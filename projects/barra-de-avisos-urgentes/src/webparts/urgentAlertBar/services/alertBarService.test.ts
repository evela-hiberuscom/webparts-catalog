import type { IAlertBarRequest, IAlertBarViewModel } from '../models/alertModels';
import { AlertBarService } from './alertBarService';

describe('AlertBarService', () => {
  it('filters inactive alerts and keeps partial data state', async () => {
    const repository = {
      load: jest.fn().mockResolvedValue({
        sourceLabel: 'SharePointListTitle',
        hasPartialData: false,
        items: [
          {
            id: 'critical',
            severity: 'critical',
            title: 'Incidencia VPN',
            message: 'La VPN está degradada',
            startAt: '2026-03-23T11:00:00Z',
            endAt: '2026-03-23T13:00:00Z',
            ctaUrl: '/sites/it/status/vpn',
            priority: 2
          },
          {
            id: 'expired',
            severity: 'warning',
            title: 'Aviso vencido',
            message: 'Este aviso ya no está vigente',
            startAt: '2026-03-22T11:00:00Z',
            endAt: '2026-03-23T10:00:00Z',
            ctaUrl: '/sites/it/status/old',
            priority: 1
          },
          {
            id: 'partial',
            severity: 'unknown',
            title: 'Severidad no clasificada',
            startAt: '2026-03-23T11:00:00Z',
            endAt: '2026-03-23T13:00:00Z',
            ctaUrl: '/sites/it/status/unknown'
          }
        ]
      } as IAlertBarViewModel)
    };

    const service = new AlertBarService(repository as never);
    const request: IAlertBarRequest = {
      dataSourceType: 'SharePointList',
      listTitleOrUrl: 'AlertsList',
      maxAlerts: 2,
      dismissible: false,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/portal'
    };

    const result = await service.load(request, new Date('2026-03-23T12:00:00Z'));

    expect(repository.load).toHaveBeenCalledWith(request);
    expect(result.items).toHaveLength(2);
    expect(result.items[0].id).toBe('critical');
    expect(result.items[1].id).toBe('partial');
    expect(result.hasPartialData).toBe(true);
  });
});
