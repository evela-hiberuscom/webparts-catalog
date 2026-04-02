import * as React from 'react';
import type { IHowDoIDoThisRequest, IHowDoIDoThisViewModel } from '../models/howDoIDoThisModels';
import { GuidesCatalogService } from '../services/guidesCatalogService';
import { ALL_CATEGORIES_LABEL } from '../utils/howDoIDoThisUtils';

export interface IUseHowDoIDoThisResult extends IHowDoIDoThisViewModel {
  setSelectedCategory: (category: string) => void;
}

export function useHowDoIDoThis(service: GuidesCatalogService, request: IHowDoIDoThisRequest): IUseHowDoIDoThisResult {
  const [state, setState] = React.useState<IHowDoIDoThisViewModel>({
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

    service.load(request)
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
    request.description,
    request.listTitleOrUrl,
    request.maxItems,
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
