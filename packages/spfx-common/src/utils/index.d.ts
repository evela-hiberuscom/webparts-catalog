export interface ISafeExternalLink {
  href: string;
  rel: 'noopener noreferrer';
  target: '_blank';
}

export function createSafeExternalLink(url: string | undefined): ISafeExternalLink | undefined;

export function openSafeExternalLink(url: string | undefined): boolean;

export function escapeODataString(value: string): string;

export function resolveSameOriginUrl(rawUrl: string, baseUrl: string): string;

export function classifyAsyncState(args: {
  hasData?: boolean;
  hasError?: boolean;
  isLoading?: boolean;
  isPartial?: boolean;
}): 'loading' | 'error' | 'partialData' | 'empty' | 'ready';

export function ensureUniqueStrings(values?: string[]): string[];
