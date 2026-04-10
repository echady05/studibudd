const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^\[::1\]$/i,
  /^::1$/i,
  /^fc00:/i,
  /^fe80:/i,
];

function isPrivateHost(hostname) {
  if (!hostname) return true;
  return PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
}

export function normalizeCanvasUrl(raw) {
  const value = String(raw || "").trim();
  if (!value) {
    throw new Error("Canvas URL is required");
  }

  const candidate = value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;

  let url;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error("Canvas URL must be a valid URL");
  }

  if (url.protocol !== "https:") {
    throw new Error("Canvas URL must use https://");
  }

  if (isPrivateHost(url.hostname)) {
    throw new Error("Canvas URL host is not allowed");
  }

  url.pathname = url.pathname.replace(/\/+$/, "");
  return url.toString().replace(/\/$/, "");
}

export function buildCanvasHeaders(canvasToken) {
  return {
    Authorization: `Bearer ${String(canvasToken)}`,
    Accept: "application/json",
  };
}
