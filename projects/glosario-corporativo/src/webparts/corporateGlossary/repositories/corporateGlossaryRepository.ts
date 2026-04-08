import type {
  ICorporateGlossaryConfiguration,
  ICorporateGlossaryContext,
  ICorporateGlossaryItem,
  ICorporateGlossaryRepository
} from '../models/corporateGlossaryModels';
import {
  clampMaxItems,
  normalizeText,
  resolveAbsoluteUrl,
  splitAliases
} from '../utils/corporateGlossaryUtils';

interface ISharePointGlossaryItem {
  Id: number;
  Title?: string;
  Definition?: string;
  Meaning?: string;
  Category?: string;
  Type?: string;
  Aliases?: unknown;
  Synonyms?: unknown;
  RelatedUrl?: string;
  RelatedLink?: string;
  UpdatedAt?: string;
  Modified?: string;
  Featured?: boolean | string;
}

interface ISharePointItemsResponse {
  value?: ISharePointGlossaryItem[];
}

export class CorporateGlossaryRepository implements ICorporateGlossaryRepository {
  public constructor(private readonly context: ICorporateGlossaryContext) {}

  public async getGlossary(configuration: ICorporateGlossaryConfiguration): Promise<ICorporateGlossaryItem[]> {
    const top = clampMaxItems(configuration.maxItems);
    const endpoint =
      `${this.context.webAbsoluteUrl}/_api/web/lists/getByTitle('${encodeURIComponent(configuration.listTitle)}')/items` +
      `?$select=Id,Title,Definition,Meaning,Category,Type,Aliases,Synonyms,RelatedUrl,RelatedLink,UpdatedAt,Modified,Featured&$top=${Math.max(top * 2, 50)}`;

    const response = await this.context.spHttpClient.get(endpoint, this.context.spHttpClientConfiguration);
    if (!response.ok) {
      throw new Error(`Failed to load glossary: ${response.status}`);
    }

    const payload = await response.json() as ISharePointItemsResponse;
    return (payload.value ?? []).map((item, index) => this.mapItem(item, index, configuration.defaultCategory)).slice(0, top);
  }

  private mapItem(item: ISharePointGlossaryItem, index: number, defaultCategory: string): ICorporateGlossaryItem {
    const title = normalizeText(item.Title) || 'Sin titulo';
    const definition = normalizeText(item.Definition ?? item.Meaning) || '';
    const category = normalizeText(item.Category ?? item.Type) || normalizeText(defaultCategory) || 'General';
    const aliases = splitAliases(item.Aliases ?? item.Synonyms);
    const relatedUrl = resolveAbsoluteUrl(this.context.webAbsoluteUrl, item.RelatedUrl ?? item.RelatedLink);

    return {
      id: String(item.Id ?? index + 1),
      title,
      definition,
      category,
      aliases,
      relatedUrl,
      updatedAt: item.UpdatedAt ?? item.Modified,
      featured: String(item.Featured).toLowerCase() === 'true' || item.Featured === true,
      partialData: !definition || !relatedUrl
    };
  }
}
