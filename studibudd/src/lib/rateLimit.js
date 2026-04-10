const rateLimitStore = new Map();

function getRemoteIp(req) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "unknown";
}

export function getRateLimitKey(req) {
  return `rate-limit:${getRemoteIp(req)}`;
}

export function assertNotRateLimited(key, maxAttempts, windowMs) {
  const now = Date.now();
  const entry = rateLimitStore.get(key) || { count: 0, expiresAt: now + windowMs };

  if (entry.expiresAt < now) {
    entry.count = 0;
    entry.expiresAt = now + windowMs;
  }

  if (entry.count >= maxAttempts) {
    rateLimitStore.set(key, entry);
    throw new Error("Too many requests. Please try again later.");
  }

  entry.count += 1;
  rateLimitStore.set(key, entry);
}
