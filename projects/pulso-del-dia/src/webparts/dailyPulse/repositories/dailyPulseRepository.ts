import type {
  IDailyPulseAnswer,
  IDailyPulsePrompt,
  IDailyPulseRepositoryResult,
  IDailyPulseRequest,
  IDailyPulseSubmissionResult
} from '../models/dailyPulseModels';
import {
  buildFallbackPrompt,
  createStorageKey,
  deriveServerRelativePath,
  escapeODataTitle,
  isSameOriginOrRelativeUrl,
  normalizePrompt,
  parsePromptPayload,
  resolveSameOriginUrl
} from '../utils/dailyPulseUtils';

interface IFetchResponseLike {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

type Fetcher = (input: string, init?: RequestInit) => Promise<IFetchResponseLike>;

function getCurrentDateKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function createStoredAnswerKey(request: IDailyPulseRequest, promptId: string): string {
  const webUrl = request.webUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://contoso.sharepoint.com');
  const userKey = request.userLoginName?.trim() || request.userDisplayName || 'anonymous';
  return createStorageKey(webUrl, promptId, userKey);
}

function readStoredAnswer(promptId: string, request: IDailyPulseRequest): IDailyPulseAnswer | undefined {
  if (typeof window === 'undefined' || !window.localStorage) {
    return undefined;
  }

  const key = createStoredAnswerKey(request, promptId);
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) {
      return undefined;
    }

    return {
      promptId: typeof parsed.promptId === 'string' ? parsed.promptId : promptId,
      optionId: typeof parsed.optionId === 'string' ? parsed.optionId : '',
      optionLabel: typeof parsed.optionLabel === 'string' ? parsed.optionLabel : '',
      submittedBy: typeof parsed.submittedBy === 'string' ? parsed.submittedBy : request.userDisplayName,
      submittedAt: typeof parsed.submittedAt === 'string' ? parsed.submittedAt : new Date().toISOString()
    };
  } catch {
    return undefined;
  }
}

function persistStoredAnswer(request: IDailyPulseRequest, answer: IDailyPulseAnswer): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  const key = createStoredAnswerKey(request, answer.promptId);
  window.localStorage.setItem(key, JSON.stringify(answer));
}

function clearStoredAnswer(request: IDailyPulseRequest, promptId: string): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  const key = createStoredAnswerKey(request, promptId);
  window.localStorage.removeItem(key);
}

function parseCollection(raw: unknown): unknown[] {
  if (Array.isArray(raw)) {
    return raw;
  }

  if (isRecord(raw) && Array.isArray(raw.items)) {
    return raw.items;
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

  throw new Error('Expected an array payload or a payload with items/value/results collections');
}

function createRequestHeaders(): Record<string, string> {
  return {
    Accept: 'application/json'
  };
}

function createJsonWriteHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json;odata=nometadata',
    ...additionalHeaders
  };
}

async function fetchJson(fetcher: Fetcher, url: string): Promise<unknown> {
  const response = await fetcher(url, { headers: createRequestHeaders() });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return response.json();
}

function buildSharePointItemsEndpoint(webUrl: string, listTitleOrUrl: string): string {
  const listValue = listTitleOrUrl.trim();
  if (!listValue) {
    throw new Error('listTitleOrUrl is required when sourceType is SharePointList');
  }

  if (/^https?:\/\//i.test(listValue) || listValue.startsWith('/')) {
    if (!isSameOriginOrRelativeUrl(listValue, webUrl)) {
      throw new Error('listTitleOrUrl must be same-origin or relative');
    }

    const resolvedUrl = resolveSameOriginUrl(listValue, webUrl);
    const serverRelativePath = deriveServerRelativePath(resolvedUrl, webUrl);
    return `${webUrl.replace(/\/$/, '')}/_api/web/GetList(@listUrl)/items?@listUrl='${encodeURIComponent(serverRelativePath)}'`;
  }

  return `${webUrl.replace(/\/$/, '')}/_api/web/lists/getbytitle('${escapeODataTitle(listValue)}')/items`;
}

function parseDigestValue(payload: unknown): string | undefined {
  if (!isRecord(payload)) {
    return undefined;
  }

  const directValue = payload.FormDigestValue;
  if (typeof directValue === 'string' && directValue.trim()) {
    return directValue.trim();
  }

  const contextWebInfo = payload.GetContextWebInformation;
  if (isRecord(contextWebInfo) && typeof contextWebInfo.FormDigestValue === 'string' && contextWebInfo.FormDigestValue.trim()) {
    return contextWebInfo.FormDigestValue.trim();
  }

  const directD = payload.d;
  if (isRecord(directD)) {
    const directNestedValue = directD.FormDigestValue;
    if (typeof directNestedValue === 'string' && directNestedValue.trim()) {
      return directNestedValue.trim();
    }

    const nestedContextWebInfo = directD.GetContextWebInformation;
    if (
      isRecord(nestedContextWebInfo) &&
      typeof nestedContextWebInfo.FormDigestValue === 'string' &&
      nestedContextWebInfo.FormDigestValue.trim()
    ) {
      return nestedContextWebInfo.FormDigestValue.trim();
    }
  }

  return undefined;
}

async function fetchFormDigest(fetcher: Fetcher, webUrl: string): Promise<string> {
  const endpoint = `${webUrl.replace(/\/$/, '')}/_api/contextinfo`;
  const response = await fetcher(endpoint, {
    method: 'POST',
    headers: createJsonWriteHeaders()
  });

  if (!response.ok) {
    throw new Error(`Could not obtain form digest (${response.status})`);
  }

  const payload = await response.json();
  const digestValue = parseDigestValue(payload);
  if (!digestValue) {
    throw new Error('Could not obtain form digest value');
  }

  return digestValue;
}

async function postRemoteAnswer(
  fetcher: Fetcher,
  endpoint: string,
  payload: unknown,
  additionalHeaders?: Record<string, string>
): Promise<void> {
  const response = await fetcher(endpoint, {
    method: 'POST',
    headers: createJsonWriteHeaders(additionalHeaders),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Submit failed (${response.status}) for ${endpoint}`);
  }
}

function createResponderIdentity(request: IDailyPulseRequest): string {
  return request.userLoginName?.trim() || request.userDisplayName || 'anonymous';
}

async function ensureNoRemoteDuplicateForToday(fetcher: Fetcher, request: IDailyPulseRequest): Promise<void> {
  const responder = escapeODataTitle(createResponderIdentity(request));
  const currentDate = `${getCurrentDateKey()}T00:00:00.000Z`;
  const endpoint =
    `${buildSharePointItemsEndpoint(request.webUrl, request.listTitleOrUrl)}` +
    `?$top=1&$select=Id,DailyPulseSubmittedAt` +
    `&$filter=${encodeURIComponent(
      `DailyPulseItemType eq 'Response' and DailyPulseSubmittedBy eq '${responder}' and DailyPulseSubmittedAt ge datetime'${currentDate}'`
    )}`;
  const payload = await fetchJson(fetcher, endpoint);
  const results = parseCollection(payload);

  if (results.length > 0) {
    throw new Error('Ya existe una respuesta para hoy.');
  }
}

async function submitToSharePointList(fetcher: Fetcher, request: IDailyPulseRequest, prompt: IDailyPulsePrompt, submitted: IDailyPulseAnswer): Promise<void> {
  if (!request.webUrl.trim()) {
    throw new Error('webUrl is required when sourceType is SharePointList');
  }

  const endpoint = buildSharePointItemsEndpoint(request.webUrl, request.listTitleOrUrl);
  const digestValue = await fetchFormDigest(fetcher, request.webUrl);
  await postRemoteAnswer(
    fetcher,
    endpoint,
    {
      Title: prompt.prompt,
      DailyPulseItemType: 'Response',
      DailyPulseActive: false,
      DailyPulsePromptText: prompt.prompt,
      DailyPulseResponseValue: submitted.optionId,
      DailyPulseResponseLabel: submitted.optionLabel,
      DailyPulseSubmittedBy: submitted.submittedBy,
      DailyPulseSubmittedAt: submitted.submittedAt
    },
    {
      'X-RequestDigest': digestValue
    }
  );
}

function buildSourceLabel(request: IDailyPulseRequest): string {
  if (request.sourceType === 'StaticConfig') {
    return 'Configuración local';
  }

  if (request.sourceType === 'JsonUrl') {
    return `JSON: ${request.jsonUrl || 'sin configurar'}`;
  }

  if (request.sourceType === 'ApiEndpoint') {
    return `API: ${request.apiEndpointUrl || 'sin configurar'}`;
  }

  return request.listTitleOrUrl ? `Lista SharePoint: ${request.listTitleOrUrl}` : 'Lista SharePoint';
}

function parseListPrompt(rawItem: unknown): IDailyPulsePrompt | undefined {
  if (!isRecord(rawItem)) {
    return undefined;
  }

  const prompt = parsePromptPayload({
    id: rawItem.ID ?? rawItem.Id ?? rawItem.id,
    prompt: rawItem.DailyPulsePromptText ?? rawItem.PromptText ?? rawItem.Prompt ?? rawItem.Title ?? rawItem.title,
    helpText: rawItem.DailyPulseHelpText ?? rawItem.HelpText ?? rawItem.Description,
    options: rawItem.DailyPulseOptionsJson ?? rawItem.OptionsJson ?? rawItem.Options ?? rawItem.Choices ?? rawItem.options
  });

  if (!prompt) {
    return undefined;
  }

  return normalizePrompt(prompt);
}

async function loadFromCollection(fetcher: Fetcher, request: IDailyPulseRequest, collectionUrl: string): Promise<IDailyPulseRepositoryResult> {
  const payload = await fetchJson(fetcher, collectionUrl);
  const items = parseCollection(payload);
  const prompt = items.map((item) => parseListPrompt(item)).find((value): value is IDailyPulsePrompt => Boolean(value));

  if (!prompt) {
    return {
      sourceLabel: buildSourceLabel(request),
      notes: ['La fuente no devolvió un prompt activo.'],
      hasPartialData: false
    };
  }

  return {
    prompt,
    sourceLabel: buildSourceLabel(request),
    notes: [],
    hasPartialData: prompt.options.length < 3
  };
}

function loadFromStaticConfig(request: IDailyPulseRequest): IDailyPulseRepositoryResult {
  const raw = request.promptJson.trim();
  if (!raw) {
    const fallbackPrompt = buildFallbackPrompt();
    return {
      prompt: fallbackPrompt,
      sourceLabel: buildSourceLabel(request),
      notes: ['promptJson vacío; se usa el prompt inferido para el workbench.'],
      hasPartialData: true
    };
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const prompt = normalizePrompt(parsePromptPayload(parsed) ?? buildFallbackPrompt());

    return {
      prompt,
      sourceLabel: buildSourceLabel(request),
      notes: [],
      hasPartialData: prompt.options.length < 3
    };
  } catch (error) {
    throw new Error(`promptJson is invalid: ${(error as Error).message}`);
  }
}

async function loadFromSharePointList(fetcher: Fetcher, request: IDailyPulseRequest): Promise<IDailyPulseRepositoryResult> {
  if (!request.webUrl.trim()) {
    throw new Error('webUrl is required when sourceType is SharePointList');
  }

  const endpoint = `${buildSharePointItemsEndpoint(request.webUrl, request.listTitleOrUrl)}?$top=100`;

  return loadFromCollection(fetcher, request, endpoint);
}

async function loadFromJsonUrl(fetcher: Fetcher, request: IDailyPulseRequest): Promise<IDailyPulseRepositoryResult> {
  if (!request.webUrl.trim()) {
    throw new Error('webUrl is required when sourceType is JsonUrl');
  }

  const url = resolveSameOriginUrl(request.jsonUrl, request.webUrl);
  return loadFromCollection(fetcher, request, url);
}

async function loadFromApiEndpoint(fetcher: Fetcher, request: IDailyPulseRequest): Promise<IDailyPulseRepositoryResult> {
  if (!request.webUrl.trim()) {
    throw new Error('webUrl is required when sourceType is ApiEndpoint');
  }

  const url = resolveSameOriginUrl(request.apiEndpointUrl, request.webUrl);
  return loadFromCollection(fetcher, request, url);
}

export class DailyPulseRepository {
  constructor(private readonly fetcher: Fetcher = globalThis.fetch?.bind(globalThis) as Fetcher) {}

  public async loadPrompt(request: IDailyPulseRequest): Promise<IDailyPulseRepositoryResult> {
    switch (request.sourceType) {
      case 'JsonUrl':
        return loadFromJsonUrl(this.fetcher, request);
      case 'ApiEndpoint':
        return loadFromApiEndpoint(this.fetcher, request);
      case 'SharePointList':
        return loadFromSharePointList(this.fetcher, request);
      case 'StaticConfig':
      default:
        return loadFromStaticConfig(request);
    }
  }

  public readStoredAnswer(promptId: string, request: IDailyPulseRequest): IDailyPulseAnswer | undefined {
    return readStoredAnswer(promptId, request);
  }

  public async submitAnswer(
    request: IDailyPulseRequest,
    prompt: IDailyPulsePrompt,
    optionId: string
  ): Promise<IDailyPulseSubmissionResult> {
    const option = prompt.options.find((item) => item.id === optionId);
    if (!option) {
      throw new Error('Selected option is not part of the current prompt');
    }

    const storedAnswer = readStoredAnswer(prompt.id, request);
    if (request.oneResponsePerDay && storedAnswer && storedAnswer.submittedAt.slice(0, 10) === getCurrentDateKey()) {
      return {
        submitted: storedAnswer,
        persistedLocally: false,
        sourceLabel: buildSourceLabel(request),
        notes: ['Ya existe una respuesta para hoy.']
      };
    }

    const submitted: IDailyPulseAnswer = {
      promptId: prompt.id,
      optionId: option.id,
      optionLabel: option.label,
      submittedBy: createResponderIdentity(request),
      submittedAt: new Date().toISOString()
    };

    if (request.sourceType === 'SharePointList') {
      try {
        if (request.oneResponsePerDay) {
          await ensureNoRemoteDuplicateForToday(this.fetcher, request);
        }

        await submitToSharePointList(this.fetcher, request, prompt, submitted);
        persistStoredAnswer(request, submitted);
      } catch (error) {
        clearStoredAnswer(request, submitted.promptId);
        throw error;
      }

      return {
        submitted,
        persistedLocally: true,
        sourceLabel: buildSourceLabel(request),
        notes: ['La respuesta se registró en la lista SharePoint y se cacheó localmente.']
      };
    }

    if (request.sourceType === 'ApiEndpoint' && request.apiEndpointUrl.trim()) {
      const endpoint = resolveSameOriginUrl(request.apiEndpointUrl, request.webUrl);
      try {
        await postRemoteAnswer(this.fetcher, endpoint, submitted);
        persistStoredAnswer(request, submitted);
      } catch (error) {
        clearStoredAnswer(request, submitted.promptId);
        throw error;
      }

      return {
        submitted,
        persistedLocally: true,
        sourceLabel: buildSourceLabel(request),
        notes: ['La respuesta se registró en el endpoint configurado y se cacheó localmente.']
      };
    }

    if (request.sourceType === 'JsonUrl' && request.jsonUrl.trim()) {
      persistStoredAnswer(request, submitted);
      const notes = ['La respuesta se almacenó localmente para el workbench.'];
      return {
        submitted,
        persistedLocally: true,
        sourceLabel: buildSourceLabel(request),
        notes
      };
    }

    persistStoredAnswer(request, submitted);
    return {
      submitted,
      persistedLocally: true,
      sourceLabel: buildSourceLabel(request),
      notes: ['La respuesta se almacenó localmente para el workbench.']
    };
  }
}
