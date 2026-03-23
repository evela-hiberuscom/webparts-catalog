export function createProjectTestChecklist(projectSlug) {
  return {
    projectSlug,
    requiredChecks: [
      "build",
      "tests",
      "coverage",
      "accessibility-smoke",
      "packaging"
    ]
  };
}

export function createAsyncStateFixture(overrides = {}) {
  return {
    hasData: false,
    hasError: false,
    isLoading: false,
    isPartial: false,
    ...overrides
  };
}
