jest.mock('@microsoft/sp-http', () => ({
  SPHttpClient: {
    configurations: {
      v1: {}
    }
  }
}));

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
import BirthdaysAndAnniversaries from './BirthdaysAndAnniversaries';
import * as hookModule from '../hooks/useCelebrations';

describe('BirthdaysAndAnniversaries', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  function renderComponent() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    act(() => {
      ReactDom.render(
        <BirthdaysAndAnniversaries
          spHttpClient={{} as never}
          webAbsoluteUrl="https://contoso.sharepoint.com/sites/portal"
          dataSourceTypes={['SharePointList']}
          directoryJsonUrl=""
          listTitleOrUrl=""
          jsonUrl=""
          showBirthdays
          showAnniversaries
          daysAhead={14}
        />,
        container
      );
    });

    return container;
  }

  it('renders loading state', () => {
    jest.spyOn(hookModule, 'useCelebrations').mockReturnValue({
      title: 'Cumpleaños y aniversarios',
      subtitle: 'Reconoce los hitos de hoy y los próximos en una vista ligera.',
      status: 'loading',
      items: [],
      todayItems: [],
      upcomingItems: [],
      partialItems: [],
      sourceLabel: 'Cargando',
      hasPartialData: false,
      notes: [],
      refresh: jest.fn()
    });

    const container = renderComponent();
    expect(container.textContent).toContain('Cargando celebraciones');

    ReactDom.unmountComponentAtNode(container);
    container.remove();
  });

  it('renders error state', () => {
    jest.spyOn(hookModule, 'useCelebrations').mockReturnValue({
      title: 'Cumpleaños y aniversarios',
      subtitle: 'Reconoce los hitos de hoy y los próximos en una vista ligera.',
      status: 'error',
      items: [],
      todayItems: [],
      upcomingItems: [],
      partialItems: [],
      sourceLabel: 'Error',
      hasPartialData: false,
      notes: ['Fallo de carga'],
      errorMessage: 'Fallo de carga',
      refresh: jest.fn()
    });

    const container = renderComponent();
    expect(container.textContent).toContain('No se han podido cargar las celebraciones');
    expect(container.textContent).toContain('Fallo de carga');

    ReactDom.unmountComponentAtNode(container);
    container.remove();
  });

  it('renders ready state with sections', () => {
    jest.spyOn(hookModule, 'useCelebrations').mockReturnValue({
      title: 'Cumpleaños y aniversarios',
      subtitle: 'Reconoce los hitos de hoy y los próximos en una vista ligera.',
      status: 'ready',
      items: [
        {
          id: '1',
          displayName: 'Sofía Martín',
          photoUrl: '/sites/portal/profile/sofia.jpg',
          celebrationType: 'birthday',
          date: '2026-03-24T00:00:00.000Z',
          avatarText: 'SM',
          dateLabel: 'Hoy',
          daysRemaining: 0,
          isToday: true,
          isPartial: false
        }
      ],
      todayItems: [
        {
          id: '1',
          displayName: 'Sofía Martín',
          photoUrl: '/sites/portal/profile/sofia.jpg',
          celebrationType: 'birthday',
          date: '2026-03-24T00:00:00.000Z',
          avatarText: 'SM',
          dateLabel: 'Hoy',
          daysRemaining: 0,
          isToday: true,
          isPartial: false
        }
      ],
      upcomingItems: [],
      partialItems: [],
      sourceLabel: 'SharePoint list',
      hasPartialData: false,
      notes: [],
      refresh: jest.fn()
    });

    const container = renderComponent();
    expect(container.textContent).toContain('Sofía Martín');
    expect(container.textContent).toContain('Hoy');
    expect(container.textContent).toContain('SharePoint list');

    ReactDom.unmountComponentAtNode(container);
    container.remove();
  });
});
