import { whmJson } from "../_lib/whm.js";
import { verifyHmac, ALLOW_WHM } from "../_lib/guard.js";
import { setCors, handlePreflight } from "../_lib/cors.js";
import { rateLimit } from "../_lib/ratelimit.js";

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  setCors(req, res);
  if (req.method !== "POST") return res.status(405).json({ ok:false, error:"method_not_allowed" });
  if (rateLimit(req, res, { limit: 5 })) return;

  try {
    const raw = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
    if (!verifyHmac(raw, req.headers["x-qn-signature"])) return res.status(401).json({ ok:false, error:"bad_signature" });
    if (!ALLOW_WHM.has("createacct")) return res.status(403).json({ ok:false, error:"not_allowed" });

    const { username, domain, password, plan, contactemail } = JSON.parse(raw);
    if (!username || !domain || !password || !plan) {
      return res.status(400).json({ ok:false, error:"missing_fields", need:["username","domain","password","plan"] });
    }

    const data = await whmJson("createacct", { username, domain, password, plan, contactemail });
    return res.json({ ok:true, result: data?.data || data });
  } catch (e) {
    console.error("[whm:createacct]", e?.message || e);
    res.status(500).json({ ok:false, error:"whm_error", detail:e?.message || String(e) });
  }
}
