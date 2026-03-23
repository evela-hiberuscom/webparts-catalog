export function createSafeExternalLink(url) {
  return {
    href: url,
    rel: "noopener noreferrer",
    target: "_blank"
  };
}

export function classifyAsyncState({ hasData = false, hasError = false, isLoading = false, isPartial = false }) {
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

export function ensureUniqueStrings(values = []) {
  return [...new Set(values.filter(Boolean))];
}
