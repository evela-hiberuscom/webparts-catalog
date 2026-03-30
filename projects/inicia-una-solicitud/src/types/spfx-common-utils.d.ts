declare module '@paquete/spfx-common/utils' {
  import type { IRequestLink } from '../webparts/startARequest/models/startARequestModels';

  export function createSafeExternalLink(
    url: string
  ): Pick<IRequestLink, 'href' | 'external' | 'rel' | 'target'> | undefined;

  export function classifyAsyncState(input: {
    hasData?: boolean;
    hasError?: boolean;
    isLoading?: boolean;
    isPartial?: boolean;
  }): 'loading' | 'ready' | 'empty' | 'partialData' | 'error';

  export function ensureUniqueStrings(values?: string[]): string[];
}
