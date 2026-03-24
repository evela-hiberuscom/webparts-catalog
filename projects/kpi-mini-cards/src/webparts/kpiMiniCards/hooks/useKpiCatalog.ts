import * as React from 'react';
import type { IKpiCatalogConfig, IKpiCatalogViewModel } from '../models/kpiModels';
import { useKpiCatalogService } from '../contexts/KpiCatalogContext';

function buildLoadingState(): IKpiCatalogViewModel {
  return {
    items: [],
    sourceLabel: 'Loading KPI catalog',
    hasPartialData: false,
    notes: [],
    status: 'loading',
    reload: () => {
      // Overwritten at runtime.
    }
  };
}

export function useKpiCatalog(config: IKpiCatalogConfig): IKpiCatalogViewModel {
  const { service } = useKpiCatalogService();
  const [viewModel, setViewModel] = React.useState<IKpiCatalogViewModel>(() => buildLoadingState());
  const [reloadTick, setReloadTick] = React.useState(0);

  React.useEffect(() => {
    let disposed = false;

    async function loadCatalog(): Promise<void> {
      setViewModel((current) => ({
        ...current,
        status: 'loading',
        sourceLabel: current.sourceLabel || 'Loading KPI catalog'
      }));

      try {
        const result = await service.resolveCatalog(config);
        if (!disposed) {
          setViewModel({
            ...result,
            reload: () => setReloadTick((value) => value + 1)
          });
        }
      } catch (error) {
        if (!disposed) {
          setViewModel({
            items: [],
            sourceLabel: 'KPI catalog',
            hasPartialData: false,
            notes: [(error as Error).message],
            status: 'error',
            reload: () => setReloadTick((value) => value + 1)
          });
        }
      }
    }

    loadCatalog().catch(() => undefined);

    return () => {
      disposed = true;
    };
  }, [
    config.apiEndpointUrl,
    config.jsonUrl,
    config.kpiCardsJson,
    config.layoutMode,
    config.maxItems,
    config.openInNewTab,
    config.listTitleOrUrl,
    config.showTrend,
    config.sourceType,
    config.webUrl,
    reloadTick,
    service
  ]);

  return viewModel;
}
