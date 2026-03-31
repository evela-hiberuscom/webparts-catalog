import { SPHttpClient } from '@microsoft/sp-http';
import type { FetchLike, IShiftEntry, IShiftsGuardsConfiguration } from '../models/shiftsGuardsModels';

export class ShiftsGuardsRepository {
  private _fetchClient: FetchLike;
  private _spHttpClient: SPHttpClient;
  private _webAbsoluteUrl: string;

  constructor(options: { fetchClient: FetchLike; spHttpClient: SPHttpClient; webAbsoluteUrl: string }) {
    this._fetchClient = options.fetchClient;
    this._spHttpClient = options.spHttpClient;
    this._webAbsoluteUrl = options.webAbsoluteUrl;
  }

  async getEntries(config: IShiftsGuardsConfiguration): Promise<IShiftEntry[]> {
    if (config.dataSourceType === 'StaticConfig') return this.getStaticEntries();
    if (config.dataSourceType === 'JsonUrl') return this.getEntriesFromJsonUrl(config.listTitleOrUrl);
    return this.getEntriesFromSharePoint(config.listTitleOrUrl, config.maxItems);
  }

  private async getEntriesFromSharePoint(listTitleOrUrl: string, maxItems: number): Promise<IShiftEntry[]> {
    const response = await this._spHttpClient.get(`${this._webAbsoluteUrl}/_api/web/lists/getByTitle('${encodeURIComponent(listTitleOrUrl)}')/items?$top=${maxItems}`, SPHttpClient.configurations.v1);
    if (!response.ok) throw new Error(`Failed: ${response.status}`);
    const data = await response.json();
    return (data.value || []).map((item: any) => ({ id: String(item.Id), personName: item.PersonName || '', role: item.Role || '', type: item.Type === 'Guardia' ? 'guardia' : item.Type === 'Disponibilidad' ? 'disponibilidad' : 'turno', startTime: item.StartTime || '', endTime: item.EndTime || '', contact: item.Contact || undefined, location: item.Location || undefined }));
  }

  private async getEntriesFromJsonUrl(jsonUrl: string): Promise<IShiftEntry[]> {
    const response = await this._fetchClient(jsonUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) throw new Error(`Failed: ${response.status}`);
    const data = await response.json();
    return (data.items || []).slice(0, 10);
  }

  private getStaticEntries(): IShiftEntry[] {
    const now = new Date();
    const later = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    return [
      { id: '1', personName: 'Carlos García', role: 'Soporte técnico', type: 'turno', startTime: now.toISOString(), endTime: later.toISOString(), contact: 'carlos@company.com', location: 'Planta 1' },
      { id: '2', personName: 'María López', role: 'Atención al cliente', type: 'guardia', startTime: now.toISOString(), endTime: later.toISOString(), contact: 'maria@company.com', location: 'Planta 2' },
      { id: '3', personName: 'Juan Pérez', role: 'Seguridad', type: 'disponibilidad', startTime: now.toISOString(), endTime: later.toISOString(), contact: 'juan@company.com', location: 'Remoto' }
    ];
  }
}