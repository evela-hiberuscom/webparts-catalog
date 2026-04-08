import * as React from 'react';
import type {
  ISmartFaqConfiguration,
  ISmartFaqService,
  ISmartFaqState
} from '../models/smartFaqModels';
import { filterFaqs } from '../utils/smartFaqUtils';

export interface IUseSmartFaqResult {
  state: ISmartFaqState;
  visibleItems: ISmartFaqState['items'];
  search: string;
  selectedCategory: string;
  expandedId: string | undefined;
  setSearch: (value: string) => void;
  setSelectedCategory: (value: string) => void;
  toggleExpanded: (id: string) => void;
  reload: () => void;
}

export function useSmartFaq(service: ISmartFaqService, configuration: ISmartFaqConfiguration): IUseSmartFaqResult {
  const [state, setState] = React.useState<ISmartFaqState>({
    status: 'loading',
    items: [],
    categories: [],
    hasPartialData: false
  });
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [expandedId, setExpandedId] = React.useState<string | undefined>(undefined);
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    let isMounted = true;

    setState({
      status: 'loading',
      items: [],
      categories: [],
      hasPartialData: false
    });

    service.load(configuration)
      .then((nextState) => {
        if (isMounted) {
          setState(nextState);
        }
      })
      .catch((error: Error) => {
        if (isMounted) {
          setState({
            status: 'error',
            items: [],
            categories: [],
            hasPartialData: false,
            errorMessage: error.message
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    configuration.defaultCategory,
    configuration.description,
    configuration.enableSearch,
    configuration.listTitleOrUrl,
    configuration.maxItems,
    configuration.title,
    reloadKey,
    service
  ]);

  const visibleItems = configuration.enableSearch
    ? filterFaqs(state.items, search, selectedCategory)
    : filterFaqs(state.items, '', selectedCategory);

  return {
    state,
    visibleItems,
    search,
    selectedCategory,
    expandedId,
    setSearch,
    setSelectedCategory,
    toggleExpanded: (id: string) => {
      setExpandedId((current) => (current === id ? undefined : id));
    },
    reload: () => {
      setReloadKey((current) => current + 1);
    }
  };
}
