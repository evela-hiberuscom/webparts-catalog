import * as React from 'react';
import type {
  ICorporateResourcesFilters,
  ICorporateResourcesRequest,
  ICorporateResourcesStateSnapshot
} from '../models/corporateResourcesSearchModels';
import { CorporateResourcesSearchService } from '../services/corporateResourcesSearchService';
import { normalizeText } from '../utils/corporateResourcesSearchUtils';

export interface ICorporateResourcesSearchViewModel extends ICorporateResourcesStateSnapshot {
  setQuery: (value: string) => void;
  setResourceType: (value: string) => void;
  setCategory: (value: string) => void;
  refresh: () => void;
}

interface IUseCorporateResourcesSearchOptions {
  debounceMs?: number;
  service?: CorporateResourcesSearchService;
}

function createIdleSnapshot(query: string): ICorporateResourcesStateSnapshot {
  return {
    status: 'idle',
    query,
    items: [],
    featuredItems: [],
    filteredItems: [],
    facets: {
      resourceTypes: [],
      categories: []
    },
    filters: {
      resourceType: '',
      category: ''
    },
    sourceLabel: 'SearchAPI',
    hasPartialData: false
  };
}

export function useCorporateResourcesSearch(
  request: ICorporateResourcesRequest,
  options: IUseCorporateResourcesSearchOptions = {}
): ICorporateResourcesSearchViewModel {
  const serviceRef = React.useRef<CorporateResourcesSearchService>(
    options.service ?? new CorporateResourcesSearchService()
  );
  const [query, setQuery] = React.useState(request.query);
  const [filters, setFilters] = React.useState<ICorporateResourcesFilters>({
    resourceType: '',
    category: ''
  });
  const [snapshot, setSnapshot] = React.useState<ICorporateResourcesStateSnapshot>(() =>
    createIdleSnapshot(request.query)
  );
  const [refreshToken, setRefreshToken] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    const debounceMs = options.debounceMs ?? 250;

    const timeout = window.setTimeout(() => {
      setSnapshot((current) => ({
        ...current,
        status: 'loading',
        query: normalizeText(query)
      }));

      serviceRef.current
        .resolve(
          {
            ...request,
            query,
            webUrl: request.webUrl
          },
          filters
        )
        .then((nextSnapshot) => {
          if (!cancelled) {
            setSnapshot(nextSnapshot);
          }
        })
        .catch((error: Error) => {
          if (!cancelled) {
            setSnapshot({
              ...createIdleSnapshot(query),
              status: 'error',
              errorMessage: error.message,
              query: normalizeText(query),
              filters
            });
          }
        });
    }, debounceMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [
    request,
    filters,
    query,
    refreshToken,
    options.debounceMs
  ]);

  return {
    ...snapshot,
    filters,
    query,
    setQuery,
    setResourceType: (value: string) => setFilters((current) => ({ ...current, resourceType: value })),
    setCategory: (value: string) => setFilters((current) => ({ ...current, category: value })),
    refresh: () => setRefreshToken((current) => current + 1)
  };
}

