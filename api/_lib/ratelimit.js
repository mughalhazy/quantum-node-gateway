// api/_lib/ratelimit.js
const bucket = new Map(); // key = ip+route, value = { count, resetAt }

export function rateLimit(req, res, { limit = 5, windowMs = 60_000 } = {}) {
  const ip = (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "ip") + "";
  const key = `${ip}:${req.url.split("?")[0]}`;
  const now = Date.now();

  const item = bucket.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > item.resetAt) { item.count = 0; item.resetAt = now + windowMs; }
  item.count += 1;
  bucket.set(key, item);

  res.setHeader("X-RateLimit-Limit", String(limit));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(0, limit - item.count)));
  res.setHeader("X-RateLimit-Reset", String(item.resetAt));

  if (item.count > limit) {
    res.status(429).json({ ok: false, error: "rate_limited" });
    return true;
  }
  return false;
}
