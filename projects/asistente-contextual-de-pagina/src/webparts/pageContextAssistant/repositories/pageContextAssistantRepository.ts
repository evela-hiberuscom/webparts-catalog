import type {
  IContextHelpSourceRecord,
  IPageContextAssistantRequest,
  IPageContextAssistantRepository
} from "../models/pageContextAssistantModels";
import {
  STATIC_CONTEXT_HELP_CATALOG,
  isSameOriginRelativeUrl,
  normalizeText,
  parseSourceCollection
} from "../utils/pageContextAssistantUtils";

function escapeODataValue(value: string): string {
  return value.replace(/'/g, "''");
}

function resolveListRootPath(webUrl: string, listTitleOrUrl: string): string {
  const trimmed = normalizeText(listTitleOrUrl);
  const resolved = new URL(trimmed, webUrl);
  const pathName = decodeURIComponent(resolved.pathname).replace(/\/$/, "");
  const segments = pathName.split("/").filter(Boolean);

  const allItemsIndex = segments.findIndex((segment) => segment.toLowerCase() === "allitems.aspx");
  if (allItemsIndex > -1) {
    return `/${segments.slice(0, allItemsIndex).join("/")}`;
  }

  const listsIndex = segments.findIndex((segment) => segment.toLowerCase() === "lists");
  if (listsIndex > -1 && segments.length > listsIndex + 1) {
    return `/${segments.slice(0, listsIndex + 2).join("/")}`;
  }

  return pathName || "/";
}

function buildSharePointEndpoint(webUrl: string, listTitleOrUrl: string): string {
  const trimmed = normalizeText(listTitleOrUrl);
  if (!trimmed) {
    throw new Error("listTitleOrUrl is required");
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) {
    if (!isSameOriginRelativeUrl(trimmed, webUrl)) {
      throw new Error("SharePointList source must be same-origin or relative");
    }

    const listRootPath = resolveListRootPath(webUrl, trimmed);
    const endpoint = new URL(`${new URL(webUrl).origin}/_api/web/GetList(@listUrl)/items`);
    endpoint.searchParams.set("@listUrl", `'${listRootPath}'`);
    endpoint.searchParams.set("$select", "Id,Title,ContextKey,Message,RelatedLinks,isGeneric,order");
    endpoint.searchParams.set("$top", "500");
    return endpoint.toString();
  }

  const endpoint = new URL(`${new URL(webUrl).origin}/_api/web/lists/getbytitle('${escapeODataValue(trimmed)}')/items`);
  endpoint.searchParams.set("$select", "Id,Title,ContextKey,Message,RelatedLinks,isGeneric,order");
  endpoint.searchParams.set("$top", "500");
  return endpoint.toString();
}

async function parsePayload(response: Response): Promise<IContextHelpSourceRecord[]> {
  if (!response.ok) {
    throw new Error(`Context help source request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  return parseSourceCollection(payload);
}

export function createPageContextAssistantRepository(webUrl: string): IPageContextAssistantRepository {
  return {
    async loadRecords(request: IPageContextAssistantRequest): Promise<IContextHelpSourceRecord[]> {
      if (request.dataSourceType === "StaticConfig") {
        return STATIC_CONTEXT_HELP_CATALOG;
      }

      if (request.dataSourceType === "JsonUrl") {
        const resolvedUrl = new URL(request.listTitleOrUrl, webUrl);
        if (resolvedUrl.origin !== new URL(webUrl).origin) {
          throw new Error("JsonUrl must be same-origin or relative");
        }

        const response = await fetch(resolvedUrl.toString(), {
          credentials: "same-origin"
        });

        return parsePayload(response);
      }

      const endpoint = buildSharePointEndpoint(webUrl, request.listTitleOrUrl);
      const response = await fetch(endpoint, {
        credentials: "same-origin",
        headers: {
          Accept: "application/json;odata=nometadata"
        }
      });

      return parsePayload(response);
    }
  };
}
