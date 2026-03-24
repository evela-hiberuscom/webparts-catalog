declare module '@paquete/spfx-common/utils' {
  export function createSafeExternalLink(
    url: string | undefined
  ): { href: string; rel: string; target: string } | undefined;
  export function classifyAsyncState(args: {
    hasData?: boolean;
    hasError?: boolean;
    isLoading?: boolean;
    isPartial?: boolean;
  }): 'loading' | 'ready' | 'partialData' | 'empty' | 'error';
}

