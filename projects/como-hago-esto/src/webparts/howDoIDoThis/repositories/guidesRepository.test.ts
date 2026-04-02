import { GuidesRepository } from './guidesRepository';

describe('GuidesRepository', () => {
  const request = {
    title: 'Cómo hago esto',
    description: 'Guías',
    dataSourceType: 'StaticConfig' as const,
    listTitleOrUrl: '',
    defaultCategory: '',
    maxItems: 8,
    webUrl: 'https://contoso.sharepoint.com/sites/intranet',
    userDisplayName: 'Ada Lovelace'
  };

  it('returns fallback guides for StaticConfig', async () => {
    const repository = new GuidesRepository({ get: jest.fn() } as never, jest.fn() as never);

    const result = await repository.load(request);

    expect(result.items.length).toBeGreaterThan(0);
    expect(result.sourceLabel).toBe('StaticConfig');
  });

  it('loads same-origin JsonUrl sources', async () => {
    const repository = new GuidesRepository(
      { get: jest.fn() } as never,
      jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          items: [
            {
              id: '1',
              title: 'Cómo pedir material',
              category: 'Compras',
              steps: ['Paso 1'],
              relatedUrl: '/sites/purchases/material',
              featured: true
            }
          ]
        })
      })
    );

    const result = await repository.load({
      ...request,
      dataSourceType: 'JsonUrl',
      listTitleOrUrl: '/sites/intranet/siteassets/guides.json'
    });

    expect(result.items[0].title).toBe('Cómo pedir material');
    expect(result.items[0].featured).toBe(true);
  });

  it('rejects JsonUrl entries from another origin', async () => {
    const repository = new GuidesRepository({ get: jest.fn() } as never, jest.fn() as never);

    await expect(
      repository.load({
        ...request,
        dataSourceType: 'JsonUrl',
        listTitleOrUrl: 'https://example.org/guides.json'
      })
    ).rejects.toThrow('JsonUrl must be same-origin or relative.');
  });
});
