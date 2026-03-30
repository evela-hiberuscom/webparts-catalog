import { SPHttpClient } from '@microsoft/sp-http';
import type {
  IRequestCatalogRepository,
  IRequestCatalogRequest,
  IRequestCatalogResult
} from '../models/startARequestModels';
import {
  buildSharePointListEndpoint,
  buildStaticRequestItems,
  normalizeRequestCollection,
  normalizeSameOriginUrl
} from '../utils/startARequestUtils';

export interface IRequestsCatalogRepositoryOptions {
  spHttpClient: Pick<SPHttpClient, 'get'>;
}

export class RequestsCatalogRepository implements IRequestCatalogRepository {
  public constructor(private readonly options: IRequestsCatalogRepositoryOptions) {}

  public async loadCatalog(request: IRequestCatalogRequest): Promise<IRequestCatalogResult> {
    switch (request.dataSourceType) {
      case 'JsonUrl':
        return this.loadFromJsonUrl(request);
      case 'StaticConfig':
        return this.loadFromStaticConfig(request);
      case 'SharePointList':
      default:
        return this.loadFromSharePointList(request);
    }
  }

  private async loadFromSharePointList(request: IRequestCatalogRequest): Promise<IRequestCatalogResult> {
    const endpoint = buildSharePointListEndpoint(request.webUrl, request.listTitleOrUrl);
    const payload = await this.fetchJson(endpoint);
    const items = normalizeRequestCollection(payload, request.webUrl);

    return {
      items,
      sourceLabel: 'SharePointList',
      notes: [],
      hasPartialData: items.some((item) => item.partialData)
    };
  }

  private async loadFromJsonUrl(request: IRequestCatalogRequest): Promise<IRequestCatalogResult> {
    const endpoint = normalizeSameOriginUrl(request.listTitleOrUrl, request.webUrl);
    const payload = await this.fetchJson(endpoint);
    const items = normalizeRequestCollection(payload, request.webUrl);

    return {
      items,
      sourceLabel: 'JsonUrl',
      notes: [],
      hasPartialData: items.some((item) => item.partialData)
    };
  }

  private async loadFromStaticConfig(request: IRequestCatalogRequest): Promise<IRequestCatalogResult> {
    const items = buildStaticRequestItems(request.webUrl);

    return {
      items,
      sourceLabel: 'StaticConfig',
      notes: ['Se ha aplicado el catálogo local de respaldo.'],
      hasPartialData: items.some((item) => item.partialData)
    };
  }

  private async fetchJson(url: string): Promise<unknown> {
    const response = await this.options.spHttpClient.get(url, SPHttpClient.configurations.v1);
    if (!response.ok) {
      throw new Error(`SharePoint request failed (${response.status}) for ${url}`);
    }

    return response.json();
  }
}
