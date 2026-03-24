import { DailyPulseService } from './dailyPulseService';
import type { IDailyPulseRequest } from '../models/dailyPulseModels';

function buildRequest(overrides: Partial<IDailyPulseRequest> = {}): IDailyPulseRequest {
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

describe('DailyPulseService', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('resolves a ready state for a prompt with options', async () => {
    const service = new DailyPulseService({
      loadPrompt: async () => ({
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
        hasPartialData: false
      }),
      readStoredAnswer: () => undefined,
      submitAnswer: jest.fn()
    } as never);

    const result = await service.resolve(buildRequest());

    expect(result.status).toBe('ready');
    expect(result.prompt?.options).toHaveLength(2);
    expect(result.alreadySubmitted).toBe(false);
  });

  it('maps repository errors to the error state', async () => {
    const service = new DailyPulseService({
      loadPrompt: async () => {
        throw new Error('Boom');
      },
      readStoredAnswer: () => undefined,
      submitAnswer: jest.fn()
    } as never);

    const result = await service.resolve(buildRequest());

    expect(result.status).toBe('error');
    expect(result.errorMessage).toBe('Boom');
  });
});

