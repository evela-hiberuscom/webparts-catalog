import { createSafeExternalLink } from '@paquete/spfx-common/utils';
import type {
  IChecklistFilterOption,
  IChecklistStep,
  OffboardingScenario,
  OffboardingScenarioFilter
} from '../models/offboardingOrChangeChecklistModels';

export const CHECKLIST_SCENARIOS: OffboardingScenario[] = ['offboarding', 'transfer', 'roleChange', 'generic'];

const SCENARIO_LABELS: Record<OffboardingScenario, string> = {
  offboarding: 'Offboarding',
  transfer: 'Transferencia',
  roleChange: 'Cambio de rol',
  generic: 'General'
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
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

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'si';
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  return false;
}

export function normalizeScenario(value: unknown): { scenario: OffboardingScenario; isPartial: boolean } {
  const normalized = normalizeText(value).toLowerCase();

  if (normalized === 'offboarding') {
    return { scenario: 'offboarding', isPartial: false };
  }

  if (normalized === 'transfer') {
    return { scenario: 'transfer', isPartial: false };
  }

  if (normalized === 'rolechange' || normalized === 'role-change' || normalized === 'role_change') {
    return { scenario: 'roleChange', isPartial: false };
  }

  if (normalized === 'generic') {
    return { scenario: 'generic', isPartial: false };
  }

  return { scenario: 'generic', isPartial: true };
}

export function normalizePhase(value: unknown, fallback = 'Sin fase'): { phase: string; isPartial: boolean } {
  const phase = normalizeText(value);
  if (phase) {
    return { phase, isPartial: false };
  }

  return { phase: fallback, isPartial: true };
}

export function normalizePriority(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
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

export function buildFallbackChecklistSteps(defaultScenario: OffboardingScenario, defaultPhase: string): IChecklistStep[] {
  const resolvedPhase = defaultPhase.trim() || 'Preparacion';

  return [
    {
      id: 'prepare-transition',
      title: 'Confirmar alcance del cambio',
      description: 'Validar fecha, responsable y tipo de proceso antes de iniciar.',
      scenario: defaultScenario,
      phase: resolvedPhase,
      critical: true,
      priority: 1,
      relatedUrl: '/sites/hr/procesos',
      relatedLabel: 'Proceso y contexto',
      partialData: false
    },
    {
      id: 'access-review',
      title: 'Revisar y cerrar accesos',
      description: 'VPN, correo, aplicaciones y grupos con acceso sensible.',
      scenario: 'offboarding',
      phase: 'Seguridad',
      critical: true,
      priority: 2,
      relatedUrl: '/sites/it/seguridad-accesos',
      relatedLabel: 'Guia de accesos',
      partialData: false
    },
    {
      id: 'asset-transfer',
      title: 'Transferir activos y tareas',
      description: 'Recoger equipos, traspasar ownership y actualizar pendientes.',
      scenario: 'transfer',
      phase: 'Transferencia',
      critical: false,
      priority: 3,
      relatedUrl: '/sites/ops/transferencia',
      relatedLabel: 'Plantilla de traspaso',
      partialData: false
    },
    {
      id: 'role-update',
      title: 'Actualizar rol y referencias',
      description: 'Alinear organigrama, permisos y comunicaciones internas.',
      scenario: 'roleChange',
      phase: 'Coordinacion',
      critical: false,
      priority: 4,
      relatedUrl: '/sites/hr/cambios',
      relatedLabel: 'Cambios internos',
      partialData: false
    }
  ];
}

function readField(record: Record<string, unknown>, names: string[]): unknown {
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(record, name)) {
      return record[name];
    }
  }

  return undefined;
}

export function normalizeChecklistStep(raw: unknown, index: number, defaultPhase: string): IChecklistStep {
  const record = isRecord(raw) ? raw : {};
  const title = normalizeText(readField(record, ['Title', 'title', 'StepTitle', 'stepTitle', 'Name', 'name', 'Task', 'task']), `Paso ${index + 1}`);
  const description = normalizeText(readField(record, ['Description', 'description', 'Details', 'details', 'Body', 'body']), '');
  const scenarioResult = normalizeScenario(readField(record, ['Scenario', 'scenario', 'ChecklistScenario', 'checklistScenario', 'Type', 'type', 'Category', 'category']));
  const phaseResult = normalizePhase(readField(record, ['Phase', 'phase', 'Stage', 'stage', 'OrderPhase', 'orderPhase']), defaultPhase || 'Sin fase');
  const relatedRaw = normalizeText(readField(record, ['RelatedUrl', 'relatedUrl', 'RelatedLink', 'relatedLink', 'LinkUrl', 'linkUrl', 'Url', 'url']), '');
  const relatedLink = createSafeExternalLink(relatedRaw);
  const critical = parseBoolean(readField(record, ['Critical', 'critical', 'IsCritical', 'isCritical', 'IsMandatory', 'isMandatory']));
  const priority = normalizePriority(readField(record, ['Priority', 'priority', 'SortOrder', 'sortOrder', 'Order', 'order']), index + 1);
  const relatedLabel = normalizeText(readField(record, ['RelatedLabel', 'relatedLabel', 'LinkText', 'linkText']), '');

  return {
    id: normalizeText(readField(record, ['Id', 'ID', 'id']), `step-${index + 1}`),
    title,
    description: description || undefined,
    scenario: scenarioResult.scenario,
    phase: phaseResult.phase,
    critical,
    priority,
    relatedUrl: relatedLink?.href,
    relatedLabel: relatedLabel || undefined,
    partialData: Boolean(scenarioResult.isPartial || phaseResult.isPartial || !relatedLink)
  };
}

export function parseChecklistCollection(raw: unknown): unknown[] {
  if (Array.isArray(raw)) {
    return raw;
  }

  if (isRecord(raw) && Array.isArray(raw.items)) {
    return raw.items;
  }

  if (isRecord(raw) && Array.isArray(raw.steps)) {
    return raw.steps;
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

export function sortChecklistSteps(items: IChecklistStep[]): IChecklistStep[] {
  return [...items].sort((left, right) => {
    if (left.critical !== right.critical) {
      return left.critical ? -1 : 1;
    }

    const phaseDelta = left.phase.localeCompare(right.phase);
    if (phaseDelta !== 0) {
      return phaseDelta;
    }

    if (left.priority !== right.priority) {
      return left.priority - right.priority;
    }

    return left.title.localeCompare(right.title);
  });
}

export function filterChecklistSteps(
  items: IChecklistStep[],
  scenario: OffboardingScenarioFilter,
  phase: string | 'all'
): IChecklistStep[] {
  return items.filter((item) => {
    const scenarioMatch =
      scenario === 'all' || scenario === 'generic' ? true : item.scenario === scenario || item.scenario === 'generic';
    const phaseMatch = phase === 'all' ? true : item.phase.localeCompare(phase, 'es', { sensitivity: 'base' }) === 0;
    return scenarioMatch && phaseMatch;
  });
}

export function collectScenarioOptions(items: IChecklistStep[]): IChecklistFilterOption[] {
  const options: IChecklistFilterOption[] = [{ key: 'all', text: 'Todos los escenarios' }];
  const seen = new Set<OffboardingScenario>();

  for (const scenario of CHECKLIST_SCENARIOS) {
    if (seen.has(scenario)) {
      continue;
    }

    if (scenario === 'generic' || items.some((item) => item.scenario === scenario)) {
      options.push({ key: scenario, text: SCENARIO_LABELS[scenario] });
      seen.add(scenario);
    }
  }

  return options;
}

export function collectPhaseOptions(items: IChecklistStep[]): IChecklistFilterOption[] {
  const options: IChecklistFilterOption[] = [{ key: 'all', text: 'Todas las fases' }];
  const seen = new Set<string>();

  for (const item of items) {
    const key = item.phase.trim();
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    options.push({ key, text: key });
  }

  return options;
}

export function getScenarioLabel(scenario: OffboardingScenario): string {
  return SCENARIO_LABELS[scenario];
}

export function getStepLinkProps(url: string | undefined): ReturnType<typeof createSafeExternalLink> | undefined {
  if (!url) {
    return undefined;
  }

  return createSafeExternalLink(url);
}

export function deriveServerRelativePath(listTitleOrUrl: string, webUrl: string): string {
  const resolved = new URL(listTitleOrUrl, webUrl);
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
