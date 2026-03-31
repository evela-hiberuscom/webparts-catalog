import { SPHttpClient, ISPHttpClientConfiguration } from '@microsoft/sp-http';
import type {
  FetchLike,
  IJoiner,
  INewJoinersConfiguration
} from '../models/joinerModels';

export interface INewJoinersRepositoryOptions {
  fetchClient: FetchLike;
  spHttpClient: SPHttpClient;
  spHttpClientConfiguration: ISPHttpClientConfiguration;
  webAbsoluteUrl: string;
}

interface ISPListItem {
  Id: number;
  Title?: string;
  JobTitle?: string;
  Department?: string;
  PhotoUrl?: string;
  StartDate?: string;
  ProfileUrl?: string;
  WelcomeMessage?: string;
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

export class NewJoinersRepository {
  private _fetchClient: FetchLike;
  private _spHttpClient: SPHttpClient;
  private _spHttpClientConfiguration: ISPHttpClientConfiguration;
  private _webAbsoluteUrl: string;

  constructor(options: INewJoinersRepositoryOptions) {
    this._fetchClient = options.fetchClient;
    this._spHttpClient = options.spHttpClient;
    this._spHttpClientConfiguration = options.spHttpClientConfiguration;
    this._webAbsoluteUrl = options.webAbsoluteUrl;
  }

  async getJoiners(config: INewJoinersConfiguration): Promise<IJoiner[]> {
    const { dataSourceType, listTitleOrUrl, maxItems, daysBack } = config;

    if (dataSourceType === 'StaticConfig') {
      return this.getStaticJoiners();
    }

    if (dataSourceType === 'JsonUrl') {
      return this.getJoinersFromJsonUrl(listTitleOrUrl, maxItems, daysBack);
    }

    return this.getJoinersFromSharePointList(listTitleOrUrl, maxItems, daysBack);
  }

  private async getJoinersFromSharePointList(listTitleOrUrl: string, maxItems: number, daysBack: number): Promise<IJoiner[]> {
    const normalizedUrl = normalizeListUrl(listTitleOrUrl, this._webAbsoluteUrl);
    const isUrl = normalizedUrl.startsWith('/');

    let listUrl: string;

    if (isUrl) {
      listUrl = `${this._webAbsoluteUrl}/_api/web/GetList(@listUrl)?@listUrl='${encodeURIComponent(normalizedUrl)}'`;
    } else {
      listUrl = `${this._webAbsoluteUrl}/_api/web/lists/getByTitle('${encodeURIComponent(normalizedUrl)}')`;
    }

    const selectFields = 'Id,Title,JobTitle,Department,PhotoUrl,StartDate,ProfileUrl,WelcomeMessage';
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    const cutoffIso = cutoffDate.toISOString();

    const itemsUrl = `${listUrl}/items?$top=${maxItems}&$select=${selectFields}&$filter=StartDate ge '${cutoffIso}'&$orderby=StartDate desc`;

    try {
      const response = await this._spHttpClient.get(
        itemsUrl,
        SPHttpClient.configurations.v1
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch joiners: ${response.status}`);
      }

      const data = await response.json();
      const items: ISPListItem[] = data.value || [];

      return items.map((item) => this.mapSharePointItemToJoiner(item));
    } catch (error) {
      console.error('Error fetching joiners from SharePoint:', error);
      throw error;
    }
  }

  private mapSharePointItemToJoiner(item: ISPListItem): IJoiner {
    return {
      id: String(item.Id),
      displayName: item.Title || 'Nueva incorporación',
      jobTitle: item.JobTitle || undefined,
      department: item.Department || undefined,
      photoUrl: item.PhotoUrl || undefined,
      startDate: item.StartDate || undefined,
      profileUrl: item.ProfileUrl || undefined,
      welcomeMessage: item.WelcomeMessage || undefined
    };
  }

  private async getJoinersFromJsonUrl(jsonUrl: string, maxItems: number, daysBack: number): Promise<IJoiner[]> {
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
      throw new Error(`Failed to fetch joiners from JSON URL: ${response.status}`);
    }

    const data = await response.json();
    const items = data.items || data.joiners || [];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    const cutoffIso = cutoffDate.toISOString();

    return items
      .filter((item: { startDate?: string }) => !item.startDate || item.startDate >= cutoffIso)
      .slice(0, maxItems)
      .map((item: { id?: string; displayName: string; jobTitle?: string; department?: string; photoUrl?: string; startDate?: string; profileUrl?: string; welcomeMessage?: string }, index: number) => ({
        id: item.id || `joiner-${index}`,
        displayName: item.displayName || 'Nueva incorporación',
        jobTitle: item.jobTitle || undefined,
        department: item.department || undefined,
        photoUrl: item.photoUrl || undefined,
        startDate: item.startDate || undefined,
        profileUrl: item.profileUrl || undefined,
        welcomeMessage: item.welcomeMessage || undefined
      }));
  }

  private getStaticJoiners(): IJoiner[] {
    const now = new Date();
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(now);
    lastMonth.setDate(lastMonth.getDate() - 30);

    return [
      {
        id: 'joiner-1',
        displayName: 'Ana García López',
        jobTitle: 'Desarrolladora Senior',
        department: 'Tecnología',
        photoUrl: undefined,
        startDate: lastWeek.toISOString(),
        profileUrl: 'https://outlook.office.com/person/a.garcia@company.com',
        welcomeMessage: '¡Bienvenida al equipo!'
      },
      {
        id: 'joiner-2',
        displayName: 'Carlos Martínez Ruiz',
        jobTitle: 'Analista de Negocio',
        department: 'Operaciones',
        photoUrl: undefined,
        startDate: lastMonth.toISOString(),
        profileUrl: 'https://outlook.office.com/person/c.martinez@company.com',
        welcomeMessage: '¡Bienvenido a la compañía!'
      },
      {
        id: 'joiner-3',
        displayName: 'María Rodríguez Sánchez',
        jobTitle: 'Diseñadora UX',
        department: 'Producto',
        photoUrl: undefined,
        startDate: lastWeek.toISOString(),
        profileUrl: 'https://outlook.office.com/person/m.rodriguez@company.com',
        welcomeMessage: '¡Encantada de unirme al equipo!'
      }
    ];
  }
}