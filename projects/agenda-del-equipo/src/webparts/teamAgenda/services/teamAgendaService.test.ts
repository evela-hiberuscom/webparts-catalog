import type { ITeamAgendaConfiguration } from '../models/teamAgendaModels';
import type { ITeamAgendaRepository } from '../repositories/teamAgendaRepository';
import { loadTeamAgendaViewModel } from './teamAgendaService';

describe('teamAgendaService', () => {
  const configuration: ITeamAgendaConfiguration = {
    title: 'Agenda del equipo',
    description: 'Próximas reuniones.',
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: 'AgendaList',
    maxItems: 4,
    showPast: false,
    defaultTypeFilter: '',
    webUrl: 'https://contoso.sharepoint.com/sites/demo',
    localeName: 'es-ES'
  };

  it('returns ready when repository provides complete items', async () => {
    const repository: ITeamAgendaRepository = {
      load: async () => ({
        items: [
          {
            id: '1',
            title: 'Daily',
            startsAt: '2099-04-09T09:00:00.000Z',
            endsAt: undefined,
            eventType: 'Seguimiento',
            location: 'Teams',
            joinUrl: 'https://teams.microsoft.com/l/meetup-join/example',
            openUrl: undefined
          }
        ],
        warnings: [],
        isFallback: false
      })
    };

    const viewModel = await loadTeamAgendaViewModel(configuration, repository);

    expect(viewModel.state).toBe('ready');
    expect(viewModel.items).toHaveLength(1);
  });

  it('returns partialData when items are missing metadata', async () => {
    const repository: ITeamAgendaRepository = {
      load: async () => ({
        items: [
          {
            id: '1',
            title: 'Demo',
            startsAt: '2099-04-09T09:00:00.000Z',
            endsAt: undefined,
            eventType: 'Demo',
            location: undefined,
            joinUrl: undefined,
            openUrl: undefined
          }
        ],
        warnings: [],
        isFallback: false
      })
    };

    const viewModel = await loadTeamAgendaViewModel(configuration, repository);

    expect(viewModel.state).toBe('partialData');
    expect(viewModel.hasPartialData).toBe(true);
  });

  it('returns error when the repository throws', async () => {
    const repository: ITeamAgendaRepository = {
      load: async () => {
        throw new Error('Boom');
      }
    };

    const viewModel = await loadTeamAgendaViewModel(configuration, repository);

    expect(viewModel.state).toBe('error');
    expect(viewModel.items).toHaveLength(0);
  });
});
