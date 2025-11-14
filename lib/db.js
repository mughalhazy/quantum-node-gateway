const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    if (!process.env.BILLING_DATABASE_URL) {
      throw new Error('BILLING_DATABASE_URL is not set');
    }
    pool = new Pool({
      connectionString: process.env.BILLING_DATABASE_URL,
    });
  }
  return pool;
}

async function query(text, params) {
  const client = await getPool().connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

module.exports = { query };
