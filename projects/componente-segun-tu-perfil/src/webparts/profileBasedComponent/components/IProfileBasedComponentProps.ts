import type {
  IProfileBasedComponentWebPartConfiguration,
  IProfileContextSnapshot
} from '../models/profileBasedComponentModels';

export interface IProfileBasedComponentProps extends IProfileBasedComponentWebPartConfiguration, IProfileContextSnapshot {
  isDarkTheme: boolean;
  hasTeamsContext: boolean;
}
