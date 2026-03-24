import type { ICountdownWebPartConfig } from '../models/eventCountdownModels';

export interface IEventCountdownProps {
  config: ICountdownWebPartConfig;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}
