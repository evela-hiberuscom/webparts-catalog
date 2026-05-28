export type PollDataSourceType = 'SharePointList' | 'ApiEndpoint' | 'StaticConfig';

export type PollLoadStatus = 'loading' | 'ready' | 'partialData' | 'empty' | 'error';

export type PollSubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

export type PollServiceErrorCode =
  | 'selectionRequired'
  | 'questionUnavailable'
  | 'alreadyAnswered'
  | 'submitFailed';

export interface IHttpResponseLike {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

export interface ISharePointHttpClientLike {
  get(
    url: string,
    configuration: unknown,
    options?: {
      headers?: Record<string, string>;
    }
  ): Promise<IHttpResponseLike>;
  post(
    url: string,
    configuration: unknown,
    options: {
      headers?: Record<string, string>;
      body?: string;
    }
  ): Promise<IHttpResponseLike>;
}

export type FetchLike = (
  input: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  }
) => Promise<IHttpResponseLike>;

export interface IKeyValueStorageLike {
  getItem(key: string): string | undefined;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

export interface IMicroSurveyUserContext {
  displayName: string;
  email: string;
  loginName: string;
}

export interface IMicroSurveyConfiguration {
  description: string;
  dataSourceType: PollDataSourceType;
  listTitleOrUrl: string;
  responsesListTitleOrUrl: string;
  apiEndpointUrl: string;
  questionText: string;
  optionsCsv: string;
  oneResponsePerUser: boolean;
}

export interface IPollOption {
  id: string;
  label: string;
}

export interface IPollQuestion {
  id: string;
  question: string;
  description?: string;
  options: IPollOption[];
  source: PollDataSourceType;
  thankYouMessage?: string;
}

export interface IPollExistingSubmission {
  selectedOption: string;
  submittedAt?: string;
  submittedBy?: string;
}

export interface IPollLoadResponse {
  question?: IPollQuestion;
  sourceLabel: string;
  hasPartialData: boolean;
  notes: string[];
  errorMessage?: string;
  existingSubmission?: IPollExistingSubmission;
}

export interface IPollAnswerSubmission {
  questionId: string;
  selectedOption: string;
}

export interface IPollSubmissionResponse {
  confirmationMessage: string;
  submittedAt: string;
  selectedOption: string;
}

export interface IMicroSurveyResolvedState {
  status: PollLoadStatus;
  question?: IPollQuestion;
  sourceLabel: string;
  hasPartialData: boolean;
  notes: string[];
  errorMessage?: string;
  existingSubmission?: IPollExistingSubmission;
}

export interface IMicroSurveyHookState extends IMicroSurveyResolvedState {
  submitStatus: PollSubmitStatus;
  selectedOption?: string;
  confirmationMessage?: string;
  interactionErrorCode?: PollServiceErrorCode;
  interactionErrorMessage?: string;
  refresh(): Promise<void>;
  selectOption(optionId: string): void;
  submit(): Promise<void>;
}
