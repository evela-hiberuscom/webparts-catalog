declare module '@paquete/spfx-common' {
  export function classifyAsyncState(input: {
    hasData?: boolean;
    hasError?: boolean;
    isLoading?: boolean;
    isPartial?: boolean;
  }): 'loading' | 'error' | 'partialData' | 'empty' | 'ready';

  export function ensureUniqueStrings(values?: string[]): string[];
}

