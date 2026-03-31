import { SPHttpClient, ISPHttpClientConfiguration } from '@microsoft/sp-http';
import type {
  FetchLike,
  IGoalItem,
  IAreaGoalsConfiguration
} from '../models/goalModels';

export interface IAreaGoalsRepositoryOptions {
  fetchClient: FetchLike;
  spHttpClient: SPHttpClient;
  spHttpClientConfiguration: ISPHttpClientConfiguration;
  webAbsoluteUrl: string;
}

interface ISPListItem {
  Id: number;
  Title?: string;
  Description?: string;
  Progress?: number;
  Status?: string;
  Owner?: string;
  DueDate?: string;
  DetailUrl?: string;
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

function normalizeStatus(status: string | undefined): IGoalItem['status'] {
  if (!status) {
    return 'unknown';
  }
  const lower = status.toLowerCase();
  if (lower.includes('completed') || lower.includes('complete') || lower.includes('completado')) {
    return 'completed';
  }
  if (lower.includes('risk') || lower.includes('riesgo') || lower.includes('at-risk')) {
    return 'atRisk';
  }
  return 'onTrack';
}

function normalizeProgress(progress: number | undefined): number {
  if (typeof progress !== 'number' || isNaN(progress)) {
    return 0;
  }
  return Math.min(100, Math.max(0, progress));
}

export class AreaGoalsRepository {
  private _fetchClient: FetchLike;
  private _spHttpClient: SPHttpClient;
  private _spHttpClientConfiguration: ISPHttpClientConfiguration;
  private _webAbsoluteUrl: string;

  constructor(options: IAreaGoalsRepositoryOptions) {
    this._fetchClient = options.fetchClient;
    this._spHttpClient = options.spHttpClient;
    this._spHttpClientConfiguration = options.spHttpClientConfiguration;
    this._webAbsoluteUrl = options.webAbsoluteUrl;
  }

  async getGoals(config: IAreaGoalsConfiguration): Promise<IGoalItem[]> {
    const { dataSourceType, listTitleOrUrl, maxItems } = config;

    if (dataSourceType === 'StaticConfig') {
      return this.getStaticGoals();
    }

    if (dataSourceType === 'JsonUrl') {
      return this.getGoalsFromJsonUrl(listTitleOrUrl, maxItems);
    }

    return this.getGoalsFromSharePointList(listTitleOrUrl, maxItems);
  }

  private async getGoalsFromSharePointList(listTitleOrUrl: string, maxItems: number): Promise<IGoalItem[]> {
    const normalizedUrl = normalizeListUrl(listTitleOrUrl, this._webAbsoluteUrl);
    const isUrl = normalizedUrl.startsWith('/');

    let listUrl: string;

    if (isUrl) {
      listUrl = `${this._webAbsoluteUrl}/_api/web/GetList(@listUrl)?@listUrl='${encodeURIComponent(normalizedUrl)}'`;
    } else {
      listUrl = `${this._webAbsoluteUrl}/_api/web/lists/getByTitle('${encodeURIComponent(normalizedUrl)}')`;
    }

    const selectFields = 'Id,Title,Description,Progress,Status,Owner,DueDate,DetailUrl';
    const itemsUrl = `${listUrl}/items?$top=${maxItems}&$select=${selectFields}`;

    try {
      const response = await this._spHttpClient.get(
        itemsUrl,
        SPHttpClient.configurations.v1
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch goals: ${response.status}`);
      }

      const data = await response.json();
      const items: ISPListItem[] = data.value || [];

      return items.map((item) => this.mapSharePointItemToGoal(item));
    } catch (error) {
      console.error('Error fetching goals from SharePoint:', error);
      throw error;
    }
  }

  private mapSharePointItemToGoal(item: ISPListItem): IGoalItem {
    return {
      id: String(item.Id),
      title: item.Title || 'Sin título',
      description: item.Description || undefined,
      progress: normalizeProgress(item.Progress),
      status: normalizeStatus(item.Status),
      owner: item.Owner || undefined,
      dueDate: item.DueDate || undefined,
      detailUrl: item.DetailUrl || undefined
    };
  }

  private async getGoalsFromJsonUrl(jsonUrl: string, maxItems: number): Promise<IGoalItem[]> {
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
      throw new Error(`Failed to fetch goals from JSON URL: ${response.status}`);
    }

    const data = await response.json();
    const items = data.items || data.goals || [];

    return items
      .slice(0, maxItems)
      .map((item: { id?: string; title: string; description?: string; progress?: number; status?: string; owner?: string; dueDate?: string; detailUrl?: string }, index: number) => ({
        id: item.id || `goal-${index}`,
        title: item.title || 'Sin título',
        description: item.description || undefined,
        progress: normalizeProgress(item.progress),
        status: normalizeStatus(item.status),
        owner: item.owner || undefined,
        dueDate: item.dueDate || undefined,
        detailUrl: item.detailUrl || undefined
      }));
  }

  private getStaticGoals(): IGoalItem[] {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return [
      {
        id: 'goal-1',
        title: 'Incrementar satisfacción del cliente',
        description: 'Lograr un NPS superior a 50 puntos',
        progress: 75,
        status: 'onTrack',
        owner: 'Dirección de Operaciones',
        dueDate: nextMonth.toISOString(),
        detailUrl: '/sites/okrs/goals/1'
      },
      {
        id: 'goal-2',
        title: 'Reducir tiempo de respuesta',
        description: 'Reducir el tiempo medio de respuesta a tickets en un 20%',
        progress: 45,
        status: 'atRisk',
        owner: 'Equipo de Soporte',
        dueDate: nextMonth.toISOString(),
        detailUrl: '/sites/okrs/goals/2'
      },
      {
        id: 'goal-3',
        title: 'Lanzar nueva versión del producto',
        description: 'Completar el desarrollo y lanzamiento de la versión 2.0',
        progress: 100,
        status: 'completed',
        owner: 'Equipo de Producto',
        dueDate: now.toISOString(),
        detailUrl: '/sites/okrs/goals/3'
      }
    ];
  }
}