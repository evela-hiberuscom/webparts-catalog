import { InternalServicesStatusService } from './internalServicesStatusService';
import type { IInternalServiceStatusRepository } from '../models/internalServicesStatusModels';

describe('InternalServicesStatusService', () => {
  it('returns ready state for valid critical services without forcing partial mode', async () => {
    const repository: IInternalServiceStatusRepository = {
      loadRecords: jest.fn().mockResolvedValue([
        {
          id: 'svc-1',
          name: 'Núcleo de identidad',
          status: 'critical',
          criticality: 'high',
          summary: 'Caída en curso',
          updatedAt: '2026-03-23T08:00:00.000Z',
          domain: 'Plataforma'
        }
      ])
    };

    const service = new InternalServicesStatusService(repository);
    const result = await service.loadSnapshot({
      dataSourceType: 'StaticConfig',
      listTitleOrUrl: 'ServiceStatusList',
      showOnlyCritical: true,
      staleThresholdMinutes: 120
    });

    expect(result.status).toBe('ready');
    expect(result.hasPartialData).toBe(false);
    expect(result.sourceCount).toBe(1);
    expect(result.items).toHaveLength(1);
  });

  it('returns partial data when a source item lacks mandatory fields', async () => {
    const repository: IInternalServiceStatusRepository = {
      loadRecords: jest.fn().mockResolvedValue([
        {
          id: 'svc-2',
          name: 'Integración financiera',
          status: 'warning',
          criticality: 'medium',
          summary: '',
          updatedAt: undefined,
          domain: 'Finanzas'
        }
      ])
    };

    const service = new InternalServicesStatusService(repository);
    const result = await service.loadSnapshot({
      dataSourceType: 'StaticConfig',
      listTitleOrUrl: 'ServiceStatusList',
      showOnlyCritical: false,
      staleThresholdMinutes: 30
    });

    expect(result.status).toBe('partialData');
    expect(result.hasPartialData).toBe(true);
    expect(result.staleCount).toBe(0);
  });

  it('keeps unknown as a valid ready-state value when mandatory fields exist', async () => {
    const repository: IInternalServiceStatusRepository = {
      loadRecords: jest.fn().mockResolvedValue([
        {
          id: 'svc-4',
          name: 'Bus de integración',
          status: 'unknown',
          criticality: 'unknown',
          summary: 'Sin telemetría consolidada todavía.',
          updatedAt: '2026-03-23T12:00:00.000Z',
          domain: 'Integraciones'
        }
      ])
    };

    const service = new InternalServicesStatusService(repository);
    const result = await service.loadSnapshot({
      dataSourceType: 'StaticConfig',
      listTitleOrUrl: 'ServiceStatusList',
      showOnlyCritical: false,
      staleThresholdMinutes: 30
    });

    expect(result.status).toBe('ready');
    expect(result.hasPartialData).toBe(false);
    expect(result.items[0].status).toBe('unknown');
    expect(result.items[0].isPartial).toBe(false);
  });

  it('returns empty state when no items survive the filter', async () => {
    const repository: IInternalServiceStatusRepository = {
      loadRecords: jest.fn().mockResolvedValue([
        {
          id: 'svc-3',
          name: 'Portal RRHH',
          status: 'ok',
          criticality: 'low',
          summary: 'Operativo',
          updatedAt: '2026-03-23T09:00:00.000Z',
          domain: 'RRHH'
        }
      ])
    };

    const service = new InternalServicesStatusService(repository);
    const result = await service.loadSnapshot({
      dataSourceType: 'StaticConfig',
      listTitleOrUrl: 'ServiceStatusList',
      showOnlyCritical: true,
      staleThresholdMinutes: 30
    });

    expect(result.status).toBe('empty');
    expect(result.hasPartialData).toBe(false);
    expect(result.items).toHaveLength(0);
  });
});
