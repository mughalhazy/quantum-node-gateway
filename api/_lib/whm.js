const host  = process.env.WHM_HOST;
const user  = process.env.WHM_USER;
const token = process.env.WHM_TOKEN;

function authHeaders() { return { Authorization: `whm ${user}:${token}` }; }

export async function whmJson(fn, params = {}) {
  const qs = new URLSearchParams({ "api.version": "1" });
  for (const [k,v] of Object.entries(params)) qs.set(k, String(v));
  const url = `https://${host}:2087/json-api/${fn}?${qs.toString()}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`WHM ${fn} ${res.status}`);
  return res.json();
}
