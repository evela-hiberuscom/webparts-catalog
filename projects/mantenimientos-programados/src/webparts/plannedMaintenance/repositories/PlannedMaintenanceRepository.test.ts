import { PlannedMaintenanceRepository } from './PlannedMaintenanceRepository';
import type { IPlannedMaintenanceRequest } from '../models/plannedMaintenanceModels';

describe('PlannedMaintenanceRepository', () => {
  it('normalizes view URLs before using GetList', async () => {
    const get = jest.fn(async (url: string) => ({
      ok: true,
      status: 200,
      json: async () => ({
        value: [
          {
            Id: 1,
            Title: 'ERP',
            StartAt: '2026-03-31T10:00:00Z',
            EndAt: '2026-03-31T11:00:00Z',
            Impact: 'high',
            Services: 'ERP'
          }
        ]
      })
    }));

    const request: IPlannedMaintenanceRequest = {
      webPartProps: {
        title: 'Mantenimientos programados',
        description: 'Desc',
        dataSourceType: 'SharePointList',
        listTitleOrUrl: 'https://contoso.sharepoint.com/sites/demo/Lists/MaintenanceList/Forms/AllItems.aspx',
        jsonUrl: '',
        hideCompleted: true,
        maxItems: 10
      },
      hostContext: {
        spHttpClient: { get } as never,
        webUrl: 'https://contoso.sharepoint.com/sites/demo',
        siteUrl: 'https://contoso.sharepoint.com/sites/demo'
      },
      now: new Date('2026-03-30T10:00:00Z')
    };

    const repository = new PlannedMaintenanceRepository({ get } as never);
    const result = await repository.load(request);

    expect(get).toHaveBeenCalledTimes(1);
    expect(get.mock.calls[0][0]).toContain('/_api/web/GetList(@listUrl)/items');
    expect(get.mock.calls[0][0]).not.toContain('Forms/AllItems.aspx');
    expect(result.items[0]?.status).toBe('upcoming');
  });

  it('rejects cross-origin JsonUrl', async () => {
    const repository = new PlannedMaintenanceRepository({ get: jest.fn() } as never);

    await expect(
      repository.load({
        webPartProps: {
          title: 'Mantenimientos programados',
          description: 'Desc',
          dataSourceType: 'JsonUrl',
          listTitleOrUrl: 'MaintenanceList',
          jsonUrl: 'https://external.example.com/maintenance.json',
          hideCompleted: true,
          maxItems: 10
        },
        hostContext: {
          spHttpClient: { get: jest.fn() } as never,
          webUrl: 'https://contoso.sharepoint.com/sites/demo',
          siteUrl: 'https://contoso.sharepoint.com/sites/demo'
        },
        now: new Date('2026-03-30T10:00:00Z')
      })
    ).rejects.toThrow('JsonUrl no configurada o fuera del mismo origen.');
  });
});
