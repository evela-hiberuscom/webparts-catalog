import type { IHttpClient } from '../models/httpClient';
import type { IScanConfiguration, IScanProgress, IScanError } from '../models/scanConfiguration';
import type { ISiteReport } from '../models/siteReport';
import { createInitialProgress } from '../models/scanConfiguration';
import { SiteDiscoveryRepository, type IDiscoveredSite } from '../repositories/siteDiscoveryRepository';
import { SiteMetricsRepository } from '../repositories/siteMetricsRepository';
import { ThrottledError } from '../repositories/siteMetricsRepository';
import { ReportListRepository } from '../repositories/reportListRepository';
import { IndexedDbCacheService } from './indexedDbCacheService';
import { RateLimiter } from './rateLimiter';
import { evaluateHealth } from './healthEvaluator';

export type ScanEventType = 'progress' | 'site-completed' | 'site-error' | 'throttled' | 'completed' | 'cancelled' | 'error';

export interface IScanEvent {
  type: ScanEventType;
  progress: IScanProgress;
  report?: ISiteReport;
  error?: string;
}

export type ScanEventListener = (event: IScanEvent) => void;

export interface IScanEngineOptions {
  spHttpClient: IHttpClient;
  currentSiteUrl: string;
  configuration: IScanConfiguration;
  /** @internal For testing only */
  _dependencies?: {
    rateLimiter?: RateLimiter;
    cache?: IndexedDbCacheService;
  };
}

export class ScanEngine {
  private readonly spHttpClient: IHttpClient;
  private readonly currentSiteUrl: string;
  private readonly configuration: IScanConfiguration;
  private readonly rateLimiter: RateLimiter;
  private readonly cache: IndexedDbCacheService;
  private readonly listeners: ScanEventListener[] = [];
  private progress: IScanProgress;
  private cancelled = false;
  private paused = false;
  private pausePromiseResolve: (() => void) | undefined;

  public constructor(options: IScanEngineOptions) {
    this.spHttpClient = options.spHttpClient;
    this.currentSiteUrl = options.currentSiteUrl;
    this.configuration = options.configuration;
    this.rateLimiter = options._dependencies?.rateLimiter ?? new RateLimiter({ maxRequestsPerSecond: options.configuration.maxRequestsPerSecond });
    this.cache = options._dependencies?.cache ?? new IndexedDbCacheService();
    this.progress = createInitialProgress();
  }

  public onEvent(listener: ScanEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx >= 0) this.listeners.splice(idx, 1);
    };
  }

  public async start(): Promise<void> {
    this.cancelled = false;
    this.paused = false;

    try {
      await this.cache.open();

      this.updateProgress({ globalStatus: 'discovering', startedAt: new Date().toISOString() });

      const sites = await this.discoverSites();
      this.updateProgress({ globalStatus: 'scanning', totalSites: sites.length });

      const savedState = await this.cache.getScanState('current');
      const completedUrls = new Set(savedState?.completedUrls ?? []);
      const pendingSites = sites.filter((s) => !completedUrls.has(s.url));

      for (const site of pendingSites) {
        if (this.cancelled) {
          this.updateProgress({ globalStatus: 'cancelled' });
          this.emit({ type: 'cancelled', progress: this.progress });
          return;
        }

        if (this.paused) {
          await this.waitForResume();
        }

        this.updateProgress({ currentSiteUrl: site.url, currentSiteTitle: site.title });
        this.emit({ type: 'progress', progress: this.progress });

        const report = await this.scanSite(site);
        await this.cache.saveReport(report);
        completedUrls.add(site.url);

        await this.cache.saveScanState({
          id: 'current',
          completedUrls: Array.from(completedUrls),
          pendingUrls: pendingSites.filter((s) => !completedUrls.has(s.url)).map((s) => s.url),
          timestamp: new Date().toISOString()
        });

        this.updateProgress({
          completedSites: completedUrls.size,
          estimatedRemainingSeconds: this.estimateRemaining(completedUrls.size, sites.length)
        });

        this.emit({ type: 'site-completed', progress: this.progress, report });
      }

      await this.flushToReportList(Array.from(completedUrls));

      this.updateProgress({ globalStatus: 'completed', currentSiteUrl: undefined, currentSiteTitle: undefined });
      this.emit({ type: 'completed', progress: this.progress });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown scan error';
      this.updateProgress({ globalStatus: 'error' });
      this.emit({ type: 'error', progress: this.progress, error: message });
    }
  }

  public pause(): void {
    if (this.progress.globalStatus !== 'scanning') return;
    this.paused = true;
    this.updateProgress({ globalStatus: 'paused', isPaused: true });
    this.emit({ type: 'progress', progress: this.progress });
  }

  public resume(): void {
    if (this.progress.globalStatus !== 'paused') return;
    this.paused = false;
    this.updateProgress({ globalStatus: 'scanning', isPaused: false });
    const resolve = this.pausePromiseResolve;
    this.pausePromiseResolve = undefined;
    if (resolve) resolve();
    this.emit({ type: 'progress', progress: this.progress });
  }

  public cancel(): void {
    this.cancelled = true;
    const resolve = this.pausePromiseResolve;
    this.pausePromiseResolve = undefined;
    if (resolve) resolve();
  }

  public getProgress(): IScanProgress {
    return { ...this.progress };
  }

  private async discoverSites(): Promise<IDiscoveredSite[]> {
    if (this.configuration.scope === 'manual') {
      return this.configuration.manualSiteUrls
        .filter((url) => /^https:\/\/.+\..+/i.test(url))
        .map((url) => ({ url: url.replace(/\/$/, ''), title: url }));
    }

    await this.rateLimiter.waitForSlot();
    const discovery = new SiteDiscoveryRepository({
      spHttpClient: this.spHttpClient,
      currentSiteUrl: this.currentSiteUrl
    });

    return discovery.discoverSites();
  }

  private async scanSite(site: IDiscoveredSite): Promise<ISiteReport> {
    const metrics = new SiteMetricsRepository({ spHttpClient: this.spHttpClient });

    try {
      await this.rateLimiter.waitForSlot();
      const libraries = await this.withThrottleHandling(() => metrics.getDocumentLibraries(site.url));

      await this.rateLimiter.waitForSlot();
      const recycleBin = await this.withThrottleHandling(() => metrics.getRecycleBinMetrics(site.url));

      await this.rateLimiter.waitForSlot();
      const usage = await this.withThrottleHandling(() => metrics.getSiteUsage(site.url));

      const totalLibraryItems = libraries.reduce((sum, lib) => sum + lib.itemCount, 0);

      const report: ISiteReport = {
        siteUrl: site.url,
        siteTitle: site.title,
        scanDate: new Date().toISOString(),
        libraryCount: libraries.length,
        totalLibraryItems,
        recycleBinItemCount: recycleBin.itemCount,
        recycleBinSizeBytes: recycleBin.sizeBytes,
        storageUsedBytes: usage.storageUsedBytes,
        storageQuotaBytes: usage.storageQuotaBytes,
        healthLevel: 'ok',
        flags: [],
        scanStatus: recycleBin.isAccessible ? 'completed' : 'partial',
        errorMessage: recycleBin.errorMessage,
        libraries,
        recycleBin
      };

      const health = evaluateHealth(report);
      report.healthLevel = health.level;
      report.flags = health.flags;

      return report;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const scanError: IScanError = {
        siteUrl: site.url,
        message,
        timestamp: new Date().toISOString(),
        httpStatus: undefined
      };

      this.progress.errors.push(scanError);
      this.emit({ type: 'site-error', progress: this.progress, error: message });

      return {
        siteUrl: site.url,
        siteTitle: site.title,
        scanDate: new Date().toISOString(),
        libraryCount: 0,
        totalLibraryItems: 0,
        recycleBinItemCount: undefined,
        recycleBinSizeBytes: undefined,
        storageUsedBytes: undefined,
        storageQuotaBytes: undefined,
        healthLevel: 'unknown',
        flags: [],
        scanStatus: 'error',
        errorMessage: message,
        libraries: [],
        recycleBin: { itemCount: undefined, sizeBytes: undefined, isAccessible: false, errorMessage: message }
      };
    }
  }

  private async withThrottleHandling<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof ThrottledError) {
        this.rateLimiter.applyRetryAfter(error.retryAfterSeconds);
        this.updateProgress({ lastThrottleAt: new Date().toISOString() });
        this.emit({ type: 'throttled', progress: this.progress });
        await this.rateLimiter.waitForSlot();
        return fn();
      }
      throw error;
    }
  }

  private async flushToReportList(completedUrls: string[]): Promise<void> {
    if (!this.configuration.reportListUrl) return;

    const reportRepo = new ReportListRepository({
      spHttpClient: this.spHttpClient,
      reportListUrl: this.configuration.reportListUrl
    });

    for (const url of completedUrls) {
      try {
        const report = await this.cache.getReport(url);
        if (report) {
          const { mapReportToListItem } = await import(/* webpackChunkName: 'site-report-mapper' */ '../models/siteReport');
          await this.rateLimiter.waitForSlot();
          await reportRepo.saveReport(mapReportToListItem(report));
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown flush error';
        this.progress.errors.push({ siteUrl: url, message, timestamp: new Date().toISOString(), httpStatus: undefined });
      }
    }
  }

  private async waitForResume(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.pausePromiseResolve = resolve;
    });
  }

  private updateProgress(update: Partial<IScanProgress>): void {
    this.progress = { ...this.progress, ...update };
  }

  private estimateRemaining(completed: number, total: number): number | undefined {
    if (completed === 0 || !this.progress.startedAt) return undefined;
    const elapsed = (Date.now() - new Date(this.progress.startedAt).getTime()) / 1000;
    const avgPerSite = elapsed / completed;
    return Math.round(avgPerSite * (total - completed));
  }

  private emit(event: IScanEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {
        // Listener errors should not break the scan
      }
    }
  }
}
