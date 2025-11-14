export default function handler(req, res) {
  const { customerId, planCode, domain, start } = req.query;

  return res.status(200).json({
    ok: true,
    route: 'billing/create-service-and-invoice',
    method: req.method,
    service: {
      customerId: customerId || null,
      planCode: planCode || null,
      domain: domain || null,
      start: start || null,
    },
    invoice: {
      tempInvoiceId: 'INV_TEMP_001',
      status: 'pending',
    },
  });
}
