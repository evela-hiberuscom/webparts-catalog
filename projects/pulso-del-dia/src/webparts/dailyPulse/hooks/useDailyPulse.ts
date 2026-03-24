import * as React from 'react';
import type { IDailyPulseRequest, IDailyPulseStateSnapshot, IDailyPulseViewModel } from '../models/dailyPulseModels';
import { useDailyPulseService } from '../contexts/DailyPulseContext';

function createLoadingViewModel(): IDailyPulseStateSnapshot {
  return {
    status: 'loading',
    sourceLabel: 'Pulso del día',
    notes: [],
    hasPartialData: false,
    selectedOptionId: '',
    submissionState: 'idle',
    alreadySubmitted: false
  };
}

export function useDailyPulse(request: IDailyPulseRequest): IDailyPulseViewModel {
  const service = useDailyPulseService();
  const [viewModel, setViewModel] = React.useState<IDailyPulseStateSnapshot>(() => createLoadingViewModel());
  const [reloadTick, setReloadTick] = React.useState(0);
  const requestRef = React.useRef(request);
  requestRef.current = request;

  const reload = React.useCallback(() => {
    setReloadTick((value) => value + 1);
  }, []);

  const selectOption = React.useCallback((optionId: string) => {
    setViewModel((current) => ({
      ...current,
      selectedOptionId: optionId,
      submissionState: 'idle',
      submissionMessage: undefined
    }));
  }, []);

  const submitSelection = React.useCallback(async () => {
    const currentRequest = requestRef.current;
    const currentPrompt = viewModel.prompt;
    const currentSelection = viewModel.selectedOptionId;

    if (!currentPrompt || !currentSelection || viewModel.submissionState === 'submitting' || viewModel.alreadySubmitted) {
      return;
    }

    setViewModel((current) => ({
      ...current,
      submissionState: 'submitting',
      errorMessage: undefined
    }));

    try {
      const result = await service.submit(currentRequest, currentPrompt, currentSelection);
      setViewModel((current) => ({
        ...current,
        submissionState: 'success',
        submissionMessage: currentRequest.oneResponsePerDay ? 'Pulso registrado hoy.' : 'Pulso registrado.',
        alreadySubmitted: true,
        sourceLabel: result.sourceLabel,
        notes: [...current.notes, ...result.notes],
        selectedOptionId: result.submitted.optionId
      }));
    } catch (error) {
      setViewModel((current) => ({
        ...current,
        submissionState: 'error',
        errorMessage: (error as Error).message
      }));
    }
  }, [service, viewModel.alreadySubmitted, viewModel.prompt, viewModel.selectedOptionId, viewModel.submissionState]);

  React.useEffect(() => {
    let disposed = false;

    async function load(): Promise<void> {
      setViewModel(createLoadingViewModel());
      const result = await service.resolve(request);

      if (!disposed) {
        setViewModel(result);
      }
    }

    load().catch((error) => {
      if (!disposed) {
        setViewModel({
          status: 'error',
          sourceLabel: request.title,
          notes: [],
          hasPartialData: false,
          selectedOptionId: '',
          submissionState: 'error',
          errorMessage: (error as Error).message,
          alreadySubmitted: false
        });
      }
    });

    return () => {
      disposed = true;
    };
  }, [
    reloadTick,
    request.apiEndpointUrl,
    request.jsonUrl,
    request.listTitleOrUrl,
    request.oneResponsePerDay,
    request.promptJson,
    request.sourceType,
    request.submitLabel,
    request.subtitle,
    request.title,
    request.userDisplayName,
    request.webUrl,
    service
  ]);

  return {
    ...viewModel,
    reload,
    selectOption,
    submitSelection
  };
}

