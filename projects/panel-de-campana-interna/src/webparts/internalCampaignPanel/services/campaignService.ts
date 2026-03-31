import { ICampaignItem, IInternalCampaignConfiguration, AsyncState } from '../models/campaignModels';
import { CampaignRepository } from '../repositories/campaignRepository';

export class CampaignService {
  private _repository: CampaignRepository;

  constructor(repository: CampaignRepository) {
    this._repository = repository;
  }

  async loadCampaigns(config: IInternalCampaignConfiguration): Promise<AsyncState<ICampaignItem[]>> {
    try {
      const campaigns = await this._repository.getCampaigns(config);

      if (!campaigns || campaigns.length === 0) {
        return { status: 'empty' };
      }

      const hasPartialData = campaigns.some(
        (campaign) => !campaign.ctaUrl || !campaign.imageUrl
      );

      if (hasPartialData) {
        return { status: 'partialData', data: campaigns, hasPartialData: true };
      }

      return { status: 'ready', data: campaigns };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido al cargar campañas';
      return { status: 'error', message };
    }
  }
}