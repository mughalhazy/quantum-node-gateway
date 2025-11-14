// /api/billing/create-plan.js
import { db } from '../../lib/db.js';
import { sendJson } from '../../lib/cors.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { planId, name, price, features } = req.body;

    if (!planId || !name || !price) {
      return sendJson(res, 400, { ok: false, error: 'Missing planId, name or price' });
    }

    db.plans[planId] = {
      planId,
      name,
      price,
      features: features || [],
      createdAt: new Date().toISOString()
    };

    return sendJson(res, 200, {
      ok: true,
      plan: db.plans[planId]
    });

  } catch (err) {
    return sendJson(res, 500, { ok: false, error: err.message });
  }
}
