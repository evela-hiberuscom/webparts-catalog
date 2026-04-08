import type { INewsByAreaConfiguration, INewsByAreaService } from '../models/newsByAreaModels';

export interface INewsByAreaProps {
  configuration: INewsByAreaConfiguration;
  service: INewsByAreaService;
  environmentMessage: string;
  hasTeamsContext: boolean;
  isDarkTheme: boolean;
  localeName: string;
  userDisplayName: string;
}
