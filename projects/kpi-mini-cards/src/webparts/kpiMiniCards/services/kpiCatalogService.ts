import { classifyAsyncState } from '@paquete/spfx-common/utils';
import type {
  IKpiCatalogConfig,
  IKpiCatalogResult,
  IKpiMiniCard,
  IKpiMiniCardInput,
  KpiBadge,
  KpiState,
  KpiTrend
} from '../models/kpiModels';
import { KpiCatalogRepository, normalizeRepositoryInputs } from '../repositories/kpiCatalogRepository';
import { sanitizeKpiUrl } from '../utils/kpiLink';

const BADGE_RANKING: Record<KpiBadge, number> = {
  critical: 0,
  warning: 1,
  partial: 2,
  unknown: 3,
  ok: 4
};

const TREND_RANKING: Record<KpiTrend, number> = {
  down: 0,
  flat: 1,
  up: 2,
  unknown: 3
};

const STATE_RANKING: Record<KpiBadge, number> = {
  critical: 0,
  warning: 1,
  partial: 2,
  unknown: 3,
  ok: 4
};

function ensureNumber(input: number | string | undefined): number | undefined {
  if (input === undefined || input === '') {
    return undefined;
  }

  const value = Number(input);
  return Number.isFinite(value) ? value : undefined;
}

function ensureBadge(input: KpiBadge | string | undefined): KpiBadge {
  const value = typeof input === 'string' ? input.toLowerCase() : input;
  if (value === 'critical' || value === 'warning' || value === 'partial' || value === 'unknown' || value === 'ok') {
    return value;
  }

  return 'unknown';
}

function ensureState(input: KpiBadge | string | undefined): 'critical' | 'warning' | 'unknown' | 'ok' {
  const value = typeof input === 'string' ? input.toLowerCase() : input;
  if (value === 'critical' || value === 'warning' || value === 'unknown' || value === 'ok') {
    return value;
  }

  return 'unknown';
}

function resolveExplicitState(input: IKpiMiniCardInput): 'critical' | 'warning' | 'unknown' | 'ok' | undefined {
  if (typeof input.state === 'string' && input.state.trim()) {
    return ensureState(input.state);
  }

  return undefined;
}

function resolveBadgeState(input: IKpiMiniCardInput): 'critical' | 'warning' | 'unknown' | 'ok' | undefined {
  if (typeof input.badge !== 'string' || !input.badge.trim()) {
    return undefined;
  }

  const normalized = input.badge.trim().toLowerCase();
  if (normalized === 'partial') {
    return undefined;
  }

  return ensureState(normalized);
}

function ensureTrend(input: KpiTrend | string | undefined): KpiTrend {
  const value = typeof input === 'string' ? input.toLowerCase() : input;
  if (value === 'up' || value === 'down' || value === 'flat' || value === 'unknown') {
    return value;
  }

  return 'unknown';
}

function inferStateFromKpi(input: IKpiMiniCardInput, trend: KpiTrend): 'critical' | 'warning' | 'unknown' | 'ok' {
  const explicitState = resolveExplicitState(input) ?? resolveBadgeState(input);
  if (explicitState !== undefined) {
    return explicitState;
  }

  const value = ensureNumber(input.value);
  const threshold = ensureNumber(input.threshold);
  if (value === undefined || threshold === undefined || trend === 'unknown') {
    return 'unknown';
  }

  if ((input.thresholdDirection ?? 'above') === 'below') {
    return value <= threshold ? 'ok' : value <= threshold * 1.1 ? 'warning' : 'critical';
  }

  return value >= threshold ? 'ok' : value >= threshold * 0.9 ? 'warning' : 'critical';
}

export function sortKpiCards(items: IKpiMiniCard[]): IKpiMiniCard[] {
  return [...items].sort((left, right) => {
    const leftPriority = left.priority ?? Number.POSITIVE_INFINITY;
    const rightPriority = right.priority ?? Number.POSITIVE_INFINITY;

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    const leftStateRank = STATE_RANKING[left.state];
    const rightStateRank = STATE_RANKING[right.state];
    if (leftStateRank !== rightStateRank) {
      return leftStateRank - rightStateRank;
    }

    const leftBadgeRank = BADGE_RANKING[left.badge];
    const rightBadgeRank = BADGE_RANKING[right.badge];
    if (leftBadgeRank !== rightBadgeRank) {
      return leftBadgeRank - rightBadgeRank;
    }

    const leftTrendRank = TREND_RANKING[left.trend];
    const rightTrendRank = TREND_RANKING[right.trend];
    if (leftTrendRank !== rightTrendRank) {
      return leftTrendRank - rightTrendRank;
    }

    return left.label.localeCompare(right.label);
  });
}

export function applyKpiLimit(items: IKpiMiniCard[], maxItems: number): IKpiMiniCard[] {
  if (!Number.isFinite(maxItems) || maxItems <= 0) {
    return items;
  }

  return items.slice(0, maxItems);
}

export function getKpiCatalogState(input: {
  isLoading: boolean;
  hasError: boolean;
  hasPartialData: boolean;
  hasData: boolean;
}): KpiState {
  return classifyAsyncState({
    isLoading: input.isLoading,
    hasError: input.hasError,
    isPartial: input.hasPartialData,
    hasData: input.hasData
  });
}

export function normalizeKpiCards(
  inputs: IKpiMiniCardInput[],
  config: Pick<IKpiCatalogConfig, 'openInNewTab' | 'showTrend'>
): IKpiMiniCard[] {
  return normalizeRepositoryInputs(inputs).map((input, index) => {
    const trend = ensureTrend(input.trend);
    const safeLink = sanitizeKpiUrl(input.openUrl, config.openInNewTab || Boolean(input.openInNewTab));
    const hasComparison = Boolean(input.comparison && input.comparison.trim());
    const hasTrend = config.showTrend ? trend !== 'unknown' : true;
    const hasValue = input.value !== undefined && input.value !== '';
    const hasPartialData = !safeLink || !hasComparison || !hasTrend || !hasValue;
    const state = inferStateFromKpi(input, trend);
    const explicitBadge = typeof input.badge === 'string' && input.badge.trim() ? ensureBadge(input.badge) : undefined;
    const badge = explicitBadge ?? (hasPartialData ? 'partial' : state);

    return {
      id: input.id ?? `kpi-${index + 1}`,
      label: input.label ?? `KPI ${index + 1}`,
      value: input.value,
      unit: input.unit ?? '',
      state,
      trend,
      comparison: input.comparison ?? '',
      comparisonLabel: input.comparisonLabel ?? '',
      priority: ensureNumber(input.priority),
      threshold: ensureNumber(input.threshold),
      thresholdDirection: typeof input.thresholdDirection === 'string' && input.thresholdDirection.toLowerCase() === 'below' ? 'below' : 'above',
      badge,
      description: input.description ?? '',
      openInNewTab: config.openInNewTab || Boolean(input.openInNewTab),
      safeLink,
      hasPartialData
    };
  });
}

export class KpiCatalogService {
  constructor(private readonly repository: Pick<KpiCatalogRepository, 'load'> = new KpiCatalogRepository()) {}

  public async resolveCatalog(config: IKpiCatalogConfig): Promise<IKpiCatalogResult> {
    const repositoryResult = await this.repository.load(config);
    const normalizedItems = normalizeKpiCards(repositoryResult.inputs, config);
    const sortedItems = sortKpiCards(normalizedItems);
    const limitedItems = applyKpiLimit(sortedItems, config.maxItems);
    const hasPartialData = repositoryResult.hasPartialData || limitedItems.some((item) => item.hasPartialData);
    const hasError = Boolean(repositoryResult.errorMessage) && limitedItems.length === 0;
    const status = getKpiCatalogState({
      isLoading: false,
      hasError,
      hasPartialData,
      hasData: limitedItems.length > 0
    });

    return {
      items: limitedItems,
      sourceLabel: repositoryResult.sourceLabel,
      hasPartialData,
      notes: repositoryResult.notes,
      status
    };
  }
}
