export type IdeaMailboxSourceType = "SharePointList" | "ApiEndpoint" | "JsonBridge";

export type IdeaMailboxStatus = "idle" | "submitting" | "success" | "validationError" | "submitError";

export interface IIdeaDraft {
  title: string;
  description: string;
  category: string;
}

export interface IIdeaFormErrors {
  title?: string;
  description?: string;
  category?: string;
  form?: string;
}

export interface IIdeaValidationResult {
  draft: IIdeaDraft;
  errors: IIdeaFormErrors;
  isValid: boolean;
}

export interface IIdeaSubmissionPayload {
  title: string;
  description?: string;
  category?: string;
  submittedBy?: string;
  submittedAt: string;
  sourceType: IdeaMailboxSourceType;
  pageUrl: string;
}

export interface IIdeaSubmissionRequest {
  title: string;
  subtitle: string;
  sourceType: IdeaMailboxSourceType;
  listTitleOrUrl: string;
  endpointUrl: string;
  allowAnonymous: boolean;
  showCategory: boolean;
  submitLabel: string;
  categoryLabel: string;
  userDisplayName: string;
  pageUrl: string;
}

export interface IIdeaSubmissionResult {
  persisted: boolean;
  sourceLabel: string;
  acknowledgement?: string;
  notes: string[];
}

export interface IIdeaMailboxViewState {
  status: IdeaMailboxStatus;
  draft: IIdeaDraft;
  errors: IIdeaFormErrors;
  successMessage?: string;
  errorMessage?: string;
}

export interface IIdeaMailboxViewModel extends IIdeaMailboxViewState {
  updateField: (field: keyof IIdeaDraft, value: string) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export interface IIdeasMailboxWebPartProps {
  title: string;
  subtitle: string;
  sourceType: IdeaMailboxSourceType;
  listTitleOrUrl: string;
  endpointUrl: string;
  allowAnonymous: boolean;
  showCategory: boolean;
  submitLabel: string;
  categoryLabel: string;
}

export interface IIdeasMailboxProps extends IIdeasMailboxWebPartProps {
  userDisplayName: string;
  pageUrl: string;
}
