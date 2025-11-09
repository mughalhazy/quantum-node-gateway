// api/dev/sign.js
import crypto from "crypto";

const DEV_KEY = process.env.DEV_SIGN_KEY;
const HMAC_SECRET = process.env.GATEWAY_HMAC_SECRET;

function hmac(raw) {
  return crypto.createHmac("sha256", HMAC_SECRET).update(raw).digest("hex");
}

function bad(res, code, error) {
  res.status(code).json({ ok: false, error });
}

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") return bad(res, 405, "method_not_allowed");

    const key = String(req.query.key || "");
    if (!DEV_KEY || key !== DEV_KEY) return bad(res, 401, "unauthorized");

    const route = String(req.query.route || "");
    if (!["createacct", "suspendacct"].includes(route))
      return bad(res, 400, "route_must_be_createacct_or_suspendacct");

    let body;
    if (route === "createacct") {
      const { username, domain, password, plan, contactemail } = req.query;
      if (!username || !domain || !password)
        return bad(res, 400, "missing_fields_for_createacct");
      body = { username, domain, password, plan, contactemail };
    } else {
      const { user, reason } = req.query;
      if (!user) return bad(res, 400, "missing_user_for_suspendacct");
      body = { user, reason: reason || "manual_test" };
    }

    const raw = JSON.stringify(body);
    const sig = hmac(raw);
    const host = req.headers.host;
    const url = `https://${host}/api/whm/${route}`;

    const f = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-qn-signature": sig,
      },
      body: raw,
    });

    const data = await f.json().catch(() => ({}));
    res.status(f.status).json({ ok: f.ok, route, request: body, response: data });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
