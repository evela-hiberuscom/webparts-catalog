jest.mock('TeamAgendaWebPartStrings', () => ({
  KickerLabel: 'Visión compartida',
  EventsCountLabel: 'eventos',
  FilterLabel: 'Filtrar por tipo',
  AllTypesOptionLabel: 'Todos',
  LoadingStateLabel: 'Cargando agenda',
  EmptyStateMessage: 'Sin eventos',
  PartialStateMessage: 'Parcial',
  ErrorStateMessage: 'Error',
  TodayGroupLabel: 'Hoy',
  TomorrowGroupLabel: 'Mañana',
  UpcomingGroupLabel: 'Próximos días',
  PastGroupLabel: 'Pasados',
  PartialBadgeLabel: 'Parcial',
  JoinActionLabel: 'Unirse',
  OpenActionLabel: 'Abrir detalle',
  DateUnavailableLabel: 'Fecha no disponible'
}), { virtual: true });

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { registerIcons } from '@fluentui/react';
import { act } from 'react-dom/test-utils';

import TeamAgenda from './TeamAgenda';
import type { ITeamAgendaConfiguration, ITeamAgendaService } from '../models/teamAgendaModels';

describe('TeamAgenda', () => {
  let container: HTMLDivElement;

  const configuration: ITeamAgendaConfiguration = {
    title: 'Agenda del equipo',
    description: 'Próximas reuniones.',
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: 'AgendaList',
    maxItems: 5,
    showPast: false,
    defaultTypeFilter: '',
    webUrl: 'https://contoso.sharepoint.com/sites/demo',
    localeName: 'es-ES'
  };

  beforeEach(() => {
    registerIcons({
      icons: {
        calendar: <span />,
        chevrondown: <span />,
        poi: <span />
      }
    });
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  it('renders loaded agenda items', async () => {
    const service: ITeamAgendaService = {
      load: async () => ({
        state: 'ready',
        title: 'Agenda del equipo',
        description: 'Próximas reuniones.',
        items: [
          {
            id: '1',
            title: 'Daily',
            startsAt: '2026-04-09T09:00:00.000Z',
            endsAt: undefined,
            eventType: 'Seguimiento',
            location: 'Teams',
            joinUrl: 'https://teams.microsoft.com/l/meetup-join/example',
            openUrl: undefined,
            group: 'today',
            isPartial: false
          }
        ],
        availableTypes: ['Seguimiento'],
        hasPartialData: false,
        warningMessages: []
      })
    };

    await act(async () => {
      ReactDOM.render(
        <TeamAgenda
          configuration={configuration}
          service={service}
          localeName="es-ES"
          environmentMessage=""
          hasTeamsContext={false}
          isDarkTheme={false}
        />,
        container
      );
      await Promise.resolve();
    });

    expect(container.textContent).toContain('Agenda del equipo');
    expect(container.textContent).toContain('Daily');
    expect(container.textContent).toContain('Unirse');
  });
});
