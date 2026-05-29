import { TeamAgendaRepository } from './teamAgendaRepository';

describe('TeamAgendaRepository', () => {
  it('returns fallback items for static configuration', async () => {
    const repository = new TeamAgendaRepository(async () => ({
      ok: true,
      status: 200,
      json: async () => ({})
    }));

    const result = await repository.load({
      title: 'Agenda',
      description: 'Desc',
      dataSourceType: 'StaticConfig',
      listTitleOrUrl: '',
      maxItems: 8,
      showPast: false,
      defaultTypeFilter: '',
      webUrl: 'https://contoso.sharepoint.com/sites/intranet',
      localeName: 'es-ES'
    });

    expect(result.isFallback).toBe(true);
    expect(result.items.length).toBeGreaterThan(0);
  });

  it('maps items from a JSON payload', async () => {
    const repository = new TeamAgendaRepository(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          {
            id: 'json-1',
            title: 'Hito trimestral',
            startsAt: '2026-04-11T12:00:00.000Z',
            endsAt: undefined,
            eventType: 'Hito',
            location: 'Sala Norte',
            joinUrl: undefined,
            openUrl: '/sites/intranet/hito'
          }
        ]
      })
    }));

    const result = await repository.load({
      title: 'Agenda',
      description: 'Desc',
      dataSourceType: 'JsonUrl',
      listTitleOrUrl: 'https://contoso.sharepoint.com/sites/intranet/SiteAssets/agenda.json',
      maxItems: 8,
      showPast: false,
      defaultTypeFilter: '',
      webUrl: 'https://contoso.sharepoint.com/sites/intranet',
      localeName: 'es-ES'
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('Hito trimestral');
  });
});
