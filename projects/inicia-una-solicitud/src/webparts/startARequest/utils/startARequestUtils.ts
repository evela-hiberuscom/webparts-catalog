import { createSafeExternalLink, ensureUniqueStrings, classifyAsyncState } from '@paquete/spfx-common/utils';
import type {
  IRequestItem,
  IRequestLink,
  RequestCatalogStatus
} from '../models/startARequestModels';

interface IRecordLike {
  [key: string]: unknown;
}

interface IStaticRequestSeed {
  id: string;
  title: string;
  category: string;
  audience?: string;
  description?: string;
  prerequisites?: string;
  startUrl?: string;
  featured?: boolean;
  order?: number;
}

const STATIC_REQUESTS: IStaticRequestSeed[] = [
  {
    id: 'vacaciones',
    title: 'Solicitar vacaciones',
    category: 'RRHH',
    audience: 'Empleado',
    description: 'Inicia una solicitud de vacaciones en el flujo corporativo.',
    prerequisites: 'Comprueba el saldo disponible antes de continuar.',
    startUrl: '/sites/hr/requests/vacaciones',
    featured: true,
    order: 1
  },
  {
    id: 'soporte',
    title: 'Abrir ticket de soporte',
    category: 'IT',
    audience: 'Empleado',
    description: 'Dirige la petición al servicio de soporte correcto.',
    prerequisites: 'Describe el problema con el mayor detalle posible.',
    startUrl: '/sites/it/requests/soporte',
    featured: true,
    order: 2
  },
  {
    id: 'material',
    title: 'Pedir material',
    category: 'Operaciones',
    audience: 'Empleado',
    description: 'Solicita material habitual sin navegar por varios portales.',
    prerequisites: 'Ten a mano el centro de coste si aplica.',
    startUrl: '/sites/ops/requests/material',
    featured: false,
    order: 3
  },
  {
    id: 'compras',
    title: 'Solicitar compra',
    category: 'Finanzas',
    audience: 'Backoffice',
    description: 'Abre una solicitud de compra con el circuito adecuado.',
    prerequisites: 'Adjunta el presupuesto o la justificacion interna.',
    startUrl: '/sites/finance/requests/compras',
    featured: false,
    order: 4
  }
];

function isRecord(value: unknown): value is IRecordLike {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function normalizeOptionalText(value: unknown): string | undefined {
  const normalized = normalizeText(value);
  return normalized.length > 0 ? normalized : undefined;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return /^(true|1|yes|si|sí)$/i.test(value.trim());
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  return false;
}

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function parseCollection(payload: unknown): IRecordLike[] {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }

  if (!isRecord(payload)) {
    return [];
  }

  const value = payload.value;
  if (Array.isArray(value)) {
    return value.filter(isRecord);
  }

  const data = payload.d;
  if (isRecord(data) && Array.isArray(data.results)) {
    return data.results.filter(isRecord);
  }

  if (Array.isArray(payload.items)) {
    return payload.items.filter(isRecord);
  }

  return [];
}

export function normalizeSameOriginUrl(rawUrl: string, webUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    throw new Error('listTitleOrUrl is required');
  }

  const resolved = new URL(trimmed, webUrl);
  const webOrigin = new URL(webUrl).origin;
  if (resolved.origin !== webOrigin) {
    throw new Error('listTitleOrUrl must be same-origin or relative');
  }

  return resolved.toString();
}

export function normalizeListTitleOrUrl(rawValue: string, webUrl: string): { isUrlLike: boolean; value: string } {
  const value = rawValue.trim();
  if (!value) {
    throw new Error('listTitleOrUrl is required when sourceType is SharePointList');
  }

  if (/^(https?:\/\/|\/)/i.test(value)) {
    return {
      isUrlLike: true,
      value: normalizeSameOriginUrl(value, webUrl)
    };
  }

  return {
    isUrlLike: false,
    value
  };
}

function extractListRootPath(rawUrl: string, webUrl: string): string {
  const resolved = new URL(rawUrl, webUrl);
  const pathname = decodeURIComponent(resolved.pathname).replace(/\/$/, '');
  const lower = pathname.toLowerCase();

  if (lower.endsWith('/forms/allitems.aspx')) {
    return pathname.slice(0, -'/Forms/AllItems.aspx'.length);
  }

  if (lower.endsWith('/allitems.aspx')) {
    return pathname.slice(0, -'/AllItems.aspx'.length);
  }

  if (lower.endsWith('/forms')) {
    return pathname.slice(0, -'/Forms'.length);
  }

  return pathname;
}

export function buildSharePointListEndpoint(webUrl: string, listTitleOrUrl: string): string {
  const normalized = normalizeListTitleOrUrl(listTitleOrUrl, webUrl);
  const siteRoot = webUrl.replace(/\/$/, '');

  if (!normalized.isUrlLike) {
    return `${siteRoot}/_api/web/lists/getbytitle('${normalized.value.replace(/'/g, "''")}')/items?$select=Id,Title,Category,Audience,Description,Prerequisites,StartUrl,Featured,SortOrder`;
  }

  const listUrl = extractListRootPath(normalized.value, webUrl);
  return `${siteRoot}/_api/web/GetList(@listUrl)/items?$select=Id,Title,Category,Audience,Description,Prerequisites,StartUrl,Featured,SortOrder&@listUrl='${encodeURIComponent(listUrl)}'`;
}

export function normalizeRequestLink(rawUrl: unknown, webUrl: string): IRequestLink | undefined {
  const value = normalizeOptionalText(rawUrl);
  if (!value) {
    return undefined;
  }

  if (/^(javascript|data|vbscript):/i.test(value)) {
    return undefined;
  }

  try {
    const resolved = new URL(value, webUrl);
    if (resolved.origin === new URL(webUrl).origin) {
      return {
        href: resolved.toString(),
        external: false
      };
    }
  } catch {
    return undefined;
  }

  const safeExternal = createSafeExternalLink(value);
  if (!safeExternal) {
    return undefined;
  }

  return {
    ...safeExternal,
    external: true
  };
}

export function normalizeRequestItem(rawItem: unknown, index: number, webUrl: string): IRequestItem {
  const item = isRecord(rawItem) ? rawItem : {};
  const title = normalizeOptionalText(item.Title ?? item.title) ?? `Solicitud ${index + 1}`;
  const category = normalizeOptionalText(item.Category ?? item.category) ?? normalizeOptionalText(item.Audience ?? item.audience) ?? 'General';
  const audience = normalizeOptionalText(item.Audience ?? item.audience);
  const description = normalizeOptionalText(item.Description ?? item.description);
  const prerequisites = normalizeOptionalText(item.Prerequisites ?? item.prerequisites);
  const startUrl = normalizeOptionalText(item.StartUrl ?? item.startUrl);
  const featured = toBoolean(item.Featured ?? item.featured);
  const order = toNumber(item.SortOrder ?? item.order ?? item.Order, index + 1);
  const startLink = normalizeRequestLink(startUrl ?? '', webUrl);
  const actionable = Boolean(startLink);
  const partialData = !startLink || !description || !prerequisites;

  return {
    id: normalizeOptionalText(item.Id ?? item.id) ?? `${index + 1}`,
    title,
    category,
    audience,
    description,
    prerequisites,
    startUrl,
    featured,
    order,
    actionable,
    partialData,
    startLink
  };
}

export function normalizeRequestCollection(rawPayload: unknown, webUrl: string): IRequestItem[] {
  return parseCollection(rawPayload).map((item, index) => normalizeRequestItem(item, index, webUrl));
}

export function buildStaticRequestItems(webUrl: string): IRequestItem[] {
  return STATIC_REQUESTS.map((item, index) =>
    normalizeRequestItem(
      {
        Id: item.id,
        Title: item.title,
        Category: item.category,
        Audience: item.audience,
        Description: item.description,
        Prerequisites: item.prerequisites,
        StartUrl: item.startUrl,
        Featured: item.featured ?? false,
        SortOrder: item.order ?? index + 1
      },
      index,
      webUrl
    )
  );
}

export function deriveCategories(items: IRequestItem[]): string[] {
  return ensureUniqueStrings(items.map((item) => item.category)).sort((left, right) => left.localeCompare(right));
}

export function sortRequests(items: IRequestItem[]): IRequestItem[] {
  return [...items].sort((left: IRequestItem, right: IRequestItem) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    if (left.order !== right.order) {
      return left.order - right.order;
    }

    return left.title.localeCompare(right.title);
  });
}

export function filterRequestsByCategory(items: IRequestItem[], category: string): IRequestItem[] {
  const normalized = category.trim();
  if (!normalized || normalized === 'all') {
    return items;
  }

  return items.filter((item) => item.category.toLowerCase() === normalized.toLowerCase());
}

export function classifyRequestStatus(input: {
  hasData: boolean;
  hasError: boolean;
  hasPartialData: boolean;
  isLoading: boolean;
}): RequestCatalogStatus {
  return classifyAsyncState({
    hasData: input.hasData,
    hasError: input.hasError,
    isPartial: input.hasPartialData,
    isLoading: input.isLoading
  }) as RequestCatalogStatus;
}
