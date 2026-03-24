export type KpiLayoutMode = 'compact' | 'standard';

export type KpiSourceType = 'SharePointList' | 'JsonUrl' | 'StaticConfig' | 'ApiEndpoint';

export type KpiState = 'loading' | 'ready' | 'empty' | 'partialData' | 'error';

export type KpiBadge = 'ok' | 'warning' | 'critical' | 'unknown' | 'partial';

export type KpiTrend = 'up' | 'down' | 'flat' | 'unknown';

export type KpiThresholdDirection = 'above' | 'below';

export interface IKpiMiniCardInput {
  id?: string;
  label?: string;
  value?: number | string;
  unit?: string;
  state?: KpiBadge | string;
  trend?: KpiTrend | string;
  comparison?: string;
  comparisonLabel?: string;
  openUrl?: string;
  openInNewTab?: boolean | string;
  priority?: number | string;
  threshold?: number | string;
  thresholdDirection?: KpiThresholdDirection | string;
  badge?: KpiBadge | string;
  description?: string;
}

export interface IKpiMiniCardLink {
  href: string;
  target: '_self' | '_blank';
  rel?: string;
}

export interface IKpiMiniCard {
  id: string;
  label: string;
  value?: number | string;
  unit: string;
  state: KpiBadge;
  trend: KpiTrend;
  comparison: string;
  comparisonLabel: string;
  priority?: number;
  threshold?: number;
  thresholdDirection?: KpiThresholdDirection;
  badge: KpiBadge;
  description: string;
  openInNewTab: boolean;
  safeLink?: IKpiMiniCardLink;
  hasPartialData: boolean;
}

export interface IKpiCatalogConfig {
  sourceType: KpiSourceType;
  kpiCardsJson: string;
  jsonUrl?: string;
  apiEndpointUrl?: string;
  listTitleOrUrl?: string;
  webUrl?: string;
  showTrend: boolean;
  layoutMode: KpiLayoutMode;
  maxItems: number;
  openInNewTab: boolean;
}

export interface IKpiRepositoryResult {
  inputs: IKpiMiniCardInput[];
  sourceLabel: string;
  hasPartialData: boolean;
  notes: string[];
  errorMessage?: string;
}

export interface IKpiCatalogResult {
  items: IKpiMiniCard[];
  sourceLabel: string;
  hasPartialData: boolean;
  notes: string[];
  status: KpiState;
}

export interface IKpiCatalogViewModel extends IKpiCatalogResult {
  reload: () => void;
}

export const DEFAULT_KPI_CARD_INPUTS: IKpiMiniCardInput[] = [
  {
    id: 'revenue',
    label: 'Ingresos',
    value: 1240,
    unit: 'k€',
    state: 'ok',
    trend: 'up',
    comparison: 'vs mes anterior',
    priority: 1,
    threshold: 1000,
    thresholdDirection: 'above',
    openUrl: '/sites/finance'
  },
  {
    id: 'delivery',
    label: 'Entregas a tiempo',
    value: 94,
    unit: '%',
    state: 'ok',
    trend: 'up',
    comparison: 'vs objetivo trimestral',
    priority: 2,
    threshold: 90,
    thresholdDirection: 'above',
    openUrl: '/sites/ops'
  },
  {
    id: 'risks',
    label: 'Riesgos abiertos',
    value: 3,
    unit: '',
    state: 'warning',
    trend: 'down',
    comparison: 'vs sprint anterior',
    priority: 3,
    threshold: 5,
    thresholdDirection: 'below',
    openUrl: '/sites/pm'
  },
  {
    id: 'coverage',
    label: 'Cobertura',
    value: 98,
    unit: '%',
    state: 'ok',
    trend: 'flat',
    comparison: 'última ejecución',
    priority: 4,
    threshold: 95,
    thresholdDirection: 'above',
    openUrl: '/sites/quality'
  }
];

export const DEFAULT_KPI_CARD_JSON = JSON.stringify(DEFAULT_KPI_CARD_INPUTS);
