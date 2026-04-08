import type { ICorporateAzConfiguration } from '../models/corporateAzModels';
import { CorporateAzRepository } from './corporateAzRepository';

describe('CorporateAzRepository', () => {
  const configuration: ICorporateAzConfiguration = {
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: 'CorporateAz',
    maxItems: 12
  };

  it('returns the static dataset', async () => {
    const repository = new CorporateAzRepository({
      fetchClient: jest.fn() as unknown as typeof fetch,
      spHttpClient: {} as never,
      spHttpClientConfiguration: {} as never,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/intranet'
    });

    const result = await repository.getEntries(configuration);

    expect(result.length).toBeGreaterThan(3);
    expect(result[0]?.title).toBeTruthy();
  });

  it('loads same-origin json payloads', async () => {
    const fetchClient = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        items: [{ id: '1', letter: 'A', title: 'Ausencias' }]
      })
    })) as unknown as typeof fetch;

    const repository = new CorporateAzRepository({
      fetchClient,
      spHttpClient: {} as never,
      spHttpClientConfiguration: {} as never,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/intranet'
    });

    const result = await repository.getEntries({
      ...configuration,
      dataSourceType: 'JsonUrl',
      listTitleOrUrl: '/sites/intranet/siteassets/corporate-az.json'
    });

    expect(fetchClient).toHaveBeenCalledWith(
      'https://contoso.sharepoint.com/sites/intranet/siteassets/corporate-az.json',
      expect.any(Object)
    );
    expect(result[0]?.letter).toBe('A');
  });

  it('rejects cross-origin json urls', async () => {
    const repository = new CorporateAzRepository({
      fetchClient: jest.fn() as unknown as typeof fetch,
      spHttpClient: {} as never,
      spHttpClientConfiguration: {} as never,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/intranet'
    });

    await expect(
      repository.getEntries({
        ...configuration,
        dataSourceType: 'JsonUrl',
        listTitleOrUrl: 'https://external.example.com/corporate-az.json'
      })
    ).rejects.toThrow('Invalid JSON URL format');
  });
});
