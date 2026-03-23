function createProjectTestChecklist(projectSlug) {
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

function createAsyncStateFixture(overrides = {}) {
  return {
    hasData: false,
    hasError: false,
    isLoading: false,
    isPartial: false,
    ...overrides
  };
}

module.exports = {
  createProjectTestChecklist,
  createAsyncStateFixture
};
