import type { ITasksConfiguration } from '../models/taskModels';
import { TasksRepository } from './tasksRepository';

describe('TasksRepository', () => {
  const baseConfiguration: ITasksConfiguration = {
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: '',
    showCompleted: false,
    maxItems: 6,
    defaultSort: 'dueDate'
  };

  it('returns the static dataset', async () => {
    const repository = new TasksRepository({
      fetchClient: jest.fn() as unknown as typeof fetch,
      spHttpClient: {} as never,
      spHttpClientConfiguration: {} as never,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/demo'
    });

    const result = await repository.getTasks(baseConfiguration);

    expect(result.length).toBeGreaterThan(0);
    expect(result.some((task) => task.group === 'noDate')).toBe(true);
  });

  it('loads same-origin json payloads', async () => {
    const fetchClient = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        tasks: [
          {
            id: 'task-1',
            title: 'Revisar plan',
            source: 'Json',
            status: 'open',
            dueDate: '2026-04-10T08:00:00.000Z',
            priority: 'high',
            openUrl: '/tasks/1'
          }
        ]
      })
    })) as unknown as typeof fetch;

    const repository = new TasksRepository({
      fetchClient,
      spHttpClient: {} as never,
      spHttpClientConfiguration: {} as never,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/demo'
    });

    const result = await repository.getTasks({
      ...baseConfiguration,
      dataSourceType: 'JsonUrl',
      listTitleOrUrl: '/sites/demo/siteassets/tasks.json'
    });

    expect(fetchClient).toHaveBeenCalled();
    expect(result[0]?.title).toBe('Revisar plan');
  });
});
