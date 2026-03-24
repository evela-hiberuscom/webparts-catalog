import { CorporateResourcesSearchService } from './corporateResourcesSearchService';

describe('CorporateResourcesSearchService', () => {
  it('returns idle when there is no query and no items', async () => {
    const service = new CorporateResourcesSearchService({
      load: jest.fn().mockResolvedValue([])
    } as never);

    const result = await service.resolve({
      webUrl: 'https://contoso.sharepoint.com/sites/portal',
      query: '',
      dataSourceTypes: ['SearchAPI'],
      listTitleOrUrl: '',
      searchScopeUrl: '',
      showFeaturedWhenEmpty: true,
      maxItems: 10
    });

    expect(result.status).toBe('idle');
    expect(result.filteredItems).toHaveLength(0);
  });

  it('returns ready with featured results when the query is empty', async () => {
    const service = new CorporateResourcesSearchService({
      load: jest.fn().mockResolvedValue([
        {
          sourceLabel: 'SharePointList',
          hasPartialData: false,
          items: [
            {
              id: '1',
              title: 'Política de vacaciones',
              resourceType: 'Policy',
              category: 'RRHH',
              summary: 'Documento oficial',
              openUrl: '/sites/hr/politicas/vacaciones',
              isExactMatch: false,
              isFeatured: true,
              sourceType: 'SharePointList',
              sourceLabel: 'SharePointList',
              keywords: ['vacaciones']
            }
          ]
        }
      ])
    } as never);

    const result = await service.resolve({
      webUrl: 'https://contoso.sharepoint.com/sites/portal',
      query: '',
      dataSourceTypes: ['SharePointList'],
      listTitleOrUrl: 'Resources',
      searchScopeUrl: '',
      showFeaturedWhenEmpty: true,
      maxItems: 10
    });

    expect(result.status).toBe('ready');
    expect(result.featuredItems).toHaveLength(1);
    expect(result.facets.resourceTypes[0].label).toBe('Policy');
  });

  it('returns empty when filters remove every match', async () => {
    const service = new CorporateResourcesSearchService({
      load: jest.fn().mockResolvedValue([
        {
          sourceLabel: 'SharePointList',
          hasPartialData: false,
          items: [
            {
              id: '1',
              title: 'Política de vacaciones',
              resourceType: 'Policy',
              category: 'RRHH',
              summary: 'Documento oficial',
              openUrl: '/sites/hr/politicas/vacaciones',
              isExactMatch: false,
              isFeatured: false,
              sourceType: 'SharePointList',
              sourceLabel: 'SharePointList',
              keywords: ['vacaciones']
            }
          ]
        }
      ])
    } as never);

    const result = await service.resolve(
      {
        webUrl: 'https://contoso.sharepoint.com/sites/portal',
        query: 'vacaciones',
        dataSourceTypes: ['SharePointList'],
        listTitleOrUrl: 'Resources',
        searchScopeUrl: '',
        showFeaturedWhenEmpty: true,
        maxItems: 10
      },
      { category: 'IT' }
    );

    expect(result.status).toBe('empty');
    expect(result.filteredItems).toHaveLength(0);
  });

  it('surfaces partial data when items are incomplete', async () => {
    const service = new CorporateResourcesSearchService({
      load: jest.fn().mockResolvedValue([
        {
          sourceLabel: 'JsonUrl',
          hasPartialData: true,
          items: [
            {
              id: '1',
              title: 'Manual de onboarding',
              resourceType: 'Manual',
              category: '',
              summary: '',
              openUrl: '',
              isExactMatch: false,
              isFeatured: false,
              sourceType: 'JsonUrl',
              sourceLabel: 'JsonUrl',
              keywords: []
            }
          ]
        }
      ])
    } as never);

    const result = await service.resolve({
      webUrl: 'https://contoso.sharepoint.com/sites/portal',
      query: 'manual',
      dataSourceTypes: ['JsonUrl'],
      listTitleOrUrl: '/sites/portal/SiteAssets/resources.json',
      searchScopeUrl: '',
      showFeaturedWhenEmpty: true,
      maxItems: 10
    });

    expect(result.status).toBe('partialData');
    expect(result.hasPartialData).toBe(true);
  });
});

