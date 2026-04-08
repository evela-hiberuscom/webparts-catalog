import type { SPHttpClient } from '@microsoft/sp-http';
import type {
  FetchLike,
  IUsefulDocument,
  IUsefulDocumentsConfiguration
} from '../models/usefulDocumentModels';

export interface IUsefulDocumentsRepositoryOptions {
  fetchClient: FetchLike;
  spHttpClient: SPHttpClient;
  spHttpClientConfiguration: unknown;
  webAbsoluteUrl: string;
}

interface ISPListItem {
  Id: number;
  Title?: string;
  Category?: string;
  Updated?: string;
  Owner?: string;
  FileRef?: string;
  Priority?: string;
}

function normalizeListUrl(listTitleOrUrl: string, webAbsoluteUrl: string): string {
  if (!listTitleOrUrl) {
    return listTitleOrUrl;
  }

  const trimmed = listTitleOrUrl.trim();

  if (trimmed.startsWith('http')) {
    try {
      const url = new URL(trimmed);
      if (url.origin === new URL(webAbsoluteUrl).origin) {
        let path = url.pathname;
        if (path.toLowerCase().includes('/forms/')) {
          path = path.split('/forms/')[0];
        } else if (path.toLowerCase().includes('/allitems.aspx')) {
          path = path.split('/AllItems.aspx')[0];
        }
        return path;
      }
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

function buildSelectFields(): string {
  return 'Id,Title,Category,Updated,Owner,FileRef,Priority';
}

function normalizePriority(priority: string | undefined): IUsefulDocument['priority'] {
  if (!priority) {
    return 'unknown';
  }
  const lower = priority.toLowerCase();
  if (lower.includes('featured') || lower.includes('destacado')) {
    return 'featured';
  }
  if (lower.includes('frequent') || lower.includes('frecuente')) {
    return 'frequent';
  }
  return 'normal';
}

export class UsefulDocumentsRepository {
  private _fetchClient: FetchLike;
  private _spHttpClient: SPHttpClient;
  private _spHttpClientConfiguration: unknown;
  private _webAbsoluteUrl: string;

  constructor(options: IUsefulDocumentsRepositoryOptions) {
    this._fetchClient = options.fetchClient;
    this._spHttpClient = options.spHttpClient;
    this._spHttpClientConfiguration = options.spHttpClientConfiguration;
    this._webAbsoluteUrl = options.webAbsoluteUrl;
  }

  async getDocuments(config: IUsefulDocumentsConfiguration): Promise<IUsefulDocument[]> {
    const { dataSourceType, listTitleOrUrl, maxItems } = config;

    if (dataSourceType === 'StaticConfig') {
      return this.getStaticDocuments();
    }

    if (dataSourceType === 'JsonUrl') {
      return this.getDocumentsFromJsonUrl(listTitleOrUrl);
    }

    return this.getDocumentsFromSharePointList(listTitleOrUrl, maxItems);
  }

  private async getDocumentsFromSharePointList(listTitleOrUrl: string, maxItems: number): Promise<IUsefulDocument[]> {
    const normalizedUrl = normalizeListUrl(listTitleOrUrl, this._webAbsoluteUrl);
    const isUrl = normalizedUrl.startsWith('/');

    let listUrl: string;
    const selectFields = buildSelectFields();

    if (isUrl) {
      listUrl = `${this._webAbsoluteUrl}/_api/web/GetList(@listUrl)?@listUrl='${encodeURIComponent(normalizedUrl)}'`;
    } else {
      listUrl = `${this._webAbsoluteUrl}/_api/web/lists/getByTitle('${encodeURIComponent(normalizedUrl)}')`;
    }

    const itemsUrl = `${listUrl}/items?$top=${maxItems}&$select=${selectFields}`;

    try {
      const response = await this._spHttpClient.get(
        itemsUrl,
        this._spHttpClientConfiguration as never
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.status}`);
      }

      const data = await response.json();
      const items: ISPListItem[] = data.value || [];

      return items.map((item) => this.mapSharePointItemToUsefulDocument(item));
    } catch (error) {
      console.error('Error fetching documents from SharePoint:', error);
      throw error;
    }
  }

  private mapSharePointItemToUsefulDocument(item: ISPListItem): IUsefulDocument {
    return {
      id: String(item.Id),
      title: item.Title || 'Sin título',
      category: item.Category || undefined,
      updatedAt: item.Updated || undefined,
      owner: item.Owner || undefined,
      openUrl: item.FileRef || undefined,
      priority: normalizePriority(item.Priority)
    };
  }

  private async getDocumentsFromJsonUrl(jsonUrl: string): Promise<IUsefulDocument[]> {
    if (!jsonUrl || !jsonUrl.trim()) {
      throw new Error('JSON URL is required for JsonUrl data source type');
    }

    try {
      const url = new URL(jsonUrl);
      const sameOrigin = url.origin === new URL(this._webAbsoluteUrl).origin;
      if (!sameOrigin && !jsonUrl.startsWith('/')) {
        throw new Error('JSON URL must be same-origin or relative path');
      }
    } catch {
      if (!jsonUrl.startsWith('/')) {
        throw new Error('Invalid JSON URL format');
      }
    }

    const response = await this._fetchClient(jsonUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch documents from JSON URL: ${response.status}`);
    }

    const data = await response.json();
    const items = data.items || data.documents || [];

    return items.map((item: { id?: string; title: string; category?: string; updatedAt?: string; owner?: string; openUrl?: string; priority?: string }, index: number) => ({
      id: item.id || `doc-${index}`,
      title: item.title || 'Sin título',
      category: item.category || undefined,
      updatedAt: item.updatedAt || undefined,
      owner: item.owner || undefined,
      openUrl: item.openUrl || undefined,
      priority: normalizePriority(item.priority)
    }));
  }

  private getStaticDocuments(): IUsefulDocument[] {
    return [
      {
        id: 'static-1',
        title: 'Manual de políticas corporativas',
        category: 'Políticas',
        updatedAt: new Date().toISOString(),
        owner: 'Recursos Humanos',
        openUrl: '/sites/docs/ManualPoliticas.pdf',
        priority: 'featured'
      },
      {
        id: 'static-2',
        title: 'Plantilla de informe mensual',
        category: 'Plantillas',
        updatedAt: new Date().toISOString(),
        owner: 'Gestión',
        openUrl: '/sites/docs/PlantillaInforme.xlsx',
        priority: 'frequent'
      },
      {
        id: 'static-3',
        title: 'Guía de onboarding',
        category: 'Recursos Humanos',
        updatedAt: new Date().toISOString(),
        owner: 'RRHH',
        openUrl: '/sites/docs/GuiaOnboarding.docx',
        priority: 'normal'
      }
    ];
  }
}
