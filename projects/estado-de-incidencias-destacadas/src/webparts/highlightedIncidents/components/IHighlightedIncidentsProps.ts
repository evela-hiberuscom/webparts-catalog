import type {
  HighlightedIncidentsDataSourceType,
  IHighlightedIncidentsWebPartProps
} from '../models/highlightedIncidentModels';

export interface IHighlightedIncidentsProps extends IHighlightedIncidentsWebPartProps {
  webUrl: string;
}

export interface IHighlightedIncidentsWebPartPropsForm {
  title: string;
  subtitle: string;
  dataSourceType: HighlightedIncidentsDataSourceType;
  listTitleOrUrl: string;
  showResolved: boolean;
  maxItems: number;
}
