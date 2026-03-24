import * as React from "react";
import type {
  IIdeaDraft,
  IIdeaMailboxViewModel,
  IdeaMailboxStatus,
  IIdeaMailboxViewState,
  IIdeaSubmissionRequest
} from "../models/ideaMailboxModels";
import { createEmptyIdeaDraft } from "../utils/ideaMailboxUtils";
import { useIdeasMailboxServices } from "../contexts/IdeasMailboxContext";

function createInitialState(): IIdeaMailboxViewState {
  return {
    status: "idle",
    draft: createEmptyIdeaDraft(),
    errors: {}
  };
}

function clearFieldError(state: IIdeaMailboxViewState, field: keyof IIdeaDraft): IIdeaMailboxViewState {
  if (!state.errors[field]) {
    return state;
  }

  const nextErrors = { ...state.errors };
  delete nextErrors[field];
  const nextStatus: IdeaMailboxStatus =
    state.status === "validationError" && Object.keys(nextErrors).length === 0 ? "idle" : state.status;

  return {
    ...state,
    errors: nextErrors,
    status: nextStatus
  };
}

export function useIdeasMailbox(request: IIdeaSubmissionRequest): IIdeaMailboxViewModel {
  const { submissionService, validationService } = useIdeasMailboxServices();
  const [state, setState] = React.useState<IIdeaMailboxViewState>(() => createInitialState());

  const updateField = React.useCallback((field: keyof IIdeaDraft, value: string) => {
    setState((current) => {
      const nextStatus: IdeaMailboxStatus = current.status === "submitting" ? current.status : "idle";
      const nextState = {
        ...current,
        draft: {
          ...current.draft,
          [field]: value
        },
        status: nextStatus,
        successMessage: current.status === "success" ? undefined : current.successMessage,
        errorMessage: current.status === "submitError" || current.status === "validationError" ? undefined : current.errorMessage
      };

      return clearFieldError(nextState, field);
    });
  }, []);

  const reset = React.useCallback(() => {
    setState(createInitialState());
  }, []);

  const submit = React.useCallback(async () => {
    const validation = validationService.validateDraft(state.draft);
    if (!validation.isValid) {
      setState((current) => ({
        ...current,
        status: "validationError",
        draft: validation.draft,
        errors: validation.errors,
        successMessage: undefined,
        errorMessage: undefined
      }));
      return;
    }

    setState((current) => ({
      ...current,
      status: "submitting",
      draft: validation.draft,
      errors: {},
      successMessage: undefined,
      errorMessage: undefined
    }));

    try {
      const result = await submissionService.submit(request, validation.draft);
      setState({
        status: "success",
        draft: createEmptyIdeaDraft(),
        errors: {},
        successMessage: result.acknowledgement ?? "Tu idea se ha enviado correctamente.",
        errorMessage: undefined
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        status: "submitError",
        errorMessage: (error as Error).message,
        successMessage: undefined
      }));
    }
  }, [request, state.draft, submissionService, validationService]);

  return {
    ...state,
    updateField,
    submit,
    reset
  };
}
