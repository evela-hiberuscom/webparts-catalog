import { PlannedMaintenanceService } from './PlannedMaintenanceService';
import type { IPlannedMaintenanceRequest } from '../models/plannedMaintenanceModels';

describe('PlannedMaintenanceService', () => {
  const request: IPlannedMaintenanceRequest = {
    webPartProps: {
      title: 'Mantenimientos programados',
      description: 'Desc',
      dataSourceType: 'SharePointList',
      listTitleOrUrl: 'MaintenanceList',
      jsonUrl: '',
      hideCompleted: true,
      maxItems: 10
    },
    hostContext: {
      spHttpClient: {} as never,
      webUrl: 'https://contoso.sharepoint.com/sites/demo',
      siteUrl: 'https://contoso.sharepoint.com/sites/demo'
    },
    now: new Date('2026-03-30T10:00:00Z')
  };

  it('filters completed items when hideCompleted is enabled', async () => {
    const repository = {
      load: jest.fn(async () => ({
        items: [
          {
            id: '1',
            title: 'In progress',
            startAt: '2026-03-30T09:00:00Z',
            endAt: '2026-03-30T11:00:00Z',
            impact: 'high',
            services: ['ERP'],
            status: 'inProgress',
            partialData: false
          },
          {
            id: '2',
            title: 'Completed',
            startAt: '2026-03-29T09:00:00Z',
            endAt: '2026-03-29T11:00:00Z',
            impact: 'low',
            services: ['CRM'],
            status: 'completed',
            partialData: false
          }
        ],
        sourceLabel: 'SharePointList: MaintenanceList',
        hasPartialData: false,
        notes: []
      }))
    };
    const service = new PlannedMaintenanceService(repository as never);

    const result = await service.load(request);

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.title).toBe('In progress');
    expect(result.counts.completed).toBe(1);
  });

  it('marks partial data in the resulting state', async () => {
    const repository = {
      load: jest.fn(async () => ({
        items: [
          {
            id: '1',
            title: 'Unknown',
            startAt: '2026-03-30T09:00:00Z',
            endAt: undefined,
            impact: 'unknown',
            services: [],
            status: 'unknown',
            partialData: true
          }
        ],
        sourceLabel: 'JsonUrl: /maintenance.json',
        hasPartialData: true,
        notes: []
      }))
    };
    const service = new PlannedMaintenanceService(repository as never);

    const result = await service.load({
      ...request,
      webPartProps: {
        ...request.webPartProps,
        hideCompleted: false
      }
    });

    expect(result.state).toBe('partialData');
    expect(result.hasPartialData).toBe(true);
  });
});
