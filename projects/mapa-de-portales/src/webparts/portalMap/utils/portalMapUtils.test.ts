import {
  buildPortalHierarchy,
  buildPortalMapItemsEndpoint,
  createStaticPortalNodes,
  parsePortalNode
} from './portalMapUtils';

describe('portalMapUtils', () => {
  it('normalizes SharePoint list view URLs before building the endpoint', () => {
    const endpoint = buildPortalMapItemsEndpoint(
      'https://contoso.sharepoint.com/sites/intranet',
      '/sites/intranet/Lists/PortalMap/Forms/AllItems.aspx'
    );

    expect(endpoint).toContain('GetList(@listUrl)');
    expect(endpoint).toContain(encodeURIComponent('/sites/intranet/Lists/PortalMap'));
  });

  it('marks unsafe links as partial data', () => {
    const node = parsePortalNode(
      {
        Id: 'node-1',
        Title: 'Portal inseguro',
        NodeType: 'site',
        OpenUrl: 'ftp://example.invalid/portal'
      },
      0
    );

    expect(node.openUrl).toBeUndefined();
    expect(node.partialData).toBe(true);
  });

  it('detects orphan and cycle conditions in the hierarchy', () => {
    const items = [
      parsePortalNode({ Id: 'a', Title: 'A', NodeType: 'hub', ParentId: 'c', OpenUrl: '/a' }, 0),
      parsePortalNode({ Id: 'b', Title: 'B', NodeType: 'site', ParentId: 'a', OpenUrl: '/b' }, 1),
      parsePortalNode({ Id: 'c', Title: 'C', NodeType: 'site', ParentId: 'b', OpenUrl: '/c' }, 2),
      parsePortalNode({ Id: 'd', Title: 'D', NodeType: 'area', ParentId: 'missing', OpenUrl: '/d' }, 3)
    ];

    const hierarchy = buildPortalHierarchy(items, 4);

    expect(hierarchy.hasCycles).toBe(true);
    expect(hierarchy.hasOrphans).toBe(true);
    expect(hierarchy.roots.length).toBeGreaterThan(0);
  });

  it('provides a static configuration fallback dataset', () => {
    const items = createStaticPortalNodes();

    expect(items.length).toBeGreaterThan(3);
    expect(items.some((item) => item.nodeType === 'hub')).toBe(true);
  });
});
