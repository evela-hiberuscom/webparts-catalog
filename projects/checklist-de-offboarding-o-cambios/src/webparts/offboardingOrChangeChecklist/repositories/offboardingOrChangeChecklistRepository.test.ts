import type { IOffboardingOrChangeChecklistRequest } from '../models/offboardingOrChangeChecklistModels';
import { OffboardingOrChangeChecklistRepository } from './offboardingOrChangeChecklistRepository';

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

describe('OffboardingOrChangeChecklistRepository', () => {
  it('loads checklist steps from a SharePoint list title', async () => {
    const fetcher = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        value: [
          {
            Id: 1,
            Title: 'Cerrar accesos',
            Description: 'VPN y correo',
            Scenario: 'offboarding',
            Phase: 'Seguridad',
            Critical: true,
            Priority: 1,
            RelatedUrl: '/sites/it/security'
          }
        ]
      })
    }));

    const repository = new OffboardingOrChangeChecklistRepository(fetcher as never);
    const result = await repository.loadChecklist(
      buildRequest({
        dataSourceType: 'SharePointList'
      })
    );

    expect(fetcher).toHaveBeenCalledWith(
      "https://contoso.sharepoint.com/sites/portal/_api/web/lists/getbytitle('OffboardingChecklistList')/items?$select=Id,Title,Description,Scenario,Phase,Critical,Priority,RelatedUrl,RelatedLabel",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json'
        })
      })
    );
    expect(result.items[0].title).toBe('Cerrar accesos');
    expect(result.items[0].critical).toBe(true);
  });

  it('normalizes SharePoint view urls to the list root', async () => {
    const fetcher = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ value: [] })
    }));

    const repository = new OffboardingOrChangeChecklistRepository(fetcher as never);
    await repository.loadChecklist(
      buildRequest({
        dataSourceType: 'SharePointList',
        listTitleOrUrl: '/sites/portal/Lists/OffboardingChecklist/Forms/AllItems.aspx'
      })
    );

    const firstCall = fetcher.mock.calls[0] as unknown as [string, RequestInit?];
    expect(firstCall[0]).toContain('%2Fsites%2Fportal%2FLists%2FOffboardingChecklist');
    expect(firstCall[0]).not.toContain('AllItems.aspx');
  });

  it('uses the inferred checklist for empty static config', async () => {
    const repository = new OffboardingOrChangeChecklistRepository((jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({})
    })) as never));
    const result = await repository.loadChecklist(buildRequest());

    expect(result.items.length).toBeGreaterThan(0);
    expect(result.hasPartialData).toBe(true);
  });

  it('rejects cross-origin json urls', async () => {
    const repository = new OffboardingOrChangeChecklistRepository(jest.fn() as never);

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
