import type { INewJoinersConfiguration } from '../models/joinerModels';
import { NewJoinersRepository } from './newJoinersRepository';

describe('NewJoinersRepository', () => {
  const configuration: INewJoinersConfiguration = {
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: 'NewJoiners',
    maxItems: 4,
    daysBack: 30
  };

  it('returns the static dataset', async () => {
    const repository = new NewJoinersRepository({
      fetchClient: jest.fn() as unknown as typeof fetch,
      spHttpClient: {} as never,
      spHttpClientConfiguration: {} as never,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/demo'
    });

    const result = await repository.getJoiners(configuration);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]?.displayName).toBeTruthy();
  });

  it('loads same-origin json payloads', async () => {
    const fetchClient = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        items: [
          {
            id: 'joiner-10',
            displayName: 'Ada Lovelace',
            department: 'Technology',
            startDate: new Date().toISOString()
          }
        ]
      })
    })) as unknown as typeof fetch;

    const repository = new NewJoinersRepository({
      fetchClient,
      spHttpClient: {} as never,
      spHttpClientConfiguration: {} as never,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/demo'
    });

    const result = await repository.getJoiners({
      ...configuration,
      dataSourceType: 'JsonUrl',
      listTitleOrUrl: '/sites/demo/siteassets/new-joiners.json'
    });

    expect(fetchClient).toHaveBeenCalledWith(
      'https://contoso.sharepoint.com/sites/demo/siteassets/new-joiners.json',
      expect.any(Object)
    );
    expect(result[0]?.id).toBe('joiner-10');
  });

  it('rejects cross-origin json urls', async () => {
    const repository = new NewJoinersRepository({
      fetchClient: jest.fn() as unknown as typeof fetch,
      spHttpClient: {} as never,
      spHttpClientConfiguration: {} as never,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/demo'
    });

    await expect(
      repository.getJoiners({
        ...configuration,
        dataSourceType: 'JsonUrl',
        listTitleOrUrl: 'https://external.example.com/new-joiners.json'
      })
    ).rejects.toThrow('Invalid JSON URL format');
  });
});
