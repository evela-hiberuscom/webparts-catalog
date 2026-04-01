import { useState, useEffect, useCallback } from 'react';
import type { IFeaturedQuestion, IFeaturedQuestionConfiguration, AsyncState } from '../models/featuredQuestionModels';
import { FeaturedQuestionService } from '../services/featuredQuestionService';

export function useFeaturedQuestion(options: { service: FeaturedQuestionService; configuration: IFeaturedQuestionConfiguration }): AsyncState<IFeaturedQuestion[]> {
  const { service, configuration } = options;
  const [state, setState] = useState<AsyncState<IFeaturedQuestion[]>>({ status: 'loading' });
  const loadData = useCallback(async (): Promise<void> => { setState(await service.loadQuestion(configuration)); }, [service, configuration]);
  useEffect(() => { loadData().catch(() => undefined); }, [loadData]);
  return state;
}