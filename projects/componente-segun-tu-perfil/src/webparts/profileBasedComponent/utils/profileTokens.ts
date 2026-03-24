import type { IProfileContextSnapshot, ProfileAudienceMode } from '../models/profileBasedComponentModels';

export function normalizeToken(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function splitTokens(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(/[\s,;|]+/g)
    .map(normalizeToken)
    .filter(Boolean);
}

export function uniqueTokens(values: string[]): string[] {
  return values.filter((token, index) => values.indexOf(token) === index);
}

function splitName(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(/[^a-zA-Z0-9]+/g)
    .map(normalizeToken)
    .filter(Boolean);
}

export function buildCurrentProfileTokens(context: IProfileContextSnapshot, audienceMode: ProfileAudienceMode): string[] {
  const tokens = [
    ...splitTokens(context.profileTokens),
    ...splitName(context.displayName),
    ...splitName(context.loginName),
  ];

  if (context.email) {
    const email = context.email.toLowerCase();
    const [localPart, domainPart] = email.split('@');
    tokens.push(...splitName(localPart));
    if (domainPart) {
      tokens.push(...splitName(domainPart.split('.')[0]));
    }
  }

  if (audienceMode !== 'group') {
    tokens.push(audienceMode);
  }

  return uniqueTokens(tokens.filter(Boolean));
}

export function normalizeAudienceTokens(values: string[] | undefined): string[] {
  return uniqueTokens((values ?? []).map(normalizeToken).filter(Boolean));
}
