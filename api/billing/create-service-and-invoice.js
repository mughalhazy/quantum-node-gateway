// /api/billing/create-service-and-invoice.js
import { db } from '../../lib/db.js';
import { sendJson } from '../../lib/cors.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { customerId, planId } = req.body;

    if (!customerId || !planId) {
      return sendJson(res, 400, { ok: false, error: 'Missing customerId or planId' });
    }

    const customer = db.customers[customerId];
    const plan = db.plans[planId];

    if (!customer) return sendJson(res, 404, { ok: false, error: 'Customer not found' });
    if (!plan) return sendJson(res, 404, { ok: false, error: 'Plan not found' });

    // Create service
    const serviceId = 'svc_' + Date.now();

    db.services[serviceId] = {
      serviceId,
      customerId,
      planId,
      status: "active",
      nextInvoiceDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // Create invoice
    const invoiceId = 'inv_' + Date.now();

    db.invoices[invoiceId] = {
      invoiceId,
      serviceId,
      customerId,
      amount: plan.price,
      status: 'unpaid',
      createdAt: new Date().toISOString()
    };

    return sendJson(res, 200, {
      ok: true,
      service: db.services[serviceId],
      invoice: db.invoices[invoiceId]
    });

  } catch (err) {
    return sendJson(res, 500, { ok: false, error: err.message });
  }
}
