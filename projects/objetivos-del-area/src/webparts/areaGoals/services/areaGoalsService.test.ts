import type { AreaGoalsRepository } from '../repositories/areaGoalsRepository';
import type { IAreaGoalsConfiguration, IGoalItem } from '../models/goalModels';
import { AreaGoalsService } from './areaGoalsService';

const configuration: IAreaGoalsConfiguration = {
  dataSourceType: 'StaticConfig',
  listTitleOrUrl: '',
  maxItems: 5
};

describe('AreaGoalsService', () => {
  it('marks goals with missing operational fields as partial data', async () => {
    const goals: IGoalItem[] = [
      {
        id: 'goal-1',
        title: 'Reducir tiempos de respuesta',
        description: undefined,
        progress: 45,
        status: 'onTrack',
        owner: undefined,
        dueDate: '2026-04-30',
        detailUrl: '/sites/intranet/goals/1'
      }
    ];
    const repository = {
      getGoals: jest.fn().mockResolvedValue(goals)
    } as unknown as AreaGoalsRepository;

    const state = await new AreaGoalsService(repository).loadGoals(configuration);

    expect(state).toEqual({ status: 'partialData', data: goals, hasPartialData: true });
  });
});
