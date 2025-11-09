// api/_lib/cors.js
const ALLOW_ORIGINS = (process.env.ADMIN_ORIGIN || "*").split(",");

export function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && (ALLOW_ORIGINS.includes("*") || ALLOW_ORIGINS.includes(origin))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*"); // safe default for server-to-server
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type, x-qn-signature");
}

export function handlePreflight(req, res) {
  if (req.method === "OPTIONS") {
    setCors(req, res);
    res.status(204).end();
    return true;
  }
  return false;
}
