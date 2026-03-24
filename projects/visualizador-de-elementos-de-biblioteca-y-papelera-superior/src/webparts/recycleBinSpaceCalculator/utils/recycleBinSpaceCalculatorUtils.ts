import type {
  IRecycleBinHealthEvaluation,
  IRecycleBinItem,
  IRecycleBinSpaceCalculatorViewModel,
  IRecycleBinStageDiagnostics,
  RecycleBinStage
} from '../models/recycleBinSpaceCalculatorModels';

export function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function extractArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  const candidate = payload as {
    value?: unknown[];
    results?: unknown[];
    d?: { results?: unknown[] };
  };

  if (Array.isArray(candidate?.value)) {
    return candidate.value;
  }

  if (Array.isArray(candidate?.results)) {
    return candidate.results;
  }

  if (Array.isArray(candidate?.d?.results)) {
    return candidate.d.results;
  }

  return [];
}

export function getStageLabel(stage: RecycleBinStage): string {
  return stage === 1 ? 'Papelera nivel 1' : 'Papelera nivel 2';
}

export function formatBytes(value: number | null): string {
  if (value === null) {
    return 'No disponible';
  }

  if (value === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let amount = value;
  let unitIndex = 0;

  while (amount >= 1024 && unitIndex < units.length - 1) {
    amount /= 1024;
    unitIndex += 1;
  }

  const precision = amount >= 100 || unitIndex === 0 ? 0 : 1;
  const formattedAmount = Number(amount.toFixed(precision));
  return `${Number.isInteger(formattedAmount) ? formattedAmount : formattedAmount.toFixed(precision)} ${units[unitIndex]}`;
}

export function sumBytes(values: Array<number | null>): number | null {
  if (values.some((value) => value === null)) {
    return null;
  }

  return values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
}

export function buildRecycleBinUrl(siteUrl: string, stage: RecycleBinStage): string {
  const normalizedSiteUrl = siteUrl.replace(/\/$/, '');
  const path = stage === 1 ? '/_api/web/RecycleBin' : '/_api/site/RecycleBin';
  return `${normalizedSiteUrl}${path}`;
}

export function buildRecycleBinPageUrl(siteUrl: string): string {
  return `${siteUrl.replace(/\/$/, '')}/_layouts/15/RecycleBin.aspx`;
}

export function coerceRecycleBinItem(item: Record<string, unknown>, stage: RecycleBinStage): IRecycleBinItem {
  return {
    id: normalizeText(item.Id ?? item.ID ?? item.id ?? item.UniqueId ?? item.UniqueID) || `${stage}-${normalizeText(item.LeafName ?? item.leafName ?? item.Title ?? item.title)}`,
    stage,
    title: normalizeText(item.LeafName ?? item.leafName ?? item.Title ?? item.title) || 'Elemento eliminado',
    deletedDate: normalizeText(item.DeletedDate ?? item.deletedDate ?? item.TimeDeleted ?? item.timeDeleted) || null,
    path: normalizeText(item.DirName ?? item.dirName ?? item.Path ?? item.path ?? item.ServerRelativeUrl ?? item.serverRelativeUrl) || null,
    sizeBytes: normalizeNumber(item.Size ?? item.size ?? item.ItemSize ?? item.itemSize ?? item.File_x0020_Size ?? item.ContentLength)
  };
}

export function aggregateStage(items: IRecycleBinItem[], stage: RecycleBinStage): IRecycleBinStageDiagnostics {
  const count = items.length;
  const sizeBytes = items.every((item) => item.sizeBytes !== null)
    ? items.reduce((sum, item) => sum + (item.sizeBytes ?? 0), 0)
    : null;

  const precision = sizeBytes === null ? 'partial' : 'exact';

  return {
    stage,
    label: getStageLabel(stage),
    itemCount: count,
    sizeBytes: count === 0 ? 0 : sizeBytes,
    precision: count === 0 ? 'exact' : precision,
    items,
    isAccessible: true
  };
}

export function createUnavailableStage(stage: RecycleBinStage, errorMessage: string): IRecycleBinStageDiagnostics {
  return {
    stage,
    label: getStageLabel(stage),
    itemCount: null,
    sizeBytes: null,
    precision: 'partial',
    items: [],
    isAccessible: false,
    errorMessage
  };
}

export function evaluateHealth(args: {
  stage1: IRecycleBinStageDiagnostics;
  stage2: IRecycleBinStageDiagnostics;
  warningThresholdItems: number;
  warningThresholdSizeMb: number;
}): IRecycleBinHealthEvaluation {
  // Stage 2 being inaccessible is expected for non-admin users — not an error.
  const stage2PermissionLimited = !args.stage2.isAccessible && args.stage1.isAccessible;

  const reasons: string[] = [];
  const effectiveSizeBytes = stage2PermissionLimited
    ? args.stage1.sizeBytes
    : sumBytes([args.stage1.sizeBytes, args.stage2.sizeBytes]);
  const effectiveItems = stage2PermissionLimited
    ? args.stage1.itemCount
    : (args.stage1.itemCount !== null && args.stage2.itemCount !== null
        ? args.stage1.itemCount + args.stage2.itemCount
        : null);

  if (effectiveItems !== null && effectiveItems >= args.warningThresholdItems) {
    reasons.push(`El número de elementos eliminados supera el umbral configurado (${args.warningThresholdItems}).`);
  }

  if (effectiveSizeBytes !== null && effectiveSizeBytes >= args.warningThresholdSizeMb * 1024 * 1024) {
    reasons.push(`El tamaño total supera el umbral configurado (${args.warningThresholdSizeMb} MB).`);
  }

  if (!stage2PermissionLimited && (!args.stage1.isAccessible || !args.stage2.isAccessible)) {
    reasons.push('Falta acceso completo a una de las etapas de la papelera.');
  }

  if (reasons.some((reason) => reason.includes('supera'))) {
    const isCritical = reasons.length >= 2;
    return {
      level: isCritical ? 'critical' : 'warning',
      reasons
    };
  }

  if (!stage2PermissionLimited && (!args.stage1.isAccessible || !args.stage2.isAccessible)) {
    return {
      level: 'unknown',
      reasons
    };
  }

  return {
    level: 'ok',
    reasons: ['La papelera se mantiene por debajo de los umbrales configurados.']
  };
}

export function buildViewModel(args: {
  siteUrl: string;
  description: string;
  stage1: IRecycleBinStageDiagnostics;
  stage2: IRecycleBinStageDiagnostics;
  warningThresholdItems: number;
  warningThresholdSizeMb: number;
  title?: string;
}): IRecycleBinSpaceCalculatorViewModel {
  // Stage 2 requires Site Collection Administrator. When only stage 2 is inaccessible,
  // use stage 1 data for totals so the user still gets useful information.
  const stage2PermissionLimited = !args.stage2.isAccessible && args.stage1.isAccessible;

  const totalSizeBytes = stage2PermissionLimited
    ? args.stage1.sizeBytes
    : sumBytes([args.stage1.sizeBytes, args.stage2.sizeBytes]);
  const totalItemCount = stage2PermissionLimited
    ? args.stage1.itemCount
    : (args.stage1.itemCount !== null && args.stage2.itemCount !== null
        ? args.stage1.itemCount + args.stage2.itemCount
        : null);

  const hasPartialData = stage2PermissionLimited
    ? args.stage1.precision === 'partial' || args.stage1.sizeBytes === null
    : (args.stage1.precision === 'partial' ||
       args.stage2.precision === 'partial' ||
       !args.stage1.isAccessible ||
       totalSizeBytes === null ||
       totalItemCount === null);

  return {
    siteUrl: args.siteUrl,
    recycleBinUrl: buildRecycleBinPageUrl(args.siteUrl),
    title: args.title ?? 'Visualizador de elementos de biblioteca y papelera superior',
    description: args.description,
    stage1: args.stage1,
    stage2: args.stage2,
    totalItemCount,
    totalSizeBytes,
    hasPartialData,
    stage2PermissionLimited,
    health: evaluateHealth({
      stage1: args.stage1,
      stage2: args.stage2,
      warningThresholdItems: args.warningThresholdItems,
      warningThresholdSizeMb: args.warningThresholdSizeMb
    }),
    lastUpdated: new Date().toISOString()
  };
}
