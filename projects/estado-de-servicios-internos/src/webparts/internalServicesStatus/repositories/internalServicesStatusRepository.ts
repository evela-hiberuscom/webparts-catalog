import type {
  IInternalServiceStatusRepository,
  IInternalServiceStatusSourceRecord,
  IInternalServicesStatusRequest
} from "../models/internalServicesStatusModels";
import { internalServicesStatusSample } from "../utils/internalServicesStatusSamples";

function isAbsoluteOrRelativeUrl(value: string): boolean {
  return /^(https?:\/\/|\/)/i.test(value.trim());
}

function normalizeListTitleOrUrl(webUrl: string, listTitleOrUrl: string): string {
  const trimmed = listTitleOrUrl.trim();
  if (!trimmed) {
    throw new Error("listTitleOrUrl is required");
  }

  if (isAbsoluteOrRelativeUrl(trimmed)) {
    const resolved = new URL(trimmed, webUrl);
    const segments = resolved.pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    if (!lastSegment) {
      throw new Error("Unable to resolve SharePoint list title from URL");
    }
    return decodeURIComponent(lastSegment);
  }

  return trimmed;
}

async function parseJsonResponse(response: Response): Promise<IInternalServiceStatusSourceRecord[]> {
  if (!response.ok) {
    throw new Error(`JSON source request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as
    | IInternalServiceStatusSourceRecord[]
    | { services?: IInternalServiceStatusSourceRecord[]; items?: IInternalServiceStatusSourceRecord[]; value?: IInternalServiceStatusSourceRecord[] };

  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.services ?? payload.items ?? payload.value ?? [];
}

function normalizeSharePointItem(item: Record<string, unknown>): IInternalServiceStatusSourceRecord {
  return {
    id: item.Id as string | number | undefined,
    name: (item.name as string | undefined) ?? (item.Title as string | undefined),
    title: item.Title as string | undefined,
    status: item.status as string | undefined,
    criticality: item.criticality as string | undefined,
    summary: (item.summary as string | undefined) ?? (item.Summary as string | undefined),
    updatedAt: (item.updatedAt as string | undefined) ?? (item.UpdatedAt as string | undefined),
    detailUrl: (item.detailUrl as string | undefined) ?? (item.DetailUrl as string | undefined),
    domain: (item.domain as string | undefined) ?? (item.Domain as string | undefined)
  };
}

export function createInternalServicesStatusRepository(webUrl: string): IInternalServiceStatusRepository {
  return {
    async loadRecords(request: IInternalServicesStatusRequest): Promise<IInternalServiceStatusSourceRecord[]> {
      if (request.dataSourceType === "StaticConfig") {
        return internalServicesStatusSample;
      }

      if (request.dataSourceType === "JsonUrl") {
        const resolvedUrl = new URL(request.listTitleOrUrl.trim(), webUrl);
        if (resolvedUrl.origin !== new URL(webUrl).origin) {
          throw new Error("JsonUrl must be same-origin or relative");
        }

        const response = await fetch(resolvedUrl.toString(), {
          credentials: "same-origin"
        });

        return parseJsonResponse(response);
      }

      const listTitle = normalizeListTitleOrUrl(webUrl, request.listTitleOrUrl);
      const endpoint = new URL(`${webUrl.replace(/\/$/, "")}/_api/web/lists/getbytitle('${listTitle.replace(/'/g, "''")}')/items`, webUrl);
      endpoint.searchParams.set("$select", "Id,Title,status,criticality,summary,updatedAt,detailUrl,domain");
      endpoint.searchParams.set("$top", "500");

      const response = await fetch(endpoint.toString(), {
        credentials: "same-origin",
        headers: {
          Accept: "application/json;odata=nometadata"
        }
      });

      if (!response.ok) {
        throw new Error(`SharePoint list request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as { value?: Record<string, unknown>[] };
      return (payload.value ?? []).map(normalizeSharePointItem);
    }
  };
}
