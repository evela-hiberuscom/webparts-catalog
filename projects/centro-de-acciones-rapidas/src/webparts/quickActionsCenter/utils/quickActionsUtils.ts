import type { IQuickAction, IQuickActionInput } from '../models/quickActionsModels';

export const ALL_CATEGORIES_LABEL = 'Todas';
export const DEFAULT_CATEGORY = 'General';
export const DEFAULT_ICON = 'Page';

export interface IQuickActionsSourceRecord {
  [key: string]: unknown;
}

export function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export function normalizeCollection(raw: unknown): IQuickActionsSourceRecord[] {
  if (Array.isArray(raw)) {
    return raw.filter((entry): entry is IQuickActionsSourceRecord => Boolean(entry) && typeof entry === 'object');
  }

  if (raw && typeof raw === 'object') {
    const candidate = raw as { items?: unknown[]; value?: unknown[]; results?: unknown[]; d?: { results?: unknown[] } };
    if (Array.isArray(candidate.items)) {
      return candidate.items.filter((entry): entry is IQuickActionsSourceRecord => Boolean(entry) && typeof entry === 'object');
    }
    if (Array.isArray(candidate.value)) {
      return candidate.value.filter((entry): entry is IQuickActionsSourceRecord => Boolean(entry) && typeof entry === 'object');
    }
    if (Array.isArray(candidate.results)) {
      return candidate.results.filter((entry): entry is IQuickActionsSourceRecord => Boolean(entry) && typeof entry === 'object');
    }
    if (candidate.d && Array.isArray(candidate.d.results)) {
      return candidate.d.results.filter((entry): entry is IQuickActionsSourceRecord => Boolean(entry) && typeof entry === 'object');
    }
  }

  return [];
}

export function normalizeCategory(value: unknown): string {
  const text = normalizeText(value);
  return text || DEFAULT_CATEGORY;
}

export function normalizeIconName(value: unknown): string {
  const text = normalizeText(value);
  return text || DEFAULT_ICON;
}

export function normalizeQuickAction(input: IQuickActionInput, index: number, defaultCategory: string): IQuickAction | undefined {
  const title = normalizeText(input.title);
  if (!title) {
    return undefined;
  }

  const description = normalizeText(input.description) || 'Sin descripción disponible.';
  const openUrl = normalizeText(input.openUrl);

  return {
    id: normalizeText(input.id) || `quick-action-${index + 1}`,
    title,
    description,
    category: normalizeCategory(input.category || defaultCategory),
    icon: normalizeIconName(input.icon),
    priority: normalizeNumber(input.priority),
    openUrl: openUrl || undefined
  };
}

export function sortQuickActions(items: IQuickAction[]): IQuickAction[] {
  return [...items].sort((left, right) => {
    const leftPriority = left.priority ?? Number.MAX_SAFE_INTEGER;
    const rightPriority = right.priority ?? Number.MAX_SAFE_INTEGER;

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return left.title.localeCompare(right.title);
  });
}

export function uniqueCategories(items: IQuickAction[]): string[] {
  const seen = new Set<string>();
  const categories: string[] = [];

  for (const item of items) {
    const key = item.category.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    categories.push(item.category);
  }

  return categories;
}

export function filterQuickActions(items: IQuickAction[], selectedCategory: string): IQuickAction[] {
  const normalized = normalizeText(selectedCategory);
  if (!normalized || normalized === ALL_CATEGORIES_LABEL) {
    return items;
  }

  const filterKey = normalized.toLowerCase();
  return items.filter((item) => item.category.toLowerCase() === filterKey);
}

export function hasPartialQuickAction(action: IQuickAction): boolean {
  return !action.openUrl || !action.description.trim() || action.category === DEFAULT_CATEGORY || action.icon === DEFAULT_ICON;
}

export function buildFallbackQuickActions(): IQuickAction[] {
  return sortQuickActions([
    {
      id: 'support',
      title: 'Soporte',
      description: 'Abrir el punto de soporte corporativo.',
      category: 'IT',
      icon: 'Headset',
      priority: 1,
      openUrl: '/sites/it/soporte'
    },
    {
      id: 'forms',
      title: 'Formularios',
      description: 'Ir al catálogo de formularios frecuentes.',
      category: 'Operaciones',
      icon: 'FormLibrary',
      priority: 2,
      openUrl: '/sites/operations/forms'
    },
    {
      id: 'hr-requests',
      title: 'Solicitudes RRHH',
      description: 'Abrir solicitudes y trámites de personas.',
      category: 'RRHH',
      icon: 'People',
      priority: 3,
      openUrl: '/sites/hr/requests'
    },
    {
      id: 'docs',
      title: 'Manual y políticas',
      description: 'Consultar documentación y normas internas.',
      category: 'Documentación',
      icon: 'KnowledgeArticle',
      priority: 4,
      openUrl: '/sites/corporate/policies'
    },
    {
      id: 'team-links',
      title: 'Accesos del equipo',
      description: 'Entradas prioritarias para el área actual.',
      category: 'Equipo',
      icon: 'FavoriteStar',
      priority: 5,
      openUrl: '/sites/team/links'
    }
  ]);
}
