import { useState, useEffect, useCallback } from 'react';
import type { IAzEntry, ICorporateAzConfiguration, AsyncState } from '../models/corporateAzModels';
import { CorporateAzService } from '../services/corporateAzService';

export function useCorporateAz(options: { service: CorporateAzService; configuration: ICorporateAzConfiguration }): AsyncState<IAzEntry[]> {
  const { service, configuration } = options;
  const [state, setState] = useState<AsyncState<IAzEntry[]>>({ status: 'loading' });
  const loadData = useCallback(async (): Promise<void> => { setState(await service.loadEntries(configuration)); }, [service, configuration]);
  useEffect(() => { loadData().catch(() => undefined); }, [loadData]);
  return state;
}