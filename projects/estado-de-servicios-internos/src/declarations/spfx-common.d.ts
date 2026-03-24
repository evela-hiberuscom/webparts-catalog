declare module "@paquete/spfx-common" {
  export interface ISafeExternalLink {
    href: string;
    rel?: string;
    target?: string;
  }

  export function createSafeExternalLink(url?: string): ISafeExternalLink | undefined;

  export function classifyAsyncState(input: {
    hasData?: boolean;
    hasError?: boolean;
    isLoading?: boolean;
    isPartial?: boolean;
  }): "loading" | "error" | "partialData" | "empty" | "ready";

  export function ensureUniqueStrings(values?: string[]): string[];
}
