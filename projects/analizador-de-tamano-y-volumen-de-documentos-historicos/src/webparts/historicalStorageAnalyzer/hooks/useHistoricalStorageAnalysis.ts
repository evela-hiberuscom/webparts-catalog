import * as React from 'react';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  type HistoricalStorageAnalysisStatus,
  type HistoricalStorageScanMode,
  type IHistoricalStorageAnalysisResult,
  type IHistoricalStorageLibraryOption
} from '../models/historicalStorageAnalyzer.types';
import { HistoricalStorageAnalyzerService } from '../services/HistoricalStorageAnalyzerService';
import { pickDefaultLibrary } from '../utils/librarySelection';
import { toPositiveInteger } from '../utils/analysisCalculations';

export interface IUseHistoricalStorageAnalysisOptions {
  defaultLibraryTitleOrUrl?: string;
  defaultScanMode: HistoricalStorageScanMode;
  topDocumentsLimit: string;
  maxVersionConcurrency: string;
  includeHiddenLibraries: boolean;
}

export interface IHistoricalStorageAnalysisActions {
  refresh: () => void;
  setSelectedLibraryId: (libraryId: string) => void;
  setScanMode: (scanMode: HistoricalStorageScanMode) => void;
}

export interface IHistoricalStorageAnalysisHookResult {
  libraries: IHistoricalStorageLibraryOption[];
  selectedLibrary?: IHistoricalStorageLibraryOption;
  scanMode: HistoricalStorageScanMode;
  isRefreshing: boolean;
  status: HistoricalStorageAnalysisStatus;
  errorMessage?: string;
  result?: IHistoricalStorageAnalysisResult;
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
  const [status, setStatus] = React.useState<HistoricalStorageAnalysisStatus>('idle');
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();
  const [result, setResult] = React.useState<IHistoricalStorageAnalysisResult | undefined>();
  const [refreshToken, setRefreshToken] = React.useState(0);
  const requestIdRef = React.useRef(0);

  React.useEffect(() => {
    let cancelled = false;
    setIsRefreshing(true);
    setStatus('loading');

    void service
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

        const message = error instanceof Error ? error.message : 'No se han podido cargar las bibliotecas del sitio.';
        setErrorMessage(message);
        setStatus('error');
      })
      .then(() => {
        if (!cancelled) {
          setIsRefreshing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [options.defaultLibraryTitleOrUrl, options.includeHiddenLibraries, service]);

  React.useEffect(() => {
    if (!selectedLibraryId) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsRefreshing(true);
    setStatus('loading');
    setErrorMessage(undefined);

    void service
      .analyzeLibrary({
        selectedLibraryId,
        scanMode,
        topDocumentsLimit: toPositiveInteger(options.topDocumentsLimit, 8),
        maxVersionConcurrency: toPositiveInteger(options.maxVersionConcurrency, 3),
        includeHiddenLibraries: options.includeHiddenLibraries
      })
      .then((nextResult) => {
        if (requestIdRef.current !== requestId) {
          return;
        }

        setResult(nextResult);
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

        const message = error instanceof Error ? error.message : 'No se ha podido completar el análisis.';
        setErrorMessage(message);
        setStatus('error');
        setResult(undefined);
      })
      .then(() => {
        if (requestIdRef.current === requestId) {
          setIsRefreshing(false);
        }
      });
  }, [
    options.includeHiddenLibraries,
    options.maxVersionConcurrency,
    options.topDocumentsLimit,
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
    isRefreshing,
    status,
    errorMessage,
    result,
    actions: {
      refresh: (): void => {
        setRefreshToken((currentValue) => currentValue + 1);
      },
      setSelectedLibraryId,
      setScanMode
    }
  };
}
