import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import EventCountdown from './EventCountdown';
import type { IEventCountdownProps } from './IEventCountdownProps';

jest.mock('../hooks/useCountdown', () => ({
  useCountdownModel: jest.fn()
}));

const mockUseCountdownModel = require('../hooks/useCountdown').useCountdownModel as jest.Mock;

function renderComponent(props: IEventCountdownProps): HTMLDivElement {
  const container = document.createElement('div');
  act(() => {
    ReactDOM.render(<EventCountdown {...props} />, container);
  });

  return container;
}

describe('EventCountdown', () => {
  it('renders the countdown hero and CTA', () => {
    mockUseCountdownModel.mockReturnValue({
      state: 'ready',
      phase: 'countdown',
      item: {
        title: 'Lanzamiento Q2',
        targetDate: '2026-04-01T09:00:00Z',
        subtitle: 'Campaña',
        detailUrl: 'https://contoso.sharepoint.com/sites/portal/SitePages/evento.aspx',
        state: 'countdown',
        showCompleted: false,
        hasPartialData: false
      },
      remaining: {
        days: 10,
        hours: 5,
        minutes: 12,
        totalMinutes: 15_432
      },
      sourceLabel: 'Configuración estática',
      hasPartialData: false,
      notes: [],
      phaseLabel: 'Cuenta atrás',
      supportingText: 'Faltan 10 días · 5 horas · 12 minutos para Lanzamiento Q2.',
      ctaLink: {
        href: 'https://contoso.sharepoint.com/sites/portal/SitePages/evento.aspx',
        rel: 'noopener noreferrer',
        target: '_blank'
      }
    });

    const container = renderComponent({
      config: {
        sourceType: 'StaticConfig',
        eventTitle: 'Cuenta atrás a eventos',
        targetDate: '2026-04-01T09:00:00Z',
        subtitle: 'Campaña',
        detailUrl: 'https://contoso.sharepoint.com/sites/portal/SitePages/evento.aspx',
        showCompleted: false,
        webUrl: 'https://contoso.sharepoint.com/sites/portal',
        refreshIntervalSeconds: 60
      },
      isDarkTheme: false,
      environmentMessage: 'Running on a SharePoint page',
      hasTeamsContext: false,
      userDisplayName: 'Marta'
    });

    expect(container.textContent).toContain('Lanzamiento Q2');
    expect(container.textContent).toContain('10');
    expect(container.textContent).toContain('Abrir detalle');
    ReactDOM.unmountComponentAtNode(container);
    jest.clearAllMocks();
  });

  it('renders an empty state when the hook returns empty', () => {
    mockUseCountdownModel.mockReturnValue({
      state: 'empty',
      phase: 'unknown',
      item: null,
      remaining: null,
      sourceLabel: 'Configuración estática',
      hasPartialData: false,
      notes: [],
      phaseLabel: 'Sin evento',
      supportingText: 'No hay evento configurado.',
      emptyReason: 'No hay evento configurado.'
    });

    const container = renderComponent({
      config: {
        sourceType: 'StaticConfig',
        eventTitle: 'Cuenta atrás a eventos',
        targetDate: '',
        showCompleted: false,
        webUrl: 'https://contoso.sharepoint.com/sites/portal',
        refreshIntervalSeconds: 60
      },
      isDarkTheme: false,
      environmentMessage: 'Running on a SharePoint page',
      hasTeamsContext: false,
      userDisplayName: 'Marta'
    });

    expect(container.textContent).toContain('No hay evento activo');
    expect(container.textContent).toContain('No hay evento configurado.');
    ReactDOM.unmountComponentAtNode(container);
    jest.clearAllMocks();
  });
});
