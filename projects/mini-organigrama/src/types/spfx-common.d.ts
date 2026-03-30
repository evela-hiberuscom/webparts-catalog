declare module '@paquete/spfx-common' {
  export function createSafeExternalLink(
    url: string
  ): { href: string; rel: string; target: string } | undefined;

  export function classifyAsyncState(options: {
    hasData?: boolean;
    hasError?: boolean;
    isLoading?: boolean;
    isPartial?: boolean;
  }): 'loading' | 'error' | 'partialData' | 'empty' | 'ready';

  export function ensureUniqueStrings(values?: string[]): string[];
}

