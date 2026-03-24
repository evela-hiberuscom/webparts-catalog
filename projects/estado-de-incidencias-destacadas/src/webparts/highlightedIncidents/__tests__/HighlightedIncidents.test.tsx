jest.mock('../hooks/useHighlightedIncidents', () => ({
  useHighlightedIncidents: jest.fn()
}));

import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import HighlightedIncidents from '../components/HighlightedIncidents';
import { useHighlightedIncidents } from '../hooks/useHighlightedIncidents';
import type { IHighlightedIncidentsProps } from '../components/IHighlightedIncidentsProps';

const mockedUseHighlightedIncidents = useHighlightedIncidents as jest.MockedFunction<typeof useHighlightedIncidents>;

describe('HighlightedIncidents', () => {
  const baseProps: IHighlightedIncidentsProps = {
    title: 'Estado de incidencias destacadas',
    subtitle: 'Seguimiento compacto',
    dataSourceType: 'SharePointList',
    listTitleOrUrl: 'IncidentsList',
    showResolved: false,
    maxItems: 5,
    webUrl: 'https://contoso.sharepoint.com/sites/portal'
  };

  it('renders ready cards and summary', () => {
    mockedUseHighlightedIncidents.mockReturnValue({
      status: 'ready',
      result: {
        items: [
          {
            id: 'INC-001',
            title: 'Portal caído',
            severity: 'critical',
            impact: 'Los usuarios no pueden iniciar sesión',
            status: 'active',
            workaround: 'Usar el acceso alternativo',
            eta: '2026-03-25T10:30:00Z',
            detailUrl: '/sites/support/portal-caido',
            sourceName: 'IncidentsList',
            isPartial: false
          }
        ],
        hasPartialData: false,
        status: 'ready',
        sourceCount: 1,
        activeCount: 1,
        monitoringCount: 0,
        resolvedCount: 0,
        hiddenResolvedCount: 0
      },
      refresh: jest.fn()
    });

    const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(HighlightedIncidents, baseProps));

    expect(markup).toContain('Estado de incidencias destacadas');
    expect(markup).toContain('Portal caído');
    expect(markup).toContain('Abrir detalle');
    expect(markup).toContain('1 activas');
  });

  it('renders loading and empty states from the hook result', () => {
    mockedUseHighlightedIncidents.mockReturnValue({
      status: 'loading',
      refresh: jest.fn()
    });

    const loadingMarkup = ReactDOMServer.renderToStaticMarkup(React.createElement(HighlightedIncidents, baseProps));
    expect(loadingMarkup).toContain('Cargando incidencias destacadas');

    mockedUseHighlightedIncidents.mockReturnValue({
      status: 'empty',
      result: {
        items: [],
        hasPartialData: false,
        status: 'empty',
        sourceCount: 0,
        activeCount: 0,
        monitoringCount: 0,
        resolvedCount: 0,
        hiddenResolvedCount: 0
      },
      refresh: jest.fn()
    });

    const emptyMarkup = ReactDOMServer.renderToStaticMarkup(React.createElement(HighlightedIncidents, baseProps));
    expect(emptyMarkup).toContain('No hay incidencias destacadas');
  });

  it('renders the error message and retry action', () => {
    mockedUseHighlightedIncidents.mockReturnValue({
      status: 'error',
      error: 'No se pudo cargar la fuente.',
      refresh: jest.fn()
    });

    const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(HighlightedIncidents, baseProps));
    expect(markup).toContain('No hemos podido leer la fuente de incidencias');
    expect(markup).toContain('No se pudo cargar la fuente.');
    expect(markup).toContain('Reintentar');
  });
});
