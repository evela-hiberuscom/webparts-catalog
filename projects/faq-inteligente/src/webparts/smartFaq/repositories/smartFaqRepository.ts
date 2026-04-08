import type {
  ISmartFaqConfiguration,
  ISmartFaqContext,
  ISmartFaqItem,
  ISmartFaqRepository
} from '../models/smartFaqModels';
import {
  clampMaxItems,
  normalizeCategory,
  parseTextList,
  resolveAbsoluteUrl
} from '../utils/smartFaqUtils';

interface ISharePointFaqItem {
  Id: number;
  Title?: string;
  Question?: string;
  Answer?: string;
  Response?: string;
  Category?: string;
  Topic?: string;
  Tags?: unknown;
  Aliases?: unknown;
  Synonyms?: unknown;
  RelatedLink?: string;
  RelatedUrl?: string;
  UpdatedAt?: string;
  Modified?: string;
  Featured?: boolean | string | number;
  IsFeatured?: boolean | string | number;
}

interface ISharePointFaqResponse {
  value?: ISharePointFaqItem[];
}

export class SmartFaqRepository implements ISmartFaqRepository {
  public constructor(private readonly context: ISmartFaqContext) {}

  public async getFaqs(configuration: ISmartFaqConfiguration): Promise<ISmartFaqItem[]> {
    const endpoint =
      `${this.context.webAbsoluteUrl}/_api/web/lists/getByTitle('${encodeURIComponent(configuration.listTitleOrUrl)}')/items` +
      `?$select=Id,Title,Question,Answer,Response,Category,Topic,Tags,Aliases,Synonyms,RelatedLink,RelatedUrl,UpdatedAt,Modified,Featured,IsFeatured` +
      `&$orderby=Modified desc&$top=${Math.max(clampMaxItems(configuration.maxItems) * 2, 20)}`;

    const response = await this.context.spHttpClient.get(endpoint, this.context.spHttpClientConfiguration);
    if (!response.ok) {
      throw new Error(`Failed to load FAQs: ${response.status}`);
    }

    const payload = await response.json() as ISharePointFaqResponse;
    return (payload.value ?? []).map((item) => this.mapItem(item, configuration.defaultCategory));
  }

  private mapItem(item: ISharePointFaqItem, defaultCategory: string): ISmartFaqItem {
    return {
      id: String(item.Id),
      question: item.Question?.trim() || item.Title?.trim() || 'FAQ sin pregunta',
      answer: item.Answer?.trim() || item.Response?.trim() || '',
      category: normalizeCategory(item.Category || item.Topic, defaultCategory || 'General'),
      aliases: parseTextList(item.Aliases || item.Synonyms || item.Tags),
      relatedUrl: resolveAbsoluteUrl(this.context.webAbsoluteUrl, item.RelatedUrl || item.RelatedLink),
      updatedAt: item.UpdatedAt || item.Modified,
      isFeatured: this.parseBoolean(item.Featured) || this.parseBoolean(item.IsFeatured)
    };
  }

  private parseBoolean(value: boolean | string | number | undefined): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return value > 0;
    }

    return value === '1' || value === 'true';
  }
}
