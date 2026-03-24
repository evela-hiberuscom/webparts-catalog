import type {
  IAnalysisProgressInfo,
  IHistoricalStorageAnalysisRequest,
  IHistoricalStorageAnalysisResult,
  IHistoricalStorageDocumentSnapshot,
  IHistoricalStorageLibraryOption
} from '../models/historicalStorageAnalyzer.types';

export type AnalysisProgressCallback = (progress: IAnalysisProgressInfo) => void;

export interface IHistoricalStorageAnalyzerRepository {
  listLibraries(includeHiddenLibraries: boolean): Promise<IHistoricalStorageLibraryOption[]>;

  analyzeLibrary(
    request: IHistoricalStorageAnalysisRequest,
    onProgress?: AnalysisProgressCallback
  ): Promise<IHistoricalStorageAnalysisResult>;

  retryDocument(
    document: IHistoricalStorageDocumentSnapshot
  ): Promise<IHistoricalStorageDocumentSnapshot>;
}
