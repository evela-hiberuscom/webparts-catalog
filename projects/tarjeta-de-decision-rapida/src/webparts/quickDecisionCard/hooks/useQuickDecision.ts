import { useState, useEffect, useCallback } from 'react';
import type { IQuickDecision, IQuickDecisionConfiguration, AsyncState } from '../models/quickDecisionModels';
import { QuickDecisionService } from '../services/quickDecisionService';

export function useQuickDecision(options: { service: QuickDecisionService; configuration: IQuickDecisionConfiguration }): AsyncState<IQuickDecision[]> {
  const { service, configuration } = options;
  const [state, setState] = useState<AsyncState<IQuickDecision[]>>({ status: 'loading' });
  const loadData = useCallback(async (): Promise<void> => { setState(await service.loadDecision(configuration)); }, [service, configuration]);
  useEffect(() => { void loadData(); }, [loadData]);
  return state;
}