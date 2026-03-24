export type QuickActionsSourceType = 'SharePointList' | 'JsonUrl' | 'StaticConfig';

export type QuickActionsViewState = 'loading' | 'ready' | 'partialData' | 'empty' | 'error';

export interface IQuickActionInput {
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  icon?: string;
  priority?: number | string;
  openUrl?: string;
}

export interface IQuickAction {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  priority?: number;
  openUrl?: string;
}

export interface IQuickActionsWebPartProps {
  title: string;
  subtitle: string;
  dataSourceType: QuickActionsSourceType;
  listTitleOrUrl: string;
  jsonUrl: string;
  staticActionsJson: string;
  defaultCategory: string;
  maxItems: number;
}

export interface IQuickActionsRequest extends IQuickActionsWebPartProps {
  webUrl: string;
  userDisplayName: string;
}

export interface IQuickActionsRepositoryResult {
  items: IQuickAction[];
  sourceLabel: string;
  hasPartialData: boolean;
  notes: string[];
}

export interface IQuickActionsViewModel {
  status: QuickActionsViewState;
  items: IQuickAction[];
  visibleItems: IQuickAction[];
  categories: string[];
  selectedCategory: string;
  sourceLabel: string;
  hasPartialData: boolean;
  errorMessage?: string;
}
