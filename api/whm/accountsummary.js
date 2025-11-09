import { whmJson } from "../_lib/whm.js";
import { verifyHmac, ALLOW_WHM } from "../_lib/guard.js";
import { setCors, handlePreflight } from "../_lib/cors.js";
import { rateLimit } from "../_lib/ratelimit.js";

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  setCors(req, res);

  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });
  if (rateLimit(req, res, { limit: 10, windowMs: 60_000 })) return;

  try {
    const raw = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
    if (!verifyHmac(raw, req.headers["x-qn-signature"])) {
      return res.status(401).json({ ok: false, error: "bad_signature" });
    }
    const body = raw ? JSON.parse(raw) : {};
    const user = body?.user;
    if (!user) return res.status(400).json({ ok: false, error: "user_required" });
    if (!ALLOW_WHM.has("accountsummary")) {
      return res.status(403).json({ ok: false, error: "not_allowed" });
    }

    const data = await whmJson("accountsummary", { user });
    console.log("[whm:accountsummary]", { user });
    res.json({ ok: true, summary: data?.data || {} });
  } catch (e) {
    console.error("[whm:accountsummary:error]", e?.message || e);
    res.status(500).json({ ok: false, error: "whm_error", detail: e?.message || String(e) });
  }
}
