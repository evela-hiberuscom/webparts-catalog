declare module '@paquete/spfx-common/utils' {
  export interface ISafeExternalLink {
    href: string;
    rel: string;
    target: string;
  }

  export function createSafeExternalLink(url?: string | null): ISafeExternalLink | undefined;
  export function classifyAsyncState(args?: {
    hasData?: boolean;
    hasError?: boolean;
    isLoading?: boolean;
    isPartial?: boolean;
  }): 'loading' | 'error' | 'partialData' | 'empty' | 'ready';
  export function ensureUniqueStrings(values?: Array<string | null | undefined>): string[];
}
