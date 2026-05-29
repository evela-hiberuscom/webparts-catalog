import * as React from 'react';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  type HistoricalStorageAnalysisStatus,
  type HistoricalStorageScanMode,
  type IAnalysisProgressInfo,
  type IHistoricalStorageAnalysisResult,
  type IHistoricalStorageDocumentSnapshot,
  type IHistoricalStorageLibraryOption
} from '../models/historicalStorageAnalyzer.types';
import { HistoricalStorageAnalyzerService } from '../services/HistoricalStorageAnalyzerService';
import { pickDefaultLibrary } from '../utils/librarySelection';
import { toPositiveInteger } from '../utils/analysisCalculations';

export interface IUseHistoricalStorageAnalysisOptions {
  defaultLibraryTitleOrUrl?: string;
  defaultScanMode: HistoricalStorageScanMode;
  maxVersionConcurrency: string;
  includeHiddenLibraries: boolean;
  labels: {
    loadLibrariesError: string;
    analyzeLibraryError: string;
  };
}

export interface IHistoricalStorageAnalysisActions {
  refresh: () => void;
  setSelectedLibraryId: (libraryId: string) => void;
  setScanMode: (scanMode: HistoricalStorageScanMode) => void;
  setMaxDocumentsToScan: (limit: number) => void;
  retryDocument: (document: IHistoricalStorageDocumentSnapshot) => void;
}

export interface IHistoricalStorageAnalysisHookResult {
  libraries: IHistoricalStorageLibraryOption[];
  selectedLibrary?: IHistoricalStorageLibraryOption;
  scanMode: HistoricalStorageScanMode;
  maxDocumentsToScan: number;
  isRefreshing: boolean;
  status: HistoricalStorageAnalysisStatus;
  errorMessage?: string;
  result?: IHistoricalStorageAnalysisResult;
  progress?: IAnalysisProgressInfo;
  retryingDocumentIds: ReadonlySet<number>;
  actions: IHistoricalStorageAnalysisActions;
}

export function useHistoricalStorageAnalysis(
  context: WebPartContext,
  options: IUseHistoricalStorageAnalysisOptions
): IHistoricalStorageAnalysisHookResult {
  const [service] = React.useState(() => HistoricalStorageAnalyzerService.fromContext(context));
  const [libraries, setLibraries] = React.useState<IHistoricalStorageLibraryOption[]>([]);
  const [selectedLibraryId, setSelectedLibraryId] = React.useState('');
  const [scanMode, setScanMode] = React.useState<HistoricalStorageScanMode>(options.defaultScanMode);
  const [maxDocumentsToScan, setMaxDocumentsToScan] = React.useState(
    options.defaultScanMode === 'deepScan' ? 0 : 20
  );
  const [status, setStatus] = React.useState<HistoricalStorageAnalysisStatus>('idle');
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();
  const [result, setResult] = React.useState<IHistoricalStorageAnalysisResult | undefined>();
  const [progress, setProgress] = React.useState<IAnalysisProgressInfo | undefined>();
  const [retryingDocumentIds, setRetryingDocumentIds] = React.useState<ReadonlySet<number>>(new Set<number>());
  const [refreshToken, setRefreshToken] = React.useState(0);
  const requestIdRef = React.useRef(0);

  // Destructure to primitives so effect deps compare by value, not object identity.
  const loadLibrariesErrorLabel = options.labels.loadLibrariesError;
  const analyzeLibraryErrorLabel = options.labels.analyzeLibraryError;

  React.useEffect(() => {
    let cancelled = false;
    setIsRefreshing(true);
    setStatus('loading');

    service
      .getLibraries(options.includeHiddenLibraries)
      .then((availableLibraries) => {
        if (cancelled) {
          return;
        }

        setLibraries(availableLibraries);
        const defaultLibrary = pickDefaultLibrary(availableLibraries, options.defaultLibraryTitleOrUrl);
        setSelectedLibraryId((currentValue) => currentValue || defaultLibrary?.id || availableLibraries[0]?.id || '');
        setErrorMessage(undefined);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : loadLibrariesErrorLabel;
        setErrorMessage(message);
        setStatus('error');
      })
      .then(
        () => {
          if (!cancelled) {
            setIsRefreshing(false);
          }
        },
        () => {
          if (!cancelled) {
            setIsRefreshing(false);
          }
        }
      );

    return () => {
      cancelled = true;
    };
  }, [options.defaultLibraryTitleOrUrl, options.includeHiddenLibraries, loadLibrariesErrorLabel, service]);

  React.useEffect(() => {
    if (!selectedLibraryId) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsRefreshing(true);
    setStatus('loading');
    setErrorMessage(undefined);
    setProgress(undefined);

    service
      .analyzeLibrary(
        {
          selectedLibraryId,
          scanMode,
          maxDocumentsToScan,
          maxVersionConcurrency: toPositiveInteger(options.maxVersionConcurrency, 3),
          includeHiddenLibraries: options.includeHiddenLibraries
        },
        (progressInfo) => {
          if (requestIdRef.current === requestId) {
            setProgress(progressInfo);
          }
        }
      )
      .then((nextResult) => {
        if (requestIdRef.current !== requestId) {
          return;
        }

        setResult(nextResult);
        setProgress(undefined);
        setStatus(
          nextResult.summary.totalDocuments === 0
            ? 'empty'
            : nextResult.summary.throttled
              ? 'throttled'
              : nextResult.summary.exactness === 'exact'
                ? 'ready'
                : 'partialData'
        );
      })
      .catch((error: unknown) => {
        if (requestIdRef.current !== requestId) {
          return;
        }

        const message = error instanceof Error ? error.message : analyzeLibraryErrorLabel;
        setErrorMessage(message);
        setStatus('error');
        setResult(undefined);
        setProgress(undefined);
      })
      .then(
        () => {
          if (requestIdRef.current === requestId) {
            setIsRefreshing(false);
          }
        },
        () => {
          if (requestIdRef.current === requestId) {
            setIsRefreshing(false);
          }
        }
      );
  }, [
    maxDocumentsToScan,
    options.includeHiddenLibraries,
    options.maxVersionConcurrency,
    refreshToken,
    scanMode,
    selectedLibraryId,
    service
  ]);

  const selectedLibrary = libraries.find((library) => library.id === selectedLibraryId);

  return {
    libraries,
    selectedLibrary,
    scanMode,
    maxDocumentsToScan,
    isRefreshing,
    status,
    errorMessage,
    result,
    progress,
    retryingDocumentIds,
    actions: {
      refresh: (): void => {
        setRefreshToken((currentValue) => currentValue + 1);
      },
      setSelectedLibraryId,
      setScanMode: (mode: HistoricalStorageScanMode): void => {
        setScanMode(mode);
        setMaxDocumentsToScan(mode === 'deepScan' ? 0 : 20);
      },
      setMaxDocumentsToScan: (limit: number): void => {
        setMaxDocumentsToScan(Math.max(0, Math.floor(limit)));
      },
      retryDocument: (document: IHistoricalStorageDocumentSnapshot): void => {
        setRetryingDocumentIds((prev) => {
          const next = new Set<number>(prev);
          next.add(document.id);
          return next;
        });
        const cleanup = (): void => {
          setRetryingDocumentIds((prev) => {
            const next = new Set<number>(prev);
            next.delete(document.id);
            return next;
          });
        };
        service
          .retryDocument(document)
          .then(
            (retried) => {
              setResult((currentResult) => {
                if (!currentResult) return currentResult;
                return {
                  ...currentResult,
                  topDocuments: currentResult.topDocuments.map((doc) =>
                    doc.id === retried.id ? retried : doc
                  )
                };
              });
              cleanup();
            },
            () => {
              cleanup();
            }
          );
      }
    }
  };
}
