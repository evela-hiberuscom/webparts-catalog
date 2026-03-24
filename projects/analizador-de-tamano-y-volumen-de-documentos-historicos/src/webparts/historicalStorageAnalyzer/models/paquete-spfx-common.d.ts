declare module '@paquete/spfx-common' {
  export function createSafeExternalLink(
    url: string
  ): {
    href: string;
    rel: string;
    target: string;
  } | undefined;

  export function classifyAsyncState(options: {
    hasData?: boolean;
    hasError?: boolean;
    isLoading?: boolean;
    isPartial?: boolean;
  }): 'loading' | 'error' | 'partialData' | 'empty' | 'ready';

  export function ensureUniqueStrings(values?: string[]): string[];

  export const hiberusThemeTokens: {
    palette: Record<string, string>;
    typography: Record<string, string>;
    spacing: Record<string, string>;
    radii: Record<string, string>;
  };
}
