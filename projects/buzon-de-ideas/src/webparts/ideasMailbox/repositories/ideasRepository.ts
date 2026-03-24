import type {
  IIdeaSubmissionPayload,
  IIdeaSubmissionRequest,
  IIdeaSubmissionResult
} from "../models/ideaMailboxModels";
import {
  buildListSubmissionBody,
  buildSharePointListEndpoint,
  buildSubmissionPayload,
  normalizeSubmitUrl,
  isRecordPayload
} from "../utils/ideaMailboxUtils";

interface IFetchLikeResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

type Fetcher = (input: string, init?: RequestInit) => Promise<IFetchLikeResponse>;

function createJsonHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
  return {
    Accept: "application/json",
    "Content-Type": "application/json;odata=nometadata",
    ...additionalHeaders
  };
}

function parseDigestValue(payload: unknown): string | undefined {
  if (!isRecordPayload(payload)) {
    return undefined;
  }

  const direct = payload.FormDigestValue;
  if (typeof direct === "string" && direct.trim()) {
    return direct.trim();
  }

  const nested = payload.GetContextWebInformation;
  if (isRecordPayload(nested) && typeof nested.FormDigestValue === "string" && nested.FormDigestValue.trim()) {
    return nested.FormDigestValue.trim();
  }

  const directD = payload.d;
  if (isRecordPayload(directD)) {
    const nestedDirect = directD.FormDigestValue;
    if (typeof nestedDirect === "string" && nestedDirect.trim()) {
      return nestedDirect.trim();
    }

    const nestedContext = directD.GetContextWebInformation;
    if (isRecordPayload(nestedContext) && typeof nestedContext.FormDigestValue === "string" && nestedContext.FormDigestValue.trim()) {
      return nestedContext.FormDigestValue.trim();
    }
  }

  return undefined;
}

async function fetchFormDigest(fetcher: Fetcher, webUrl: string): Promise<string> {
  const endpoint = `${webUrl.replace(/\/$/, "")}/_api/contextinfo`;
  const response = await fetcher(endpoint, {
    method: "POST",
    headers: createJsonHeaders()
  });

  if (!response.ok) {
    throw new Error(`Could not obtain form digest (${response.status})`);
  }

  const payload = await response.json();
  const digestValue = parseDigestValue(payload);
  if (!digestValue) {
    throw new Error("Could not obtain form digest value");
  }

  return digestValue;
}

async function postJson(
  fetcher: Fetcher,
  endpoint: string,
  body: unknown,
  additionalHeaders?: Record<string, string>
): Promise<unknown> {
  const response = await fetcher(endpoint, {
    method: "POST",
    headers: createJsonHeaders(additionalHeaders),
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Submit failed (${response.status}) for ${endpoint}`);
  }

  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function buildRemoteEndpoint(webUrl: string, endpointUrl: string): string {
  return normalizeSubmitUrl(endpointUrl, webUrl);
}

function buildSourceLabel(sourceType: IIdeaSubmissionRequest["sourceType"]): string {
  if (sourceType === "SharePointList") {
    return "SharePointList";
  }

  if (sourceType === "JsonBridge") {
    return "JsonBridge";
  }

  return "ApiEndpoint";
}

export class IdeasRepository {
  constructor(private readonly fetcher: Fetcher = globalThis.fetch?.bind(globalThis) as Fetcher) {}

  public async submitIdea(request: IIdeaSubmissionRequest, payload: IIdeaSubmissionPayload): Promise<IIdeaSubmissionResult> {
    switch (request.sourceType) {
      case "SharePointList":
        return this.submitToSharePointList(request, payload);
      case "JsonBridge":
      case "ApiEndpoint":
      default:
        return this.submitToRemoteEndpoint(request, payload);
    }
  }

  private async submitToSharePointList(
    request: IIdeaSubmissionRequest,
    payload: IIdeaSubmissionPayload
  ): Promise<IIdeaSubmissionResult> {
    if (!request.listTitleOrUrl.trim()) {
      throw new Error("listTitleOrUrl is required when sourceType is SharePointList");
    }

    const endpoint = buildSharePointListEndpoint(request.pageUrl, request.listTitleOrUrl);
    const digestValue = await fetchFormDigest(this.fetcher, request.pageUrl);
    const body = buildListSubmissionBody(payload);
    const response = await postJson(this.fetcher, endpoint, body, {
      "X-RequestDigest": digestValue
    });

    return {
      persisted: true,
      sourceLabel: buildSourceLabel(request.sourceType),
      acknowledgement: isRecordPayload(response) && typeof response.Id === "number" ? String(response.Id) : undefined,
      notes: ["La idea se registró en la lista SharePoint."]
    };
  }

  private async submitToRemoteEndpoint(
    request: IIdeaSubmissionRequest,
    payload: IIdeaSubmissionPayload
  ): Promise<IIdeaSubmissionResult> {
    const endpoint = buildRemoteEndpoint(request.pageUrl, request.endpointUrl);
    const response = await postJson(this.fetcher, endpoint, payload, {
      Accept: "application/json"
    });

    return {
      persisted: true,
      sourceLabel: buildSourceLabel(request.sourceType),
      acknowledgement: isRecordPayload(response) && typeof response.id === "string" ? response.id : undefined,
      notes: [request.sourceType === "JsonBridge" ? "La idea se envió al bridge configurado." : "La idea se envió al endpoint configurado."]
    };
  }
}

export function buildIdeaSubmissionPayload(
  request: IIdeaSubmissionRequest,
  draft: { title: string; description: string; category: string }
): IIdeaSubmissionPayload {
  return buildSubmissionPayload(
    {
      title: request.title,
      subtitle: request.subtitle,
      sourceType: request.sourceType,
      listTitleOrUrl: request.listTitleOrUrl,
      endpointUrl: request.endpointUrl,
      allowAnonymous: request.allowAnonymous,
      showCategory: request.showCategory,
      submitLabel: request.submitLabel,
      categoryLabel: request.categoryLabel
    },
    draft,
    request.userDisplayName,
    request.pageUrl
  );
}
