// /api/billing/create-customer.js
import { db } from '../../lib/db.js';
import { sendJson } from '../../lib/cors.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { customerName, email, phone } = req.body;

    if (!customerName || !email) {
      return sendJson(res, 400, { ok: false, error: 'Missing customerName or email' });
    }

    const id = Date.now().toString();

    // Insert into the in-memory DB
    db.customers[id] = {
      id,
      customerName,
      email,
      phone: phone || null,
      createdAt: new Date().toISOString()
    };

    return sendJson(res, 200, {
      ok: true,
      customer: db.customers[id]
    });

  } catch (err) {
    return sendJson(res, 500, { ok: false, error: err.message });
  }
}
