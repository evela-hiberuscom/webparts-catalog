import { SPHttpClient } from '@microsoft/sp-http';
import type { FetchLike, IRouteStep, IGuidedRouteConfiguration } from '../models/guidedRouteModels';
import { escapeODataString as escapeODataListTitle } from '@paquete/spfx-common';

export class GuidedRouteRepository {
  private _fetchClient: FetchLike;
  private _spHttpClient: SPHttpClient;
  private _webAbsoluteUrl: string;

  constructor(options: { fetchClient: FetchLike; spHttpClient: SPHttpClient; webAbsoluteUrl: string }) {
    this._fetchClient = options.fetchClient;
    this._spHttpClient = options.spHttpClient;
    this._webAbsoluteUrl = options.webAbsoluteUrl;
  }

  async getRoute(config: IGuidedRouteConfiguration): Promise<IRouteStep[]> {
    if (config.dataSourceType === 'StaticConfig') return this.getStaticRoute();
    if (config.dataSourceType === 'JsonUrl') return this.getRouteFromJsonUrl(config.listTitleOrUrl, config.maxSteps);
    return this.getRouteFromSharePoint(config.listTitleOrUrl, config.maxSteps);
  }

  private async getRouteFromSharePoint(listTitleOrUrl: string, maxSteps: number): Promise<IRouteStep[]> {
    const response = await this._spHttpClient.get(`${this._webAbsoluteUrl}/_api/web/lists/getByTitle('${escapeODataListTitle(listTitleOrUrl)}')/items?$top=${maxSteps}`, SPHttpClient.configurations.v1);
    if (!response.ok) throw new Error(`Failed: ${response.status}`);
    const data = await response.json();
    return (data.value || []).map((item: any) => ({ id: String(item.Id), title: item.Title || 'Paso', description: item.Description || '', linkUrl: item.LinkUrl || undefined, icon: item.Icon || 'Circle1', order: item.Order || 0 }));
  }

  private async getRouteFromJsonUrl(jsonUrl: string, maxSteps: number): Promise<IRouteStep[]> {
    const response = await this._fetchClient(jsonUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) throw new Error(`Failed: ${response.status}`);
    const data = await response.json();
    return (data.items || []).slice(0, maxSteps);
  }

  private getStaticRoute(): IRouteStep[] {
    return [
      { id: '1', title: 'Bienvenida', description: 'Conoce la intranet y sus utilidades principales', linkUrl: '/sites/welcome', icon: 'Home', order: 1 },
      { id: '2', title: 'Tu perfil', description: 'Actualiza tu información y preferencias', linkUrl: '/myprofile', icon: 'Person', order: 2 },
      { id: '3', title: 'Recursos importantes', description: 'Accede a documentos y herramientas clave', linkUrl: '/sites/resources', icon: 'Document', order: 3 },
      { id: '4', title: 'Contacto de soporte', description: '¿Necesitas ayuda? Contacta con IT', linkUrl: '/support', icon: 'Help', order: 4 }
    ];
  }
}