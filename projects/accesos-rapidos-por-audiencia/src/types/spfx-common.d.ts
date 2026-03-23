declare module '@paquete/spfx-common' {
  export const hiberusThemeTokens: {
    palette: {
      primary: string;
      primaryDark: string;
      accent: string;
      accentHover: string;
      textPrimary: string;
      textSecondary: string;
      textInverse: string;
      surface: string;
      white: string;
    };
    typography: {
      heading: string;
      body: string;
    };
    spacing: Record<string, string>;
    radii: Record<string, string>;
  };

  export const selfHostedFontManifest: {
    families: Array<{
      family: string;
      recommendedWeights: string[];
      projectRelativeTarget: string;
    }>;
    strategy: string;
    cspSafe: boolean;
  };

  export function createSafeExternalLink(url: string): {
    href: string;
    rel: string;
    target: string;
  } | undefined;

  export function classifyAsyncState(input: {
    hasData?: boolean;
    hasError?: boolean;
    isLoading?: boolean;
    isPartial?: boolean;
  }): 'loading' | 'error' | 'partialData' | 'empty' | 'ready';

  export function ensureUniqueStrings(values?: string[]): string[];
}
