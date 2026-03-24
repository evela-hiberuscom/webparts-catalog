export type OnboardingChecklistDataSourceType = 'SharePointList' | 'JsonUrl' | 'StaticConfig';

export type OnboardingChecklistState = 'loading' | 'ready' | 'empty' | 'partialData' | 'error';

export type OnboardingChecklistFilter = string | 'all';

export interface IOnboardingChecklistWebPartProps {
  title: string;
  description: string;
  dataSourceType: OnboardingChecklistDataSourceType;
  webUrl: string;
  listTitleOrUrl: string;
  jsonUrl: string;
  staticConfigJson: string;
  defaultVariant: string;
  defaultPhase: string;
}

export interface IOnboardingChecklistRequest extends IOnboardingChecklistWebPartProps {
  userDisplayName: string;
}

export interface IOnboardingChecklistFilterOption {
  key: string;
  text: string;
}

export interface IOnboardingChecklistStep {
  id: string;
  title: string;
  description?: string;
  phase: string;
  variant: string;
  mandatory: boolean;
  order: number;
  relatedUrl?: string;
  relatedLabel?: string;
  partialData: boolean;
}

export interface IOnboardingChecklistRepositoryResult {
  items: IOnboardingChecklistStep[];
  sourceLabel: string;
  notes: string[];
  hasPartialData: boolean;
}

export interface IOnboardingChecklistStateSnapshot {
  status: OnboardingChecklistState;
  items: IOnboardingChecklistStep[];
  sourceLabel: string;
  notes: string[];
  hasPartialData: boolean;
  errorMessage?: string;
  activeVariant: OnboardingChecklistFilter;
  activePhase: OnboardingChecklistFilter;
}

export interface IOnboardingChecklistViewModel extends IOnboardingChecklistStateSnapshot {
  filteredItems: IOnboardingChecklistStep[];
  variantOptions: IOnboardingChecklistFilterOption[];
  phaseOptions: IOnboardingChecklistFilterOption[];
  mandatoryCount: number;
  reload: () => void;
  setVariantFilter: (variant: OnboardingChecklistFilter) => void;
  setPhaseFilter: (phase: OnboardingChecklistFilter) => void;
  resetFilters: () => void;
}
