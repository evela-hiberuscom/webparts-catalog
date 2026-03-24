import type {
  OffboardingChecklistDataSourceType,
  OffboardingScenario
} from '../models/offboardingOrChangeChecklistModels';

export interface IOffboardingOrChangeChecklistProps {
  title: string;
  description: string;
  dataSourceType: OffboardingChecklistDataSourceType;
  webUrl: string;
  listTitleOrUrl: string;
  jsonUrl: string;
  staticConfigJson: string;
  defaultScenario: OffboardingScenario;
  defaultPhase: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}
