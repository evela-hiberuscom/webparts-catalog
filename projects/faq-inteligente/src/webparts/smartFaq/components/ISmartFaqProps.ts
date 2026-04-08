import type {
  ISmartFaqConfiguration,
  ISmartFaqService
} from '../models/smartFaqModels';

export interface ISmartFaqProps {
  configuration: ISmartFaqConfiguration;
  service: ISmartFaqService;
  environmentMessage: string;
  hasTeamsContext: boolean;
  isDarkTheme: boolean;
  localeName: string;
  userDisplayName: string;
}
