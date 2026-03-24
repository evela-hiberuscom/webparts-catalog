import * as React from 'react';
import type { IQuickActionsRequest, IQuickActionsViewModel } from '../models/quickActionsModels';
import { ALL_CATEGORIES_LABEL } from '../utils/quickActionsUtils';
import { QuickActionsService } from '../services/quickActionsService';

export interface IUseQuickActionsResult extends IQuickActionsViewModel {
  setSelectedCategory: (category: string) => void;
}

export function useQuickActions(service: QuickActionsService, request: IQuickActionsRequest): IUseQuickActionsResult {
  const [state, setState] = React.useState<IQuickActionsViewModel>({
    status: 'loading',
    items: [],
    visibleItems: [],
    categories: [],
    selectedCategory: ALL_CATEGORIES_LABEL,
    sourceLabel: request.title,
    hasPartialData: false
  });

  const [selectedCategory, setSelectedCategory] = React.useState<string>(ALL_CATEGORIES_LABEL);

  React.useEffect(() => {
    let isMounted = true;
    setState((current) => ({
      ...current,
      status: 'loading',
      sourceLabel: request.title
    }));
    setSelectedCategory(request.defaultCategory?.trim() || ALL_CATEGORIES_LABEL);

    service
      .load(request)
      .then((viewModel) => {
        if (!isMounted) {
          return;
        }

        setState(viewModel);
        setSelectedCategory(viewModel.selectedCategory);
      })
      .catch((error: Error) => {
        if (!isMounted) {
          return;
        }

        setState({
          status: 'error',
          items: [],
          visibleItems: [],
          categories: [],
          selectedCategory: ALL_CATEGORIES_LABEL,
          sourceLabel: request.title,
          hasPartialData: false,
          errorMessage: error.message
        });
      });

    return () => {
      isMounted = false;
    };
  }, [
    request.dataSourceType,
    request.defaultCategory,
    request.jsonUrl,
    request.listTitleOrUrl,
    request.maxItems,
    request.staticActionsJson,
    request.subtitle,
    request.title,
    request.userDisplayName,
    request.webUrl,
    service
  ]);

  const visibleItems =
    selectedCategory === ALL_CATEGORIES_LABEL
      ? state.items
      : state.items.filter((item) => item.category.toLowerCase() === selectedCategory.toLowerCase());

  return {
    ...state,
    visibleItems,
    selectedCategory,
    setSelectedCategory
  };
}
