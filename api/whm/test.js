import { whmJson } from "../_lib/whm.js";

export default async function handler(req, res) {
  // Quick security check so nobody else can call it
  const key = req.query?.key || req.headers["x-test-key"];
  if (!key || key !== process.env.TEST_KEY) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  try {
    // Ask WHM for a small list of accounts
    const data = await whmJson("listaccts");
    const acct = (data?.data?.acct || []).slice(0, 3).map(a => ({
      user: a.user, domain: a.domain, plan: a.plan, suspended: a.suspended
    }));
    return res.json({ ok: true, sample: acct, total: (data?.data?.acct || []).length });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
