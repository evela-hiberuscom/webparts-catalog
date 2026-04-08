import * as React from 'react';
import type {
  ITemplatesLibraryConfiguration,
  ITemplatesLibraryService,
  ITemplatesLibraryState
} from '../models/templatesLibraryModels';
import { filterTemplates } from '../utils/templatesLibraryUtils';

export interface IUseTemplatesLibraryResult {
  state: ITemplatesLibraryState;
  visibleItems: ITemplatesLibraryState['items'];
  selectedCategory: string;
  selectedType: string;
  query: string;
  setSelectedCategory: (value: string) => void;
  setSelectedType: (value: string) => void;
  setQuery: (value: string) => void;
  reload: () => void;
}

export function useTemplatesLibrary(
  service: ITemplatesLibraryService,
  configuration: ITemplatesLibraryConfiguration
): IUseTemplatesLibraryResult {
  const [state, setState] = React.useState<ITemplatesLibraryState>({
    status: 'loading',
    items: [],
    categories: [],
    types: [],
    hasPartialData: false
  });
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [selectedType, setSelectedType] = React.useState('all');
  const [query, setQuery] = React.useState('');
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    let isMounted = true;

    setState({
      status: 'loading',
      items: [],
      categories: [],
      types: [],
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
            types: [],
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
    configuration.listTitleOrUrl,
    configuration.maxItems,
    configuration.sourceKind,
    configuration.title,
    reloadKey,
    service
  ]);

  return {
    state,
    visibleItems: filterTemplates(state.items, query, selectedCategory, selectedType),
    selectedCategory,
    selectedType,
    query,
    setSelectedCategory,
    setSelectedType,
    setQuery,
    reload: () => {
      setReloadKey((current) => current + 1);
    }
  };
}
