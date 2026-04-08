import type { SPHttpClient } from '@microsoft/sp-http';
import type {
  FetchLike,
  ITaskItem,
  ITasksConfiguration
} from '../models/taskModels';

export interface ITasksRepositoryOptions {
  fetchClient: FetchLike;
  spHttpClient: SPHttpClient;
  spHttpClientConfiguration: unknown;
  webAbsoluteUrl: string;
}

interface ISPListItem {
  Id: number;
  Title?: string;
  Source?: string;
  Status?: string;
  DueDate?: string;
  Priority?: string;
  ItemLink?: string;
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

function mapGroup(dueDate: string | undefined): ITaskItem['group'] {
  if (!dueDate) {
    return 'noDate';
  }

  const now = new Date();
  const taskDate = new Date(dueDate);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowEnd = new Date(todayStart);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 2);

  if (taskDate < now) {
    return 'overdue';
  }
  if (taskDate < tomorrowEnd) {
    return 'today';
  }
  return 'soon';
}

function normalizePriority(priority: string | undefined): ITaskItem['priority'] {
  if (!priority) {
    return 'unknown';
  }
  const lower = priority.toLowerCase();
  if (lower.includes('high') || lower.includes('alta') || lower.includes('1')) {
    return 'high';
  }
  if (lower.includes('medium') || lower.includes('media') || lower.includes('2')) {
    return 'medium';
  }
  return 'low';
}

function normalizeStatus(status: string | undefined): ITaskItem['status'] {
  if (!status) {
    return 'unknown';
  }
  const lower = status.toLowerCase();
  if (lower.includes('completed') || lower.includes('complete') || lower.includes('hecho')) {
    return 'completed';
  }
  if (lower.includes('open') || lower.includes('pending') || lower.includes('active')) {
    return 'open';
  }
  return 'unknown';
}

export class TasksRepository {
  private _fetchClient: FetchLike;
  private _spHttpClient: SPHttpClient;
  private _spHttpClientConfiguration: unknown;
  private _webAbsoluteUrl: string;

  constructor(options: ITasksRepositoryOptions) {
    this._fetchClient = options.fetchClient;
    this._spHttpClient = options.spHttpClient;
    this._spHttpClientConfiguration = options.spHttpClientConfiguration;
    this._webAbsoluteUrl = options.webAbsoluteUrl;
  }

  async getTasks(config: ITasksConfiguration): Promise<ITaskItem[]> {
    const { dataSourceType, listTitleOrUrl, maxItems, showCompleted } = config;

    if (dataSourceType === 'StaticConfig') {
      return this.getStaticTasks();
    }

    if (dataSourceType === 'JsonUrl') {
      return this.getTasksFromJsonUrl(listTitleOrUrl, maxItems);
    }

    return this.getTasksFromSharePointList(listTitleOrUrl, maxItems, showCompleted);
  }

  private async getTasksFromSharePointList(listTitleOrUrl: string, maxItems: number, showCompleted: boolean): Promise<ITaskItem[]> {
    const normalizedUrl = normalizeListUrl(listTitleOrUrl, this._webAbsoluteUrl);
    const isUrl = normalizedUrl.startsWith('/');

    let listUrl: string;

    if (isUrl) {
      listUrl = `${this._webAbsoluteUrl}/_api/web/GetList(@listUrl)?@listUrl='${encodeURIComponent(normalizedUrl)}'`;
    } else {
      listUrl = `${this._webAbsoluteUrl}/_api/web/lists/getByTitle('${encodeURIComponent(normalizedUrl)}')`;
    }

    const selectFields = 'Id,Title,Source,Status,DueDate,Priority,ItemLink';
    const itemsUrl = `${listUrl}/items?$top=${maxItems * 2}&$select=${selectFields}`;

    try {
      const response = await this._spHttpClient.get(
        itemsUrl,
        this._spHttpClientConfiguration as never
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }

      const data = await response.json();
      const items: ISPListItem[] = data.value || [];

      return items
        .map((item) => this.mapSharePointItemToTask(item))
        .filter((task) => showCompleted || task.status !== 'completed');
    } catch (error) {
      console.error('Error fetching tasks from SharePoint:', error);
      throw error;
    }
  }

  private mapSharePointItemToTask(item: ISPListItem): ITaskItem {
    return {
      id: String(item.Id),
      title: item.Title || 'Sin título',
      source: item.Source || 'SharePoint',
      status: normalizeStatus(item.Status),
      dueDate: item.DueDate || undefined,
      priority: normalizePriority(item.Priority),
      openUrl: item.ItemLink || undefined,
      group: mapGroup(item.DueDate)
    };
  }

  private async getTasksFromJsonUrl(jsonUrl: string, maxItems: number): Promise<ITaskItem[]> {
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
      throw new Error(`Failed to fetch tasks from JSON URL: ${response.status}`);
    }

    const data = await response.json();
    const items = data.items || data.tasks || [];

    return items
      .slice(0, maxItems)
      .map((item: { id?: string; title: string; source?: string; status?: string; dueDate?: string; priority?: string; openUrl?: string }, index: number) => ({
        id: item.id || `task-${index}`,
        title: item.title || 'Sin título',
        source: item.source || 'JsonUrl',
        status: normalizeStatus(item.status),
        dueDate: item.dueDate || undefined,
        priority: normalizePriority(item.priority),
        openUrl: item.openUrl || undefined,
        group: mapGroup(item.dueDate)
      }));
  }

  private getStaticTasks(): ITaskItem[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return [
      {
        id: 'task-1',
        title: 'Revisar informe mensual',
        source: 'Planner',
        status: 'open',
        dueDate: today.toISOString(),
        priority: 'high',
        openUrl: 'https://tasks.office.com/task/1',
        group: 'today'
      },
      {
        id: 'task-2',
        title: 'Preparar presentación',
        source: 'ToDo',
        status: 'open',
        dueDate: tomorrow.toISOString(),
        priority: 'medium',
        openUrl: 'https://todo.microsoft.com/task/2',
        group: 'soon'
      },
      {
        id: 'task-3',
        title: 'Actualizar documentación',
        source: 'SharePoint',
        status: 'open',
        dueDate: nextWeek.toISOString(),
        priority: 'low',
        openUrl: '/sites/docs/doc.pdf',
        group: 'soon'
      },
      {
        id: 'task-4',
        title: 'Reunión de equipo',
        source: 'Planner',
        status: 'open',
        dueDate: undefined,
        priority: 'unknown',
        openUrl: undefined,
        group: 'noDate'
      }
    ];
  }
}
