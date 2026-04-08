import type {
  IRecognitionItem,
  IRawRecognitionItem,
  RecognitionsDataSourceType
} from '../models/recognitionsModels';

function normalizeText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function parseDate(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

export function clampMaxItems(value: number, min: number = 1, max: number = 20): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}

export function describeSource(dataSourceType: RecognitionsDataSourceType, listTitleOrUrl: string): string {
  switch (dataSourceType) {
    case 'SharePointList':
      return `SharePoint list: ${listTitleOrUrl || 'RecognitionsList'}`;
    case 'JsonUrl':
      return `JsonUrl: ${listTitleOrUrl || 'not configured'}`;
    case 'StaticConfig':
    default:
      return 'Static config';
  }
}

export function resolveSameOriginUrl(candidate: string | undefined, webAbsoluteUrl: string): string | undefined {
  const normalizedCandidate = normalizeText(candidate);
  if (!normalizedCandidate) {
    return undefined;
  }

  try {
    const baseUrl = new URL(webAbsoluteUrl);
    const resolvedUrl = new URL(normalizedCandidate, baseUrl);
    return resolvedUrl.origin === baseUrl.origin ? resolvedUrl.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function normalizeRecognitionItem(
  item: IRawRecognitionItem,
  index: number,
  webAbsoluteUrl: string
): IRecognitionItem {
  const targetName = normalizeText(item.targetName) ?? `Recognition ${index + 1}`;
  const message = normalizeText(item.message);
  const date = parseDate(item.date);
  const photoUrl = resolveSameOriginUrl(item.photoUrl, webAbsoluteUrl);
  const detailUrl = resolveSameOriginUrl(item.detailUrl, webAbsoluteUrl);

  return {
    id: normalizeText(item.id) ?? `recognition-${index + 1}`,
    targetName,
    message,
    date,
    photoUrl,
    detailUrl,
    hasAction: Boolean(detailUrl),
    hasPhoto: Boolean(photoUrl),
    isPartial: !message || !date || !photoUrl || !detailUrl
  };
}

export function sortRecognitionsByDate(items: IRecognitionItem[]): IRecognitionItem[] {
  return [...items].sort((left, right) => {
    const leftValue = left.date ? new Date(left.date).getTime() : Number.NEGATIVE_INFINITY;
    const rightValue = right.date ? new Date(right.date).getTime() : Number.NEGATIVE_INFINITY;

    if (leftValue === rightValue) {
      return left.targetName.localeCompare(right.targetName);
    }

    return rightValue - leftValue;
  });
}

export function limitRecognitions(items: IRecognitionItem[], maxItems: number): IRecognitionItem[] {
  return items.slice(0, clampMaxItems(maxItems));
}
