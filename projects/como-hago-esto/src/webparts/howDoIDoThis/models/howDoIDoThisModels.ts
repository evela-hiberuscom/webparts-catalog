export type HowDoIDoThisDataSourceType = 'SharePointList' | 'JsonUrl' | 'StaticConfig';
export type HowDoIDoThisViewState = 'loading' | 'ready' | 'partialData' | 'empty' | 'error';

export interface IGuideItemInput {
  id?: unknown;
  title?: unknown;
  summary?: unknown;
  description?: unknown;
  category?: unknown;
  steps?: unknown;
  relatedUrl?: unknown;
  relatedLink?: unknown;
  featured?: unknown;
}

export interface IGuideItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  steps: string[];
  relatedUrl?: string;
  featured: boolean;
  isPartial: boolean;
}

export interface IHowDoIDoThisWebPartProps {
  title: string;
  description: string;
  dataSourceType: HowDoIDoThisDataSourceType;
  listTitleOrUrl: string;
  defaultCategory: string;
  maxItems: number;
}

export interface IHowDoIDoThisRequest extends IHowDoIDoThisWebPartProps {
  webUrl: string;
  userDisplayName: string;
}

export interface IGuidesRepositoryResult {
  items: IGuideItem[];
  sourceLabel: string;
  hasPartialData: boolean;
  notes: string[];
}

export interface IHowDoIDoThisViewModel {
  status: HowDoIDoThisViewState;
  items: IGuideItem[];
  visibleItems: IGuideItem[];
  categories: string[];
  selectedCategory: string;
  sourceLabel: string;
  hasPartialData: boolean;
  errorMessage?: string;
}
