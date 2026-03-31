import { SPHttpClient, ISPHttpClientConfiguration } from '@microsoft/sp-http';
import type {
  FetchLike,
  ICampaignItem,
  IInternalCampaignConfiguration
} from '../models/campaignModels';

export interface ICampaignRepositoryOptions {
  fetchClient: FetchLike;
  spHttpClient: SPHttpClient;
  spHttpClientConfiguration: ISPHttpClientConfiguration;
  webAbsoluteUrl: string;
}

interface ISPListItem {
  Id: number;
  Title?: string;
  Claim?: string;
  Description?: string;
  ImageUrl?: string;
  CtaText?: string;
  CtaUrl?: string;
  StartDate?: string;
  EndDate?: string;
  Priority?: number;
  Category?: string;
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

function isCampaignActive(startDate: string | undefined, endDate: string | undefined): boolean {
  const now = new Date();
  
  if (startDate && new Date(startDate) > now) {
    return false;
  }
  
  if (endDate && new Date(endDate) < now) {
    return false;
  }
  
  return true;
}

export class CampaignRepository {
  private _fetchClient: FetchLike;
  private _spHttpClient: SPHttpClient;
  private _spHttpClientConfiguration: ISPHttpClientConfiguration;
  private _webAbsoluteUrl: string;

  constructor(options: ICampaignRepositoryOptions) {
    this._fetchClient = options.fetchClient;
    this._spHttpClient = options.spHttpClient;
    this._spHttpClientConfiguration = options.spHttpClientConfiguration;
    this._webAbsoluteUrl = options.webAbsoluteUrl;
  }

  async getCampaigns(config: IInternalCampaignConfiguration): Promise<ICampaignItem[]> {
    const { dataSourceType, listTitleOrUrl, maxItems } = config;

    if (dataSourceType === 'StaticConfig') {
      return this.getStaticCampaigns();
    }

    if (dataSourceType === 'JsonUrl') {
      return this.getCampaignsFromJsonUrl(listTitleOrUrl, maxItems);
    }

    return this.getCampaignsFromSharePointList(listTitleOrUrl, maxItems);
  }

  private async getCampaignsFromSharePointList(listTitleOrUrl: string, maxItems: number): Promise<ICampaignItem[]> {
    const normalizedUrl = normalizeListUrl(listTitleOrUrl, this._webAbsoluteUrl);
    const isUrl = normalizedUrl.startsWith('/');

    let listUrl: string;

    if (isUrl) {
      listUrl = `${this._webAbsoluteUrl}/_api/web/GetList(@listUrl)?@listUrl='${encodeURIComponent(normalizedUrl)}'`;
    } else {
      listUrl = `${this._webAbsoluteUrl}/_api/web/lists/getByTitle('${encodeURIComponent(normalizedUrl)}')`;
    }

    const selectFields = 'Id,Title,Claim,Description,ImageUrl,CtaText,CtaUrl,StartDate,EndDate,Priority,Category';
    const itemsUrl = `${listUrl}/items?$top=${maxItems * 2}&$select=${selectFields}&$orderby=Priority desc`;

    try {
      const response = await this._spHttpClient.get(
        itemsUrl,
        SPHttpClient.configurations.v1
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch campaigns: ${response.status}`);
      }

      const data = await response.json();
      const items: ISPListItem[] = data.value || [];

      const campaigns = items
        .map((item) => this.mapSharePointItemToCampaign(item))
        .filter((campaign) => isCampaignActive(campaign.startDate, campaign.endDate))
        .slice(0, maxItems);

      return campaigns;
    } catch (error) {
      console.error('Error fetching campaigns from SharePoint:', error);
      throw error;
    }
  }

  private mapSharePointItemToCampaign(item: ISPListItem): ICampaignItem {
    return {
      id: String(item.Id),
      title: item.Title || 'Sin título',
      claim: item.Claim || undefined,
      description: item.Description || undefined,
      imageUrl: item.ImageUrl || undefined,
      ctaText: item.CtaText || 'Más información',
      ctaUrl: item.CtaUrl || undefined,
      startDate: item.StartDate || undefined,
      endDate: item.EndDate || undefined,
      priority: item.Priority || 0,
      category: item.Category || undefined
    };
  }

  private async getCampaignsFromJsonUrl(jsonUrl: string, maxItems: number): Promise<ICampaignItem[]> {
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
      throw new Error(`Failed to fetch campaigns from JSON URL: ${response.status}`);
    }

    const data = await response.json();
    const items = data.items || data.campaigns || [];

    return items
      .filter((item: { startDate?: string; endDate?: string }) => isCampaignActive(item.startDate, item.endDate))
      .slice(0, maxItems)
      .map((item: { id?: string; title: string; claim?: string; description?: string; imageUrl?: string; ctaText?: string; ctaUrl?: string; startDate?: string; endDate?: string; priority?: number; category?: string }, index: number) => ({
        id: item.id || `campaign-${index}`,
        title: item.title || 'Sin título',
        claim: item.claim || undefined,
        description: item.description || undefined,
        imageUrl: item.imageUrl || undefined,
        ctaText: item.ctaText || 'Más información',
        ctaUrl: item.ctaUrl || undefined,
        startDate: item.startDate || undefined,
        endDate: item.endDate || undefined,
        priority: item.priority || 0,
        category: item.category || undefined
      }));
  }

  private getStaticCampaigns(): ICampaignItem[] {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);

    return [
      {
        id: 'campaign-1',
        title: 'Semana de la Seguridad',
        claim: 'Tu seguridad es nuestra prioridad',
        description: 'Participa en nuestras actividades de seguridad laboral y cuida de ti y tus compañeros.',
        imageUrl: undefined,
        ctaText: 'Participar',
        ctaUrl: 'https://intranet.company.com/safety',
        startDate: lastWeek.toISOString(),
        endDate: nextWeek.toISOString(),
        priority: 10,
        category: 'Seguridad'
      },
      {
        id: 'campaign-2',
        title: 'Programa de Bienestar',
        claim: 'Cuida tu mente y tu cuerpo',
        description: 'Únete a nuestros programas de bienestar mental y físico.',
        imageUrl: undefined,
        ctaText: 'Ver programas',
        ctaUrl: 'https://intranet.company.com/wellness',
        startDate: lastWeek.toISOString(),
        endDate: nextWeek.toISOString(),
        priority: 5,
        category: 'Bienestar'
      }
    ];
  }
}