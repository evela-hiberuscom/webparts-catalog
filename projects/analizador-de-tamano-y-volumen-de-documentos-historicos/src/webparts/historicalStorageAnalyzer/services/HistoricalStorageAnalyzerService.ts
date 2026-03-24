import type { WebPartContext } from '@microsoft/sp-webpart-base';
import type {
  IHistoricalStorageAnalysisRequest,
  IHistoricalStorageAnalysisResult,
  IHistoricalStorageDocumentSnapshot,
  IHistoricalStorageLibraryOption
} from '../models/historicalStorageAnalyzer.types';
import type {
  AnalysisProgressCallback,
  IHistoricalStorageAnalyzerRepository
} from '../repositories/IHistoricalStorageAnalyzerRepository';
import { SharePointHistoricalStorageAnalyzerRepository } from '../repositories/SharePointHistoricalStorageAnalyzerRepository';

export class HistoricalStorageAnalyzerService {
  public constructor(private readonly repository: IHistoricalStorageAnalyzerRepository) {}

  public static fromContext(context: WebPartContext): HistoricalStorageAnalyzerService {
    return new HistoricalStorageAnalyzerService(
      new SharePointHistoricalStorageAnalyzerRepository(context)
    );
  }

  public getLibraries(includeHiddenLibraries: boolean): Promise<IHistoricalStorageLibraryOption[]> {
    return this.repository.listLibraries(includeHiddenLibraries);
  }

  public analyzeLibrary(
    request: IHistoricalStorageAnalysisRequest,
    onProgress?: AnalysisProgressCallback
  ): Promise<IHistoricalStorageAnalysisResult> {
    return this.repository.analyzeLibrary(request, onProgress);
  }

  public retryDocument(
    document: IHistoricalStorageDocumentSnapshot
  ): Promise<IHistoricalStorageDocumentSnapshot> {
    return this.repository.retryDocument(document);
  }
}
