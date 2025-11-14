// /api/billing/mark-invoice-paid.js
import { db } from '../../lib/db.js';
import { sendJson } from '../../lib/cors.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { invoiceId } = req.body;

    if (!invoiceId) {
      return sendJson(res, 400, { ok: false, error: 'Missing invoiceId' });
    }

    const invoice = db.invoices[invoiceId];
    if (!invoice) return sendJson(res, 404, { ok: false, error: 'Invoice not found' });

    invoice.status = "paid";
    invoice.paidAt = new Date().toISOString();

    // Update the service next renewal date
    const service = db.services[invoice.serviceId];
    if (service) {
      service.nextInvoiceDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // next 30 days
    }

    return sendJson(res, 200, {
      ok: true,
      invoice
    });

  } catch (err) {
    return sendJson(res, 500, { ok: false, error: err.message });
  }
}
