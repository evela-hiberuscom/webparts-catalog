import type { IOnboardingChecklistRequest } from '../models/onboardingChecklistModels';
import { OnboardingChecklistService } from './onboardingChecklistService';

function buildRequest(overrides: Partial<IOnboardingChecklistRequest> = {}): IOnboardingChecklistRequest {
  return {
    title: 'Checklist de onboarding',
    description: 'Checklist secuencial',
    dataSourceType: 'StaticConfig',
    webUrl: 'https://contoso.sharepoint.com/sites/onboarding',
    listTitleOrUrl: 'OnboardingChecklistList',
    jsonUrl: '',
    staticConfigJson: '',
    defaultVariant: 'all',
    defaultPhase: 'all',
    userDisplayName: 'Ada Lovelace',
    ...overrides
  };
}

describe('OnboardingChecklistService', () => {
  it('resolves a ready snapshot when data exists', async () => {
    const repository = {
      loadChecklist: jest.fn(async () => ({
        items: [
          {
            id: '1',
            title: 'Revisar bienvenida',
            phase: 'Inicio',
            variant: 'General',
            mandatory: true,
            order: 1,
            partialData: false
          }
        ],
        sourceLabel: 'SharePoint',
        notes: [],
        hasPartialData: false
      }))
    };

    const service = new OnboardingChecklistService(repository as never);
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

    const service = new OnboardingChecklistService(repository as never);
    const snapshot = await service.resolve(buildRequest({ dataSourceType: 'SharePointList' }));

    expect(snapshot.status).toBe('empty');
  });

  it('surfaces repository errors', async () => {
    const repository = {
      loadChecklist: jest.fn(async () => {
        throw new Error('boom');
      })
    };

    const service = new OnboardingChecklistService(repository as never);
    const snapshot = await service.resolve(buildRequest({ dataSourceType: 'JsonUrl' }));

    expect(snapshot.status).toBe('error');
    expect(snapshot.errorMessage).toContain('boom');
  });

  it('keeps partial data state when repository flags partial items', async () => {
    const repository = {
      loadChecklist: jest.fn(async () => ({
        items: [
          {
            id: '1',
            title: 'Completar perfil',
            phase: 'Inicio',
            variant: 'Nuevo ingreso',
            mandatory: true,
            order: 1,
            partialData: true
          }
        ],
        sourceLabel: 'Static',
        notes: ['Datos parciales'],
        hasPartialData: true
      }))
    };

    const service = new OnboardingChecklistService(repository as never);
    const snapshot = await service.resolve(buildRequest());

    expect(snapshot.status).toBe('partialData');
    expect(snapshot.hasPartialData).toBe(true);
  });
});
