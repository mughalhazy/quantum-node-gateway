export default function handler(req, res) {
  const { code, name, price, currency, cycle } = req.query;

  return res.status(200).json({
    ok: true,
    route: 'billing/create-plan',
    method: req.method,
    plan: {
      code: code || null,
      name: name || null,
      price: price || null,
      currency: currency || null,
      cycle: cycle || null,
    },
  });
}
