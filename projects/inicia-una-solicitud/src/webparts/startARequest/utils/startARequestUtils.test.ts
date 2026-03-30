import {
  buildSharePointListEndpoint,
  buildStaticRequestItems,
  filterRequestsByCategory,
  normalizeListTitleOrUrl,
  normalizeRequestLink
} from './startARequestUtils';

describe('startARequestUtils', () => {
  it('normalizes AllItems.aspx urls to a list root path', () => {
    const normalized = normalizeListTitleOrUrl(
      '/sites/hr/RequestsCatalog/Forms/AllItems.aspx',
      'https://contoso.sharepoint.com'
    );

    expect(normalized.isUrlLike).toBe(true);
    expect(normalized.value).toContain('/sites/hr/RequestsCatalog/Forms/AllItems.aspx');
  });

  it('builds the correct SharePoint list endpoint for a title', () => {
    const endpoint = buildSharePointListEndpoint('https://contoso.sharepoint.com/sites/hr', 'RequestsCatalogList');

    expect(endpoint).toContain("/_api/web/lists/getbytitle('RequestsCatalogList')/items");
  });

  it('builds the correct SharePoint list endpoint for a list url', () => {
    const endpoint = buildSharePointListEndpoint(
      'https://contoso.sharepoint.com/sites/hr',
      '/sites/hr/RequestsCatalog/Forms/AllItems.aspx'
    );

    expect(endpoint).toContain('/_api/web/GetList(@listUrl)/items');
    expect(endpoint).toContain('%2Fsites%2Fhr%2FRequestsCatalog');
  });

  it('rejects dangerous request links', () => {
    const dangerousUrl = ['java', 'script:alert(1)'].join('');
    expect(normalizeRequestLink(dangerousUrl, 'https://contoso.sharepoint.com/sites/hr')).toBeUndefined();
  });

  it('keeps static items actionable', () => {
    const items = buildStaticRequestItems('https://contoso.sharepoint.com/sites/hr');

    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.actionable)).toBe(true);
  });

  it('filters by category', () => {
    const filtered = filterRequestsByCategory(
      [
        { id: '1', title: 'One', category: 'RRHH', featured: false, order: 1, actionable: true, partialData: false },
        { id: '2', title: 'Two', category: 'IT', featured: false, order: 2, actionable: true, partialData: false }
      ],
      'RRHH'
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe('One');
  });
});
