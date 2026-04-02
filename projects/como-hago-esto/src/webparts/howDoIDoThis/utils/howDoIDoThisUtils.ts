import type { IGuideItem, IGuideItemInput } from '../models/howDoIDoThisModels';

export const ALL_CATEGORIES_LABEL = 'All';
export const DEFAULT_CATEGORY = 'General';
const DEFAULT_SUMMARY = '';

interface ISourceRecord {
  [key: string]: unknown;
}

export function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeCollection(raw: unknown): ISourceRecord[] {
  if (Array.isArray(raw)) {
    return raw.filter((entry): entry is ISourceRecord => Boolean(entry) && typeof entry === 'object');
  }

  if (raw && typeof raw === 'object') {
    const candidate = raw as { items?: unknown[]; value?: unknown[]; results?: unknown[]; d?: { results?: unknown[] } };
    if (Array.isArray(candidate.items)) {
      return candidate.items.filter((entry): entry is ISourceRecord => Boolean(entry) && typeof entry === 'object');
    }
    if (Array.isArray(candidate.value)) {
      return candidate.value.filter((entry): entry is ISourceRecord => Boolean(entry) && typeof entry === 'object');
    }
    if (Array.isArray(candidate.results)) {
      return candidate.results.filter((entry): entry is ISourceRecord => Boolean(entry) && typeof entry === 'object');
    }
    if (candidate.d && Array.isArray(candidate.d.results)) {
      return candidate.d.results.filter((entry): entry is ISourceRecord => Boolean(entry) && typeof entry === 'object');
    }
  }

  return [];
}

export function normalizeCategory(value: unknown, defaultCategory?: string): string {
  return normalizeText(value) || normalizeText(defaultCategory) || DEFAULT_CATEGORY;
}

export function normalizeBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value > 0;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  }

  return false;
}

export function normalizeSteps(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => normalizeText(entry))
      .filter((entry) => Boolean(entry));
  }

  const text = normalizeText(value);
  if (!text) {
    return [];
  }

  if (text.startsWith('[') && text.endsWith(']')) {
    try {
      return normalizeSteps(JSON.parse(text) as unknown);
    } catch {
      return [];
    }
  }

  return text
    .split(/\r?\n|;/)
    .map((entry) => entry.replace(/^\s*(?:\d+[.)]|-)\s*/, '').trim())
    .filter((entry) => Boolean(entry));
}

export function resolveSameOriginUrl(rawUrl: string, webUrl: string): string {
  const resolved = new URL(rawUrl, webUrl);
  if (resolved.origin !== new URL(webUrl).origin) {
    throw new Error('JsonUrl must be same-origin or relative.');
  }

  return resolved.toString();
}

function sanitizeRelatedUrl(value: unknown, webUrl: string): string | undefined {
  const text = normalizeText(value);
  if (!text) {
    return undefined;
  }

  try {
    return resolveSameOriginUrl(text, webUrl);
  } catch {
    return undefined;
  }
}

function escapeODataValue(value: string): string {
  return value.replace(/'/g, "''");
}

function deriveListRootPath(rawUrl: string, webUrl: string): string {
  const resolved = new URL(rawUrl, webUrl);
  let pathName = decodeURIComponent(resolved.pathname).replace(/\/$/, '');
  const lowerPath = pathName.toLowerCase();

  if (lowerPath.endsWith('/forms/allitems.aspx')) {
    pathName = pathName.slice(0, -'/Forms/AllItems.aspx'.length);
  } else if (lowerPath.endsWith('/allitems.aspx')) {
    pathName = pathName.slice(0, -'/AllItems.aspx'.length);
  }

  return pathName || '/';
}

export function resolveSharePointListEndpoint(webUrl: string, listTitleOrUrl: string): string {
  const trimmed = normalizeText(listTitleOrUrl);
  if (!trimmed) {
    throw new Error('listTitleOrUrl is required when sourceType is SharePointList');
  }

  const baseUrl = webUrl.replace(/\/$/, '');
  const select = '$select=Id,Title,Summary,Description,Category,Steps,RelatedUrl,RelatedLink,Featured,IsFeatured';

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) {
    const resolved = resolveSameOriginUrl(trimmed, webUrl);
    const listPath = deriveListRootPath(resolved, webUrl);
    return `${baseUrl}/_api/web/GetList(@listUrl)/items?${select}&@listUrl='${encodeURIComponent(listPath)}'`;
  }

  return `${baseUrl}/_api/web/lists/getbytitle('${escapeODataValue(trimmed)}')/items?${select}`;
}

export function normalizeGuide(input: IGuideItemInput, index: number, webUrl: string, defaultCategory?: string): IGuideItem | undefined {
  const title = normalizeText(input.title);
  if (!title) {
    return undefined;
  }

  const summary = normalizeText(input.summary) || normalizeText(input.description) || DEFAULT_SUMMARY;
  const steps = normalizeSteps(input.steps);
  const relatedUrl = sanitizeRelatedUrl(input.relatedUrl ?? input.relatedLink, webUrl);
  const category = normalizeCategory(input.category, defaultCategory);
  const featured = normalizeBoolean(input.featured);
  const isPartial = !steps.length || !relatedUrl || category === DEFAULT_CATEGORY;

  return {
    id: normalizeText(input.id) || `guide-${index + 1}`,
    title,
    summary,
    category,
    steps,
    relatedUrl,
    featured,
    isPartial
  };
}

export function sortGuides(items: IGuideItem[]): IGuideItem[] {
  return [...items].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    return left.title.localeCompare(right.title);
  });
}

export function buildFallbackGuides(): IGuideItem[] {
  return sortGuides([
    {
      id: 'guide-material',
      title: 'Cómo pedir material',
      summary: 'Solicita material de oficina sin abrir un ticket manual.',
      category: 'Compras',
      steps: ['Abre el formulario de compras.', 'Selecciona el centro de coste.', 'Envía la solicitud para validación.'],
      relatedUrl: '/sites/purchases/material',
      featured: true,
      isPartial: false
    },
    {
      id: 'guide-expenses',
      title: 'Cómo reportar un gasto',
      summary: 'Carga justificantes y deja el gasto listo para aprobación.',
      category: 'Finanzas',
      steps: ['Entra en el portal de gastos.', 'Adjunta el recibo.', 'Confirma el concepto y el proyecto.'],
      relatedUrl: '/sites/finance/expenses',
      featured: true,
      isPartial: false
    },
    {
      id: 'guide-absence',
      title: 'Cómo solicitar una ausencia',
      summary: 'Registra vacaciones o permisos desde el autoservicio de personas.',
      category: 'Personas',
      steps: ['Accede al portal de ausencias.', 'Elige las fechas.', 'Añade observaciones si son necesarias.'],
      relatedUrl: '/sites/hr/leave',
      featured: false,
      isPartial: false
    },
    {
      id: 'guide-signature',
      title: 'Cómo actualizar la firma',
      summary: 'Revisa el formato corporativo y publica la firma en Outlook.',
      category: 'IT',
      steps: [],
      relatedUrl: '/sites/it/signature',
      featured: false,
      isPartial: true
    }
  ]);
}
