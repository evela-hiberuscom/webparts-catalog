import { PeopleCelebrationsRepository } from './peopleCelebrationsRepository';

describe('PeopleCelebrationsRepository', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loads same-origin json payloads and normalizes records', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        items: [
          {
            id: '1',
            displayName: 'Sofía Martín',
            photoUrl: '/sites/portal/profile/sofia.jpg',
            celebrationType: 'birthday',
            date: '2026-03-24T00:00:00.000Z'
          }
        ]
      })
    });

    const repository = new PeopleCelebrationsRepository();
    const originalFetch = window.fetch;
    window.fetch = fetchMock as never;

    try {
      const result = await repository.load({
        dataSourceTypes: ['JsonUrl'],
        jsonUrl: '/sites/portal/data/celebrations.json',
        webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/portal',
        showBirthdays: true,
        showAnniversaries: true,
        daysAhead: 14
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].displayName).toBe('Sofía Martín');
      expect(result.sourceLabel).toBe('JSON feed');
    } finally {
      window.fetch = originalFetch;
    }
  });

  it('normalizes list urls before querying SharePoint', async () => {
    const getMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        value: [
          {
            Id: 1,
            Title: 'Andrés García',
            CelebrationType: 'anniversary',
            CelebrationDate: '2026-03-27T00:00:00.000Z',
            PhotoUrl: '/sites/portal/profile/andres.jpg'
          }
        ]
      })
    });

    const repository = new PeopleCelebrationsRepository();

    const result = await repository.load({
      dataSourceTypes: ['SharePointList'],
      listTitleOrUrl: '/sites/portal/Lists/PeopleCelebrations/Forms/AllItems.aspx?view=1',
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/portal',
      showBirthdays: true,
      showAnniversaries: true,
      daysAhead: 14,
      spHttpClientConfiguration: {},
      spHttpClient: {
        get: getMock
      } as never
    });

    expect(getMock).toHaveBeenCalledTimes(1);
    expect(getMock.mock.calls[0][0]).toContain('GetList(@listUrl)');
    expect(getMock.mock.calls[0][0]).toContain(encodeURIComponent('/sites/portal/Lists/PeopleCelebrations'));
    expect(result.items[0].displayName).toBe('Andrés García');
  });

  it('rejects cross-origin json urls', async () => {
    const repository = new PeopleCelebrationsRepository();

    await expect(
      repository.load({
        dataSourceTypes: ['JsonUrl'],
        jsonUrl: 'https://evil.example.com/celebrations.json',
        webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/portal',
        showBirthdays: true,
        showAnniversaries: true,
        daysAhead: 14
      })
    ).rejects.toThrow('Only same-origin celebration feeds are allowed.');
  });
});
