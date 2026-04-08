import type { ITasksConfiguration } from '../models/taskModels';
import type { TasksRepository } from '../repositories/tasksRepository';
import { TasksService } from './tasksService';

describe('TasksService', () => {
  const configuration: ITasksConfiguration = {
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: '',
    showCompleted: false,
    maxItems: 6,
    defaultSort: 'dueDate'
  };

  it('returns ready when the repository response is complete', async () => {
    const repository = {
      getTasks: jest.fn(async () => [
        {
          id: 'task-1',
          title: 'Revisar informe',
          source: 'Planner',
          status: 'open',
          dueDate: '2026-04-10T08:00:00.000Z',
          priority: 'high',
          openUrl: '/tasks/1',
          group: 'today'
        }
      ])
    } as unknown as TasksRepository;

    const service = new TasksService(repository);
    const result = await service.loadTasks(configuration);

    expect(result.status).toBe('ready');
  });

  it('calculates grouped counters', () => {
    const service = new TasksService({ getTasks: jest.fn() } as unknown as TasksRepository);

    expect(
      service.calculateCounts([
        { id: '1', title: 'A', source: 'Planner', status: 'open', dueDate: undefined, priority: 'high', openUrl: '/1', group: 'overdue' },
        { id: '2', title: 'B', source: 'Planner', status: 'open', dueDate: undefined, priority: 'medium', openUrl: '/2', group: 'today' },
        { id: '3', title: 'C', source: 'Planner', status: 'open', dueDate: undefined, priority: 'low', openUrl: '/3', group: 'soon' },
        { id: '4', title: 'D', source: 'Planner', status: 'open', dueDate: undefined, priority: 'unknown', openUrl: undefined, group: 'noDate' }
      ])
    ).toEqual({
      overdue: 1,
      today: 1,
      soon: 1,
      noDate: 1
    });
  });
});
