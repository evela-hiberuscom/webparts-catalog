import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
import UrgentAlertBar from './UrgentAlertBar';
import * as useAlertBarModule from '../hooks/useAlertBar';

describe('UrgentAlertBar', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders loading state', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    jest.spyOn(useAlertBarModule, 'useAlertBar').mockReturnValue({
      status: 'loading',
      items: [],
      hasPartialData: false,
      refresh: jest.fn()
    });

    act(() => {
      ReactDom.render(
        <UrgentAlertBar
          spHttpClient={{} as never}
          webAbsoluteUrl="https://contoso.sharepoint.com/sites/portal"
          dataSourceType="SharePointList"
          listTitleOrUrl="AlertsList"
          jsonUrl=""
          staticConfigJson=""
          maxAlerts={3}
          dismissible={false}
        />,
        container
      );
    });

    expect(container.textContent).toContain('Cargando avisos urgentes');

    ReactDom.unmountComponentAtNode(container);
    container.remove();
  });

  it('renders error state', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    jest.spyOn(useAlertBarModule, 'useAlertBar').mockReturnValue({
      status: 'error',
      items: [],
      hasPartialData: false,
      errorMessage: 'Fallo de carga',
      refresh: jest.fn()
    });

    act(() => {
      ReactDom.render(
        <UrgentAlertBar
          spHttpClient={{} as never}
          webAbsoluteUrl="https://contoso.sharepoint.com/sites/portal"
          dataSourceType="SharePointList"
          listTitleOrUrl="AlertsList"
          jsonUrl=""
          staticConfigJson=""
          maxAlerts={3}
          dismissible={false}
        />,
        container
      );
    });

    expect(container.textContent).toContain('No se han podido cargar los avisos urgentes');
    expect(container.textContent).toContain('Fallo de carga');

    ReactDom.unmountComponentAtNode(container);
    container.remove();
  });

  it('renders ready state with partial badge', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    jest.spyOn(useAlertBarModule, 'useAlertBar').mockReturnValue({
      status: 'ready',
      items: [
        {
          id: '1',
          severity: 'critical',
          title: 'Incidencia VPN',
          message: 'La VPN presenta degradación',
          startAt: '2026-03-23T11:00:00Z',
          endAt: '2026-03-23T13:00:00Z',
          ctaUrl: '/sites/it/status/vpn',
          priority: 1
        }
      ],
      hasPartialData: true,
      sourceLabel: 'SharePointListTitle',
      refresh: jest.fn()
    });

    act(() => {
      ReactDom.render(
        <UrgentAlertBar
          spHttpClient={{} as never}
          webAbsoluteUrl="https://contoso.sharepoint.com/sites/portal"
          dataSourceType="SharePointList"
          listTitleOrUrl="AlertsList"
          jsonUrl=""
          staticConfigJson=""
          maxAlerts={3}
          dismissible={false}
        />,
        container
      );
    });

    expect(container.textContent).toContain('Incidencia VPN');
    expect(container.textContent).toContain('Datos parciales');

    ReactDom.unmountComponentAtNode(container);
    container.remove();
  });
});

