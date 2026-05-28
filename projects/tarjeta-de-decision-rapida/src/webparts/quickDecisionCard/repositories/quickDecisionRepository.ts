import { SPHttpClient } from '@microsoft/sp-http';
import type { FetchLike, IQuickDecision, IQuickDecisionConfiguration } from '../models/quickDecisionModels';
import { escapeODataString as escapeODataListTitle } from '@paquete/spfx-common';

export class QuickDecisionRepository {
  private _fetchClient: FetchLike;
  private _spHttpClient: SPHttpClient;
  private _webAbsoluteUrl: string;

  constructor(options: { fetchClient: FetchLike; spHttpClient: SPHttpClient; webAbsoluteUrl: string }) {
    this._fetchClient = options.fetchClient;
    this._spHttpClient = options.spHttpClient;
    this._webAbsoluteUrl = options.webAbsoluteUrl;
  }

  async getDecision(config: IQuickDecisionConfiguration): Promise<IQuickDecision[]> {
    if (config.dataSourceType === 'StaticConfig') return this.getStaticDecision();
    if (config.dataSourceType === 'JsonUrl') return this.getDecisionFromJson(config.listTitleOrUrl);
    return this.getDecisionFromSharePoint(config.listTitleOrUrl);
  }

  private async getDecisionFromSharePoint(listTitleOrUrl: string): Promise<IQuickDecision[]> {
    const response = await this._spHttpClient.get(`${this._webAbsoluteUrl}/_api/web/lists/getByTitle('${escapeODataListTitle(listTitleOrUrl)}')/items?$top=1`, SPHttpClient.configurations.v1);
    if (!response.ok) throw new Error(`Failed: ${response.status}`);
    const data = await response.json();
    return (data.value || []).map((item: any) => ({ id: String(item.Id), question: item.Question || '¿Qué prefieres?', options: item.OptionsJson ? JSON.parse(item.OptionsJson) : [], context: item.Context || undefined, expiresAt: item.ExpiresAt || undefined }));
  }

  private async getDecisionFromJson(jsonUrl: string): Promise<IQuickDecision[]> {
    const response = await this._fetchClient(jsonUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) throw new Error(`Failed: ${response.status}`);
    const data = await response.json();
    return (data.items || [data]).slice(0, 1);
  }

  private getStaticDecision(): IQuickDecision[] {
    return [{ id: '1', question: '¿Prefieres trabajar desde oficina o en remoto?', options: [{ id: 'a', text: 'Oficina' }, { id: 'b', text: 'Remoto' }, { id: 'c', text: 'Híbrido' }], context: 'Tu respuesta nos ayuda a mejorar las políticas de trabajo', expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() }];
  }
}