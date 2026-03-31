import type { IInternalCampaignConfiguration } from '../models/campaignModels';
import type { CampaignService } from '../services/campaignService';

export interface IInternalCampaignPanelProps {
  configuration: IInternalCampaignConfiguration;
  service: CampaignService;
  autoRefreshSeconds?: number;
  title?: string;
}