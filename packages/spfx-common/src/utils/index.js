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

function openSafeExternalLink(url) {
  const link = createSafeExternalLink(url);
  if (!link) {
    console.warn("[spfx-common] Unsafe external URL was blocked.");
    return false;
  }

  if (typeof window === "undefined" || typeof window.open !== "function") {
    return false;
  }

  window.open(link.href, link.target, "noopener,noreferrer");
  return true;
}

function escapeODataString(value) {
  return String(value).replace(/'/g, "''");
}

function resolveSameOriginUrl(rawUrl, baseUrl) {
  const value = typeof rawUrl === "string" ? rawUrl.trim() : "";
  const base = typeof baseUrl === "string" && baseUrl.trim()
    ? baseUrl
    : typeof window !== "undefined" && window.location
      ? window.location.href
      : "";

  if (!value || !base) {
    throw new Error("url and baseUrl are required");
  }

  const resolved = new URL(value, base);
  const baseOrigin = new URL(base).origin;
  if (!/^https?:$/i.test(resolved.protocol) || resolved.origin !== baseOrigin) {
    throw new Error("url must be same-origin or relative");
  }

  return resolved.toString();
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
  openSafeExternalLink,
  escapeODataString,
  resolveSameOriginUrl,
  classifyAsyncState,
  ensureUniqueStrings
};
