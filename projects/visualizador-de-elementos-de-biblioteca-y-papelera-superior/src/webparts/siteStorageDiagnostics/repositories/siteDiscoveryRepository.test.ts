import { SiteDiscoveryRepository } from './siteDiscoveryRepository';

describe('SiteDiscoveryRepository', () => {
  it('parses search results into discovered sites', async () => {
    const get = jest.fn(async () => ({
      ok: true,
      status: 200,
      headers: { get: () => undefined },
      json: async () => ({
        PrimaryQueryResult: {
          RelevantResults: {
            TotalRows: 2,
            Table: {
              Rows: [
                {
                  Cells: [
                    { Key: 'SPSiteURL', Value: 'https://contoso.sharepoint.com/sites/hr' },
                    { Key: 'SiteTitle', Value: 'HR Portal' }
                  ]
                },
                {
                  Cells: [
                    { Key: 'SPSiteURL', Value: 'https://contoso.sharepoint.com/sites/finance' },
                    { Key: 'SiteTitle', Value: 'Finance' }
                  ]
                }
              ]
            }
          }
        }
      })
    }));

    const repo = new SiteDiscoveryRepository({
      spHttpClient: { get, post: jest.fn() },
      currentSiteUrl: 'https://contoso.sharepoint.com/sites/admin'
    });

    const sites = await repo.discoverSites();

    expect(sites).toHaveLength(2);
    expect(sites[0].url).toBe('https://contoso.sharepoint.com/sites/hr');
    expect(sites[0].title).toBe('HR Portal');
    expect(sites[1].url).toBe('https://contoso.sharepoint.com/sites/finance');
  });

  it('deduplicates sites by URL', async () => {
    const get = jest.fn(async () => ({
      ok: true,
      status: 200,
      headers: { get: () => undefined },
      json: async () => ({
        PrimaryQueryResult: {
          RelevantResults: {
            TotalRows: 2,
            Table: {
              Rows: [
                {
                  Cells: [
                    { Key: 'SPSiteURL', Value: 'https://contoso.sharepoint.com/sites/hr' },
                    { Key: 'SiteTitle', Value: 'HR Portal' }
                  ]
                },
                {
                  Cells: [
                    { Key: 'SPSiteURL', Value: 'https://contoso.sharepoint.com/sites/HR' },
                    { Key: 'SiteTitle', Value: 'HR Portal Duplicate' }
                  ]
                }
              ]
            }
          }
        }
      })
    }));

    const repo = new SiteDiscoveryRepository({
      spHttpClient: { get, post: jest.fn() },
      currentSiteUrl: 'https://contoso.sharepoint.com'
    });

    const sites = await repo.discoverSites();
    expect(sites).toHaveLength(1);
  });

  it('throws on HTTP error', async () => {
    const get = jest.fn(async () => ({
      ok: false,
      status: 500,
      headers: { get: () => undefined },
      json: async () => ({})
    }));

    const repo = new SiteDiscoveryRepository({
      spHttpClient: { get, post: jest.fn() },
      currentSiteUrl: 'https://contoso.sharepoint.com'
    });

    await expect(repo.discoverSites()).rejects.toThrow('Search API returned HTTP 500');
  });
});
