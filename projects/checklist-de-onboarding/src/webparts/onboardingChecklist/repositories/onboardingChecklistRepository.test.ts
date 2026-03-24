import type { IOnboardingChecklistRequest } from '../models/onboardingChecklistModels';
import { OnboardingChecklistRepository } from './onboardingChecklistRepository';

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

describe('OnboardingChecklistRepository', () => {
  it('loads checklist steps from a SharePoint list title', async () => {
    const fetcher = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        value: [
          {
            Id: 1,
            Title: 'Revisar bienvenida',
            Phase: 'Inicio',
            Variant: 'General',
            Mandatory: true,
            Order: 1,
            RelatedUrl: '/sites/onboarding/Documentos/Bienvenida'
          }
        ]
      })
    }));

    const repository = new OnboardingChecklistRepository(fetcher as never);
    const result = await repository.loadChecklist(
      buildRequest({
        dataSourceType: 'SharePointList'
      })
    );

    expect(fetcher).toHaveBeenCalledWith(
      "https://contoso.sharepoint.com/sites/onboarding/_api/web/lists/getbytitle('OnboardingChecklistList')/items?$select=Id,Title,Description,Phase,Variant,Mandatory,Order,RelatedUrl,RelatedLabel",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json'
        })
      })
    );
    expect(result.items[0].title).toBe('Revisar bienvenida');
    expect(result.items[0].mandatory).toBe(true);
  });

  it('normalizes SharePoint view urls to the list root', async () => {
    const fetcher = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ value: [] })
    }));

    const repository = new OnboardingChecklistRepository(fetcher as never);
    await repository.loadChecklist(
      buildRequest({
        dataSourceType: 'SharePointList',
        listTitleOrUrl: '/sites/onboarding/Lists/OnboardingChecklist/Forms/AllItems.aspx'
      })
    );

    const firstCall = fetcher.mock.calls[0] as unknown as [string, RequestInit?];
    expect(firstCall[0]).toContain('%2Fsites%2Fonboarding%2FLists%2FOnboardingChecklist');
    expect(firstCall[0]).not.toContain('AllItems.aspx');
  });

  it('returns empty state for blank static config', async () => {
    const repository = new OnboardingChecklistRepository(jest.fn() as never);
    const result = await repository.loadChecklist(buildRequest());

    expect(result.items).toHaveLength(0);
    expect(result.notes).toContain('Configuracion local vacia.');
  });

  it('rejects cross-origin json urls', async () => {
    const repository = new OnboardingChecklistRepository(jest.fn() as never);

    await expect(
      repository.loadChecklist(
        buildRequest({
          dataSourceType: 'JsonUrl',
          jsonUrl: 'https://example.com/checklist.json'
        })
      )
    ).rejects.toThrow('same-origin');
  });
});
