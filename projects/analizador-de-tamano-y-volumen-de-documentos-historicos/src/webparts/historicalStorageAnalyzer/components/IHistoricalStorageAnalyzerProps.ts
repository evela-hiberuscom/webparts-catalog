import type { WebPartContext } from '@microsoft/sp-webpart-base';
import type { HistoricalStorageScanMode } from '../models/historicalStorageAnalyzer.types';

export interface IHistoricalStorageAnalyzerProps {
  context: WebPartContext;
  description: string;
  defaultLibraryTitleOrUrl?: string;
  defaultScanMode: HistoricalStorageScanMode;
  topDocumentsLimit: string;
  maxVersionConcurrency: string;
  includeHiddenLibraries: boolean;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}
