import { whmJson } from "../_lib/whm.js";
import { verifyHmac, ALLOW_WHM } from "../_lib/guard.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
  if (!verifyHmac(body, req.headers["x-qn-signature"])) return res.status(401).json({ error: "bad signature" });
  if (!ALLOW_WHM.has("accountsummary")) return res.status(403).json({ error: "not allowed" });

  const parsed = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  if (!parsed.user) return res.status(400).json({ error: "user required" });

  try {
    const data = await whmJson("accountsummary", { user: parsed.user });
    res.json({ ok: true, summary: data?.data || {} });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
