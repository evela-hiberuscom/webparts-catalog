import { useState, useEffect, useCallback } from 'react';
import type { IRouteStep, IGuidedRouteConfiguration, AsyncState } from '../models/guidedRouteModels';
import { GuidedRouteService } from '../services/guidedRouteService';

export function useGuidedRoute(options: { service: GuidedRouteService; configuration: IGuidedRouteConfiguration }): AsyncState<IRouteStep[]> {
  const { service, configuration } = options;
  const [state, setState] = useState<AsyncState<IRouteStep[]>>({ status: 'loading' });
  const loadData = useCallback(async (): Promise<void> => { setState(await service.loadRoute(configuration)); }, [service, configuration]);
  useEffect(() => { loadData().catch(() => undefined); }, [loadData]);
  return state;
}