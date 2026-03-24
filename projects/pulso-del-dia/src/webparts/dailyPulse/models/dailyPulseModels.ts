export type DailyPulseSourceType = 'SharePointList' | 'JsonUrl' | 'ApiEndpoint' | 'StaticConfig';

export type DailyPulseTone = 'positive' | 'neutral' | 'negative';

export type DailyPulseViewState = 'loading' | 'ready' | 'partialData' | 'empty' | 'error';

export type DailyPulseSubmissionState = 'idle' | 'submitting' | 'success' | 'error';

export interface IDailyPulseOption {
  id: string;
  label: string;
  description?: string;
  tone?: DailyPulseTone;
  emoji?: string;
}

export interface IDailyPulsePrompt {
  id: string;
  prompt: string;
  options: IDailyPulseOption[];
  helpText?: string;
}

export interface IDailyPulseAnswer {
  promptId: string;
  optionId: string;
  optionLabel: string;
  submittedBy: string;
  submittedAt: string;
}

export interface IDailyPulseWebPartProps {
  title: string;
  subtitle: string;
  sourceType: DailyPulseSourceType;
  webUrl: string;
  listTitleOrUrl: string;
  jsonUrl: string;
  apiEndpointUrl: string;
  promptJson: string;
  oneResponsePerDay: boolean;
  submitLabel: string;
}

export interface IDailyPulseRequest extends IDailyPulseWebPartProps {
  userDisplayName: string;
  userLoginName?: string;
}

export interface IDailyPulseRepositoryResult {
  prompt?: IDailyPulsePrompt;
  sourceLabel: string;
  notes: string[];
  hasPartialData: boolean;
}

export interface IDailyPulseSubmissionResult {
  submitted: IDailyPulseAnswer;
  persistedLocally: boolean;
  sourceLabel: string;
  notes: string[];
}

export interface IDailyPulseStateSnapshot {
  status: DailyPulseViewState;
  prompt?: IDailyPulsePrompt;
  sourceLabel: string;
  notes: string[];
  hasPartialData: boolean;
  selectedOptionId: string;
  submissionState: DailyPulseSubmissionState;
  submissionMessage?: string;
  errorMessage?: string;
  alreadySubmitted: boolean;
}

export interface IDailyPulseViewModel extends IDailyPulseStateSnapshot {
  reload: () => void;
  selectOption: (optionId: string) => void;
  submitSelection: () => Promise<void>;
}
