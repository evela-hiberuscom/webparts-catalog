import * as React from 'react';
import type {
  IMicroSurveyConfiguration,
  IMicroSurveyHookState,
  PollServiceErrorCode
} from '../models/pollModels';
import { MicroSurveyService, PollServiceError } from '../services/microSurveyService';

const defaultState: Omit<
  IMicroSurveyHookState,
  'refresh' | 'selectOption' | 'submit'
> = {
  status: 'loading',
  submitStatus: 'idle',
  sourceLabel: '',
  hasPartialData: false,
  notes: []
};

export function useMicroSurvey(
  configuration: IMicroSurveyConfiguration,
  service: MicroSurveyService
): IMicroSurveyHookState {
  const [state, setState] = React.useState(defaultState);

  React.useEffect(() => {
    let isCancelled = false;

    const loadSurvey = async (): Promise<void> => {
      setState((currentState) => ({
        ...currentState,
        status: 'loading',
        submitStatus: 'idle',
        interactionErrorCode: undefined,
        interactionErrorMessage: undefined
      }));

      try {
        const resolvedState = await service.resolveSurvey(configuration);
        if (isCancelled) {
          return;
        }

        setState({
          ...resolvedState,
          submitStatus: resolvedState.existingSubmission ? 'success' : 'idle',
          selectedOption: resolvedState.existingSubmission?.selectedOption,
          confirmationMessage: resolvedState.existingSubmission
            ? resolvedState.existingSubmission.selectedOption
            : undefined
        });
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setState({
          status: 'error',
          submitStatus: 'idle',
          sourceLabel: '',
          hasPartialData: false,
          notes: [],
          errorMessage: error instanceof Error ? error.message : 'unknown-error'
        });
      }
    };

    loadSurvey().catch(() => undefined);

    return () => {
      isCancelled = true;
    };
  }, [
    configuration.apiEndpointUrl,
    configuration.dataSourceType,
    configuration.listTitleOrUrl,
    configuration.oneResponsePerUser,
    configuration.optionsCsv,
    configuration.questionText,
    configuration.responsesListTitleOrUrl,
    service
  ]);

  async function refresh(): Promise<void> {
    const resolvedState = await service.resolveSurvey(configuration);
    setState({
      ...resolvedState,
      submitStatus: resolvedState.existingSubmission ? 'success' : 'idle',
      selectedOption: resolvedState.existingSubmission?.selectedOption,
      confirmationMessage: resolvedState.existingSubmission
        ? resolvedState.existingSubmission.selectedOption
        : undefined
    });
  }

  function selectOption(optionId: string): void {
    setState((currentState) => ({
      ...currentState,
      selectedOption: optionId,
      interactionErrorCode: undefined,
      interactionErrorMessage: undefined
    }));
  }

  async function submit(): Promise<void> {
    setState((currentState) => ({
      ...currentState,
      submitStatus: 'submitting',
      interactionErrorCode: undefined,
      interactionErrorMessage: undefined
    }));

    try {
      const submission = await service.submitAnswer(
        configuration,
        state.question,
        state.selectedOption,
        state.existingSubmission?.selectedOption
      );

      setState((currentState) => ({
        ...currentState,
        submitStatus: 'success',
        existingSubmission: {
          selectedOption: submission.selectedOption,
          submittedAt: submission.submittedAt
        },
        confirmationMessage: submission.confirmationMessage
      }));
    } catch (error) {
      let interactionErrorCode: PollServiceErrorCode | undefined;
      let interactionErrorMessage: string | undefined;

      if (error instanceof PollServiceError) {
        interactionErrorCode = error.code;
        interactionErrorMessage = error.message;
      } else if (error instanceof Error) {
        interactionErrorMessage = error.message;
      }

      setState((currentState) => ({
        ...currentState,
        submitStatus: 'error',
        interactionErrorCode,
        interactionErrorMessage
      }));
    }
  }

  return {
    ...state,
    refresh,
    selectOption,
    submit
  };
}
