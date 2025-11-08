import crypto from "crypto";
const SECRET = process.env.GATEWAY_HMAC_SECRET;

export function verifyHmac(rawBody, signature) {
  if (!signature) return false;
  const calc = crypto.createHmac("sha256", SECRET).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(String(signature)));
  } catch {
    return false;
  }
}

export const ALLOW_WHM = new Set(["listaccts", "accountsummary"]);
