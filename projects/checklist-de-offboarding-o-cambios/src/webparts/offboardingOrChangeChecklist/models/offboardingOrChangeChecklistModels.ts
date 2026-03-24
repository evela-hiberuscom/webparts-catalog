export type OffboardingChecklistDataSourceType = 'SharePointList' | 'JsonUrl' | 'StaticConfig';

export type OffboardingScenario = 'offboarding' | 'transfer' | 'roleChange' | 'generic';

export type OffboardingScenarioFilter = OffboardingScenario | 'all';

export type OffboardingChecklistState = 'loading' | 'ready' | 'empty' | 'partialData' | 'error';

export interface IOffboardingOrChangeChecklistWebPartProps {
  title: string;
  description: string;
  dataSourceType: OffboardingChecklistDataSourceType;
  webUrl: string;
  listTitleOrUrl: string;
  jsonUrl: string;
  staticConfigJson: string;
  defaultScenario: OffboardingScenario;
  defaultPhase: string;
}

export interface IOffboardingOrChangeChecklistRequest extends IOffboardingOrChangeChecklistWebPartProps {
  userDisplayName: string;
}

export interface IChecklistFilterOption {
  key: string;
  text: string;
}

export interface IChecklistStep {
  id: string;
  title: string;
  description?: string;
  scenario: OffboardingScenario;
  phase: string;
  critical: boolean;
  priority: number;
  relatedUrl?: string;
  relatedLabel?: string;
  partialData: boolean;
}

export interface IChecklistRepositoryResult {
  items: IChecklistStep[];
  sourceLabel: string;
  notes: string[];
  hasPartialData: boolean;
}

export interface IChecklistStateSnapshot {
  status: OffboardingChecklistState;
  items: IChecklistStep[];
  sourceLabel: string;
  notes: string[];
  hasPartialData: boolean;
  errorMessage?: string;
  activeScenario: OffboardingScenarioFilter;
  activePhase: string | 'all';
}

export interface IChecklistViewModel extends IChecklistStateSnapshot {
  filteredItems: IChecklistStep[];
  scenarioOptions: IChecklistFilterOption[];
  phaseOptions: IChecklistFilterOption[];
  criticalCount: number;
  reload: () => void;
  setScenarioFilter: (scenario: OffboardingScenarioFilter) => void;
  setPhaseFilter: (phase: string | 'all') => void;
  resetFilters: () => void;
}
