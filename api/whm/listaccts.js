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
    if (!ALLOW_WHM.has("listaccts")) {
      return res.status(403).json({ ok: false, error: "not_allowed" });
    }

    const data = await whmJson("listaccts");
    const accounts = (data?.data?.acct || []).map(a => ({
      domain: a.domain, user: a.user, suspended: a.suspended, plan: a.plan, diskused: a.diskused
    }));
    console.log("[whm:listaccts]", { count: accounts.length });
    res.json({ ok: true, accounts });
  } catch (e) {
    console.error("[whm:listaccts:error]", e?.message || e);
    res.status(500).json({ ok: false, error: "whm_error", detail: e?.message || String(e) });
  }
}
