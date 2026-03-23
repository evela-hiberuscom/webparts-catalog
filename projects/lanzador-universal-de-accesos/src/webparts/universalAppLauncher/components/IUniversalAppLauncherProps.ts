import type { AudienceMatchMode } from '../models/launchModels';

export interface IUniversalAppLauncherProps {
  title: string;
  subtitle: string;
  audienceMode: AudienceMatchMode;
  currentAudienceTokens: string;
  defaultCategory: string;
  maxItems: number;
  openInNewTab: boolean;
  launchItemsJson: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}

