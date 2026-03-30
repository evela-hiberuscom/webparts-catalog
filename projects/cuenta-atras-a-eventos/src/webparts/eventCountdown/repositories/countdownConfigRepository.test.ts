jest.mock('EventCountdownWebPartStrings', () => jest.requireActual('../testSupport/mockEventCountdownStrings').mockEventCountdownStrings, {
  virtual: true
});

import { CountdownConfigRepository } from './countdownConfigRepository';

describe('CountdownConfigRepository', () => {
  const webUrl = 'https://contoso.sharepoint.com/sites/portal';

  it('loads static configuration without calling fetch', async () => {
    const fetcher = jest.fn();
    const repository = new CountdownConfigRepository(fetcher as never);

    const result = await repository.load({
      sourceType: 'StaticConfig',
      eventTitle: 'Lanzamiento Q2',
      targetDate: '2026-04-01T09:00:00Z',
      subtitle: 'Campaña',
      detailUrl: 'https://contoso.sharepoint.com/sites/portal/SitePages/evento.aspx',
      showCompleted: false,
      webUrl,
      refreshIntervalSeconds: 60
    });

    expect(fetcher).not.toHaveBeenCalled();
    expect(result.item?.title).toBe('Lanzamiento Q2');
    expect(result.sourceLabel).toBe('Configuración estática');
  });

  it('normalizes a SharePoint list view URL before requesting items', async () => {
    const fetcher = jest.fn(async (url: string) => ({
      ok: true,
      status: 200,
      json: async () => ({
        value: [
          {
            Title: 'Lanzamiento Q2',
            TargetDate: '2026-04-01T09:00:00Z',
            Subtitle: 'Campaña Q2',
            DetailUrl: 'https://contoso.sharepoint.com/sites/portal/SitePages/evento.aspx'
          }
        ]
      })
    }));

    const repository = new CountdownConfigRepository(fetcher as never);

    const result = await repository.load({
      sourceType: 'SharePointList',
      eventTitle: 'Cuenta atrás a eventos',
      targetDate: '2026-04-01T09:00:00Z',
      showCompleted: false,
      listTitleOrUrl: '/sites/portal/Lists/Events/Forms/AllItems.aspx',
      webUrl,
      refreshIntervalSeconds: 60
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0][0]).toContain('GetList(@listUrl)');
    expect(fetcher.mock.calls[0][0]).not.toContain('AllItems.aspx');
    expect(result.item?.title).toBe('Lanzamiento Q2');
    expect(result.hasPartialData).toBe(false);
  });

  it('rejects cross-origin JSON URLs', async () => {
    const repository = new CountdownConfigRepository(jest.fn() as never);

    await expect(
      repository.load({
        sourceType: 'JsonUrl',
        eventTitle: 'Cuenta atrás a eventos',
        targetDate: '2026-04-01T09:00:00Z',
        showCompleted: false,
        jsonUrl: 'https://evil.example.com/data.json',
        webUrl,
        refreshIntervalSeconds: 60
      })
    ).rejects.toThrow('jsonUrl must be same-origin or relative');
  });
});
