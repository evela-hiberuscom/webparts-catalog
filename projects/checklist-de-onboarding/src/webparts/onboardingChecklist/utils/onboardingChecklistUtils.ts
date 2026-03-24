import { createSafeExternalLink } from '@paquete/spfx-common/utils';
import type {
  IOnboardingChecklistFilterOption,
  IOnboardingChecklistStep,
  OnboardingChecklistFilter
} from '../models/onboardingChecklistModels';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readField(record: Record<string, unknown>, names: string[]): unknown {
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(record, name)) {
      return record[name];
    }
  }

  return undefined;
}

export function normalizeText(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

export function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'si';
  }

  return false;
}

export function normalizePhase(value: unknown, fallback = 'General'): { phase: string; isPartial: boolean } {
  const phase = normalizeText(value);
  if (phase) {
    return { phase, isPartial: false };
  }

  return { phase: fallback, isPartial: true };
}

export function normalizeVariant(value: unknown, fallback = 'General'): { variant: string; isPartial: boolean } {
  const variant = normalizeText(value);
  if (variant) {
    return { variant, isPartial: false };
  }

  return { variant: fallback, isPartial: true };
}

export function normalizeOrder(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

export function normalizeSourceLabel(sourceType: string, listTitleOrUrl: string, jsonUrl: string): string {
  if (sourceType === 'StaticConfig') {
    return 'Configuracion local';
  }

  if (sourceType === 'JsonUrl') {
    return jsonUrl ? `JSON: ${jsonUrl}` : 'JSON sin configurar';
  }

  return listTitleOrUrl ? `Lista SharePoint: ${listTitleOrUrl}` : 'Lista SharePoint';
}

export function parseChecklistCollection(raw: unknown): unknown[] {
  if (Array.isArray(raw)) {
    return raw;
  }

  if (isRecord(raw) && Array.isArray(raw.items)) {
    return raw.items;
  }

  if (isRecord(raw) && Array.isArray(raw.results)) {
    return raw.results;
  }

  if (isRecord(raw) && Array.isArray(raw.value)) {
    return raw.value;
  }

  if (isRecord(raw) && isRecord(raw.d) && Array.isArray(raw.d.results)) {
    return raw.d.results;
  }

  throw new Error('Expected an array payload or a payload with items/results/value collections');
}

export function resolveSameOriginUrl(rawUrl: string, webUrl: string): string {
  const trimmed = normalizeText(rawUrl);
  if (!trimmed) {
    throw new Error('url is required');
  }

  const resolved = new URL(trimmed, webUrl);
  if (resolved.origin !== new URL(webUrl).origin) {
    throw new Error('url must be same-origin or relative');
  }

  return resolved.toString();
}

export function deriveServerRelativeListPath(rawListUrl: string, webUrl: string): string {
  const resolved = new URL(rawListUrl, webUrl);
  let pathName = decodeURIComponent(resolved.pathname).replace(/\/$/, '');
  const lowerPath = pathName.toLowerCase();

  if (lowerPath.endsWith('/forms/allitems.aspx')) {
    pathName = pathName.slice(0, -'/Forms/AllItems.aspx'.length);
  } else if (lowerPath.endsWith('/allitems.aspx')) {
    pathName = pathName.slice(0, -'/AllItems.aspx'.length);
  } else if (lowerPath.endsWith('/forms')) {
    pathName = pathName.slice(0, -'/Forms'.length);
  }

  return pathName || '/';
}

export function getStepLinkProps(url: string | undefined): ReturnType<typeof createSafeExternalLink> | undefined {
  if (!url) {
    return undefined;
  }

  return createSafeExternalLink(url);
}

export function normalizeOnboardingChecklistStep(raw: unknown, index: number, defaultPhase: string): IOnboardingChecklistStep {
  const record = isRecord(raw) ? raw : {};
  const titleSource = readField(record, ['Title', 'title', 'StepTitle', 'stepTitle', 'Name', 'name', 'Task', 'task']);
  const title = normalizeText(titleSource, `Paso ${index + 1}`);
  const phaseResult = normalizePhase(readField(record, ['Phase', 'phase', 'Stage', 'stage', 'StepPhase', 'stepPhase']), defaultPhase || 'General');
  const variantResult = normalizeVariant(readField(record, ['Variant', 'variant', 'Audience', 'audience', 'Role', 'role', 'Target', 'target', 'Persona', 'persona']), 'General');
  const description = normalizeText(readField(record, ['Description', 'description', 'Details', 'details', 'Body', 'body']), '');
  const relatedRaw = normalizeText(readField(record, ['RelatedUrl', 'relatedUrl', 'RelatedLink', 'relatedLink', 'LinkUrl', 'linkUrl', 'Url', 'url']), '');
  const relatedLabel = normalizeText(readField(record, ['RelatedLabel', 'relatedLabel', 'LinkText', 'linkText']), '');
  const mandatory = parseBoolean(readField(record, ['Mandatory', 'mandatory', 'Required', 'required', 'IsMandatory', 'isMandatory', 'Critical', 'critical']));
  const order = normalizeOrder(readField(record, ['Order', 'order', 'SortOrder', 'sortOrder', 'Priority', 'priority']), index + 1);
  const link = getStepLinkProps(relatedRaw);
  const id = normalizeText(readField(record, ['Id', 'ID', 'id']), `step-${index + 1}`);

  return {
    id,
    title,
    description: description || undefined,
    phase: phaseResult.phase,
    variant: variantResult.variant,
    mandatory,
    order,
    relatedUrl: link?.href,
    relatedLabel: relatedLabel || undefined,
    partialData: Boolean(
      title === `Paso ${index + 1}` || phaseResult.isPartial || variantResult.isPartial || !link
    )
  };
}

export function sortOnboardingChecklistSteps(items: IOnboardingChecklistStep[]): IOnboardingChecklistStep[] {
  return [...items].sort((left, right) => {
    const phaseDelta = left.phase.localeCompare(right.phase, 'es', { sensitivity: 'base' });
    if (phaseDelta !== 0) {
      return phaseDelta;
    }

    if (left.mandatory !== right.mandatory) {
      return left.mandatory ? -1 : 1;
    }

    if (left.order !== right.order) {
      return left.order - right.order;
    }

    return left.title.localeCompare(right.title, 'es', { sensitivity: 'base' });
  });
}

export function filterOnboardingChecklistSteps(
  items: IOnboardingChecklistStep[],
  variant: OnboardingChecklistFilter,
  phase: OnboardingChecklistFilter
): IOnboardingChecklistStep[] {
  return items.filter((item) => {
    const variantMatch =
      variant === 'all' || normalizeText(item.variant).localeCompare(normalizeText(variant), 'es', { sensitivity: 'base' }) === 0;
    const phaseMatch =
      phase === 'all' || normalizeText(item.phase).localeCompare(normalizeText(phase), 'es', { sensitivity: 'base' }) === 0;

    return variantMatch && phaseMatch;
  });
}

export function collectVariantOptions(items: IOnboardingChecklistStep[]): IOnboardingChecklistFilterOption[] {
  const seen = new Set<string>();
  const options: IOnboardingChecklistFilterOption[] = [{ key: 'all', text: 'Todas las variantes' }];

  for (const item of items) {
    const key = normalizeText(item.variant);
    if (!key || seen.has(key.toLowerCase())) {
      continue;
    }

    seen.add(key.toLowerCase());
    options.push({ key, text: key });
  }

  return options;
}

export function collectPhaseOptions(items: IOnboardingChecklistStep[]): IOnboardingChecklistFilterOption[] {
  const seen = new Set<string>();
  const options: IOnboardingChecklistFilterOption[] = [{ key: 'all', text: 'Todas las fases' }];

  for (const item of items) {
    const key = normalizeText(item.phase);
    if (!key || seen.has(key.toLowerCase())) {
      continue;
    }

    seen.add(key.toLowerCase());
    options.push({ key, text: key });
  }

  return options;
}
