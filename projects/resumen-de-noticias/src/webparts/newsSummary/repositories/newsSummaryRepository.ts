import type {
  INewsSummaryConfiguration,
  INewsSummaryContext,
  INewsSummaryItem,
  INewsSummaryRepository
} from '../models/newsSummaryModels';
import { clampMaxItems, parseBannerImageUrl, resolveAbsoluteUrl } from '../utils/newsSummaryUtils';
import { escapeODataString as escapeODataListTitle } from '@paquete/spfx-common';

interface ISharePointNewsItem {
  Id: number;
  Title?: string;
  Description?: string;
  FirstPublishedDate?: string;
  FileRef?: string;
  BannerImageUrl?: unknown;
}

interface ISharePointItemsResponse {
  value?: ISharePointNewsItem[];
}

export class NewsSummaryRepository implements INewsSummaryRepository {
  public constructor(private readonly context: INewsSummaryContext) {}

  public async getNews(configuration: INewsSummaryConfiguration): Promise<INewsSummaryItem[]> {
    const maxItems = clampMaxItems(configuration.maxItems);
    const endpoint =
      `${this.context.webAbsoluteUrl}/_api/web/lists/getByTitle('${escapeODataListTitle(configuration.sitePagesListTitle)}')/items` +
      `?$select=Id,Title,Description,FirstPublishedDate,FileRef,BannerImageUrl,PromotedState` +
      `&$filter=PromotedState eq 2&$orderby=FirstPublishedDate desc&$top=${Math.max(maxItems * 2, 6)}`;

    const response = await this.context.spHttpClient.get(endpoint, this.context.spHttpClientConfiguration);
    if (!response.ok) {
      throw new Error(`Failed to load news pages: ${response.status}`);
    }

    const payload = await response.json() as ISharePointItemsResponse;
    return (payload.value ?? [])
      .map((item) => this.mapItem(item))
      .slice(0, maxItems);
  }

  private mapItem(item: ISharePointNewsItem): INewsSummaryItem {
    return {
      id: String(item.Id),
      title: item.Title?.trim() || 'Sin titulo',
      summary: item.Description?.trim() || undefined,
      publishedAt: item.FirstPublishedDate,
      imageUrl: resolveAbsoluteUrl(this.context.webAbsoluteUrl, parseBannerImageUrl(item.BannerImageUrl)),
      openUrl: resolveAbsoluteUrl(this.context.webAbsoluteUrl, item.FileRef),
      isFeatured: false
    };
  }
}
