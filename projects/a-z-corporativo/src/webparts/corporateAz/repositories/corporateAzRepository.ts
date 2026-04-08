import type { SPHttpClient, SPHttpClientConfiguration } from '@microsoft/sp-http';
import type { FetchLike, IAzEntry, ICorporateAzConfiguration } from '../models/corporateAzModels';

export class CorporateAzRepository {
  private _fetchClient: FetchLike;
  private _spHttpClient: SPHttpClient;
  private _spHttpClientConfiguration: SPHttpClientConfiguration;
  private _webAbsoluteUrl: string;

  constructor(options: {
    fetchClient: FetchLike;
    spHttpClient: SPHttpClient;
    spHttpClientConfiguration: SPHttpClientConfiguration;
    webAbsoluteUrl: string;
  }) {
    this._fetchClient = options.fetchClient;
    this._spHttpClient = options.spHttpClient;
    this._spHttpClientConfiguration = options.spHttpClientConfiguration;
    this._webAbsoluteUrl = options.webAbsoluteUrl;
  }

  async getEntries(config: ICorporateAzConfiguration): Promise<IAzEntry[]> {
    if (config.dataSourceType === 'StaticConfig') return this.getStaticEntries();
    if (config.dataSourceType === 'JsonUrl') return this.getEntriesFromJsonUrl(config.listTitleOrUrl);
    return this.getEntriesFromSharePoint(config.listTitleOrUrl, config.maxItems);
  }

  private async getEntriesFromSharePoint(listTitleOrUrl: string, maxItems: number): Promise<IAzEntry[]> {
    const response = await this._spHttpClient.get(
      `${this._webAbsoluteUrl}/_api/web/lists/getByTitle('${encodeURIComponent(listTitleOrUrl)}')/items?$top=${maxItems}`,
      this._spHttpClientConfiguration
    );
    if (!response.ok) {
      throw new Error(`Failed: ${response.status}`);
    }
    const data = await response.json();
    return (data.value || []).map((item: Record<string, unknown>) => ({
      id: String(item.Id),
      letter:
        typeof item.Letter === 'string'
          ? item.Letter
          : typeof item.Title === 'string'
            ? item.Title.charAt(0).toUpperCase()
            : '#',
      title: typeof item.Title === 'string' ? item.Title : '',
      description: typeof item.Description === 'string' ? item.Description : undefined,
      linkUrl: typeof item.LinkUrl === 'string' ? item.LinkUrl : undefined
    }));
  }

  private async getEntriesFromJsonUrl(jsonUrl: string): Promise<IAzEntry[]> {
    if (!jsonUrl.trim()) {
      throw new Error('JSON URL required');
    }

    let resolvedUrl = jsonUrl.trim();
    if (resolvedUrl.startsWith('/')) {
      resolvedUrl = `${new URL(this._webAbsoluteUrl).origin}${resolvedUrl}`;
    } else {
      try {
        const url = new URL(resolvedUrl);
        if (url.origin !== new URL(this._webAbsoluteUrl).origin) {
          throw new Error('Invalid JSON URL format');
        }
      } catch {
        throw new Error('Invalid JSON URL format');
      }
    }

    const response = await this._fetchClient(resolvedUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw new Error(`Failed: ${response.status}`);
    }
    const data = await response.json();
    return (data.items || []).slice(0, 50);
  }

  private getStaticEntries(): IAzEntry[] {
    return [
      { id: '1', letter: 'A', title: 'Ausencias', description: 'Gestión de permisos y vacaciones', linkUrl: '/absences' },
      { id: '2', letter: 'B', title: 'Beneficios', description: 'Programa de beneficios corporativos', linkUrl: '/benefits' },
      { id: '3', letter: 'C', title: 'Comunicaciones', description: 'Canal de noticias internas', linkUrl: '/news' },
      { id: '4', letter: 'D', title: 'Directorio', description: 'Busca a tus compañeros', linkUrl: '/directory' },
      { id: '5', letter: 'E', title: 'Evaluaciones', description: 'Ciclo de desempeño', linkUrl: '/reviews' },
      { id: '6', letter: 'F', title: 'Formación', description: 'Campus de aprendizaje', linkUrl: '/learning' },
      { id: '7', letter: 'G', title: 'Gastos', description: 'Informe de gastos', linkUrl: '/expenses' },
      { id: '8', letter: 'I', title: 'IT Soporte', description: 'Tickets de tecnología', linkUrl: '/itsupport' },
      { id: '9', letter: 'N', title: 'Nóminas', description: 'Consultar recibos', linkUrl: '/payroll' },
      { id: '10', letter: 'V', title: 'Vacaciones', description: 'Calendario y solicitud', linkUrl: '/vacations' }
    ];
  }
}
