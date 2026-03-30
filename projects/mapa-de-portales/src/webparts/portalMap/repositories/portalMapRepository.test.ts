import { PortalMapRepository } from './portalMapRepository';
import type { IPortalMapRequest } from '../models/portalMapModels';

function createRequest(overrides: Partial<IPortalMapRequest> = {}): IPortalMapRequest {
  return {
    dataSourceType: 'SharePointList',
    listTitleOrUrl: 'PortalMapList',
    viewMode: 'tree',
    maxDepth: 4,
    webUrl: 'https://contoso.sharepoint.com/sites/intranet',
    ...overrides
  };
}

describe('PortalMapRepository', () => {
  it('returns static nodes for StaticConfig', async () => {
    const repository = new PortalMapRepository();

    const result = await repository.load(createRequest({ dataSourceType: 'StaticConfig' }));

    expect(result.items.length).toBeGreaterThan(0);
  });

  it('rejects JsonUrl values from another origin', async () => {
    const repository = new PortalMapRepository();

    await expect(
      repository.load(
        createRequest({
          dataSourceType: 'JsonUrl',
          listTitleOrUrl: 'https://example.com/portal-map.json'
        })
      )
    ).rejects.toThrow('JsonUrl must be same-origin or relative');
  });

  it('loads SharePoint list data using normalized list URLs', async () => {
    const fetcher = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        value: [
          {
            Id: 'hub-1',
            Title: 'Hub Comercial',
            NodeType: 'hub',
            OpenUrl: '/sites/sales-hub'
          }
        ]
      })
    });
    const repository = new PortalMapRepository(fetcher);

    const result = await repository.load(
      createRequest({
        listTitleOrUrl: '/sites/intranet/Lists/PortalMap/Forms/AllItems.aspx'
      })
    );

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0][0]).toContain('GetList(@listUrl)');
    expect(result.items[0].title).toBe('Hub Comercial');
  });
});
