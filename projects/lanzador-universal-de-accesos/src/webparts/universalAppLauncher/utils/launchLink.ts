import { createSafeExternalLink } from '@paquete/spfx-common';

export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function parseAudienceTokens(value: string): string[] {
  return value
    .split(/[,\n;]/)
    .map((token) => token.trim())
    .filter(Boolean);
}

export function resolveLinkProps(url: string, openInNewTab: boolean): { href: string; rel?: string; target?: string } | undefined {
  if (openInNewTab || isExternalUrl(url)) {
    return createSafeExternalLink(url);
  }

  return { href: url };
}
