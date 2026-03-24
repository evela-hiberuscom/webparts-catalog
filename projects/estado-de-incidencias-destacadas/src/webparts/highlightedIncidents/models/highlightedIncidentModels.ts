export type HighlightedIncidentsDataSourceType = 'SharePointList' | 'JsonUrl';

export type HighlightedIncidentsStatus = 'loading' | 'ready' | 'empty' | 'partialData' | 'error';

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low' | 'unknown';

export type IncidentStatus = 'active' | 'monitoring' | 'resolved' | 'unknown';

export interface IHighlightedIncidentsWebPartProps {
  title: string;
  subtitle: string;
  dataSourceType: HighlightedIncidentsDataSourceType;
  listTitleOrUrl: string;
  showResolved: boolean;
  maxItems: number;
}

export const defaultHighlightedIncidentsWebPartProps: IHighlightedIncidentsWebPartProps = {
  title: 'Estado de incidencias destacadas',
  subtitle: 'Seguimiento compacto de incidencias activas, monitorizadas y sus mitigaciones.',
  dataSourceType: 'SharePointList',
  listTitleOrUrl: 'IncidentsList',
  showResolved: false,
  maxItems: 5
};

export interface IHighlightedIncidentsContext {
  webUrl: string;
}

export interface IIncidentSourceRecord {
  [key: string]: unknown;
}

export interface IHighlightedIncident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  impact?: string;
  status: IncidentStatus;
  workaround?: string;
  eta?: string;
  detailUrl?: string;
  sourceName: string;
  isPartial: boolean;
}

export interface IHighlightedIncidentsRequest extends IHighlightedIncidentsWebPartProps, IHighlightedIncidentsContext {}

export interface IHighlightedIncidentsResult {
  items: IHighlightedIncident[];
  hasPartialData: boolean;
  status: HighlightedIncidentsStatus;
  sourceCount: number;
  activeCount: number;
  monitoringCount: number;
  resolvedCount: number;
  hiddenResolvedCount: number;
}

export interface IHighlightedIncidentsRepository {
  loadIncidents(request: IHighlightedIncidentsRequest): Promise<IIncidentSourceRecord[]>;
}

export interface IHighlightedIncidentsService {
  loadOverview(request: IHighlightedIncidentsRequest): Promise<IHighlightedIncidentsResult>;
}

export interface IHighlightedIncidentsViewState {
  status: HighlightedIncidentsStatus;
  result?: IHighlightedIncidentsResult;
  error?: string;
}
