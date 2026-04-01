import { useState, useEffect, useCallback } from 'react';
import type { ISitePresence, ISitesPresenceConfiguration, AsyncState } from '../models/sitesPresenceModels';
import { SitesPresenceService } from '../services/sitesPresenceService';
export function useSitesPresence(options: { service: SitesPresenceService; configuration: ISitesPresenceConfiguration }): AsyncState<ISitePresence[]> {
  const { service, configuration } = options;
  const [state, setState] = useState<AsyncState<ISitePresence[]>>({ status: 'loading' });
  const loadData = useCallback(async (): Promise<void> => { setState(await service.loadSites(configuration)); }, [service, configuration]);
  useEffect(() => { loadData().catch(() => undefined); }, [loadData]);
  return state;
}