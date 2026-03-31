import { useState, useEffect, useCallback } from 'react';
import type { ICampaignItem, IInternalCampaignConfiguration, AsyncState } from '../models/campaignModels';
import { CampaignService } from '../services/campaignService';

export interface IUseCampaignsOptions {
  service: CampaignService;
  configuration: IInternalCampaignConfiguration;
  autoRefreshSeconds?: number;
}

export function useCampaigns(options: IUseCampaignsOptions): AsyncState<ICampaignItem[]> {
  const { service, configuration, autoRefreshSeconds } = options;
  const [state, setState] = useState<AsyncState<ICampaignItem[]>>({ status: 'loading' });

  const loadData = useCallback(async (): Promise<void> => {
    const newState = await service.loadCampaigns(configuration);
    setState(newState);
  }, [service, configuration]);

  useEffect(() => {
    void loadData();

    if (autoRefreshSeconds && autoRefreshSeconds > 0) {
      const intervalId = setInterval(() => {
        void loadData();
      }, autoRefreshSeconds * 1000);
      return () => clearInterval(intervalId);
    }
  }, [loadData, autoRefreshSeconds]);

  return state;
}