// api/_lib/guard.js
import crypto from "crypto";

const SECRET = process.env.GATEWAY_HMAC_SECRET;

/**
 * Verify HMAC of the raw JSON body against the x-qn-signature header (hex).
 */
export function verifyHmac(rawBody, signature) {
  if (!SECRET || !rawBody || !signature) return false;
  try {
    const calc = crypto.createHmac("sha256", SECRET).update(rawBody).digest("hex");
    // timing-safe compare
    return crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(String(signature)));
  } catch {
    return false;
  }
}

/**
 * Whitelisted WHM actions this gateway is allowed to call.
 * Add new actions here as we implement new endpoints.
 */
export const ALLOW_WHM = new Set([
  "listaccts",
  "accountsummary",
  // Phase 3 endpoints:
  "createacct",
  "suspendacct",
]);
