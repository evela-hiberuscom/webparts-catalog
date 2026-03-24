/* eslint-disable @rushstack/pair-react-dom-render-unmount */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { DailyPulseProvider } from '../contexts/DailyPulseContext';
import type { IDailyPulseRequest, IDailyPulseViewModel } from '../models/dailyPulseModels';
import { useDailyPulse } from './useDailyPulse';

function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('useDailyPulse', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    window.localStorage.clear();
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  it('loads a prompt, updates selection and submits it', async () => {
    const service = {
      resolve: jest.fn(async () => ({
        status: 'ready',
        prompt: {
          id: 'daily-pulse',
          prompt: '¿Cómo vas hoy?',
          options: [
            { id: 'good', label: 'Bien' },
            { id: 'great', label: 'Muy bien' }
          ]
        },
        sourceLabel: 'Configuración local',
        notes: [],
        hasPartialData: false,
        selectedOptionId: '',
        submissionState: 'idle',
        alreadySubmitted: false
      })),
      submit: jest.fn(async () => ({
        submitted: {
          promptId: 'daily-pulse',
          optionId: 'good',
          optionLabel: 'Bien',
          submittedBy: 'Ada',
          submittedAt: '2026-03-23T08:00:00.000Z'
        },
        persistedLocally: true,
        sourceLabel: 'Configuración local',
        notes: ['La respuesta se almacenó localmente para el workbench.']
      })),
      readStoredAnswer: jest.fn(() => undefined)
    };

    let latest: IDailyPulseViewModel | undefined;

    function Probe(props: { request: IDailyPulseRequest }): React.ReactElement | null {
      latest = useDailyPulse(props.request);
      return null;
    }

    await act(async () => {
      ReactDOM.render(
        <DailyPulseProvider service={service as never}>
          <Probe
            request={{
              title: 'Pulso del día',
              subtitle: 'Una señal diaria mínima para tomar temperatura del equipo.',
              sourceType: 'StaticConfig',
              webUrl: 'https://contoso.sharepoint.com/sites/intranet',
              listTitleOrUrl: '',
              jsonUrl: '',
              apiEndpointUrl: '',
              promptJson: '',
              oneResponsePerDay: true,
              submitLabel: 'Registrar pulso',
              userDisplayName: 'Ada'
            }}
          />
        </DailyPulseProvider>,
        container
      );
      await flush();
    });

    expect(service.resolve).toHaveBeenCalledTimes(1);
    expect(latest?.status).toBe('ready');

    await act(async () => {
      latest?.selectOption('good');
      await flush();
    });

    expect(latest?.selectedOptionId).toBe('good');

    await act(async () => {
      await latest?.submitSelection();
      await flush();
    });

    expect(service.submit).toHaveBeenCalledWith(
      expect.objectContaining({ userDisplayName: 'Ada' }),
      expect.objectContaining({ id: 'daily-pulse' }),
      'good'
    );
    expect(latest?.submissionState).toBe('success');
  });
});

