import type {
  IWhatChangedFeedConfiguration,
  IWhatChangedFeedService
} from '../models/whatChangedFeedModels';

export interface IWhatChangedFeedProps {
  configuration: IWhatChangedFeedConfiguration;
  service: IWhatChangedFeedService;
  environmentMessage: string;
  hasTeamsContext: boolean;
  isDarkTheme: boolean;
  localeName: string;
  userDisplayName: string;
}
