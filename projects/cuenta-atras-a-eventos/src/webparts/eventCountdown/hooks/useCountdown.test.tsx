jest.mock('EventCountdownWebPartStrings', () => jest.requireActual('../testSupport/mockEventCountdownStrings').mockEventCountdownStrings, {
  virtual: true
});

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { useCountdownModel } from './useCountdown';
import type { ICountdownSnapshot, ICountdownWebPartConfig } from '../models/eventCountdownModels';

function Harness(props: { config: ICountdownWebPartConfig; service: { loadSnapshot: jest.Mock; buildViewModel: jest.Mock } }): React.ReactElement {
  const model = useCountdownModel(props.config, props.service as never);

  return (
    <div data-state={model.state} data-supporting-text={model.supportingText}>
      {model.supportingText}
    </div>
  );
}

describe('useCountdownModel', () => {
  it('loads a snapshot and refreshes the derived view model on timer ticks', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-24T09:00:00Z'));

    const snapshot: ICountdownSnapshot = {
      item: {
        title: 'Lanzamiento Q2',
        targetDate: '2026-04-01T09:00:00Z',
        state: 'unknown',
        showCompleted: false,
        hasPartialData: false
      },
      sourceLabel: 'Configuración estática',
      hasPartialData: false,
      notes: []
    };

    const baseTime = new Date('2026-03-24T09:00:00Z').getTime();
    const service = {
      loadSnapshot: jest.fn().mockResolvedValue(snapshot),
      buildViewModel: jest.fn((_snapshot: ICountdownSnapshot, _config: ICountdownWebPartConfig, now: Date) => {
        const tick = Math.floor((now.getTime() - baseTime) / 15000);
        return {
          state: 'ready',
          phase: 'countdown',
          item: snapshot.item,
          remaining: {
            days: 0,
            hours: 0,
            minutes: 0,
            totalMinutes: 0
          },
          sourceLabel: 'Configuración estática',
          hasPartialData: false,
          notes: [],
          phaseLabel: 'Cuenta atrás',
          supportingText: `tick-${tick}`,
          ctaLink: undefined
        };
      })
    };

    const container = document.createElement('div');
    const config: ICountdownWebPartConfig = {
      sourceType: 'StaticConfig',
      eventTitle: 'Cuenta atrás a eventos',
      targetDate: '2026-04-01T09:00:00Z',
      showCompleted: false,
      webUrl: 'https://contoso.sharepoint.com/sites/portal',
      refreshIntervalSeconds: 15
    };

    await act(async () => {
      ReactDOM.render(<Harness config={config} service={service} />, container);
      await Promise.resolve();
    });

    expect(container.textContent).toContain('tick-0');
    expect(service.loadSnapshot).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(15000);
    });

    expect(container.textContent).toContain('tick-1');

    ReactDOM.unmountComponentAtNode(container);
    jest.useRealTimers();
  });
});
