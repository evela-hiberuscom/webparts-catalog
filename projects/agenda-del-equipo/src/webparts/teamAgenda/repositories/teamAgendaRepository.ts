import type {
  FetchLike,
  IAgendaRawItem,
  IAgendaRepositoryResult,
  ITeamAgendaConfiguration
} from '../models/teamAgendaModels';

export interface ITeamAgendaRepository {
  load(configuration: ITeamAgendaConfiguration): Promise<IAgendaRepositoryResult>;
}

interface ISPListResponse {
  value?: ISPListItem[];
}

interface ISPListItem {
  Id?: number;
  Title?: string;
  EventDate?: string;
  StartDate?: string;
  EndDate?: string;
  Category?: string;
  EventType?: string;
  AgendaType?: string;
  Location?: string;
  TeamsMeetingLink?: string;
  JoinUrl?: string;
  EncodedAbsUrl?: string;
  FileRef?: string;
}

function normalizeListPath(listTitleOrUrl: string, webUrl: string): string {
  const trimmed = listTitleOrUrl.trim();
  if (!trimmed.startsWith('http')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const currentWeb = new URL(webUrl);
    if (parsed.origin !== currentWeb.origin) {
      return trimmed;
    }

    return parsed.pathname.includes('/Forms/')
      ? parsed.pathname.split('/Forms/')[0]
      : parsed.pathname;
  } catch {
    return trimmed;
  }
}

function mapListItem(item: ISPListItem, webUrl: string): IAgendaRawItem {
  return {
    id: String(item.Id ?? `agenda-list-item-${item.Title ?? 'untitled'}`),
    title: item.Title ?? null,
    startsAt: item.EventDate ?? item.StartDate ?? null,
    endsAt: item.EndDate ?? null,
    eventType: item.Category ?? item.EventType ?? item.AgendaType ?? null,
    location: item.Location ?? null,
    joinUrl: item.TeamsMeetingLink ?? item.JoinUrl ?? null,
    openUrl: item.EncodedAbsUrl ?? (item.FileRef ? `${webUrl}${item.FileRef}` : null)
  };
}

function createStaticAgendaItems(webUrl: string): IAgendaRawItem[] {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 4);

  return [
    {
      id: 'agenda-static-1',
      title: 'Daily del equipo',
      startsAt: new Date(today.setHours(9, 30, 0, 0)).toISOString(),
      endsAt: new Date(today.setHours(10, 0, 0, 0)).toISOString(),
      eventType: 'Ritual',
      location: 'Teams',
      joinUrl: `${webUrl}/_layouts/15/teamslogon.aspx`,
      openUrl: `${webUrl}/SitePages/agenda-del-equipo.aspx`
    },
    {
      id: 'agenda-static-2',
      title: 'Demo de sprint',
      startsAt: new Date(tomorrow.setHours(12, 0, 0, 0)).toISOString(),
      endsAt: new Date(tomorrow.setHours(13, 0, 0, 0)).toISOString(),
      eventType: 'Demo',
      location: 'Sala Atlántico',
      joinUrl: null,
      openUrl: `${webUrl}/SitePages/demo-de-sprint.aspx`
    },
    {
      id: 'agenda-static-3',
      title: 'Revisión de hitos',
      startsAt: new Date(nextWeek.setHours(16, 0, 0, 0)).toISOString(),
      endsAt: null,
      eventType: 'Hito',
      location: null,
      joinUrl: `${webUrl}/_layouts/15/teamslogon.aspx`,
      openUrl: null
    }
  ];
}

export class TeamAgendaRepository implements ITeamAgendaRepository {
  public constructor(private readonly fetchClient: FetchLike) {}

  public async load(configuration: ITeamAgendaConfiguration): Promise<IAgendaRepositoryResult> {
    switch (configuration.dataSourceType) {
      case 'Calendar':
      case 'SharePointList':
        return this.loadFromSharePoint(configuration);
      case 'JsonUrl':
        return this.loadFromJson(configuration);
      case 'StaticConfig':
      default:
        return {
          items: createStaticAgendaItems(configuration.webUrl),
          isFallback: true,
          warnings: ['static-config']
        };
    }
  }

  private async loadFromSharePoint(configuration: ITeamAgendaConfiguration): Promise<IAgendaRepositoryResult> {
    if (!configuration.listTitleOrUrl.trim()) {
      return {
        items: createStaticAgendaItems(configuration.webUrl),
        isFallback: true,
        warnings: ['missing-list-title']
      };
    }

    const normalized = normalizeListPath(configuration.listTitleOrUrl, configuration.webUrl);
    const listEndpoint = normalized.startsWith('/')
      ? `${configuration.webUrl}/_api/web/GetList(@listUrl)?@listUrl='${encodeURIComponent(normalized)}'`
      : `${configuration.webUrl}/_api/web/lists/getByTitle('${normalized.replace(/'/g, "''")}')`;
    const url = `${listEndpoint}/items?$select=Id,Title,EventDate,StartDate,EndDate,Category,EventType,AgendaType,Location,TeamsMeetingLink,JoinUrl,EncodedAbsUrl,FileRef&$orderby=EventDate asc&$top=50`;
    const response = await this.fetchClient(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json;odata=nometadata'
      }
    });

    if (!response.ok) {
      throw new Error(`SharePoint agenda request failed with status ${response.status}`);
    }

    const data = (await response.json()) as ISPListResponse;
    return {
      items: (data.value ?? []).map((item) => mapListItem(item, configuration.webUrl)),
      isFallback: false,
      warnings: []
    };
  }

  private async loadFromJson(configuration: ITeamAgendaConfiguration): Promise<IAgendaRepositoryResult> {
    if (!configuration.listTitleOrUrl.trim()) {
      throw new Error('JSON URL required');
    }

    const response = await this.fetchClient(configuration.listTitleOrUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Agenda JSON request failed with status ${response.status}`);
    }

    const data = (await response.json()) as { items?: IAgendaRawItem[] } | IAgendaRawItem[];
    const items = Array.isArray(data) ? data : data.items ?? [];

    return {
      items,
      isFallback: false,
      warnings: []
    };
  }
}
