jest.mock('EventCountdownWebPartStrings', () => jest.requireActual('../testSupport/mockEventCountdownStrings').mockEventCountdownStrings, {
  virtual: true
});

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import EventCountdown from './EventCountdown';
import * as countdownHook from '../hooks/useCountdown';

describe('EventCountdown', () => {
  it('renders the countdown hero and CTA', () => {
    const useCountdownModelSpy = jest.spyOn(countdownHook, 'useCountdownModel').mockReturnValue({
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

    const container = document.createElement('div');
    act(() => {
      ReactDOM.render(
        <EventCountdown
          config={{
            sourceType: 'StaticConfig',
            eventTitle: 'Cuenta atrás a eventos',
            targetDate: '2026-04-01T09:00:00Z',
            subtitle: 'Campaña',
            detailUrl: 'https://contoso.sharepoint.com/sites/portal/SitePages/evento.aspx',
            showCompleted: false,
            webUrl: 'https://contoso.sharepoint.com/sites/portal',
            refreshIntervalSeconds: 60
          }}
          isDarkTheme={false}
          environmentMessage="Running on a SharePoint page"
          hasTeamsContext={false}
          userDisplayName="Marta"
        />,
        container
      );
    });

    expect(container.textContent).toContain('Lanzamiento Q2');
    expect(container.textContent).toContain('10');
    expect(container.textContent).toContain('Open details');

    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
    useCountdownModelSpy.mockRestore();
  });

  it('renders an empty state when the hook returns empty', () => {
    const useCountdownModelSpy = jest.spyOn(countdownHook, 'useCountdownModel').mockReturnValue({
      state: 'empty',
      phase: 'unknown',
      item: undefined,
      remaining: undefined,
      sourceLabel: 'Configuración estática',
      hasPartialData: false,
      notes: [],
      phaseLabel: 'Sin evento',
      supportingText: 'No hay evento configurado.',
      emptyReason: 'No hay evento configurado.'
    });

    const container = document.createElement('div');
    act(() => {
      ReactDOM.render(
        <EventCountdown
          config={{
            sourceType: 'StaticConfig',
            eventTitle: 'Cuenta atrás a eventos',
            targetDate: '',
            showCompleted: false,
            webUrl: 'https://contoso.sharepoint.com/sites/portal',
            refreshIntervalSeconds: 60
          }}
          isDarkTheme={false}
          environmentMessage="Running on a SharePoint page"
          hasTeamsContext={false}
          userDisplayName="Marta"
        />,
        container
      );
    });

    expect(container.textContent).toContain('There is no active event');
    expect(container.textContent).toContain('No hay evento configurado.');

    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
    useCountdownModelSpy.mockRestore();
  });
});
