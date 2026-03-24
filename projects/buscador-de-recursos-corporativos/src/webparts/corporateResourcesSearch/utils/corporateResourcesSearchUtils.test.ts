import {
  buildSearchApiUrl,
  buildSharePointItemsUrl,
  parseDataSourceTypes,
  rankResourceItem
} from './corporateResourcesSearchUtils';

describe('corporateResourcesSearchUtils', () => {
  it('parses data source types with fallback', () => {
    expect(parseDataSourceTypes('SearchAPI,SharePointList,Nope')).toEqual(['SearchAPI', 'SharePointList']);
    expect(parseDataSourceTypes('')).toEqual(['SearchAPI']);
  });

  it('normalizes sharepoint view urls to the list root', () => {
    const url = buildSharePointItemsUrl(
      'https://contoso.sharepoint.com/sites/portal',
      '/sites/portal/Lists/Resources/Forms/AllItems.aspx',
      10
    );

    expect(url).toContain('GetList(@listUrl)');
    expect(url).toContain('%2Fsites%2Fportal%2FLists%2FResources');
    expect(url).not.toContain('AllItems.aspx');
  });

  it('builds a search api url with the query text', () => {
    const url = buildSearchApiUrl('https://contoso.sharepoint.com/sites/portal', 'vacaciones', 12, '');
    expect(url).toContain('_api/search/query');
    expect(url).toContain("rowlimit=12");
    expect(url).toContain("vacaciones");
  });

  it('ranks exact matches ahead of featured partial matches', () => {
    const exact = rankResourceItem(
      {
        id: '1',
        title: 'Política de vacaciones',
        isExactMatch: false,
        isFeatured: false,
        sourceLabel: 'SearchAPI',
        sourceType: 'SearchAPI',
        keywords: []
      },
      'Política de vacaciones'
    );
    const featuredPartial = rankResourceItem(
      {
        id: '2',
        title: 'Vacaciones',
        isExactMatch: false,
        isFeatured: true,
        sourceLabel: 'SharePointList',
        sourceType: 'SharePointList',
        keywords: []
      },
      'Política de vacaciones'
    );

    expect(exact).toBeGreaterThan(featuredPartial);
  });
});

