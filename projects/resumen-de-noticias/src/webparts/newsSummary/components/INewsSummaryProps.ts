import type {
  INewsSummaryConfiguration,
  INewsSummaryService
} from '../models/newsSummaryModels';

export interface INewsSummaryProps {
  configuration: INewsSummaryConfiguration;
  service: INewsSummaryService;
  environmentMessage: string;
  hasTeamsContext: boolean;
  isDarkTheme: boolean;
  localeName: string;
  userDisplayName: string;
}
