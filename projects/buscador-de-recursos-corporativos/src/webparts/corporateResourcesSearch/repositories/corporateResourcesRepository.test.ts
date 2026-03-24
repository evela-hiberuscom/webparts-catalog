import { CorporateResourcesRepository } from './corporateResourcesRepository';

describe('CorporateResourcesRepository', () => {
  it('loads and normalizes sharepoint list urls', async () => {
    const fetcher = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        value: [
          {
            Id: 1,
            Title: 'Política de vacaciones',
            ResourceType: 'Policy',
            Category: 'RRHH',
            Summary: 'Documento oficial',
            OpenUrl: '/sites/hr/politicas/vacaciones',
            IsFeatured: true,
            Keywords: 'vacaciones,rrhh'
          }
        ]
      })
    }));

    const repository = new CorporateResourcesRepository(fetcher as never);
    const results = await repository.load({
      webUrl: 'https://contoso.sharepoint.com/sites/portal',
      query: '',
      dataSourceTypes: ['SharePointList'],
      listTitleOrUrl: '/sites/portal/Lists/Resources/Forms/AllItems.aspx',
      searchScopeUrl: '',
      showFeaturedWhenEmpty: true,
      maxItems: 10
    });

    const mockedFetcher = fetcher as unknown as jest.Mock;
    expect(mockedFetcher).toHaveBeenCalledTimes(1);
    expect(mockedFetcher.mock.calls[0][0]).toContain('GetList(@listUrl)');
    expect(mockedFetcher.mock.calls[0][0]).toContain('%2Fsites%2Fportal%2FLists%2FResources');
    expect(results[0].items[0].title).toBe('Política de vacaciones');
    expect(results[0].items[0].keywords).toEqual(['vacaciones', 'rrhh']);
  });

  it('rejects cross-origin json urls', async () => {
    const repository = new CorporateResourcesRepository(jest.fn() as never);

    await expect(
      repository.load({
        webUrl: 'https://contoso.sharepoint.com/sites/portal',
        query: 'vacaciones',
        dataSourceTypes: ['JsonUrl'],
        listTitleOrUrl: 'https://evil.example/resources.json',
        searchScopeUrl: '',
        showFeaturedWhenEmpty: true,
        maxItems: 10
      })
    ).rejects.toThrow('same-origin');
  });

  it('loads search api results when a query is present', async () => {
    const fetcher = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        PrimaryQueryResult: {
          RelevantResults: {
            Table: {
              Rows: {
                results: [
                  {
                    Cells: {
                      results: [
                        { Key: 'Title', Value: 'Manual de teletrabajo' },
                        { Key: 'Path', Value: '/sites/portal/manuales/teletrabajo' },
                        { Key: 'Description', Value: 'Guía oficial' }
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      })
    }));

    const repository = new CorporateResourcesRepository(fetcher as never);
    const results = await repository.load({
      webUrl: 'https://contoso.sharepoint.com/sites/portal',
      query: 'teletrabajo',
      dataSourceTypes: ['SearchAPI'],
      listTitleOrUrl: '',
      searchScopeUrl: '',
      showFeaturedWhenEmpty: true,
      maxItems: 10
    });

    expect((fetcher as unknown as jest.Mock)).toHaveBeenCalledTimes(1);
    expect(results[0].items[0].title).toBe('Manual de teletrabajo');
    expect(results[0].items[0].openUrl).toBe('/sites/portal/manuales/teletrabajo');
  });
});
