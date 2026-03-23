const sharedComponentContracts = {
  sectionHeading: {
    requiredProps: ["title"],
    optionalProps: ["subtitle", "alignment", "theme", "ctaText", "ctaUrl"]
  },
  safeLink: {
    requiredProps: ["href", "children"],
    optionalProps: ["target", "rel", "ariaLabel"]
  },
  asyncStatePanel: {
    requiredProps: ["state"],
    optionalProps: ["title", "description", "retryLabel"]
  }
};

module.exports = {
  sharedComponentContracts
};
