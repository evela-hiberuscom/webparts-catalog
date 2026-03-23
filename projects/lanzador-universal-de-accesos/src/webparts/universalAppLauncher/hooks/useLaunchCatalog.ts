import * as React from 'react';
import type { ILaunchItem } from '../models/launchModels';
import { filterLaunchItems, getLaunchCatalogState } from '../services/launchCatalogService';
import { useLaunchCatalogContext } from '../contexts/LaunchCatalogContext';

export interface IUseLaunchCatalogResult {
  query: string;
  selectedCategory: string;
  categories: string[];
  setQuery: (value: string) => void;
  setSelectedCategory: (value: string) => void;
  resetFilters: () => void;
  sortedItems: ILaunchItem[];
  visibleItems: ILaunchItem[];
  audienceTokens: string[];
  sourceLabel: string;
  hasPartialData: boolean;
  status: 'loading' | 'error' | 'partialData' | 'empty' | 'ready';
}

export function useLaunchCatalog(input: {
  title: string;
  subtitle: string;
  launchItemsJson: string;
  defaultCategory: string;
  currentAudienceTokens: string[];
  audienceMode: 'department' | 'country' | 'group' | 'role' | 'hybrid';
  maxItems: number;
  openInNewTab: boolean;
}): IUseLaunchCatalogResult {
  const { service } = useLaunchCatalogContext();
  const [query, setQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState(input.defaultCategory || 'All');
  const [sortedItems, setSortedItems] = React.useState<ILaunchItem[]>([]);
  const [categories, setCategories] = React.useState<string[]>(['All']);
  const [sourceLabel, setSourceLabel] = React.useState('Loading');
  const [hasPartialData, setHasPartialData] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect((): (() => void) => {
    let disposed = false;

    try {
      const next = service.resolveCatalog({
        title: input.title,
        subtitle: input.subtitle,
        launchItemsJson: input.launchItemsJson,
        defaultCategory: input.defaultCategory,
        currentAudienceTokens: input.currentAudienceTokens,
        audienceMode: input.audienceMode,
        maxItems: input.maxItems,
        openInNewTab: input.openInNewTab
      });

      if (!disposed) {
        setSortedItems(next.items);
        setCategories(next.categories);
        setSourceLabel(next.sourceLabel);
        setHasPartialData(next.hasPartialData);
        setLoadError(null);
        setSelectedCategory((current) => current || input.defaultCategory || 'All');
      }
    } catch (error) {
      if (!disposed) {
        setLoadError((error as Error).message);
        setHasPartialData(true);
      }
    }

    return () => {
      disposed = true;
    };
  }, [
    input.audienceMode,
    input.currentAudienceTokens.join('|'),
    input.defaultCategory,
    input.launchItemsJson,
    input.maxItems,
    input.openInNewTab,
    input.subtitle,
    input.title,
    service
  ]);

  const filteredItems = filterLaunchItems(sortedItems, query, selectedCategory, input.currentAudienceTokens);
  const visibleItems = input.maxItems > 0 ? filteredItems.slice(0, input.maxItems) : filteredItems;
  const status = getLaunchCatalogState({
    isLoading: sortedItems.length === 0 && !loadError,
    hasError: Boolean(loadError),
    hasPartialData,
    hasData: visibleItems.length > 0
  });

  return {
    query,
    selectedCategory,
    categories,
    setQuery,
    setSelectedCategory,
    resetFilters: () => {
      setQuery('');
      setSelectedCategory(input.defaultCategory || 'All');
    },
    sortedItems,
    visibleItems,
    audienceTokens: input.currentAudienceTokens,
    sourceLabel,
    hasPartialData,
    status
  };
}

