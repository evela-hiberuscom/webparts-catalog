import * as React from 'react';
import type {
  ICorporateGlossaryConfiguration,
  ICorporateGlossaryService,
  ICorporateGlossaryState
} from '../models/corporateGlossaryModels';
import { filterGlossaryItems, scoreGlossaryItem } from '../utils/corporateGlossaryUtils';

const ALL_LETTERS_LABEL = 'ALL';

export interface IUseCorporateGlossaryResult {
  state: ICorporateGlossaryState;
  query: string;
  selectedCategory: string;
  selectedLetter: string;
  visibleItems: ICorporateGlossaryState['items'];
  setQuery: (value: string) => void;
  setSelectedCategory: (value: string) => void;
  setSelectedLetter: (value: string) => void;
  reload: () => void;
}

export function useCorporateGlossary(
  service: ICorporateGlossaryService,
  configuration: ICorporateGlossaryConfiguration
): IUseCorporateGlossaryResult {
  const [state, setState] = React.useState<ICorporateGlossaryState>({
    status: 'loading',
    items: [],
    categories: [],
    letters: [],
    hasPartialData: false
  });
  const [query, setQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [selectedLetter, setSelectedLetter] = React.useState(ALL_LETTERS_LABEL);
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    let isMounted = true;

    setState({
      status: 'loading',
      items: [],
      categories: [],
      letters: [],
      hasPartialData: false
    });

    service.load(configuration)
      .then((nextState) => {
        if (isMounted) {
          setState(nextState);
          setSelectedCategory((current) => nextState.categories.indexOf(current) >= 0 ? current : '');
          setSelectedLetter((current) => nextState.letters.indexOf(current) >= 0 || current === ALL_LETTERS_LABEL ? current : ALL_LETTERS_LABEL);
        }
      })
      .catch((error: Error) => {
        if (isMounted) {
          setState({
            status: 'error',
            items: [],
            categories: [],
            letters: [],
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
    configuration.enableAlphabetNav,
    configuration.listTitle,
    configuration.maxItems,
    configuration.title,
    reloadKey,
    service
  ]);

  const visibleItems = filterGlossaryItems(
    state.items,
    query,
    selectedCategory,
    selectedLetter,
    configuration.defaultCategory
  ).sort((left, right) => scoreGlossaryItem(left, query) - scoreGlossaryItem(right, query));

  return {
    state,
    query,
    selectedCategory,
    selectedLetter,
    visibleItems,
    setQuery,
    setSelectedCategory,
    setSelectedLetter,
    reload: () => {
      setReloadKey((current) => current + 1);
    }
  };
}
