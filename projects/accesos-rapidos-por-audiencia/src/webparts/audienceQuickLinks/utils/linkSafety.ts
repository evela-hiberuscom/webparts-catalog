import { createSafeExternalLink } from '@paquete/spfx-common';

export interface ISafeLinkAttributes {
  href: string;
  target?: string;
  rel?: string;
}

function isDangerousScheme(value: string): boolean {
  return /^(javascript|data|vbscript):/i.test(value);
}

function isExternalHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function resolveSafeLink(url: string | undefined, baseOrigin?: string): ISafeLinkAttributes | undefined {
  const value = (url ?? '').trim();

  if (!value || isDangerousScheme(value)) {
    return undefined;
  }

  if (value.startsWith('/') || value.startsWith('#') || value.startsWith('?')) {
    return { href: value };
  }

  if (/^(mailto:|tel:)/i.test(value)) {
    return { href: value };
  }

  if (isExternalHttpUrl(value)) {
    return createSafeExternalLink(value);
  }

  if (!baseOrigin) {
    return { href: value };
  }

  try {
    const candidate = new URL(value, baseOrigin);
    if (candidate.origin === new URL(baseOrigin).origin) {
      return {
        href: `${candidate.pathname}${candidate.search}${candidate.hash}`
      };
    }

    return createSafeExternalLink(candidate.toString());
  } catch {
    return undefined;
  }
}
