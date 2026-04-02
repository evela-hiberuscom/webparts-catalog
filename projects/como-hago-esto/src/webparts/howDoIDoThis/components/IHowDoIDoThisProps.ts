import type { IHowDoIDoThisRequest } from '../models/howDoIDoThisModels';
import { GuidesCatalogService } from '../services/guidesCatalogService';

export interface IHowDoIDoThisProps {
  title: string;
  description: string;
  request: IHowDoIDoThisRequest;
  service: GuidesCatalogService;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}
