import { classifyAsyncState } from '@paquete/spfx-common/utils';
import type {
  DailyPulseViewState,
  IDailyPulsePrompt,
  IDailyPulseRequest,
  IDailyPulseSubmissionResult,
  IDailyPulseStateSnapshot
} from '../models/dailyPulseModels';
import { DailyPulseRepository } from '../repositories/dailyPulseRepository';

export interface IDailyPulseService {
  resolve(request: IDailyPulseRequest): Promise<IDailyPulseStateSnapshot>;
  submit(request: IDailyPulseRequest, prompt: IDailyPulsePrompt, optionId: string): Promise<IDailyPulseSubmissionResult>;
  readStoredAnswer(promptId: string, request: IDailyPulseRequest): ReturnType<DailyPulseRepository['readStoredAnswer']>;
}

function classifyViewState(input: {
  isLoading: boolean;
  hasError: boolean;
  hasPartialData: boolean;
  hasData: boolean;
}): DailyPulseViewState {
  return classifyAsyncState({
    isLoading: input.isLoading,
    hasError: input.hasError,
    isPartial: input.hasPartialData,
    hasData: input.hasData
  }) as DailyPulseViewState;
}

export class DailyPulseService implements IDailyPulseService {
  constructor(private readonly repository: DailyPulseRepository = new DailyPulseRepository()) {}

  public readStoredAnswer(
    promptId: string,
    request: IDailyPulseRequest
  ): ReturnType<DailyPulseRepository['readStoredAnswer']> {
    return this.repository.readStoredAnswer(promptId, request);
  }

  public async resolve(request: IDailyPulseRequest): Promise<IDailyPulseStateSnapshot> {
    try {
      const result = await this.repository.loadPrompt(request);
      const hasData = Boolean(result.prompt);
      const storedAnswer = result.prompt ? this.repository.readStoredAnswer(result.prompt.id, request) : undefined;
      const alreadySubmitted = Boolean(storedAnswer);
      const status = classifyViewState({
        isLoading: false,
        hasError: false,
        hasPartialData: result.hasPartialData,
        hasData
      });

      return {
        status,
        prompt: result.prompt,
        sourceLabel: result.sourceLabel,
        notes: result.notes,
        hasPartialData: result.hasPartialData,
        selectedOptionId: storedAnswer?.optionId ?? '',
        submissionState: alreadySubmitted ? 'success' : 'idle',
        submissionMessage: alreadySubmitted ? 'Pulso registrado hoy.' : undefined,
        errorMessage: undefined,
        alreadySubmitted
      };
    } catch (error) {
      return {
        status: classifyViewState({
          isLoading: false,
          hasError: true,
          hasPartialData: false,
          hasData: false
        }),
        sourceLabel: 'Pulso del día',
        notes: [],
        hasPartialData: false,
        selectedOptionId: '',
        submissionState: 'error',
        submissionMessage: undefined,
        errorMessage: (error as Error).message,
        alreadySubmitted: false
      };
    }
  }

  public async submit(
    request: IDailyPulseRequest,
    prompt: IDailyPulsePrompt,
    optionId: string
  ): Promise<IDailyPulseSubmissionResult> {
    return this.repository.submitAnswer(request, prompt, optionId);
  }
}
