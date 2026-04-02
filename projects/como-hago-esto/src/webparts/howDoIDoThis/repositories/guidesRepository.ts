import type { IGuideItem, IGuidesRepositoryResult, IHowDoIDoThisRequest } from '../models/howDoIDoThisModels';
import {
  buildFallbackGuides,
  normalizeCollection,
  normalizeGuide,
  normalizeText,
  resolveSameOriginUrl,
  resolveSharePointListEndpoint
} from '../utils/howDoIDoThisUtils';

interface IHttpResponseLike {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

interface IHttpClientLike {
  get(url: string, options?: unknown): Promise<IHttpResponseLike>;
}

type FetchLike = (url: string, init?: RequestInit) => Promise<IHttpResponseLike>;

function mapRecords(raw: unknown, webUrl: string, defaultCategory: string): IGuideItem[] {
  return normalizeCollection(raw)
    .map((record, index) => normalizeGuide({
      id: record.Id ?? record.id,
      title: record.Title ?? record.title,
      summary: record.Summary ?? record.summary ?? record.Description ?? record.description,
      description: record.Description ?? record.description,
      category: record.Category ?? record.category,
      steps: record.Steps ?? record.steps ?? record.StepList ?? record.stepList,
      relatedUrl: (record.RelatedUrl as { Url?: unknown } | undefined)?.Url ?? record.RelatedUrl ?? record.relatedUrl ?? record.LinkUrl ?? record.linkUrl,
      relatedLink: record.RelatedLink ?? record.relatedLink,
      featured: record.Featured ?? record.featured ?? record.IsFeatured ?? record.isFeatured
    }, index, webUrl, defaultCategory))
    .filter((value): value is IGuideItem => Boolean(value));
}

function buildResult(items: IGuideItem[], sourceLabel: string): IGuidesRepositoryResult {
  return {
    items,
    sourceLabel,
    hasPartialData: items.some((item) => item.isPartial),
    notes: []
  };
}

export class GuidesRepository {
  public constructor(
    private readonly spHttpClient: IHttpClientLike,
    private readonly fetchJson: FetchLike
  ) {}

  public async load(request: IHowDoIDoThisRequest): Promise<IGuidesRepositoryResult> {
    switch (request.dataSourceType) {
      case 'JsonUrl':
        return this.loadFromJsonUrl(request);
      case 'SharePointList':
        return this.loadFromSharePointList(request);
      case 'StaticConfig':
      default:
        return this.loadFromStaticConfig(request);
    }
  }

  private async loadFromJsonUrl(request: IHowDoIDoThisRequest): Promise<IGuidesRepositoryResult> {
    const source = normalizeText(request.listTitleOrUrl);
    if (!source) {
      return buildResult(buildFallbackGuides(), 'StaticConfigFallback');
    }

    const resolvedUrl = resolveSameOriginUrl(source, request.webUrl);
    const response = await this.fetchJson(resolvedUrl, {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`JsonUrl request failed (${response.status}).`);
    }

    return buildResult(mapRecords(await response.json(), request.webUrl, request.defaultCategory), 'JsonUrl');
  }

  private async loadFromSharePointList(request: IHowDoIDoThisRequest): Promise<IGuidesRepositoryResult> {
    const source = normalizeText(request.listTitleOrUrl);
    if (!source) {
      throw new Error('listTitleOrUrl is required when sourceType is SharePointList');
    }

    const endpoint = resolveSharePointListEndpoint(request.webUrl, source);
    const response = await this.spHttpClient.get(endpoint, {
      headers: {
        Accept: 'application/json;odata=nometadata'
      }
    });

    if (!response.ok) {
      throw new Error(`SharePoint list request failed (${response.status}).`);
    }

    return buildResult(mapRecords(await response.json(), request.webUrl, request.defaultCategory), 'SharePointList');
  }

  private loadFromStaticConfig(request: IHowDoIDoThisRequest): IGuidesRepositoryResult {
    const items = buildFallbackGuides().map((guide) => ({
      ...guide,
      category: guide.category || request.defaultCategory || guide.category
    }));

    return buildResult(items, 'StaticConfig');
  }
}
