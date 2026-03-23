import * as React from 'react';

import type {
  IAudienceQuickLinksHostContext,
  IAudienceQuickLinksLoadRequest,
  IAudienceQuickLinksViewModel,
  IAudienceQuickLinksWebPartProps
} from '../models/audienceLinkModels';
import { AudienceQuickLinksService } from '../services/audienceQuickLinksService';

interface IUseAudienceQuickLinksResult {
  viewModel: IAudienceQuickLinksViewModel | undefined;
  isRetrying: boolean;
  reload: () => void;
  setSelectedCategory: (category: string) => void;
}

interface IUseAudienceQuickLinksInput {
  webPartProps: IAudienceQuickLinksWebPartProps;
  hostContext: IAudienceQuickLinksHostContext;
}

function buildLoadingViewModel(webPartProps: IAudienceQuickLinksWebPartProps): IAudienceQuickLinksViewModel {
  return {
    title: webPartProps.title.trim() || 'Accesos rápidos por audiencia',
    description: webPartProps.description.trim(),
    sourceLabel: 'Cargando catálogo...',
    resolvedAudienceLabel: 'Resuelto desde el contexto de usuario',
    resolvedAudienceTokens: [],
    categories: ['Todas'],
    selectedCategory: 'Todas',
    allItems: [],
    visibleItems: [],
    hasPartialData: false,
    state: 'loading',
    notes: []
  };
}

function deriveVisibleState(hasPartialData: boolean, visibleItemsCount: number): IAudienceQuickLinksViewModel['state'] {
  if (visibleItemsCount === 0) {
    return 'empty';
  }

  return hasPartialData ? 'partialData' : 'ready';
}

export function useAudienceQuickLinks(input: IUseAudienceQuickLinksInput): IUseAudienceQuickLinksResult {
  const [viewModel, setViewModel] = React.useState<IAudienceQuickLinksViewModel | undefined>(undefined);
  const [selectedCategory, setSelectedCategoryState] = React.useState('Todas');
  const [reloadCounter, setReloadCounter] = React.useState(0);
  const [isRetrying, setIsRetrying] = React.useState(false);
  const selectedCategoryRef = React.useRef(selectedCategory);

  selectedCategoryRef.current = selectedCategory;

  React.useEffect(() => {
    let isMounted = true;
    const service = new AudienceQuickLinksService();

    async function loadData(): Promise<void> {
      setIsRetrying(true);
      setViewModel(buildLoadingViewModel(input.webPartProps));

      try {
        const model = await service.load({
          webPartProps: input.webPartProps,
          hostContext: input.hostContext
        } as IAudienceQuickLinksLoadRequest);

        if (!isMounted) {
          return;
        }

        const normalizedSelectedCategory =
          model.categories.indexOf(selectedCategoryRef.current) >= 0
            ? selectedCategoryRef.current
            : model.categories[0];

        const filteredItems =
          normalizedSelectedCategory === 'Todas'
            ? model.allItems
            : model.allItems.filter((item) => item.category === normalizedSelectedCategory);

        setViewModel({
          ...model,
          selectedCategory: normalizedSelectedCategory,
          visibleItems: filteredItems,
          state: deriveVisibleState(model.hasPartialData, filteredItems.length)
        });
        setSelectedCategoryState(normalizedSelectedCategory);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setViewModel({
          title: input.webPartProps.title.trim() || 'Accesos rápidos por audiencia',
          description: input.webPartProps.description.trim(),
          sourceLabel: 'Sin datos disponibles',
          resolvedAudienceLabel: 'No se pudo resolver la audiencia',
          resolvedAudienceTokens: [],
          categories: ['Todas'],
          selectedCategory: 'Todas',
          allItems: [],
          visibleItems: [],
          hasPartialData: false,
          state: 'error',
          notes: [`pendiente de validar: ${(error as Error).message}`]
        });
      } finally {
        if (isMounted) {
          setIsRetrying(false);
        }
      }
    }

    loadData().catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [
    input.hostContext.localeName,
    input.hostContext.siteUrl,
    input.hostContext.userDisplayName,
    input.hostContext.userEmail,
    input.hostContext.userLoginName,
    input.hostContext.webUrl,
    input.webPartProps.audienceMode,
    input.webPartProps.dataSourceType,
    input.webPartProps.defaultCategory,
    input.webPartProps.description,
    input.webPartProps.listTitleOrUrl,
    input.webPartProps.maxItems,
    input.webPartProps.showAudienceHint,
    input.webPartProps.title,
    reloadCounter
  ]);

  const reload = React.useCallback(() => {
    setReloadCounter((current) => current + 1);
  }, []);

  const setSelectedCategory = React.useCallback((category: string) => {
    let normalizedCategory = 'Todas';

    setViewModel((current) => {
      if (!current) {
        return current;
      }

      normalizedCategory = current.categories.indexOf(category) >= 0 ? category : 'Todas';
      const visibleItems =
        normalizedCategory === 'Todas'
          ? current.allItems
          : current.allItems.filter((item) => item.category === normalizedCategory);

      return {
        ...current,
        selectedCategory: normalizedCategory,
        visibleItems,
        state: deriveVisibleState(current.hasPartialData, visibleItems.length)
      };
    });

    setSelectedCategoryState(normalizedCategory);
  }, []);

  return {
    viewModel,
    isRetrying,
    reload,
    setSelectedCategory
  };
}
