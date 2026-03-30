import * as React from 'react';
import type {
  IStartARequestProps,
  IStartARequestSnapshot,
  IStartARequestViewModel,
  RequestCatalogStatus
} from '../models/startARequestModels';
import { filterRequestsByCategory } from '../utils/startARequestUtils';
import { useStartARequestService } from '../contexts/StartARequestContext';

function createInitialSnapshot(defaultCategory: string): IStartARequestSnapshot {
  return {
    status: 'loading',
    activeCategory: defaultCategory || 'all',
    items: [],
    filteredItems: [],
    categories: [],
    sourceLabel: '',
    notes: [],
    hasPartialData: false
  };
}

function buildRequest(props: IStartARequestProps): {
  dataSourceType: IStartARequestProps['dataSourceType'];
  listTitleOrUrl: string;
  defaultCategory: string;
  showPrerequisites: boolean;
  webUrl: string;
} {
  return {
    dataSourceType: props.dataSourceType,
    listTitleOrUrl: props.listTitleOrUrl,
    defaultCategory: props.defaultCategory,
    showPrerequisites: props.showPrerequisites,
    webUrl: props.webUrl
  };
}

function computeStatus(
  hasData: boolean,
  hasPartialData: boolean,
  hasError: boolean,
  isLoading: boolean
): RequestCatalogStatus {
  if (isLoading) {
    return 'loading';
  }

  if (hasError) {
    return 'error';
  }

  if (!hasData) {
    return 'empty';
  }

  return hasPartialData ? 'partialData' : 'ready';
}

export function useStartARequest(props: IStartARequestProps): IStartARequestViewModel {
  const service = useStartARequestService();
  const request = React.useMemo(
    () => buildRequest(props),
    [props.dataSourceType, props.defaultCategory, props.listTitleOrUrl, props.showPrerequisites, props.webUrl]
  );
  const [state, setState] = React.useState<IStartARequestSnapshot>(() =>
    createInitialSnapshot(props.defaultCategory?.trim() || 'all')
  );

  const refresh = React.useCallback(async () => {
    setState((current) => ({
      ...current,
      status: 'loading'
    }));

    try {
      const resolved = await service.resolve(request);
      setState((current) => {
        const nextCategory = current.activeCategory && current.activeCategory !== 'all'
          ? current.activeCategory
          : resolved.activeCategory;
        const filteredItems = filterRequestsByCategory(resolved.items, nextCategory);
        const hasData = filteredItems.length > 0;
        const status = computeStatus(hasData, resolved.hasPartialData, false, false);

        return {
          ...resolved,
          status,
          activeCategory: nextCategory,
          filteredItems
        };
      });
    } catch (error) {
      setState({
        status: 'error',
        activeCategory: props.defaultCategory?.trim() || 'all',
        items: [],
        filteredItems: [],
        categories: [],
        sourceLabel: '',
        notes: [],
        hasPartialData: false,
        errorMessage: error instanceof Error ? error.message : 'No se ha podido cargar el catalogo.'
      });
    }
  }, [props.defaultCategory, request, service]);

  React.useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  const setActiveCategory = React.useCallback((category: string) => {
    setState((current) => {
      const nextCategory = category.trim() || 'all';
      const filteredItems = filterRequestsByCategory(current.items, nextCategory);
      const hasData = filteredItems.length > 0;
      const status = computeStatus(hasData, current.hasPartialData, false, false);

      return {
        ...current,
        status,
        activeCategory: nextCategory,
        filteredItems
      };
    });
  }, []);

  return {
    ...state,
    setActiveCategory,
    refresh
  };
}
