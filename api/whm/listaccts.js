import { whmJson } from "../_lib/whm.js";
import { verifyHmac, ALLOW_WHM } from "../_lib/guard.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
  if (!verifyHmac(body, req.headers["x-qn-signature"])) return res.status(401).json({ error: "bad signature" });
  if (!ALLOW_WHM.has("listaccts")) return res.status(403).json({ error: "not allowed" });

  try {
    const data = await whmJson("listaccts");
    const accounts = (data?.data?.acct || []).map(a => ({
      domain: a.domain, user: a.user, suspended: a.suspended, plan: a.plan, diskused: a.diskused
    }));
    res.json({ ok: true, accounts });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
