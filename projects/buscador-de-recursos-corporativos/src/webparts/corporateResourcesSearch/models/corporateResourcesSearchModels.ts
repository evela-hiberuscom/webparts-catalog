export type CorporateResourcesDataSourceType = 'SearchAPI' | 'SharePointList' | 'SharePointLibrary' | 'JsonUrl';

export type CorporateResourcesViewState = 'idle' | 'loading' | 'ready' | 'empty' | 'partialData' | 'error';

export interface ICorporateResourceItem {
  id: string;
  title: string;
  resourceType?: string;
  category?: string;
  summary?: string;
  openUrl?: string;
  isExactMatch: boolean;
  isFeatured: boolean;
  sourceType: CorporateResourcesDataSourceType;
  sourceLabel: string;
  keywords: string[];
}

export interface ICorporateResourcesFacet {
  label: string;
  value: string;
  count: number;
}

export interface ICorporateResourcesFilters {
  resourceType: string;
  category: string;
}

export interface ICorporateResourcesRequest {
  webUrl: string;
  query: string;
  dataSourceTypes: CorporateResourcesDataSourceType[];
  listTitleOrUrl: string;
  searchScopeUrl: string;
  showFeaturedWhenEmpty: boolean;
  maxItems: number;
}

export interface ICorporateResourcesRawSourceResult {
  items: ICorporateResourceItem[];
  sourceLabel: string;
  hasPartialData: boolean;
}

export interface ICorporateResourcesStateSnapshot {
  status: CorporateResourcesViewState;
  query: string;
  items: ICorporateResourceItem[];
  featuredItems: ICorporateResourceItem[];
  filteredItems: ICorporateResourceItem[];
  facets: {
    resourceTypes: ICorporateResourcesFacet[];
    categories: ICorporateResourcesFacet[];
  };
  filters: ICorporateResourcesFilters;
  sourceLabel: string;
  hasPartialData: boolean;
  errorMessage?: string;
}

export interface ICorporateResourcesSearchWebPartProps {
  title: string;
  subtitle: string;
  dataSourceTypesCsv: string;
  listTitleOrUrl: string;
  searchScopeUrl: string;
  showFeaturedWhenEmpty: boolean;
  maxItems: number;
}

