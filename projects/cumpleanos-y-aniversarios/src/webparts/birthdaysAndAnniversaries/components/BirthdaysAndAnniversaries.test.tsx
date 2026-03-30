jest.mock('BirthdaysAndAnniversariesWebPartStrings', () => ({
  WebPartTitle: 'Cumpleanos y aniversarios',
  WebPartSubtitle: 'Reconoce los hitos de hoy y los proximos en una vista ligera.',
  LoadingLabel: 'Cargando celebraciones',
  SourceLabel: 'Origen',
  SourceUnavailableLabel: 'Sin origen confirmado',
  TodaySectionTitle: 'Hoy',
  UpcomingSectionTitle: 'Proximos',
  PartialSectionTitle: 'Datos parciales',
  ErrorStateTitle: 'No se han podido cargar las celebraciones',
  ErrorStateMessage: 'Revisa el origen configurado y vuelve a intentarlo.',
  ErrorStateMessageDetailed: 'La carga ha fallado. Revisa el origen configurado y vuelve a intentarlo.',
  ErrorStateRetryAction: 'Reintentar',
  EmptyStateTitle: 'No hay celebraciones proximas',
  EmptyStateMessage: 'No hay hitos dentro de la ventana configurada.',
  PartialEmptyStateTitle: 'Solo hay informacion parcial disponible',
  PartialEmptyStateMessage: 'Algunos registros tienen campos incompletos y se han mantenido visibles como referencia.',
  RefreshAction: 'Actualizar',
  PartialBannerMessage: 'Algunos registros se han normalizado con datos parciales. La vista sigue siendo utilizable.',
  CardTodayBadge: 'Hoy',
  CardBirthdayBadge: 'Cumpleanos',
  CardAnniversaryBadge: 'Aniversario',
  CardPartialBadge: 'Datos parciales',
  CardTodayMessage: 'Celebracion de hoy',
  CardPendingDateMessage: 'Fecha pendiente de validar',
  CardDaysRemainingFormat: 'Faltan {0} dias',
  CardPartialFootnote: 'Informacion parcial normalizada para no ocultar el hito.',
  CardCompleteFootnote: 'Informacion completa.'
}), { virtual: true });

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
import BirthdaysAndAnniversaries from './BirthdaysAndAnniversaries';
import * as hookModule from '../hooks/useCelebrations';

describe('BirthdaysAndAnniversaries', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders loading state', () => {
    jest.spyOn(hookModule, 'useCelebrations').mockReturnValue({
      title: 'Cumpleanos y aniversarios',
      subtitle: 'Reconoce los hitos de hoy y los proximos en una vista ligera.',
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

    const container = document.createElement('div');
    document.body.appendChild(container);

    try {
      act(() => {
        ReactDom.render(
          <BirthdaysAndAnniversaries
            spHttpClient={{} as never}
            spHttpClientConfiguration={{}}
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

      expect(container.textContent).toContain('Cargando celebraciones');
    } finally {
      ReactDom.unmountComponentAtNode(container);
      container.remove();
    }
  });

  it('renders error state', () => {
    jest.spyOn(hookModule, 'useCelebrations').mockReturnValue({
      title: 'Cumpleanos y aniversarios',
      subtitle: 'Reconoce los hitos de hoy y los proximos en una vista ligera.',
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

    const container = document.createElement('div');
    document.body.appendChild(container);

    try {
      act(() => {
        ReactDom.render(
          <BirthdaysAndAnniversaries
            spHttpClient={{} as never}
            spHttpClientConfiguration={{}}
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

      expect(container.textContent).toContain('Cumpleanos y aniversarios');
      expect(container.textContent).toContain('Error');
      expect(container.textContent).not.toContain('Sofia Martin');
    } finally {
      ReactDom.unmountComponentAtNode(container);
      container.remove();
    }
  });

  it('renders ready state with sections', () => {
    jest.spyOn(hookModule, 'useCelebrations').mockReturnValue({
      title: 'Cumpleanos y aniversarios',
      subtitle: 'Reconoce los hitos de hoy y los proximos en una vista ligera.',
      status: 'ready',
      items: [
        {
          id: '1',
          displayName: 'Sofia Martin',
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
          displayName: 'Sofia Martin',
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

    const container = document.createElement('div');
    document.body.appendChild(container);

    try {
      act(() => {
        ReactDom.render(
          <BirthdaysAndAnniversaries
            spHttpClient={{} as never}
            spHttpClientConfiguration={{}}
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

      expect(container.textContent).toContain('Sofia Martin');
      expect(container.textContent).toContain('Hoy');
      expect(container.textContent).toContain('SharePoint list');
    } finally {
      ReactDom.unmountComponentAtNode(container);
      container.remove();
    }
  });
});
