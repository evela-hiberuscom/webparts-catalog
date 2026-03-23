import type { IFavoriteItem, IRawFavoriteItem } from '../models/favoritesTypes';

const FALLBACK_FAVORITES: IRawFavoriteItem[] = [
  {
    id: 'portal-comercial',
    title: 'Portal Comercial',
    description: 'Acceso rápido a campañas, recursos y materiales de negocio.',
    openUrl: '/sites/comercial',
    icon: 'WorkforceManagement',
    type: 'site',
    category: 'Negocio',
    featured: true,
    sortOrder: 1
  },
  {
    id: 'docs-utiles',
    title: 'Mis documentos útiles',
    description: 'Plantillas y documentos de uso recurrente.',
    openUrl: '/sites/documentos-utiles',
    icon: 'Page',
    type: 'document',
    category: 'Documentos',
    featured: false,
    sortOrder: 2
  },
  {
    id: 'intranet-home',
    title: 'Inicio de intranet',
    description: 'Página principal y accesos corporativos importantes.',
    openUrl: '/sites/intranet',
    icon: 'Home',
    type: 'site',
    category: 'Navegación',
    featured: false,
    sortOrder: 3
  }
];

const SAFE_URL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

export interface ISafeLinkProps {
  href: string;
  target: '_self' | '_blank';
  rel?: string;
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }

  return false;
}

export function parseNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

export function getDefaultFavorites(): IRawFavoriteItem[] {
  return FALLBACK_FAVORITES.map((item) => ({ ...item }));
}

function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }

  return 'https://localhost';
}

function isSafeProtocol(protocol: string): boolean {
  return SAFE_URL_PROTOCOLS.indexOf(protocol) !== -1;
}

export function sanitizeOpenUrl(openUrl?: string): string | undefined {
  const candidate = (openUrl ?? '').trim();
  if (!candidate) {
    return undefined;
  }

  try {
    const resolved = new URL(candidate, getBaseUrl());
    if (!isSafeProtocol(resolved.protocol)) {
      return undefined;
    }

    return resolved.href;
  } catch {
    return undefined;
  }
}

export function createSafeLinkProps(openUrl?: string): ISafeLinkProps | undefined {
  const href = sanitizeOpenUrl(openUrl);
  if (!href) {
    return undefined;
  }

  const resolved = new URL(href);
  if (resolved.protocol === 'http:' || resolved.protocol === 'https:') {
    if (typeof window !== 'undefined' && resolved.origin !== window.location.origin) {
      return {
        href,
        target: '_blank',
        rel: 'noopener noreferrer'
      };
    }
  }

  return {
    href,
    target: '_self'
  };
}

export function inferIcon(type?: string, explicitIcon?: string): string {
  if (explicitIcon) {
    return explicitIcon;
  }

  switch ((type ?? '').toLowerCase()) {
    case 'site':
      return 'Globe';
    case 'document':
      return 'Page';
    case 'tool':
      return 'WaffleOffice365';
    case 'app':
      return 'Apps';
    default:
      return 'FavoriteStar';
  }
}

export function parseFavoritesJson(rawJson: string): { items: IRawFavoriteItem[]; warnings: string[] } {
  const trimmed = rawJson.trim();
  if (!trimmed) {
    return {
      items: getDefaultFavorites(),
      warnings: ['No se proporcionó JSON de favoritos; se usa un conjunto de ejemplo.']
    };
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    const items = Array.isArray(parsed)
      ? parsed
      : typeof parsed === 'object' && parsed !== null && Array.isArray((parsed as { items?: unknown[] }).items)
        ? (parsed as { items: IRawFavoriteItem[] }).items
        : [];

    if (!items.length) {
      return {
        items: getDefaultFavorites(),
        warnings: ['El JSON de favoritos no contenía elementos válidos; se usa un conjunto de ejemplo.']
      };
    }

    return { items, warnings: [] };
  } catch {
    return {
      items: getDefaultFavorites(),
      warnings: ['El JSON de favoritos no es válido; se usa un conjunto de ejemplo.']
    };
  }
}

export function normalizeFavoriteItem(rawItem: IRawFavoriteItem, index: number): IFavoriteItem {
  const title = (rawItem.title ?? '').trim();
  const normalizedTitle = title || `Favorito ${index + 1}`;
  const openUrl = sanitizeOpenUrl(rawItem.openUrl ?? rawItem.url);
  const sortOrder = parseNumber(rawItem.sortOrder);

  return {
    id: rawItem.id?.trim() || slugify(normalizedTitle) || `favorite-${index + 1}`,
    title: normalizedTitle,
    description: rawItem.description?.trim() || undefined,
    openUrl,
    icon: inferIcon(rawItem.type, rawItem.icon),
    type: rawItem.type?.trim() || 'general',
    category: rawItem.category?.trim() || undefined,
    featured: parseBoolean(rawItem.featured),
    sortOrder,
    hasAction: Boolean(openUrl)
  };
}

export function sortFavorites(items: IFavoriteItem[]): IFavoriteItem[] {
  return [...items].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    const leftOrder = left.sortOrder ?? Number.POSITIVE_INFINITY;
    const rightOrder = right.sortOrder ?? Number.POSITIVE_INFINITY;
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.title.localeCompare(right.title, 'es', { sensitivity: 'base' });
  });
}

export function limitFavorites(items: IFavoriteItem[], maxItems: number): IFavoriteItem[] {
  return items.slice(0, clampNumber(maxItems, 1, 24));
}

export function isPartialFavorite(item: IFavoriteItem): boolean {
  return !item.hasAction || !item.category;
}

export function describeSource(dataSourceType: string, listTitleOrUrl: string): string {
  switch (dataSourceType) {
    case 'SharePointList':
      return listTitleOrUrl ? `SharePoint list: ${listTitleOrUrl}` : 'SharePoint list';
    case 'StaticConfig':
    default:
      return 'Static config';
  }
}
