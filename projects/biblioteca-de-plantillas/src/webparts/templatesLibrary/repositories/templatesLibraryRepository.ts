import type {
  ITemplateItem,
  ITemplatesLibraryConfiguration,
  ITemplatesLibraryContext,
  ITemplatesRepository
} from '../models/templatesLibraryModels';
import {
  clampMaxItems,
  deriveDownloadUrl,
  normalizeCategory,
  normalizeTemplateType,
  resolveAbsoluteUrl
} from '../utils/templatesLibraryUtils';

interface ITemplateListItem {
  Id: number;
  Title?: string;
  FileLeafRef?: string;
  FileRef?: string;
  EncodedAbsUrl?: string;
  Modified?: string;
  Category?: string;
  TemplateType?: string;
  File_x0020_Type?: string;
  Featured?: boolean | string | number;
  FeaturedTemplate?: boolean | string | number;
}

interface ITemplateListResponse {
  value?: ITemplateListItem[];
}

export class TemplatesLibraryRepository implements ITemplatesRepository {
  public constructor(private readonly context: ITemplatesLibraryContext) {}

  public async getTemplates(configuration: ITemplatesLibraryConfiguration): Promise<ITemplateItem[]> {
    const maxItems = clampMaxItems(configuration.maxItems);
    const filter = configuration.sourceKind === 'library' ? '&$filter=FSObjType eq 0' : '';
    const endpoint =
      `${this.context.webAbsoluteUrl}/_api/web/lists/getByTitle('${encodeURIComponent(configuration.listTitleOrUrl)}')/items` +
      `?$select=Id,Title,FileLeafRef,FileRef,EncodedAbsUrl,Modified,Category,TemplateType,File_x0020_Type,Featured,FeaturedTemplate,FSObjType` +
      `${filter}&$orderby=Modified desc&$top=${Math.max(maxItems * 2, 24)}`;

    const response = await this.context.spHttpClient.get(endpoint, this.context.spHttpClientConfiguration);
    if (!response.ok) {
      throw new Error(`Failed to load templates: ${response.status}`);
    }

    const payload = await response.json() as ITemplateListResponse;
    return (payload.value ?? [])
      .map((item) => this.mapItem(item, configuration.defaultCategory))
      .slice(0, Math.max(maxItems * 2, 24));
  }

  private mapItem(item: ITemplateListItem, defaultCategory: string): ITemplateItem {
    const openUrl = resolveAbsoluteUrl(this.context.webAbsoluteUrl, item.EncodedAbsUrl || item.FileRef);
    const templateType = normalizeTemplateType(item.TemplateType || item.File_x0020_Type || this.extractFileExtension(item.FileLeafRef));

    return {
      id: String(item.Id),
      title: item.Title?.trim() || item.FileLeafRef?.trim() || 'Plantilla sin titulo',
      templateType,
      category: normalizeCategory(item.Category, defaultCategory || 'General'),
      updatedAt: item.Modified,
      openUrl,
      downloadUrl: deriveDownloadUrl(openUrl),
      featured: this.parseBoolean(item.FeaturedTemplate) || this.parseBoolean(item.Featured)
    };
  }

  private extractFileExtension(fileName: string | undefined): string | undefined {
    if (!fileName?.includes('.')) {
      return undefined;
    }

    const extension = fileName.split('.').pop();
    return extension?.toUpperCase();
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
