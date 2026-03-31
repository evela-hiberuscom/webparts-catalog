import { IGoalItem, IAreaGoalsConfiguration, AsyncState } from '../models/goalModels';
import { AreaGoalsRepository } from '../repositories/areaGoalsRepository';

export class AreaGoalsService {
  private _repository: AreaGoalsRepository;

  constructor(repository: AreaGoalsRepository) {
    this._repository = repository;
  }

  async loadGoals(config: IAreaGoalsConfiguration): Promise<AsyncState<IGoalItem[]>> {
    try {
      const goals = await this._repository.getGoals(config);

      if (!goals || goals.length === 0) {
        return { status: 'empty' };
      }

      const hasPartialData = goals.some(
        (goal) => !goal.owner || !goal.dueDate || !goal.detailUrl
      );

      if (hasPartialData) {
        return { status: 'partialData', data: goals, hasPartialData: true };
      }

      return { status: 'ready', data: goals };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido al cargar objetivos';
      return { status: 'error', message };
    }
  }
}