declare module '@paquete/spfx-common' {
  export function createSafeExternalLink(url: string): {
    href: string;
    rel: string;
    target: string;
  } | undefined;

  export function ensureUniqueStrings(values?: string[]): string[];

  export function classifyAsyncState(input: {
    hasData?: boolean;
    hasError?: boolean;
    isLoading?: boolean;
    isPartial?: boolean;
  }): 'loading' | 'ready' | 'empty' | 'error' | 'partialData';
}
