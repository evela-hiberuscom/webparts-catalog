import type {
  IHistoricalStorageAnalysisRequest,
  IHistoricalStorageAnalysisResult,
  IHistoricalStorageLibraryOption
} from '../models/historicalStorageAnalyzer.types';

export interface IHistoricalStorageAnalyzerRepository {
  listLibraries(includeHiddenLibraries: boolean): Promise<IHistoricalStorageLibraryOption[]>;

  analyzeLibrary(
    request: IHistoricalStorageAnalysisRequest
  ): Promise<IHistoricalStorageAnalysisResult>;
}
