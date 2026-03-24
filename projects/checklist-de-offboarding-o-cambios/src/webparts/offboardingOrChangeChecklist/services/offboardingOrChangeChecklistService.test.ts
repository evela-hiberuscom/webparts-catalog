import type { IOffboardingOrChangeChecklistRequest } from '../models/offboardingOrChangeChecklistModels';
import { OffboardingOrChangeChecklistService } from './offboardingOrChangeChecklistService';

function buildRequest(overrides: Partial<IOffboardingOrChangeChecklistRequest> = {}): IOffboardingOrChangeChecklistRequest {
  return {
    title: 'Checklist de offboarding o cambios',
    description: 'Organiza pasos de salida, transferencia o cambio organizativo.',
    dataSourceType: 'StaticConfig',
    webUrl: 'https://contoso.sharepoint.com/sites/portal',
    listTitleOrUrl: 'OffboardingChecklistList',
    jsonUrl: '',
    staticConfigJson: '',
    defaultScenario: 'generic',
    defaultPhase: '',
    userDisplayName: 'Ada Lovelace',
    ...overrides
  };
}

describe('OffboardingOrChangeChecklistService', () => {
  it('resolves a ready snapshot when data exists', async () => {
    const repository = {
      loadChecklist: jest.fn(async () => ({
        items: [
          {
            id: '1',
            title: 'Cerrar accesos',
            scenario: 'offboarding',
            phase: 'Seguridad',
            critical: true,
            priority: 1,
            partialData: false
          }
        ],
        sourceLabel: 'SharePoint',
        notes: [],
        hasPartialData: false
      }))
    };

    const service = new OffboardingOrChangeChecklistService(repository as never);
    const snapshot = await service.resolve(buildRequest({ dataSourceType: 'SharePointList' }));

    expect(snapshot.status).toBe('ready');
    expect(snapshot.items).toHaveLength(1);
    expect(snapshot.sourceLabel).toBe('SharePoint');
  });

  it('returns empty when the source has no steps', async () => {
    const repository = {
      loadChecklist: jest.fn(async () => ({
        items: [],
        sourceLabel: 'SharePoint',
        notes: [],
        hasPartialData: false
      }))
    };

    const service = new OffboardingOrChangeChecklistService(repository as never);
    const snapshot = await service.resolve(buildRequest({ dataSourceType: 'SharePointList' }));

    expect(snapshot.status).toBe('empty');
  });

  it('surfaces repository errors', async () => {
    const repository = {
      loadChecklist: jest.fn(async () => {
        throw new Error('boom');
      })
    };

    const service = new OffboardingOrChangeChecklistService(repository as never);
    const snapshot = await service.resolve(buildRequest({ dataSourceType: 'JsonUrl' }));

    expect(snapshot.status).toBe('error');
    expect(snapshot.errorMessage).toContain('boom');
  });
});
