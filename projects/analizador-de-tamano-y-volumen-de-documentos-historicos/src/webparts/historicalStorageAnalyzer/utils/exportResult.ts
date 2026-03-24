import type { IHistoricalStorageAnalysisResult } from '../models/historicalStorageAnalyzer.types';

export function downloadAnalysisResult(result: IHistoricalStorageAnalysisResult): void {
  const json = JSON.stringify(result, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = `historical-storage-analysis-${result.library.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')}.json`;
  anchor.rel = 'noopener noreferrer';
  anchor.click();

  URL.revokeObjectURL(url);
}
