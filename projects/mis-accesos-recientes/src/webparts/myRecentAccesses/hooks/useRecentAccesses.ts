import { useEffect, useState } from 'react';
import type { IRecentAccessesConfig, IRecentAccessesViewState } from '../models/recentAccesses.types';
import { recentAccessesCopy, recentAccessesDefaults } from '../models/recentAccesses.constants';
import { loadRecentAccesses } from '../services/recentAccessesService';

const initialState: IRecentAccessesViewState = {
  items: [],
  availableTypes: [],
  hasPartialData: false,
  sourceLabel: recentAccessesCopy.fallbackSource,
  warnings: [],
  totalCount: 0,
  isLoading: true,
  errorMessage: undefined
};

export function useRecentAccesses(config: IRecentAccessesConfig): IRecentAccessesViewState & { reload: () => void } {
  const [state, setState] = useState<IRecentAccessesViewState>(initialState);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const run = async (): Promise<void> => {
      setState((current) => ({
        ...current,
        isLoading: true,
        errorMessage: undefined
      }));

      try {
        const result = await loadRecentAccesses({
          ...config,
          maxItems: config.maxItems > 0 ? config.maxItems : recentAccessesDefaults.maxItems
        });

        if (!cancelled) {
          setState({
            ...result,
            isLoading: false,
            errorMessage: undefined
          });
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : recentAccessesCopy.error;
          setState({
            items: [],
            availableTypes: [],
            hasPartialData: false,
            sourceLabel: recentAccessesCopy.fallbackSource,
            warnings: [],
            totalCount: 0,
            isLoading: false,
            errorMessage: message
          });
        }
      }
    };

    run().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [config.dataSourceMode, config.maxItems, config.recentItemsJsonUrl, config.resourceTypeFilter, refreshIndex]);

  return {
    ...state,
    reload: () => setRefreshIndex((value) => value + 1),
    isLoading: state.isLoading
  };
}
