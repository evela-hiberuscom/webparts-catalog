export type HistoricalStorageScanMode = 'quickScan' | 'deepScan';

export type HistoricalStorageAnalysisStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'empty'
  | 'partialData'
  | 'throttled'
  | 'error';

export type HistoricalStoragePrecision = 'exact' | 'partial' | 'estimated';

export interface IHistoricalStorageLibraryOption {
  id: string;
  title: string;
  serverRelativeUrl: string;
  webUrl: string;
  hidden: boolean;
  itemCount: number;
  isSystemLibrary: boolean;
}

export interface IHistoricalStorageDocumentSnapshot {
  id: number;
  title: string;
  serverRelativeUrl: string;
  currentSizeBytes: number;
  historicalVersionCount: number;
  historicalSizeBytes: number | null;
  ratio: number | null;
  precision: HistoricalStoragePrecision;
  warnings: string[];
  scanComplete?: boolean;
}

export interface IHistoricalStorageAnalysisSummary {
  totalDocuments: number;
  documentsAnalyzed: number;
  visibleCurrentSizeBytes: number;
  historicalVersionCount: number;
  historicalEstimatedSizeBytes: number | null;
  historicalToCurrentRatio: number | null;
  analysisCoveragePercent: number;
  exactness: HistoricalStoragePrecision;
  durationMs: number;
  throttled: boolean;
}

export interface IHistoricalStorageAnalysisResult {
  library: IHistoricalStorageLibraryOption;
  scanMode: HistoricalStorageScanMode;
  summary: IHistoricalStorageAnalysisSummary;
  topDocuments: IHistoricalStorageDocumentSnapshot[];
  warnings: string[];
  exportedAt: string;
}

export interface IHistoricalStorageAnalysisRequest {
  selectedLibraryId: string;
  scanMode: HistoricalStorageScanMode;
  topDocumentsLimit: number;
  maxVersionConcurrency: number;
  includeHiddenLibraries: boolean;
}

export interface IHistoricalStorageAnalyzerViewState {
  libraries: IHistoricalStorageLibraryOption[];
  selectedLibraryId: string;
  scanMode: HistoricalStorageScanMode;
  status: HistoricalStorageAnalysisStatus;
  isRefreshing: boolean;
  errorMessage?: string;
  result?: IHistoricalStorageAnalysisResult;
}
