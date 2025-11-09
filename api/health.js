// api/health.js
export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json({
    ok: true,
    service: "quantum-node-gateway",
    uptime: process.uptime(),
    version: process.env.VERCEL_GIT_COMMIT_SHA || "local",
    time: new Date().toISOString()
  });
}
