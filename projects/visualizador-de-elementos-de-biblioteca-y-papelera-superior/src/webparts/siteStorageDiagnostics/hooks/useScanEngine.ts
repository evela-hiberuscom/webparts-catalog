import * as React from 'react';
import type { ISiteStorageDiagnosticsProps } from '../components/ISiteStorageDiagnosticsProps';
import type { IScanProgress } from '../models/scanConfiguration';
import type { ISiteReport } from '../models/siteReport';
import { createInitialProgress } from '../models/scanConfiguration';
import { ScanEngine } from '../services/scanEngine';
import { IndexedDbCacheService } from '../services/indexedDbCacheService';

export interface IUseScanEngineResult {
  progress: IScanProgress;
  reports: ISiteReport[];
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
}

export function useScanEngine(props: ISiteStorageDiagnosticsProps): IUseScanEngineResult {
  const [progress, setProgress] = React.useState<IScanProgress>(createInitialProgress);
  const [reports, setReports] = React.useState<ISiteReport[]>([]);
  const engineRef = React.useRef<ScanEngine | undefined>(undefined);
  const disposeRef = React.useRef<(() => void) | undefined>(undefined);

  React.useEffect(() => {
    const cache = new IndexedDbCacheService();
    cache.open()
      .then(() => cache.getAllReports())
      .then(setReports)
      .catch((err) => { console.warn('[SiteStorageDiagnostics] Cache load failed:', err); });
  }, []);

  React.useEffect(() => {
    return () => {
      disposeRef.current?.();
      engineRef.current?.cancel();
    };
  }, []);

  const isRunning = progress.globalStatus === 'scanning' || progress.globalStatus === 'discovering' || progress.globalStatus === 'paused';

  const start = React.useCallback(() => {
    // Cancel previous scan and dispose listener
    disposeRef.current?.();
    engineRef.current?.cancel();

    const engine = new ScanEngine({
      spHttpClient: props.spHttpClient,
      currentSiteUrl: props.currentSiteUrl,
      configuration: props.configuration
    });

    engineRef.current = engine;

    const dispose = engine.onEvent((event) => {
      setProgress({ ...event.progress });
      if (event.report) {
        setReports((prev) => {
          const idx = prev.findIndex((r) => r.siteUrl === event.report!.siteUrl);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = event.report!;
            return updated;
          }
          return [...prev, event.report!];
        });
      }
    });

    disposeRef.current = dispose;

    engine.start().catch((err) => {
      console.error('[SiteStorageDiagnostics] Scan failed:', err);
    });
  }, [props.spHttpClient, props.currentSiteUrl, props.configuration]);

  const pause = React.useCallback(() => {
    engineRef.current?.pause();
  }, []);

  const resume = React.useCallback(() => {
    engineRef.current?.resume();
  }, []);

  const cancel = React.useCallback(() => {
    engineRef.current?.cancel();
  }, []);

  return { progress, reports, isRunning, start, pause, resume, cancel };
}
