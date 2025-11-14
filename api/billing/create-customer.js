export default function handler(req, res) {
  const { name, email, phone } = req.query;

  return res.status(200).json({
    ok: true,
    route: 'billing/create-customer',
    method: req.method,
    customer: {
      name: name || null,
      email: email || null,
      phone: phone || null,
    },
  });
}
