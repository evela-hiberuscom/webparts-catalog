declare module '@paquete/spfx-common/utils' {
  export interface ISafeExternalLink {
    href: string;
    rel: string;
    target: string;
  }

  export function createSafeExternalLink(url: string | undefined | null): ISafeExternalLink | undefined;
  export function classifyAsyncState(input: {
    hasData?: boolean;
    hasError?: boolean;
    isLoading?: boolean;
    isPartial?: boolean;
  }): 'loading' | 'error' | 'partialData' | 'empty' | 'ready';
}
