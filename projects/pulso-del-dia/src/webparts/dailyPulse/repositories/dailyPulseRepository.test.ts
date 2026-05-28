import type { IDailyPulseRequest } from '../models/dailyPulseModels';
import { DailyPulseRepository } from './dailyPulseRepository';

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
    userLoginName: 'i:0#.f|membership|ada.lovelace@contoso.com',
    ...overrides
  };
}

describe('DailyPulseRepository', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('uses the inferred prompt for an empty StaticConfig source', async () => {
    const repository = new DailyPulseRepository();
    const result = await repository.loadPrompt(buildRequest());

    expect(result.prompt?.id).toBe('daily-pulse');
    expect(result.prompt?.options).toHaveLength(5);
    expect(result.hasPartialData).toBe(true);
  });

  it('rejects malformed promptJson payloads', async () => {
    const repository = new DailyPulseRepository();

    await expect(
      repository.loadPrompt(
        buildRequest({
          promptJson: '{"prompt": "broken"'
        })
      )
    ).rejects.toThrow('promptJson is invalid');
  });

  it('loads prompts from SharePoint list results', async () => {
    const fetcher = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        d: {
          results: [
            {
              ID: 1,
              Title: 'Pulso del día',
              DailyPulsePromptText: '¿Cómo te sientes hoy?',
              DailyPulseOptionsJson: JSON.stringify([{ id: 'good', label: 'Bien' }])
            }
          ]
        }
      })
    }));

    const repository = new DailyPulseRepository(fetcher as never);
    const result = await repository.loadPrompt(
      buildRequest({
        sourceType: 'SharePointList',
        listTitleOrUrl: 'DailyPulse',
        promptJson: ''
      })
    );

    expect(fetcher).toHaveBeenCalledWith(
      "https://contoso.sharepoint.com/sites/intranet/_api/web/lists/getbytitle('DailyPulse')/items?$top=100",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json'
        })
      })
    );
    expect(result.prompt?.prompt).toBe('¿Cómo te sientes hoy?');
    expect(result.prompt?.options).toHaveLength(1);
  });

  it('rejects same-origin violations for JSON feeds', async () => {
    const repository = new DailyPulseRepository();

    await expect(
      repository.loadPrompt(
        buildRequest({
          sourceType: 'JsonUrl',
          jsonUrl: 'https://evil.example/pulse.json'
        })
      )
    ).rejects.toThrow('url must be same-origin or relative');
  });

  it('persists responses to SharePoint lists when the source is remote', async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ value: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          FormDigestValue: 'digest-token'
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({})
      });

    const repository = new DailyPulseRepository(fetcher as never);
    const prompt = {
      id: 'daily-pulse',
      prompt: '¿Cómo vas hoy?',
      options: [
        { id: 'great', label: 'Muy bien' },
        { id: 'good', label: 'Bien' }
      ]
    };

    const result = await repository.submitAnswer(
      buildRequest({
        sourceType: 'SharePointList',
        listTitleOrUrl: 'DailyPulse'
      }),
      prompt,
      'good'
    );

    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("_api/web/lists/getbytitle('DailyPulse')/items?$top=1&$select=Id,DailyPulseSubmittedAt"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json'
        })
      })
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      2,
      'https://contoso.sharepoint.com/sites/intranet/_api/contextinfo',
      expect.objectContaining({
        method: 'POST'
      })
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      3,
      "https://contoso.sharepoint.com/sites/intranet/_api/web/lists/getbytitle('DailyPulse')/items",
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-RequestDigest': 'digest-token'
        }),
        body: expect.stringContaining('"DailyPulseItemType":"Response"')
      })
    );
    expect(result.persistedLocally).toBe(false);
    expect(result.notes[0]).toBe('La respuesta se registró en la lista SharePoint.');
  });

  it('fails when the configured API endpoint rejects the submission', async () => {
    const fetcher = jest.fn(async () => ({
      ok: false,
      status: 500,
      json: async () => ({})
    }));

    const repository = new DailyPulseRepository(fetcher as never);
    const prompt = {
      id: 'daily-pulse',
      prompt: '¿Cómo vas hoy?',
      options: [{ id: 'good', label: 'Bien' }]
    };

    await expect(
      repository.submitAnswer(
        buildRequest({
          sourceType: 'ApiEndpoint',
          apiEndpointUrl: '/sites/intranet/_api/pulse'
        }),
        prompt,
        'good'
      )
    ).rejects.toThrow('Submit failed (500)');
  });

  it('does not cache a remote response locally when the submission fails', async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ value: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          FormDigestValue: 'digest-token'
        })
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({})
      });

    const repository = new DailyPulseRepository(fetcher as never);
    const request = buildRequest({
      sourceType: 'SharePointList',
      listTitleOrUrl: 'DailyPulse'
    });
    const prompt = {
      id: 'daily-pulse',
      prompt: '¿Cómo vas hoy?',
      options: [{ id: 'good', label: 'Bien' }]
    };

    await expect(repository.submitAnswer(request, prompt, 'good')).rejects.toThrow('Submit failed (500)');
    expect(repository.readStoredAnswer(prompt.id, request)).toBeUndefined();
  });

  it('persists a response locally and blocks duplicate responses for the same day', async () => {
    const repository = new DailyPulseRepository();
    const request = buildRequest();
    const prompt = {
      id: 'daily-pulse',
      prompt: '¿Cómo vas hoy?',
      options: [
        { id: 'great', label: 'Muy bien' },
        { id: 'good', label: 'Bien' }
      ]
    };

    const first = await repository.submitAnswer(request, prompt, 'good');
    const second = await repository.submitAnswer(request, prompt, 'great');

    expect(first.persistedLocally).toBe(true);
    expect(first.submitted.optionId).toBe('good');
    expect(second.persistedLocally).toBe(false);
    expect(second.notes[0]).toContain('Ya existe una respuesta para hoy.');
    const storedPayload = JSON.parse(window.localStorage.getItem(window.localStorage.key(0) || '') || '{}');
    expect(storedPayload.expiresAt).toEqual(expect.any(String));
    expect(storedPayload.answer.submittedBy).toBe('');
  });

  it('writes SharePointList responses remotely without local cache and blocks same-day duplicates from the list', async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ value: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          FormDigestValue: 'digest-value'
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({})
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          value: [{ Id: 1, DailyPulseSubmittedAt: '2026-03-24T09:00:00.000Z' }]
        })
      });
    const repository = new DailyPulseRepository(fetcher as never);
    const request = buildRequest({
      sourceType: 'SharePointList',
      listTitleOrUrl: 'DailyPulse'
    });
    const prompt = {
      id: 'daily-pulse',
      prompt: '¿Cómo vas hoy?',
      options: [
        { id: 'good', label: 'Bien' },
        { id: 'great', label: 'Muy bien' }
      ]
    };

    const first = await repository.submitAnswer(request, prompt, 'good');
    await expect(repository.submitAnswer(request, prompt, 'great')).rejects.toThrow('Ya existe una respuesta para hoy.');

    expect(first.persistedLocally).toBe(false);
    expect(first.notes[0]).toBe('La respuesta se registró en la lista SharePoint.');
    expect(repository.readStoredAnswer(prompt.id, request)).toBeUndefined();
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining("_api/web/lists/getbytitle('DailyPulse')/items"),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-RequestDigest': 'digest-value'
        })
      })
    );
  });

  it('treats legacy local answers without TTL as expired', async () => {
    const repository = new DailyPulseRepository();
    const request = buildRequest();
    const prompt = {
      id: 'daily-pulse',
      prompt: '¿Cómo vas hoy?',
      options: [{ id: 'good', label: 'Bien' }]
    };
    window.localStorage.setItem(
      'daily-pulse|https://contoso.sharepoint.com/sites/intranet|daily-pulse|i:0#.f|membership|ada.lovelace@contoso.com',
      JSON.stringify({
        promptId: 'daily-pulse',
        optionId: 'good',
        optionLabel: 'Bien',
        submittedBy: 'Ada Lovelace',
        submittedAt: new Date().toISOString()
      })
    );

    const result = await repository.submitAnswer(request, prompt, 'good');

    expect(result.persistedLocally).toBe(true);
    expect(result.submitted.optionId).toBe('good');
  });
});
