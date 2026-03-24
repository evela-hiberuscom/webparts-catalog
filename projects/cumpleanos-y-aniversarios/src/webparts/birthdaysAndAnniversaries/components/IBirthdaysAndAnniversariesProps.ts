import type { SPHttpClient } from '@microsoft/sp-http';
import type { CelebrationDataSourceType } from '../models/celebrationModels';

export interface IBirthdaysAndAnniversariesProps {
  spHttpClient: SPHttpClient;
  webAbsoluteUrl: string;
  dataSourceTypes: CelebrationDataSourceType[];
  directoryJsonUrl: string;
  listTitleOrUrl: string;
  jsonUrl: string;
  showBirthdays: boolean;
  showAnniversaries: boolean;
  daysAhead: number;
}

