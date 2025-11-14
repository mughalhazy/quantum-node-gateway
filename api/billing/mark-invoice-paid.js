export default function handler(req, res) {
  const { invoiceId, paidAt } = req.query;

  return res.status(200).json({
    ok: true,
    route: 'billing/mark-invoice-paid',
    method: req.method,
    invoice: {
      invoiceId: invoiceId || null,
      paidAt: paidAt || null,
      status: 'paid',
    },
  });
}
