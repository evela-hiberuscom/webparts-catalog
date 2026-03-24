import type {
  IIdeaDraft,
  IIdeaFormErrors,
  IIdeaSubmissionPayload,
  IIdeaValidationResult,
  IIdeasMailboxWebPartProps
} from "../models/ideaMailboxModels";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stripControlCharacters(value: string): string {
  return Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127);
    })
    .join("");
}

export function createEmptyIdeaDraft(): IIdeaDraft {
  return {
    title: "",
    description: "",
    category: ""
  };
}

function normalizeSingleLineText(value: string): string {
  return stripControlCharacters(value.replace(/\r\n/g, " ").replace(/\s+/g, " ")).trim();
}

function normalizeMultilineText(value: string): string {
  return stripControlCharacters(
    value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
  )
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n")
    .trim();
}

function clampText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return value.slice(0, maxLength).trim();
}

export function sanitizeIdeaDraft(draft: IIdeaDraft): IIdeaDraft {
  return {
    title: clampText(normalizeSingleLineText(draft.title), 120),
    description: clampText(normalizeMultilineText(draft.description), 500),
    category: clampText(normalizeSingleLineText(draft.category), 80)
  };
}

export function validateIdeaDraft(draft: IIdeaDraft): IIdeaValidationResult {
  const sanitized = sanitizeIdeaDraft(draft);
  const errors: IIdeaFormErrors = {};

  if (!sanitized.title) {
    errors.title = "El título es obligatorio.";
  }

  if (sanitized.title.length > 120) {
    errors.title = "El título no puede superar 120 caracteres.";
  }

  if (sanitized.description.length > 500) {
    errors.description = "La descripción no puede superar 500 caracteres.";
  }

  if (sanitized.category.length > 80) {
    errors.category = "La categoría no puede superar 80 caracteres.";
  }

  return {
    draft: sanitized,
    errors,
    isValid: Object.keys(errors).length === 0
  };
}

export function normalizeSubmitUrl(rawUrl: string, webUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    throw new Error("endpointUrl is required");
  }

  const resolved = new URL(trimmed, webUrl);
  const webOrigin = new URL(webUrl).origin;
  if (resolved.origin !== webOrigin) {
    throw new Error("endpointUrl must be same-origin or relative");
  }

  return resolved.toString();
}

export function resolveListRootPath(rawUrl: string, webUrl: string): string {
  const resolved = new URL(rawUrl, webUrl);
  let pathName = decodeURIComponent(resolved.pathname).replace(/\/$/, "");
  const lowerPath = pathName.toLowerCase();

  if (lowerPath.endsWith("/forms/allitems.aspx")) {
    pathName = pathName.slice(0, -"/Forms/AllItems.aspx".length);
  } else if (lowerPath.endsWith("/allitems.aspx")) {
    pathName = pathName.slice(0, -"/AllItems.aspx".length);
  } else if (lowerPath.endsWith("/forms")) {
    pathName = pathName.slice(0, -"/Forms".length);
  }

  return pathName || "/";
}

export function buildSharePointListEndpoint(webUrl: string, listTitleOrUrl: string): string {
  const value = listTitleOrUrl.trim();
  if (!value) {
    throw new Error("listTitleOrUrl is required when sourceType is SharePointList");
  }

  const resolved = new URL(value, webUrl);
  if (resolved.origin !== new URL(webUrl).origin) {
    throw new Error("listTitleOrUrl must be same-origin or relative");
  }

  const isUrlLike = value.startsWith("/") || /^https?:\/\//i.test(value);
  if (isUrlLike) {
    const listRootPath = resolveListRootPath(resolved.toString(), webUrl);
    return `${webUrl.replace(/\/$/, "")}/_api/web/GetList(@listUrl)/items?@listUrl='${encodeURIComponent(listRootPath)}'`;
  }

  return `${webUrl.replace(/\/$/, "")}/_api/web/lists/getbytitle('${value.replace(/'/g, "''")}')/items`;
}

function cleanOptionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function buildSubmissionPayload(
  props: IIdeasMailboxWebPartProps,
  draft: IIdeaDraft,
  userDisplayName: string,
  pageUrl: string
): IIdeaSubmissionPayload {
  const sanitized = sanitizeIdeaDraft(draft);
  return {
    title: sanitized.title,
    description: cleanOptionalText(sanitized.description),
    category: props.showCategory ? cleanOptionalText(sanitized.category) : undefined,
    submittedBy: props.allowAnonymous ? undefined : cleanOptionalText(userDisplayName),
    submittedAt: new Date().toISOString(),
    sourceType: props.sourceType,
    pageUrl
  };
}

export function buildListSubmissionBody(payload: IIdeaSubmissionPayload): Record<string, unknown> {
  return {
    Title: payload.title,
    Description: payload.description ?? "",
    Category: payload.category ?? "",
    SubmittedBy: payload.submittedBy ?? "",
    SubmittedAt: payload.submittedAt,
    SourceType: payload.sourceType,
    PageUrl: payload.pageUrl
  };
}

export function isRecordPayload(value: unknown): value is Record<string, unknown> {
  return isRecord(value);
}
