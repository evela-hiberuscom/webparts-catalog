import { classifyAsyncState } from '@paquete/spfx-common';
import type {
  IMicroSurveyConfiguration,
  IMicroSurveyResolvedState,
  IMicroSurveyUserContext,
  IPollQuestion,
  IPollSubmissionResponse,
  PollServiceErrorCode
} from '../models/pollModels';
import { PollRepository } from '../repositories/pollRepository';
import { trimToUndefined } from '../utils/pollUtils';

export class PollServiceError extends Error {
  public readonly code: PollServiceErrorCode;

  public constructor(code: PollServiceErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export class MicroSurveyService {
  private readonly repository: PollRepository;
  private readonly userContext: IMicroSurveyUserContext;

  public constructor(
    repository: PollRepository,
    userContext: IMicroSurveyUserContext
  ) {
    this.repository = repository;
    this.userContext = userContext;
  }

  public async resolveSurvey(
    configuration: IMicroSurveyConfiguration
  ): Promise<IMicroSurveyResolvedState> {
    const response = await this.repository.load(configuration, this.userContext);
    const status = classifyAsyncState({
      hasData: !!response.question,
      hasError: !!response.errorMessage,
      isPartial: response.hasPartialData,
      isLoading: false
    });

    return {
      status,
      question: response.question,
      sourceLabel: response.sourceLabel,
      hasPartialData: response.hasPartialData,
      notes: response.notes,
      errorMessage: response.errorMessage,
      existingSubmission: response.existingSubmission
    };
  }

  public async submitAnswer(
    configuration: IMicroSurveyConfiguration,
    question: IPollQuestion | undefined,
    selectedOption: string | undefined,
    existingSubmissionSelectedOption?: string
  ): Promise<IPollSubmissionResponse> {
    if (!question) {
      throw new PollServiceError(
        'questionUnavailable',
        'No active question is available.'
      );
    }

    const normalizedSelectedOption = trimToUndefined(selectedOption);
    if (!normalizedSelectedOption) {
      throw new PollServiceError(
        'selectionRequired',
        'A poll option must be selected before submitting.'
      );
    }

    if (configuration.oneResponsePerUser && existingSubmissionSelectedOption) {
      throw new PollServiceError(
        'alreadyAnswered',
        'This poll is already answered for the current user.'
      );
    }

    try {
      return await this.repository.submit(configuration, this.userContext, question, {
        questionId: question.id,
        selectedOption: normalizedSelectedOption
      });
    } catch (error) {
      if (error instanceof PollServiceError) {
        throw error;
      }

      throw new PollServiceError('submitFailed', 'The answer could not be submitted.');
    }
  }
}
