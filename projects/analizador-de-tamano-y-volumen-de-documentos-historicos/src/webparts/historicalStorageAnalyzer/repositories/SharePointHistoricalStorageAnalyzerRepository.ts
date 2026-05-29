import { SPHttpClient } from '@microsoft/sp-http';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import type {
  IHistoricalStorageAnalysisRequest,
  IHistoricalStorageAnalysisResult,
  IHistoricalStorageDocumentSnapshot,
  IHistoricalStorageLibraryOption
} from '../models/historicalStorageAnalyzer.types';
import {
  calculateHistoricalRatio,
  derivePrecisionState,
  normalizeBytes,
  sortDocumentsByHistoricalCost,
  sumBytes
} from '../utils/analysisCalculations';
import type { IHistoricalStorageAnalyzerRepository } from './IHistoricalStorageAnalyzerRepository';
import type { AnalysisProgressCallback } from './IHistoricalStorageAnalyzerRepository';

interface ISharePointPagedResponse<T> {
  value?: T[];
  '@odata.nextLink'?: string;
  __next?: string;
}

interface ISharePointLibraryResponse {
  Id: string;
  Title: string;
  Hidden?: boolean;
  ItemCount?: number;
  RootFolder?: {
    ServerRelativeUrl?: string;
  };
}

interface ISharePointListItemResponse {
  Id: number;
  Title?: string;
  File?: {
    Name?: string;
    ServerRelativeUrl?: string;
    Length?: number;
  };
}

interface ISharePointVersionResponse {
  Size?: number;
  Length?: number;
}

interface IHistoricalDocumentScan extends IHistoricalStorageDocumentSnapshot {
  scanComplete: boolean;
}

function createWarnings(...warnings: Array<string | undefined>): string[] {
  const uniqueWarnings: string[] = [];
  warnings.forEach((warning) => {
    if (!warning || warning.trim().length === 0 || uniqueWarnings.indexOf(warning) !== -1) {
      return;
    }

    uniqueWarnings.push(warning);
  });

  return uniqueWarnings;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }

  const results = new Array<R>(items.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  });

  await Promise.all(workers);
  return results;
}

export class SharePointHistoricalStorageAnalyzerRepository
  implements IHistoricalStorageAnalyzerRepository
{
  public constructor(private readonly context: WebPartContext) {}

  public async listLibraries(includeHiddenLibraries: boolean): Promise<IHistoricalStorageLibraryOption[]> {
    const hiddenClause = includeHiddenLibraries ? '' : ' and Hidden eq false';
    const url =
      `web/lists?$select=Id,Title,Hidden,ItemCount,RootFolder/ServerRelativeUrl` +
      `&$expand=RootFolder&$filter=BaseTemplate eq 101${hiddenClause}`;
    const response = await this.getPagedCollection<ISharePointLibraryResponse>(url);

    return response
      .map((library) => this.toLibraryOption(library))
      .filter((library) => library.serverRelativeUrl.length > 0)
      .sort((left, right) => left.title.localeCompare(right.title));
  }

  public async analyzeLibrary(
    request: IHistoricalStorageAnalysisRequest,
    onProgress?: AnalysisProgressCallback
  ): Promise<IHistoricalStorageAnalysisResult> {
    const startedAt = Date.now();
    onProgress?.({ currentFileName: '', completedFiles: 0, totalFiles: 0, phase: 'listing' });
    const libraries = await this.listLibraries(request.includeHiddenLibraries);
    const library = libraries.find((entry) => entry.id === request.selectedLibraryId);

    if (!library) {
      throw new Error(`Library not found for id ${request.selectedLibraryId}`);
    }

    const items = await this.getPagedCollection<ISharePointListItemResponse>(
      `web/lists(guid'${library.id}')/items?$select=Id,Title,File/Name,File/ServerRelativeUrl,File/Length&$expand=File`
    );

    const documents = items
      .map((item) => this.toDocumentSnapshot(item))
      .filter((item): item is IHistoricalDocumentScan => !!item);

    if (documents.length === 0) {
      return {
        library,
        scanMode: request.scanMode,
        summary: {
          totalDocuments: 0,
          documentsAnalyzed: 0,
          visibleCurrentSizeBytes: 0,
          historicalVersionCount: 0,
          historicalEstimatedSizeBytes: undefined,
          historicalToCurrentRatio: undefined,
          analysisCoveragePercent: 0,
          exactness: 'estimated',
          durationMs: Date.now() - startedAt,
          throttled: false
        },
        topDocuments: [],
        warnings: ['empty-library'],
        exportedAt: new Date().toISOString()
      };
    }

    const scanLimit = request.maxDocumentsToScan > 0
      ? Math.min(documents.length, request.maxDocumentsToScan)
      : documents.length;
    const candidateDocuments = sortDocumentsByHistoricalCost(documents).slice(0, scanLimit);
    let completedFiles = 0;
    const totalFiles = candidateDocuments.length;
    const analyzedDocuments = await mapWithConcurrency(
      candidateDocuments,
      Math.max(1, request.maxVersionConcurrency),
      async (document) => {
        onProgress?.({
          currentFileName: document.title,
          completedFiles,
          totalFiles,
          phase: 'analyzing'
        });
        const enriched = await this.enrichDocumentWithVersions(document);
        completedFiles += 1;
        onProgress?.({
          currentFileName: document.title,
          completedFiles,
          totalFiles,
          phase: 'analyzing'
        });
        return enriched;
      }
    );

    const analyzedDocumentMap = new Map<number, IHistoricalDocumentScan>();
    analyzedDocuments.forEach((document) => {
      analyzedDocumentMap.set(document.id, document);
    });
    const mergedDocuments = documents.map((document) => analyzedDocumentMap.get(document.id) ?? document);
    const visibleCurrentSizeBytes = sumBytes(documents.map((document) => document.currentSizeBytes));
    const historicalEstimatedSizeBytes = sumBytes(
      analyzedDocuments.map((document) => document.historicalSizeBytes)
    );
    const historicalVersionCount = analyzedDocuments.reduce(
      (total, document) => total + document.historicalVersionCount,
      0
    );
    const coveragePercent = Math.round((analyzedDocuments.length / documents.length) * 100);
    const throttled = analyzedDocuments.some((document) =>
      document.warnings.some((warning) => warning === 'throttled')
    );
    const partialCount = mergedDocuments.filter((document) => !document.scanComplete).length;
    const exactness = derivePrecisionState({
      coveragePercent,
      partialCount,
      throttled
    });

    return {
      library,
      scanMode: request.scanMode,
      summary: {
        totalDocuments: documents.length,
        documentsAnalyzed: analyzedDocuments.length,
        visibleCurrentSizeBytes,
        historicalVersionCount,
        historicalEstimatedSizeBytes: historicalEstimatedSizeBytes > 0 ? historicalEstimatedSizeBytes : undefined,
        historicalToCurrentRatio: calculateHistoricalRatio(
          historicalEstimatedSizeBytes,
          visibleCurrentSizeBytes
        ),
        analysisCoveragePercent: coveragePercent,
        exactness,
        durationMs: Date.now() - startedAt,
        throttled
      },
      topDocuments: sortDocumentsByHistoricalCost(mergedDocuments),
      warnings: createWarnings(
        ...analyzedDocuments.reduce<string[]>((accumulator, document) => accumulator.concat(document.warnings), []),
        analyzedDocuments.length < documents.length
          ? 'scan-capped'
          : undefined
      ),
      exportedAt: new Date().toISOString()
    };
  }

  public async retryDocument(
    document: IHistoricalStorageDocumentSnapshot
  ): Promise<IHistoricalStorageDocumentSnapshot> {
    return this.enrichDocumentWithVersions(document);
  }

  private toLibraryOption(library: ISharePointLibraryResponse): IHistoricalStorageLibraryOption {
    const serverRelativeUrl = library.RootFolder?.ServerRelativeUrl ?? '';
    return {
      id: library.Id,
      title: library.Title,
      serverRelativeUrl,
      webUrl: `${this.context.pageContext.web.absoluteUrl}${serverRelativeUrl}`,
      hidden: !!library.Hidden,
      itemCount: Number(library.ItemCount ?? 0),
      isSystemLibrary: serverRelativeUrl.startsWith('/_') || serverRelativeUrl.toLowerCase().includes('/forms/')
    };
  }

  private toDocumentSnapshot(item: ISharePointListItemResponse): IHistoricalDocumentScan | undefined {
    const serverRelativeUrl = item.File?.ServerRelativeUrl?.trim();
    if (!serverRelativeUrl) {
      return undefined;
    }

    return {
      id: item.Id,
      title: item.File?.Name?.trim() || item.Title?.trim() || `Documento ${item.Id}`,
      serverRelativeUrl,
      currentSizeBytes: normalizeBytes(item.File?.Length),
      historicalVersionCount: 0,
      historicalSizeBytes: undefined,
      ratio: undefined,
      precision: 'estimated',
      warnings: [],
      scanComplete: false
    };
  }

  private async enrichDocumentWithVersions(
    document: IHistoricalStorageDocumentSnapshot
  ): Promise<IHistoricalDocumentScan> {
    try {
      const versions = await this.getPagedCollection<ISharePointVersionResponse>(
        `web/getfilebyserverrelativeurl('${document.serverRelativeUrl.replace(/'/g, "''").replace(/#/g, '%23')}')/versions?$select=Size,Length`
      );
      const historicalVersionCount = versions.length;
      const historicalSizeBytes = sumBytes(
        versions.map((version) => normalizeBytes(version.Size ?? version.Length))
      );

      return {
        ...document,
        historicalVersionCount,
        historicalSizeBytes,
        ratio: calculateHistoricalRatio(historicalSizeBytes, document.currentSizeBytes),
        precision: 'exact',
        warnings: createWarnings(...document.warnings),
        scanComplete: true
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'version-fetch-failed';
      const throttled = /429|throttl|503/i.test(message);

      return {
        ...document,
        historicalVersionCount: 0,
        historicalSizeBytes: undefined,
        ratio: undefined,
        precision: 'partial',
        warnings: createWarnings(...document.warnings, throttled ? 'throttled' : 'version-fetch-failed'),
        scanComplete: false
      };
    }
  }

  private async getPagedCollection<T>(relativeOrAbsoluteUrl: string): Promise<T[]> {
    const result: T[] = [];
    let nextUrl: string | undefined = this.buildApiUrl(relativeOrAbsoluteUrl);

    while (nextUrl) {
      const response = await this.context.spHttpClient.get(
        nextUrl,
        SPHttpClient.configurations.v1
      );

      if (!response.ok) {
        throw new Error(`SharePoint request failed (${response.status}) for ${nextUrl}`);
      }

      const body = (await response.json()) as ISharePointPagedResponse<T>;
      result.push(...(body.value ?? []));
      const nextLink = body['@odata.nextLink'] ?? body.__next;
      nextUrl = typeof nextLink === 'string' && nextLink.length > 0 ? nextLink : undefined;
    }

    return result;
  }

  private buildApiUrl(relativeOrAbsoluteUrl: string): string {
    if (/^https?:\/\//i.test(relativeOrAbsoluteUrl)) {
      return relativeOrAbsoluteUrl;
    }

    return `${this.context.pageContext.web.absoluteUrl}/_api/${relativeOrAbsoluteUrl.replace(/^\/+/, '')}`;
  }
}
