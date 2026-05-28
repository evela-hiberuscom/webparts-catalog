import type { CampaignRepository } from '../repositories/campaignRepository';
import type { ICampaignItem, IInternalCampaignConfiguration } from '../models/campaignModels';
import { CampaignService } from './campaignService';

const configuration: IInternalCampaignConfiguration = {
  dataSourceType: 'StaticConfig',
  listTitleOrUrl: '',
  maxItems: 3
};

describe('CampaignService', () => {
  it('returns partial data when a campaign misses image or CTA metadata', async () => {
    const campaigns: ICampaignItem[] = [
      {
        id: 'campaign-1',
        title: 'Campaña interna',
        claim: undefined,
        description: undefined,
        imageUrl: undefined,
        ctaText: 'Más información',
        ctaUrl: '/sites/intranet/campaign',
        startDate: undefined,
        endDate: undefined,
        priority: 1,
        category: 'Comunicaciones'
      }
    ];
    const repository = {
      getCampaigns: jest.fn().mockResolvedValue(campaigns)
    } as unknown as CampaignRepository;

    const state = await new CampaignService(repository).loadCampaigns(configuration);

    expect(state).toEqual({ status: 'partialData', data: campaigns, hasPartialData: true });
  });
});
