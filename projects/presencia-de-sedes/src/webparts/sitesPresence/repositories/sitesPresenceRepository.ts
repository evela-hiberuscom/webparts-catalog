import { SPHttpClient } from '@microsoft/sp-http';
import type { FetchLike, ISitePresence, ISitesPresenceConfiguration } from '../models/sitesPresenceModels';

function normalizeUrl(listTitleOrUrl: string, webAbsoluteUrl: string): string {
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

export class SitesPresenceRepository {
  private _fetchClient: FetchLike;
  private _spHttpClient: SPHttpClient;
  private _webAbsoluteUrl: string;

  constructor(options: { fetchClient: FetchLike; spHttpClient: SPHttpClient; webAbsoluteUrl: string }) {
    this._fetchClient = options.fetchClient;
    this._spHttpClient = options.spHttpClient;
    this._webAbsoluteUrl = options.webAbsoluteUrl;
  }

  async getSites(config: ISitesPresenceConfiguration): Promise<ISitePresence[]> {
    if (config.dataSourceType === 'StaticConfig') {
      return this.getStaticSites();
    }
    if (config.dataSourceType === 'JsonUrl') {
      return this.getSitesFromJsonUrl(config.listTitleOrUrl);
    }
    return this.getSitesFromSharePoint(config.listTitleOrUrl, config.maxItems);
  }

  private async getSitesFromSharePoint(listTitleOrUrl: string, maxItems: number): Promise<ISitePresence[]> {
    const normalizedUrl = normalizeUrl(listTitleOrUrl, this._webAbsoluteUrl);
    const isUrl = normalizedUrl.startsWith('/');
    const listUrl = isUrl
      ? `${this._webAbsoluteUrl}/_api/web/GetList(@listUrl)?@listUrl='${encodeURIComponent(normalizedUrl)}'`
      : `${this._webAbsoluteUrl}/_api/web/lists/getByTitle('${encodeURIComponent(normalizedUrl)}')`;
    const response = await this._spHttpClient.get(`${listUrl}/items?$top=${maxItems}`, SPHttpClient.configurations.v1);
    if (!response.ok) {
      throw new Error(`Failed: ${response.status}`);
    }
    const data = await response.json();
    return (data.value || []).map((item: { Id: number; Title?: string; Address?: string; Status?: string; Capacity?: number; CurrentOccupancy?: number; Hours?: string; Contact?: string }) => ({
      id: String(item.Id),
      name: item.Title || 'Sede',
      address: item.Address || undefined,
      status: item.Status === 'Abierto' ? 'open' : item.Status === 'Cerrado' ? 'closed' : 'limited',
      capacity: item.Capacity || undefined,
      currentOccupancy: item.CurrentOccupancy || undefined,
      hours: item.Hours || undefined,
      contact: item.Contact || undefined
    }));
  }

  private async getSitesFromJsonUrl(jsonUrl: string): Promise<ISitePresence[]> {
    if (!jsonUrl?.trim()) {
      throw new Error('JSON URL required');
    }
    const response = await this._fetchClient(jsonUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) {
      throw new Error(`Failed: ${response.status}`);
    }
    const data = await response.json();
    return (data.items || []).slice(0, 10);
  }

  private getStaticSites(): ISitePresence[] {
    return [
      { id: '1', name: 'Sede Central', address: 'Calle Principal 123', status: 'open', capacity: 500, currentOccupancy: 320, hours: '08:00 - 18:00', contact: 'recepcion@company.com' },
      { id: '2', name: 'Edificio Norte', address: 'Avenida Norte 456', status: 'limited', capacity: 200, currentOccupancy: 180, hours: '09:00 - 17:00', contact: 'edificionorte@company.com' },
      { id: '3', name: 'Campus Sur', address: 'Parque Sur 789', status: 'open', capacity: 800, currentOccupancy: 450, hours: '07:00 - 20:00', contact: 'campussur@company.com' }
    ];
  }
}