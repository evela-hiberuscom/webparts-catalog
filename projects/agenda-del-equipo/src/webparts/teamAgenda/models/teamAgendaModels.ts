export type TeamAgendaDataSourceType = 'Calendar' | 'SharePointList' | 'JsonUrl' | 'StaticConfig';
export type AgendaGroup = 'today' | 'tomorrow' | 'upcoming' | 'past' | 'unknown';
export type TeamAgendaLoadState = 'loading' | 'ready' | 'empty' | 'partialData' | 'error';

export interface ITeamAgendaWebPartProps {
  title: string;
  description: string;
  dataSourceType: TeamAgendaDataSourceType;
  listTitleOrUrl: string;
  maxItems: number;
  showPast: boolean;
  defaultTypeFilter: string;
}

export interface ITeamAgendaConfiguration extends ITeamAgendaWebPartProps {
  webUrl: string;
  localeName: string;
}

export interface IAgendaRawItem {
  id: string;
  title?: string;
  startsAt?: string;
  endsAt?: string;
  eventType?: string;
  location?: string;
  joinUrl?: string;
  openUrl?: string;
}

export interface IAgendaItem extends Omit<IAgendaRawItem, 'title'> {
  title: string;
  group: AgendaGroup;
  isPartial: boolean;
}

export interface IAgendaRepositoryResult {
  items: IAgendaRawItem[];
  warnings: string[];
  isFallback: boolean;
}

export interface ITeamAgendaLoadResult {
  state: TeamAgendaLoadState;
  title: string;
  description: string;
  items: IAgendaItem[];
  availableTypes: string[];
  hasPartialData: boolean;
  warningMessages: string[];
  errorMessage?: string;
}

export interface ITeamAgendaViewModel extends ITeamAgendaLoadResult {
  selectedType: string;
  visibleItems: IAgendaItem[];
  setSelectedType: (nextType: string) => void;
}

export interface ITeamAgendaService {
  load(configuration: ITeamAgendaConfiguration): Promise<ITeamAgendaLoadResult>;
}

export type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;
