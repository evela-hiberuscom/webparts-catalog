import type { OnboardingChecklistDataSourceType } from '../models/onboardingChecklistModels';

export interface IOnboardingChecklistProps {
  title: string;
  description: string;
  dataSourceType: OnboardingChecklistDataSourceType;
  webUrl: string;
  listTitleOrUrl: string;
  jsonUrl: string;
  staticConfigJson: string;
  defaultVariant: string;
  defaultPhase: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}
