export type RecycleBinStage = 1 | 2;

export type RecycleBinPrecision = 'exact' | 'estimated' | 'partial';

export type RecycleBinHealthLevel = 'ok' | 'warning' | 'critical' | 'unknown';

export interface IRecycleBinSpaceCalculatorWebPartProps {
  description: string;
  showStageBreakdown: boolean;
  refreshIntervalSeconds: number;
  warningThresholdItems: number;
  warningThresholdSizeMb: number;
}

export interface IRecycleBinItem {
  id: string;
  stage: RecycleBinStage;
  title: string;
  deletedDate: string | undefined;
  path: string | undefined;
  sizeBytes: number | undefined;
}

export interface IRecycleBinStageDiagnostics {
  stage: RecycleBinStage;
  label: string;
  itemCount: number | undefined;
  sizeBytes: number | undefined;
  precision: RecycleBinPrecision;
  items: IRecycleBinItem[];
  isAccessible: boolean;
  errorMessage?: string;
}

export interface IRecycleBinHealthEvaluation {
  level: RecycleBinHealthLevel;
  reasons: string[];
}

export interface IRecycleBinSpaceCalculatorViewModel {
  siteUrl: string;
  recycleBinUrl: string;
  title: string;
  description: string;
  stage1: IRecycleBinStageDiagnostics;
  stage2: IRecycleBinStageDiagnostics;
  totalItemCount: number | undefined;
  totalSizeBytes: number | undefined;
  hasPartialData: boolean;
  /** Stage 2 is expected to be inaccessible — user is not a Site Collection Administrator. */
  stage2PermissionLimited: boolean;
  health: IRecycleBinHealthEvaluation;
  lastUpdated: string;
}

export interface IRecycleBinSpaceCalculatorRequest {
  siteUrl: string;
  description: string;
  showStageBreakdown: boolean;
  refreshIntervalSeconds: number;
  warningThresholdItems: number;
  warningThresholdSizeMb: number;
}

export interface IRecycleBinHttpResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

export interface IRecycleBinHttpClient {
  get(
    url: string,
    configuration: unknown,
    options?: {
      headers?: Record<string, string>;
    }
  ): Promise<IRecycleBinHttpResponse>;
}

export interface IRecycleBinSpaceCalculatorRuntimeContext {
  siteUrl: string;
  spHttpClient: IRecycleBinHttpClient;
}

export interface IRecycleBinSpaceCalculatorState {
  status: 'loading' | 'ready' | 'empty' | 'partialData' | 'error';
  isRefreshing: boolean;
  viewModel: IRecycleBinSpaceCalculatorViewModel | undefined;
  errorMessage?: string;
}
