jest.mock('../hooks/useDailyPulse', () => ({
  useDailyPulse: jest.fn()
}));

import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import DailyPulse from './DailyPulse';
import type { IDailyPulseProps } from './IDailyPulseProps';
import { useDailyPulse } from '../hooks/useDailyPulse';

const mockedUseDailyPulse = useDailyPulse as jest.MockedFunction<typeof useDailyPulse>;

function buildProps(overrides: Partial<IDailyPulseProps> = {}): IDailyPulseProps {
  return {
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
    userDisplayName: 'Ada Lovelace',
    ...overrides
  };
}

describe('DailyPulse', () => {
  it('renders the prompt, options and source label', () => {
    mockedUseDailyPulse.mockReturnValue({
      status: 'ready',
      prompt: {
        id: 'daily-pulse',
        prompt: '¿Cómo vas hoy?',
        options: [
          { id: 'good', label: 'Bien', emoji: '🙂' },
          { id: 'great', label: 'Muy bien', emoji: '✨' }
        ]
      },
      sourceLabel: 'Configuración local',
      notes: [],
      hasPartialData: false,
      selectedOptionId: 'good',
      submissionState: 'idle',
      alreadySubmitted: false,
      reload: jest.fn(),
      selectOption: jest.fn(),
      submitSelection: jest.fn()
    });

    const markup = renderToStaticMarkup(<DailyPulse {...buildProps()} />);

    expect(markup).toContain('Pulso del día');
    expect(markup).toContain('¿Cómo vas hoy?');
    expect(markup).toContain('Configuración local');
    expect(markup).toContain('Bien');
  });

  it('renders the error state with a retry action', () => {
    mockedUseDailyPulse.mockReturnValue({
      status: 'error',
      prompt: undefined,
      sourceLabel: 'Pulso del día',
      notes: ['boom'],
      hasPartialData: false,
      selectedOptionId: '',
      submissionState: 'error',
      errorMessage: 'No se ha podido cargar',
      alreadySubmitted: false,
      reload: jest.fn(),
      selectOption: jest.fn(),
      submitSelection: jest.fn()
    });

    const markup = renderToStaticMarkup(<DailyPulse {...buildProps()} />);

    expect(markup).toContain('No se ha podido cargar el pulso');
    expect(markup).toContain('Reintentar');
  });
});

