import { classifyAsyncState } from '@paquete/spfx-common/utils';
import type {
  IChecklistRepositoryResult,
  IChecklistStateSnapshot,
  IOffboardingOrChangeChecklistRequest,
  OffboardingChecklistState
} from '../models/offboardingOrChangeChecklistModels';
import { OffboardingOrChangeChecklistRepository } from '../repositories/offboardingOrChangeChecklistRepository';

export interface IOffboardingOrChangeChecklistService {
  resolve(request: IOffboardingOrChangeChecklistRequest): Promise<IChecklistStateSnapshot>;
}

function classifyChecklistState(input: {
  isLoading: boolean;
  hasError: boolean;
  hasPartialData: boolean;
  hasData: boolean;
}): OffboardingChecklistState {
  return classifyAsyncState({
    isLoading: input.isLoading,
    hasError: input.hasError,
    isPartial: input.hasPartialData && input.hasData,
    hasData: input.hasData
  }) as OffboardingChecklistState;
}

function createEmptyState(request: IOffboardingOrChangeChecklistRequest): IChecklistStateSnapshot {
  return {
    status: 'empty',
    items: [],
    sourceLabel: request.title,
    notes: [],
    hasPartialData: false,
    activeScenario: request.defaultScenario,
    activePhase: request.defaultPhase?.trim() || 'all'
  };
}

function mapResultToSnapshot(request: IOffboardingOrChangeChecklistRequest, result: IChecklistRepositoryResult): IChecklistStateSnapshot {
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
    activeScenario: request.defaultScenario,
    activePhase: request.defaultPhase?.trim() || 'all'
  };
}

export class OffboardingOrChangeChecklistService implements IOffboardingOrChangeChecklistService {
  constructor(private readonly repository: OffboardingOrChangeChecklistRepository = new OffboardingOrChangeChecklistRepository()) {}

  public async resolve(request: IOffboardingOrChangeChecklistRequest): Promise<IChecklistStateSnapshot> {
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
        sourceLabel: 'Checklist de offboarding o cambios',
        notes: [],
        hasPartialData: false,
        errorMessage: (error as Error).message,
        activeScenario: request.defaultScenario,
        activePhase: request.defaultPhase?.trim() || 'all'
      };
    }
  }
}
