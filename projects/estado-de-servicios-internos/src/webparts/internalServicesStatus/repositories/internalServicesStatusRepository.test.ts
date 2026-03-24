import { createInternalServicesStatusRepository } from './internalServicesStatusRepository';

describe('internalServicesStatusRepository', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('returns the static configuration sample when requested', async () => {
    const repository = createInternalServicesStatusRepository('https://contoso.sharepoint.com/sites/intranet');
    const records = await repository.loadRecords({
      dataSourceType: 'StaticConfig',
      listTitleOrUrl: 'ServiceStatusList',
      showOnlyCritical: false,
      staleThresholdMinutes: 60
    });

    expect(records.length).toBeGreaterThan(0);
    expect(records[0].name).toBeDefined();
  });

  it('loads same-origin JSON data and parses a services payload', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        services: [{ id: 'svc-1', name: 'Portal', status: 'ok', summary: 'OK' }]
      })
    } as never);

    const repository = createInternalServicesStatusRepository('https://contoso.sharepoint.com/sites/intranet');
    const records = await repository.loadRecords({
      dataSourceType: 'JsonUrl',
      listTitleOrUrl: '/sites/intranet/data/services.json',
      showOnlyCritical: false,
      staleThresholdMinutes: 60
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://contoso.sharepoint.com/sites/intranet/data/services.json',
      expect.objectContaining({ credentials: 'same-origin' })
    );
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe('svc-1');
  });

  it('rejects cross-origin JSON sources', async () => {
    const repository = createInternalServicesStatusRepository('https://contoso.sharepoint.com/sites/intranet');

    await expect(
      repository.loadRecords({
        dataSourceType: 'JsonUrl',
        listTitleOrUrl: 'https://evil.example/data.json',
        showOnlyCritical: false,
        staleThresholdMinutes: 60
      })
    ).rejects.toThrow('JsonUrl must be same-origin or relative');
  });

  it('queries SharePoint list items and normalizes records', async () => {
    const response = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        value: [
          {
            Id: 99,
            Title: 'Plataforma interna',
            status: 'maintenance',
            criticality: 'medium',
            summary: 'Mantenimiento programado',
            UpdatedAt: '2026-03-23T11:00:00.000Z',
            DetailUrl: '/sites/intranet/status',
            Domain: 'Plataforma'
          }
        ]
      })
    };
    globalThis.fetch = jest.fn().mockResolvedValue(response as never);

    const repository = createInternalServicesStatusRepository('https://contoso.sharepoint.com/sites/intranet');
    const records = await repository.loadRecords({
      dataSourceType: 'SharePointList',
      listTitleOrUrl: "ServiceStatusList",
      showOnlyCritical: false,
      staleThresholdMinutes: 60
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/_api/web/lists/getbytitle('ServiceStatusList')/items?"),
      expect.objectContaining({
        credentials: 'same-origin',
        headers: expect.objectContaining({
          Accept: 'application/json;odata=nometadata'
        })
      })
    );
    expect(records[0].title).toBe('Plataforma interna');
    expect(records[0].domain).toBe('Plataforma');
  });
});
