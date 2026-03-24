import { QuickActionsRepository } from './quickActionsRepository';

function buildRequest(overrides: Partial<Record<string, unknown>> = {}): {
  title: string;
  subtitle: string;
  dataSourceType: 'SharePointList' | 'JsonUrl' | 'StaticConfig';
  listTitleOrUrl: string;
  jsonUrl: string;
  staticActionsJson: string;
  defaultCategory: string;
  maxItems: number;
  webUrl: string;
  userDisplayName: string;
} {
  return {
    title: 'Centro de acciones rápidas',
    subtitle: 'Accesos corporativos más usados',
    dataSourceType: 'StaticConfig' as const,
    listTitleOrUrl: '',
    jsonUrl: '',
    staticActionsJson: '',
    defaultCategory: '',
    maxItems: 12,
    webUrl: 'https://contoso.sharepoint.com/sites/intranet',
    userDisplayName: 'Ada Lovelace',
    ...overrides
  };
}

describe('QuickActionsRepository', () => {
  it('loads actions from a SharePoint list title', async () => {
    const get = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        value: [
          {
            Id: 1,
            Title: 'Abrir soporte',
            Description: 'Ir al canal de soporte',
            Category: 'IT',
            Icon: 'Headset',
            Priority: 1,
            OpenUrl: '/sites/it/support'
          }
        ]
      })
    });

    const repository = new QuickActionsRepository({ get } as never, jest.fn() as never);
    const result = await repository.load(
      buildRequest({
        dataSourceType: 'SharePointList',
        listTitleOrUrl: 'QuickActionsList'
      }) as never
    );

    expect(get.mock.calls[0][0]).toContain("/_api/web/lists/getbytitle('QuickActionsList')/items");
    expect(result.items[0].title).toBe('Abrir soporte');
    expect(result.sourceLabel).toBe('SharePointListTitle');
  });

  it('normalizes SharePoint view urls to the list root', async () => {
    const get = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ value: [] })
    });

    const repository = new QuickActionsRepository({ get } as never, jest.fn() as never);
    await repository.load(
      buildRequest({
        dataSourceType: 'SharePointList',
        listTitleOrUrl: '/sites/intranet/Lists/QuickActions/Forms/AllItems.aspx'
      }) as never
    );

    expect(get.mock.calls[0][0]).toContain("%2Fsites%2Fintranet%2FLists%2FQuickActions");
    expect(get.mock.calls[0][0]).not.toContain('AllItems.aspx');
  });

  it('rejects cross-origin json urls', async () => {
    const repository = new QuickActionsRepository({ get: jest.fn() } as never, jest.fn() as never);

    await expect(
      repository.load(
        buildRequest({
          dataSourceType: 'JsonUrl',
          jsonUrl: 'https://evil.example/actions.json'
        }) as never
      )
    ).rejects.toThrow('JsonUrl must be same-origin or relative');
  });

  it('falls back to sample actions when static config is empty', async () => {
    const repository = new QuickActionsRepository({ get: jest.fn() } as never, jest.fn() as never);
    const result = await repository.load(
      buildRequest({
        dataSourceType: 'StaticConfig',
        staticActionsJson: ''
      }) as never
    );

    expect(result.items.length).toBeGreaterThan(0);
    expect(result.notes[0]).toContain('catálogo de ejemplo');
  });
});
