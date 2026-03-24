import type { IDailyPulseOption, IDailyPulsePrompt } from '../models/dailyPulseModels';

export const DEFAULT_DAILY_PULSE_PROMPT: IDailyPulsePrompt = {
  id: 'daily-pulse',
  prompt: '¿Cómo vas hoy?',
  helpText: 'Selecciona una sola opción para capturar el pulso del día.',
  options: [
    { id: 'great', label: 'Muy bien', tone: 'positive', emoji: '✨' },
    { id: 'good', label: 'Bien', tone: 'positive', emoji: '🙂' },
    { id: 'okay', label: 'Regular', tone: 'neutral', emoji: '◻' },
    { id: 'tired', label: 'Cansado', tone: 'negative', emoji: '🌙' },
    { id: 'need-help', label: 'Necesito apoyo', tone: 'negative', emoji: '🫶' }
  ]
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toText(value: unknown, fallback = ''): string {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

function toOptionTone(value: unknown): IDailyPulseOption['tone'] | undefined {
  const tone = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (tone === 'positive' || tone === 'neutral' || tone === 'negative') {
    return tone;
  }

  return undefined;
}

function coerceOption(raw: unknown, index: number): IDailyPulseOption {
  if (!isRecord(raw)) {
    return {
      id: `pulse-option-${index + 1}`,
      label: `Opción ${index + 1}`
    };
  }

  const id = toText(raw.id ?? raw.ID ?? raw.Id ?? raw.key ?? raw.Key, `pulse-option-${index + 1}`);
  const label = toText(raw.label ?? raw.Label ?? raw.title ?? raw.Title ?? raw.name ?? raw.Name, `Opción ${index + 1}`);

  return {
    id,
    label,
    description: toText(raw.description ?? raw.Description, ''),
    tone: toOptionTone(raw.tone ?? raw.Tone),
    emoji: toText(raw.emoji ?? raw.Emoji, '')
  };
}

function parseOptions(raw: unknown): IDailyPulseOption[] {
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) {
      return [];
    }

    try {
      return parseOptions(JSON.parse(trimmed) as unknown);
    } catch {
      return [];
    }
  }

  if (Array.isArray(raw)) {
    return raw.map((item, index) => coerceOption(item, index));
  }

  if (isRecord(raw) && Array.isArray(raw.options)) {
    return raw.options.map((item, index) => coerceOption(item, index));
  }

  if (isRecord(raw) && Array.isArray(raw.choices)) {
    return raw.choices.map((item, index) => coerceOption(item, index));
  }

  if (isRecord(raw) && Array.isArray(raw.value)) {
    return raw.value.map((item, index) => coerceOption(item, index));
  }

  return [];
}

export function buildFallbackPrompt(): IDailyPulsePrompt {
  return DEFAULT_DAILY_PULSE_PROMPT;
}

export function isSameOriginOrRelativeUrl(value: string, webUrl: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return new URL(trimmed).origin === new URL(webUrl).origin;
  }

  return true;
}

export function resolveSameOriginUrl(rawUrl: string, webUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    throw new Error('url is required');
  }

  const resolved = new URL(trimmed, webUrl);
  if (resolved.origin !== new URL(webUrl).origin) {
    throw new Error('url must be same-origin or relative');
  }

  return resolved.toString();
}

export function escapeODataTitle(value: string): string {
  return value.replace(/'/g, "''");
}

export function deriveServerRelativePath(listTitleOrUrl: string, webUrl: string): string {
  const resolved = new URL(listTitleOrUrl, webUrl);
  let pathname = decodeURIComponent(resolved.pathname);

  if (pathname.toLowerCase().endsWith('/allitems.aspx')) {
    pathname = pathname.slice(0, -'/AllItems.aspx'.length);
  } else if (pathname.toLowerCase().endsWith('/forms/allitems.aspx')) {
    pathname = pathname.slice(0, -'/Forms/AllItems.aspx'.length);
  } else if (pathname.toLowerCase().endsWith('/forms')) {
    pathname = pathname.slice(0, -'/Forms'.length);
  }

  return pathname.replace(/\/$/, '');
}

export function createStorageKey(webUrl: string, promptId: string, userKey: string): string {
  return ['daily-pulse', webUrl.toLowerCase(), promptId.toLowerCase(), userKey.toLowerCase()].join('|');
}

export function serializePrompt(prompt: IDailyPulsePrompt): string {
  return JSON.stringify(prompt, null, 2);
}

export function parsePromptPayload(raw: unknown): IDailyPulsePrompt | undefined {
  if (!raw) {
    return undefined;
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) {
      return undefined;
    }

    try {
      return parsePromptPayload(JSON.parse(trimmed) as unknown);
    } catch {
      throw new Error('promptJson must be valid JSON');
    }
  }

  if (Array.isArray(raw)) {
    return coercePrompt(raw[0]);
  }

  if (isRecord(raw)) {
    const payload = raw as { d?: { results?: unknown[] }; results?: unknown[]; items?: unknown[] };

    if (Array.isArray(payload.d?.results)) {
      return coercePrompt(payload.d.results[0]);
    }

    if (Array.isArray(payload.results)) {
      return coercePrompt(payload.results[0]);
    }

    if (Array.isArray(payload.items)) {
      return coercePrompt(payload.items[0]);
    }
  }

  return coercePrompt(raw);
}

function coercePrompt(raw: unknown): IDailyPulsePrompt | undefined {
  if (!isRecord(raw)) {
    return undefined;
  }

  const promptText = toText(
    raw.prompt ?? raw.Prompt ?? raw.question ?? raw.Question ?? raw.Title ?? raw.title ?? raw.text ?? raw.Text,
    DEFAULT_DAILY_PULSE_PROMPT.prompt
  );
  const options = parseOptions(raw.options ?? raw.Options ?? raw.choices ?? raw.Choices ?? raw.items ?? raw.Items);
  const helpText = toText(raw.helpText ?? raw.HelpText ?? raw.description ?? raw.Description, '');
  const id = toText(raw.id ?? raw.ID ?? raw.Id ?? raw.key ?? raw.Key, DEFAULT_DAILY_PULSE_PROMPT.id);

  return {
    id,
    prompt: promptText,
    options,
    helpText: helpText || undefined
  };
}

export function normalizePrompt(prompt: IDailyPulsePrompt): IDailyPulsePrompt {
  const options = prompt.options
    .map((option, index) => coerceOption(option, index))
    .filter((option) => Boolean(option.label.trim()));

  return {
    id: toText(prompt.id, DEFAULT_DAILY_PULSE_PROMPT.id),
    prompt: toText(prompt.prompt, DEFAULT_DAILY_PULSE_PROMPT.prompt),
    helpText: toText(prompt.helpText, '') || undefined,
    options
  };
}
