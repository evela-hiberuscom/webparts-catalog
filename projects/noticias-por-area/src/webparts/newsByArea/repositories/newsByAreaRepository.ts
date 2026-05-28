import type {
  INewsByAreaConfiguration,
  INewsByAreaContext,
  INewsByAreaItem,
  INewsByAreaRepository
} from '../models/newsByAreaModels';
import {
  normalizeTags,
  parseBannerImageUrl,
  resolveAbsoluteUrl
} from '../utils/newsByAreaUtils';
import { escapeODataString as escapeODataListTitle } from '@paquete/spfx-common';

interface ISharePointTaxTerm {
  Term?: string;
}

interface ISharePointNewsItem {
  Id: number;
  Title?: string;
  Description?: string;
  FirstPublishedDate?: string;
  FileRef?: string;
  BannerImageUrl?: unknown;
  Category?: string | string[];
  TaxCatchAll?: ISharePointTaxTerm[];
}

interface ISharePointItemsResponse {
  value?: ISharePointNewsItem[];
}

export class NewsByAreaRepository implements INewsByAreaRepository {
  public constructor(private readonly context: INewsByAreaContext) {}

  public async getNews(configuration: INewsByAreaConfiguration): Promise<INewsByAreaItem[]> {
    const endpoint =
      `${this.context.webAbsoluteUrl}/_api/web/lists/getByTitle('${escapeODataListTitle(configuration.sitePagesListTitle)}')/items` +
      `?$select=Id,Title,Description,FirstPublishedDate,FileRef,BannerImageUrl,PromotedState,Category,TaxCatchAll/Term` +
      `&$expand=TaxCatchAll&$filter=PromotedState eq 2&$orderby=FirstPublishedDate desc&$top=${Math.max(configuration.maxItems * 4, 12)}`;

    const response = await this.context.spHttpClient.get(endpoint, this.context.spHttpClientConfiguration);
    if (!response.ok) {
      throw new Error(`Failed to load area news: ${response.status}`);
    }

    const payload = await response.json() as ISharePointItemsResponse;
    return (payload.value ?? []).map((item) => this.mapItem(item));
  }

  private mapItem(item: ISharePointNewsItem): INewsByAreaItem {
    return {
      id: String(item.Id),
      title: item.Title?.trim() || 'Sin titulo',
      summary: item.Description?.trim() || undefined,
      publishedAt: item.FirstPublishedDate,
      imageUrl: resolveAbsoluteUrl(this.context.webAbsoluteUrl, parseBannerImageUrl(item.BannerImageUrl)),
      openUrl: resolveAbsoluteUrl(this.context.webAbsoluteUrl, item.FileRef),
      tags: this.extractTags(item),
      isFeatured: false
    };
  }

  private extractTags(item: ISharePointNewsItem): string[] {
    const categoryTags = Array.isArray(item.Category)
      ? item.Category
      : typeof item.Category === 'string'
        ? item.Category.split(/[;,|]/)
        : [];

    const taxonomyTags = (item.TaxCatchAll ?? [])
      .map((term) => term.Term)
      .filter((term): term is string => !!term?.trim());

    return normalizeTags([...taxonomyTags, ...categoryTags]);
  }
}
