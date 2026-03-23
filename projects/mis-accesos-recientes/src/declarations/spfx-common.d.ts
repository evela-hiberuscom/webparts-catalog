declare module '@paquete/spfx-common/utils' {
  export function createSafeExternalLink(url: string): {
    href: string;
    rel: string;
    target: string;
  } | undefined;

  export function classifyAsyncState(args: {
    hasData?: boolean;
    hasError?: boolean;
    isLoading?: boolean;
    isPartial?: boolean;
  }): 'loading' | 'error' | 'partialData' | 'empty' | 'ready';

  export function ensureUniqueStrings(values?: string[]): string[];
}

declare module '@paquete/spfx-common/testing' {
  export function createProjectTestChecklist(projectSlug: string): {
    projectSlug: string;
    requiredChecks: string[];
  };

  export function createAsyncStateFixture(overrides?: Record<string, unknown>): Record<string, unknown>;
}
