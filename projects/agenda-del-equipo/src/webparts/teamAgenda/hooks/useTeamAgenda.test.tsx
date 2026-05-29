import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import type { ITeamAgendaConfiguration, ITeamAgendaService } from '../models/teamAgendaModels';
import { useTeamAgenda } from './useTeamAgenda';

describe('useTeamAgenda', () => {
  let container: HTMLDivElement;

  const configuration: ITeamAgendaConfiguration = {
    title: 'Agenda del equipo',
    description: 'Agenda compartida.',
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: 'AgendaList',
    maxItems: 5,
    showPast: false,
    defaultTypeFilter: 'Demo',
    webUrl: 'https://contoso.sharepoint.com/sites/demo',
    localeName: 'es-ES'
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  it('filters by the default type', async () => {
    const service: ITeamAgendaService = {
      load: async () => ({
        state: 'ready',
        title: 'Agenda del equipo',
        description: 'Agenda compartida.',
        items: [
          { id: '1', title: 'Demo', startsAt: '2026-04-09T09:00:00.000Z', endsAt: undefined, eventType: 'Demo', location: 'Teams', joinUrl: undefined, openUrl: undefined, group: 'today', isPartial: false },
          { id: '2', title: 'Daily', startsAt: '2026-04-09T10:00:00.000Z', endsAt: undefined, eventType: 'Seguimiento', location: 'Teams', joinUrl: undefined, openUrl: undefined, group: 'today', isPartial: false }
        ],
        availableTypes: ['Demo', 'Seguimiento'],
        hasPartialData: false,
        warningMessages: []
      })
    };

    function Harness(): React.ReactElement {
      const state = useTeamAgenda({ configuration, service });
      return <span>{state.visibleItems.map((item) => item.title).join(',')}</span>;
    }

    await act(async () => {
      ReactDOM.render(<Harness />, container);
      await Promise.resolve();
    });

    expect(container.textContent).toBe('Demo');
  });
});
