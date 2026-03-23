function isDangerousProtocol(value) {
  return /^(javascript|data|vbscript):/i.test(value);
}

function isAllowedDirectLink(value) {
  return /^(https?:\/\/|mailto:|tel:|\/|#|\?)/i.test(value);
}

function createSafeExternalLink(url) {
  const value = typeof url === "string" ? url.trim() : "";

  if (!value || isDangerousProtocol(value) || !isAllowedDirectLink(value)) {
    return undefined;
  }

  return {
    href: value,
    rel: "noopener noreferrer",
    target: "_blank"
  };
}

function classifyAsyncState({ hasData = false, hasError = false, isLoading = false, isPartial = false }) {
  if (isLoading) {
    return "loading";
  }

  if (hasError && !hasData) {
    return "error";
  }

  if (isPartial) {
    return "partialData";
  }

  if (!hasData) {
    return "empty";
  }

  return "ready";
}

function ensureUniqueStrings(values = []) {
  return [...new Set(values.filter(Boolean))];
}

module.exports = {
  createSafeExternalLink,
  classifyAsyncState,
  ensureUniqueStrings
};
