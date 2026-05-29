import type {
  HistoricalStoragePrecision,
  IHistoricalStorageDocumentSnapshot
} from '../models/historicalStorageAnalyzer.types';

export function toPositiveInteger(value: unknown, fallback: number): number {
  const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

export function normalizeBytes(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return Math.round(parsed);
}

export function sumBytes(values: Array<number | undefined>): number {
  return values.reduce<number>((total, current) => total + normalizeBytes(current), 0);
}

export function formatBytes(bytes: number): string {
  const safeBytes = normalizeBytes(bytes);
  if (safeBytes === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let value = safeBytes;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const decimals = unitIndex === 0 || value >= 10 ? 0 : 1;
  return `${value.toFixed(decimals)} ${units[unitIndex]}`;
}

export function formatPercent(value: number): string {
  const safeValue = Math.max(0, Math.min(100, value));
  return `${safeValue.toFixed(safeValue % 1 === 0 ? 0 : 1)}%`;
}

export function formatRatio(ratio: number | undefined): string {
  if (ratio === undefined || !Number.isFinite(ratio)) {
    return '—';
  }

  return `${ratio.toFixed(ratio >= 10 ? 0 : 1)}x`;
}

export function calculateHistoricalRatio(
  historicalSizeBytes: number,
  currentSizeBytes: number
): number | undefined {
  if (currentSizeBytes <= 0 || !Number.isFinite(historicalSizeBytes) || historicalSizeBytes < 0) {
    return undefined;
  }

  return historicalSizeBytes / currentSizeBytes;
}

export function sortDocumentsByHistoricalCost(
  documents: IHistoricalStorageDocumentSnapshot[]
): IHistoricalStorageDocumentSnapshot[] {
  return [...documents].sort((left, right) => {
    const historicalDelta = normalizeBytes(right.historicalSizeBytes) - normalizeBytes(left.historicalSizeBytes);
    if (historicalDelta !== 0) {
      return historicalDelta;
    }

    const currentDelta = normalizeBytes(right.currentSizeBytes) - normalizeBytes(left.currentSizeBytes);
    if (currentDelta !== 0) {
      return currentDelta;
    }

    return left.title.localeCompare(right.title);
  });
}

export function derivePrecisionState(options: {
  coveragePercent: number;
  partialCount: number;
  throttled: boolean;
}): HistoricalStoragePrecision {
  if (options.throttled) {
    return 'estimated';
  }

  if (options.coveragePercent >= 100 && options.partialCount === 0) {
    return 'exact';
  }

  if (options.coveragePercent > 0) {
    return 'partial';
  }

  return 'estimated';
}
