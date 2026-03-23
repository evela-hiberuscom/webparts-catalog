import type {
  IContextHelpLink,
  IContextHelpRecord,
  IContextHelpSourceRecord,
  PageContextAssistantDataSourceType,
  PageContextAssistantFallbackMode
} from "../models/pageContextAssistantModels";

export const STATIC_CONTEXT_HELP_CATALOG: IContextHelpSourceRecord[] = [
  {
    id: "generic-help",
    contextKey: "generic",
    title: "Ayuda contextual general",
    message: "Usa este bloque para orientar al usuario con un siguiente paso claro sin sacarlo de la página actual.",
    relatedLinks: [
      {
        label: "Abrir guía ampliada",
        url: "#"
      }
    ],
    isGeneric: true,
    order: 1
  },
  {
    id: "section-help",
    contextKey: "section",
    title: "Ayuda de sección",
    message: "Explica qué puede hacer el usuario en esta sección y qué recurso debería abrir después.",
    relatedLinks: [],
    isGeneric: false,
    order: 2
  }
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStringCandidate(record: IContextHelpSourceRecord, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function getBooleanCandidate(record: IContextHelpSourceRecord, keys: string[]): boolean {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true") {
        return true;
      }

      if (normalized === "false") {
        return false;
      }
    }
  }

  return false;
}

function getNumberCandidate(record: IContextHelpSourceRecord, keys: string[]): number {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number.parseInt(value.trim(), 10);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return Number.MAX_SAFE_INTEGER;
}

export function normalizeText(value: string | undefined): string {
  return value?.trim() ?? "";
}

export function normalizeContextKey(value: string | undefined): string {
  return normalizeText(value).toLowerCase();
}

export function resolveCurrentContextKey(webUrl: string, pageTitle?: string, explicitContextKey?: string): string {
  const explicit = normalizeText(explicitContextKey);
  if (explicit) {
    return explicit;
  }

  const currentTitle = normalizeText(pageTitle);
  if (currentTitle) {
    return currentTitle;
  }

  try {
    const resolved = new URL(webUrl);
    const segments = resolved.pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    if (lastSegment) {
      return decodeURIComponent(lastSegment.replace(/\.aspx$/i, ""));
    }
  } catch {
    return "generic";
  }

  return "generic";
}

export function parseRelatedLinks(value: unknown): IContextHelpLink[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!isRecord(item)) {
          return undefined;
        }

        const label = getStringCandidate(item, ["label", "text", "title", "name"]);
        const url = getStringCandidate(item, ["url", "href", "link"]);

        if (!label || !url) {
          return undefined;
        }

        return { label, url };
      })
      .filter((item): item is IContextHelpLink => Boolean(item));
  }

  if (isRecord(value)) {
    const label = getStringCandidate(value, ["label", "text", "title", "name"]);
    const url = getStringCandidate(value, ["url", "href", "link"]);
    if (label && url) {
      return [{ label, url }];
    }
  }

  if (typeof value === "string") {
    const [label, url] = value.split("|").map((part) => part.trim());
    if (label && url) {
      return [{ label, url }];
    }
  }

  return [];
}

export function parseSourceCollection(payload: unknown): IContextHelpSourceRecord[] {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord) as IContextHelpSourceRecord[];
  }

  if (!isRecord(payload)) {
    return [];
  }

  const candidates = [payload.value, payload.items, payload.results, payload.records, payload.helpItems, payload.contextHelp];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter(isRecord) as IContextHelpSourceRecord[];
    }
  }

  const nested = payload.d;
  if (isRecord(nested) && Array.isArray(nested.results)) {
    return nested.results.filter(isRecord) as IContextHelpSourceRecord[];
  }

  return [];
}

export function normalizeHelpRecord(
  record: IContextHelpSourceRecord,
  sourceType: PageContextAssistantDataSourceType,
  index: number
): IContextHelpRecord {
  const contextKey = getStringCandidate(record, ["contextKey", "ContextKey", "page", "Page", "section", "Section", "title", "Title"]);
  const title = getStringCandidate(record, ["title", "Title", "name", "Name"]) ?? contextKey ?? "Ayuda contextual";
  const message = getStringCandidate(record, ["message", "Message", "summary", "Summary", "body", "Body", "description", "Description"]) ?? "";
  const relatedLinks = parseRelatedLinks(record.relatedLinks ?? record.RelatedLinks ?? record.links ?? record.Links ?? record.link ?? record.Link);
  const isGeneric = getBooleanCandidate(record, ["isGeneric", "IsGeneric", "generic", "Generic"]) || normalizeContextKey(contextKey) === "generic";
  const order = getNumberCandidate(record, ["order", "Order", "sort", "Sort"]);
  const isPartial = !normalizeText(message) || !normalizeText(contextKey) || !normalizeText(title) || relatedLinks.some((link) => !normalizeText(link.label) || !normalizeText(link.url));

  return {
    id: getStringCandidate(record, ["id", "Id", "ID"]) ?? `${sourceType}-${index + 1}`,
    contextKey: normalizeText(contextKey) || "generic",
    title,
    message: message || "No hay contenido contextual disponible.",
    relatedLinks,
    isGeneric,
    isPartial,
    order,
    sourceType
  };
}

export function isSameOriginRelativeUrl(value: string, webUrl: string): boolean {
  const trimmed = normalizeText(value);
  if (!trimmed) {
    return false;
  }

  try {
    const resolved = new URL(trimmed, webUrl);
    return resolved.origin === new URL(webUrl).origin;
  } catch {
    return false;
  }
}

export function shouldUseGenericFallback(fallbackMode: PageContextAssistantFallbackMode): boolean {
  return fallbackMode === "generic";
}
