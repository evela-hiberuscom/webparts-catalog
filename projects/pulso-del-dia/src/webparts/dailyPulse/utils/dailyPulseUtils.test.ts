import { buildFallbackPrompt, parsePromptPayload, resolveSameOriginUrl } from './dailyPulseUtils';

describe('dailyPulseUtils', () => {
  it('builds the inferred fallback prompt', () => {
    const prompt = buildFallbackPrompt();

    expect(prompt.id).toBe('daily-pulse');
    expect(prompt.options).toHaveLength(5);
    expect(prompt.prompt).toContain('¿Cómo vas hoy?');
  });

  it('parses prompt JSON payloads from strings', () => {
    const prompt = parsePromptPayload(
      JSON.stringify({
        id: 'pulse-1',
        prompt: '¿Cómo te sientes?',
        options: [{ id: 'ok', label: 'Bien' }]
      })
    );

    expect(prompt?.id).toBe('pulse-1');
    expect(prompt?.options).toHaveLength(1);
  });

  it('resolves only same-origin relative urls', () => {
    expect(resolveSameOriginUrl('/sites/intranet/data/pulse.json', 'https://contoso.sharepoint.com/sites/intranet')).toBe(
      'https://contoso.sharepoint.com/sites/intranet/data/pulse.json'
    );
  });
});

