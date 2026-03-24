import { classifyAsyncState } from '@paquete/spfx-common/utils';
import type {
  IOnboardingChecklistRepositoryResult,
  IOnboardingChecklistRequest,
  IOnboardingChecklistStateSnapshot,
  OnboardingChecklistState
} from '../models/onboardingChecklistModels';
import { OnboardingChecklistRepository } from '../repositories/onboardingChecklistRepository';

export interface IOnboardingChecklistService {
  resolve(request: IOnboardingChecklistRequest): Promise<IOnboardingChecklistStateSnapshot>;
}

function classifyChecklistState(input: {
  isLoading: boolean;
  hasError: boolean;
  hasPartialData: boolean;
  hasData: boolean;
}): OnboardingChecklistState {
  return classifyAsyncState({
    isLoading: input.isLoading,
    hasError: input.hasError,
    isPartial: input.hasPartialData && input.hasData,
    hasData: input.hasData
  }) as OnboardingChecklistState;
}

function createEmptyState(request: IOnboardingChecklistRequest): IOnboardingChecklistStateSnapshot {
  return {
    status: 'empty',
    items: [],
    sourceLabel: request.title,
    notes: [],
    hasPartialData: false,
    activeVariant: request.defaultVariant?.trim() || 'all',
    activePhase: request.defaultPhase?.trim() || 'all'
  };
}

function mapResultToSnapshot(request: IOnboardingChecklistRequest, result: IOnboardingChecklistRepositoryResult): IOnboardingChecklistStateSnapshot {
  const hasData = result.items.length > 0;
  const status = classifyChecklistState({
    isLoading: false,
    hasError: false,
    hasPartialData: result.hasPartialData,
    hasData
  });

  return {
    status: hasData ? status : 'empty',
    items: result.items,
    sourceLabel: result.sourceLabel,
    notes: result.notes,
    hasPartialData: result.hasPartialData,
    activeVariant: request.defaultVariant?.trim() || 'all',
    activePhase: request.defaultPhase?.trim() || 'all'
  };
}

export class OnboardingChecklistService implements IOnboardingChecklistService {
  constructor(private readonly repository: OnboardingChecklistRepository = new OnboardingChecklistRepository()) {}

  public async resolve(request: IOnboardingChecklistRequest): Promise<IOnboardingChecklistStateSnapshot> {
    try {
      const result = await this.repository.loadChecklist(request);
      if (!result.items.length) {
        return createEmptyState(request);
      }

      return mapResultToSnapshot(request, result);
    } catch (error) {
      return {
        status: classifyChecklistState({
          isLoading: false,
          hasError: true,
          hasPartialData: false,
          hasData: false
        }),
        items: [],
        sourceLabel: 'Checklist de onboarding',
        notes: [],
        hasPartialData: false,
        errorMessage: (error as Error).message,
        activeVariant: request.defaultVariant?.trim() || 'all',
        activePhase: request.defaultPhase?.trim() || 'all'
      };
    }
  }
}
