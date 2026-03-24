import { AlertsRepository } from './alertsRepository';
import type { SPHttpClient } from '@microsoft/sp-http';

describe('AlertsRepository', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loads alerts from a SharePoint list title', async () => {
    const get = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        value: [
          {
            Id: 1,
            Title: 'Incidencia VPN',
            Severity: 'critical',
            Message: 'La VPN presenta degradación',
            StartAt: '2026-03-23T11:00:00Z',
            EndAt: '2026-03-23T13:00:00Z',
            CtaUrl: '/sites/it/status/vpn',
            Priority: 1
          }
        ]
      })
    });
    const repository = new AlertsRepository({ get } as unknown as Pick<SPHttpClient, 'get'>, 'https://contoso.sharepoint.com/sites/portal');

    const result = await repository.load({
      dataSourceType: 'SharePointList',
      listTitleOrUrl: 'AlertsList',
      maxAlerts: 3,
      dismissible: false,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/portal'
    });

    expect(get).toHaveBeenCalledTimes(1);
    expect(get.mock.calls[0][0]).toContain("GetByTitle('AlertsList')");
    expect(result.items[0].title).toBe('Incidencia VPN');
    expect(result.sourceLabel).toBe('SharePointListTitle');
  });

  it('loads alerts from a same-origin list url', async () => {
    const get = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ value: [] })
    });
    const repository = new AlertsRepository({ get } as unknown as Pick<SPHttpClient, 'get'>, 'https://contoso.sharepoint.com/sites/portal');

    await repository.load({
      dataSourceType: 'SharePointList',
      listTitleOrUrl: '/sites/portal/Lists/Alerts',
      maxAlerts: 3,
      dismissible: false,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/portal'
    });

    expect(get.mock.calls[0][0]).toContain('GetList(@listUrl)');
  });

  it('normalizes SharePoint view urls to the list root', async () => {
    const get = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ value: [] })
    });
    const repository = new AlertsRepository({ get } as unknown as Pick<SPHttpClient, 'get'>, 'https://contoso.sharepoint.com/sites/portal');

    await repository.load({
      dataSourceType: 'SharePointList',
      listTitleOrUrl: '/sites/portal/Lists/Alerts/Forms/AllItems.aspx',
      maxAlerts: 3,
      dismissible: false,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/portal'
    });

    expect(get.mock.calls[0][0]).toContain("%2Fsites%2Fportal%2FLists%2FAlerts");
    expect(get.mock.calls[0][0]).not.toContain('AllItems.aspx');
  });

  it('parses static config and rejects malformed json', async () => {
    const repository = new AlertsRepository({ get: jest.fn() } as unknown as Pick<SPHttpClient, 'get'>, 'https://contoso.sharepoint.com/sites/portal');

    const result = await repository.load({
      dataSourceType: 'StaticConfig',
      listTitleOrUrl: 'AlertsList',
      staticConfigJson: JSON.stringify({
        items: [
          {
            id: 'a1',
            severity: 'info',
            title: 'Mantenimiento',
            message: 'Se realizará mantenimiento',
            startAt: '2026-03-23T10:00:00Z',
            endAt: '2026-03-23T14:00:00Z',
            ctaUrl: '/sites/it/maintenance',
            priority: 3
          }
        ]
      }),
      maxAlerts: 3,
      dismissible: false,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/portal'
    });

    expect(result.items).toHaveLength(1);

    await expect(
      repository.load({
        dataSourceType: 'StaticConfig',
        listTitleOrUrl: 'AlertsList',
        staticConfigJson: '{malformed',
        maxAlerts: 3,
        dismissible: false,
        webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/portal'
      })
    ).rejects.toThrow('StaticConfig JSON is malformed.');
  });

  it('rejects external json urls', async () => {
    const repository = new AlertsRepository({ get: jest.fn() } as unknown as Pick<SPHttpClient, 'get'>, 'https://contoso.sharepoint.com/sites/portal');

    await expect(
      repository.load({
        dataSourceType: 'JsonUrl',
        listTitleOrUrl: 'AlertsList',
        jsonUrl: 'https://example.com/alerts.json',
        maxAlerts: 3,
        dismissible: false,
        webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/portal'
      })
    ).rejects.toThrow('JsonUrl must be a same-origin or relative URL.');
  });

  it('drops unsafe CTA urls from payload records and marks the result as partial', async () => {
    const repository = new AlertsRepository({ get: jest.fn() } as unknown as Pick<SPHttpClient, 'get'>, 'https://contoso.sharepoint.com/sites/portal');

    const result = await repository.load({
      dataSourceType: 'StaticConfig',
      listTitleOrUrl: 'AlertsList',
      staticConfigJson: JSON.stringify({
        items: [
          {
            id: 'a1',
            severity: 'critical',
            title: 'Incidencia VPN',
            message: 'La VPN presenta degradación',
            startAt: '2026-03-23T11:00:00Z',
            endAt: '2026-03-23T13:00:00Z',
            ctaUrl: 'https://example.com/incident',
            priority: 1
          }
        ]
      }),
      maxAlerts: 3,
      dismissible: false,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/portal'
    });

    expect(result.items[0].ctaUrl).toBeUndefined();
    expect(result.hasPartialData).toBe(true);
  });
});
