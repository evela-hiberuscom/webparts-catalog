export * from './utils';

export const hiberusThemeTokens: {
  palette: Record<string, string>;
  typography: Record<string, string>;
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

export const sharedComponentContracts: Record<
  string,
  {
    requiredProps: string[];
    optionalProps: string[];
  }
>;

export function createProjectTestChecklist(projectSlug: string): {
  projectSlug: string;
  requiredChecks: string[];
};

export function createAsyncStateFixture(overrides?: Record<string, unknown>): Record<string, unknown>;
