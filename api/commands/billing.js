// api/commands/billing.js
//
// Quantum Node - Billing Commands v1 (stub logic + self-test)
// -----------------------------------------------------------
// This file exposes a single HTTP endpoint:
//   /api/commands/billing?cmd=<commandName>
// or POST with JSON { cmd: "<commandName>", payload: {...} }
//
// Commands (Phase 1 - stubbed):
//   - createCustomer
//   - getCustomerByEmail
//   - addPlan
//   - getPlanByCode
//   - createServiceWithInvoice
//   - markInvoicePaid
//   - listCustomerServices
//   - listCustomerInvoices
//   - recordPayment
//   - findOverdueInvoices
//
// Special meta-command:
//   - selftest   (runs internal tests for all commands)

export default async function handler(req, res) {
  try {
    const method = req.method || "GET";

    // Allow both GET (query) and POST (JSON body)
    const isGet = method === "GET";
    const source = isGet ? req.query : (req.body || {});

    const cmd = source.cmd || source.command || null;
    const payload = source.payload || source; // allow flat params too

    if (!cmd) {
      return res.status(200).json({
        ok: true,
        module: "billing",
        message: "No cmd provided. See 'commands' for available options.",
        commands: [
          "createCustomer",
          "getCustomerByEmail",
          "addPlan",
          "getPlanByCode",
          "createServiceWithInvoice",
          "markInvoicePaid",
          "listCustomerServices",
          "listCustomerInvoices",
          "recordPayment",
          "findOverdueInvoices",
          "selftest",
        ],
      });
    }

    let result;

    switch (cmd) {
      case "createCustomer":
        result = await cmdCreateCustomer(payload);
        break;
      case "getCustomerByEmail":
        result = await cmdGetCustomerByEmail(payload);
        break;
      case "addPlan":
        result = await cmdAddPlan(payload);
        break;
      case "getPlanByCode":
        result = await cmdGetPlanByCode(payload);
        break;
      case "createServiceWithInvoice":
        result = await cmdCreateServiceWithInvoice(payload);
        break;
      case "markInvoicePaid":
        result = await cmdMarkInvoicePaid(payload);
        break;
      case "listCustomerServices":
        result = await cmdListCustomerServices(payload);
        break;
      case "listCustomerInvoices":
        result = await cmdListCustomerInvoices(payload);
        break;
      case "recordPayment":
        result = await cmdRecordPayment(payload);
        break;
      case "findOverdueInvoices":
        result = await cmdFindOverdueInvoices(payload);
        break;
      case "selftest":
        result = await runBillingSelfTest();
        break;
      default:
        return res.status(400).json({
          ok: false,
          module: "billing",
          error: "unknown_command",
          cmd,
        });
    }

    // Standardize response envelope
    return res.status(result.ok ? 200 : 400).json({
      module: "billing",
      cmd,
      ...result,
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      module: "billing",
      error: "internal_error",
      details: err.message || String(err),
    });
  }
}

/* ------------------------------------------------------------------ */
/*  Atomic Command Implementations (Phase 1: Stub/Echo)               */
/* ------------------------------------------------------------------ */

// NOTE: These are intentionally "dumb" echo stubs for now.
// Later we will replace internals with real DB logic while
// keeping the same external input/output shape.

async function cmdCreateCustomer(input) {
  const { name, email, phone, country } = input;

  if (!name || !email) {
    return {
      ok: false,
      error: "missing_fields",
      required: ["name", "email"],
    };
  }

  return {
    ok: true,
    customer: {
      id: "CUST_TEMP_" + Date.now(),
      name,
      email,
      phone: phone || null,
      country: country || "PK",
      createdAt: new Date().toISOString(),
    },
  };
}

async function cmdGetCustomerByEmail(input) {
  const { email } = input;
  if (!email) {
    return { ok: false, error: "missing_email" };
  }

  // Phase 1 stub: pretend not found
  return {
    ok: true,
    customer: null, // later: real lookup
  };
}

async function cmdAddPlan(input) {
  const { code, name, cycle, pricePkr, whmPackage, description } = input;

  if (!code || !name || !cycle || !pricePkr || !whmPackage) {
    return {
      ok: false,
      error: "missing_fields",
      required: ["code", "name", "cycle", "pricePkr", "whmPackage"],
    };
  }

  return {
    ok: true,
    plan: {
      id: "PLAN_TEMP_" + Date.now(),
      code,
      name,
      cycle,
      pricePkr,
      whmPackage,
      description: description || null,
      createdAt: new Date().toISOString(),
    },
  };
}

async function cmdGetPlanByCode(input) {
  const { code } = input;
  if (!code) {
    return { ok: false, error: "missing_code" };
  }

  // Phase 1 stub: return a fake plan with that code
  return {
    ok: true,
    plan: {
      id: "PLAN_FAKE_" + code,
      code,
      name: "Stub " + code,
      cycle: "monthly",
      pricePkr: 999,
      whmPackage: "quantumn_Starter",
      description: "Stub plan for testing only",
    },
  };
}

async function cmdCreateServiceWithInvoice(input) {
  const { customerId, planCode, domain, billingCycle } = input;

  if (!customerId || !planCode || !domain) {
    return {
      ok: false,
      error: "missing_fields",
      required: ["customerId", "planCode", "domain"],
    };
  }

  const serviceId = "SRV_TEMP_" + Date.now();
  const invoiceId = "INV_TEMP_" + Date.now();

  return {
    ok: true,
    service: {
      id: serviceId,
      customerId,
      planCode,
      domain,
      status: "pending_activation", // later: "active" after WHM
      billingCycle: billingCycle || "monthly",
      createdAt: new Date().toISOString(),
    },
    invoice: {
      id: invoiceId,
      customerId,
      serviceId,
      amountPkr: 999, // later: from plan price
      status: "unpaid",
      issuedAt: new Date().toISOString(),
      dueAt: new Date(Date.now() + 7 * 86400000).toISOString(), // +7 days
    },
  };
}

async function cmdMarkInvoicePaid(input) {
  const { invoiceId, paidAt } = input;
  if (!invoiceId) {
    return { ok: false, error: "missing_invoiceId" };
  }

  return {
    ok: true,
    invoice: {
      id: invoiceId,
      status: "paid",
      paidAt: paidAt || new Date().toISOString(),
    },
  };
}

async function cmdListCustomerServices(input) {
  const { customerId } = input;
  if (!customerId) {
    return { ok: false, error: "missing_customerId" };
  }

  // Phase 1 stub: return example list
  return {
    ok: true,
    services: [
      {
        id: "SRV_EXAMPLE_1",
        customerId,
        planCode: "QN_BIZ_LITE",
        domain: "example1.com",
        status: "active",
      },
      {
        id: "SRV_EXAMPLE_2",
        customerId,
        planCode: "QN_BIZ_PRO",
        domain: "example2.com",
        status: "suspended",
      },
    ],
  };
}

async function cmdListCustomerInvoices(input) {
  const { customerId } = input;
  if (!customerId) {
    return { ok: false, error: "missing_customerId" };
  }

  // Phase 1 stub: return example invoices
  return {
    ok: true,
    invoices: [
      {
        id: "INV_EXAMPLE_1",
        customerId,
        status: "paid",
        amountPkr: 999,
      },
      {
        id: "INV_EXAMPLE_2",
        customerId,
        status: "unpaid",
        amountPkr: 1499,
      },
    ],
  };
}

async function cmdRecordPayment(input) {
  const { invoiceId, amountPkr, method, reference } = input;
  if (!invoiceId || !amountPkr) {
    return {
      ok: false,
      error: "missing_fields",
      required: ["invoiceId", "amountPkr"],
    };
  }

  return {
    ok: true,
    payment: {
      id: "PAY_TEMP_" + Date.now(),
      invoiceId,
      amountPkr,
      method: method || "manual",
      reference: reference || null,
      createdAt: new Date().toISOString(),
    },
  };
}

async function cmdFindOverdueInvoices(input) {
  const { daysOverdue } = input;
  const threshold = Number(daysOverdue || 10);

  // Phase 1 stub: return fake overdue invoices
  return {
    ok: true,
    thresholdDays: threshold,
    overdueInvoices: [
      {
        id: "INV_OVERDUE_1",
        customerId: "CUST_EXAMPLE_1",
        daysOverdue: threshold + 2,
        amountPkr: 1999,
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Self-Test Runner                                                   */
/* ------------------------------------------------------------------ */

async function runBillingSelfTest() {
  const results = [];

  // 1) createCustomer
  results.push(
    await labelTest("createCustomer", () =>
      cmdCreateCustomer({
        name: "Test User",
        email: "test@example.com",
        phone: "0300-0000000",
        country: "PK",
      })
    )
  );

  // 2) getCustomerByEmail
  results.push(
    await labelTest("getCustomerByEmail", () =>
      cmdGetCustomerByEmail({ email: "test@example.com" })
    )
  );

  // 3) addPlan
  results.push(
    await labelTest("addPlan", () =>
      cmdAddPlan({
        code: "QN_TEST_PLAN",
        name: "Test Plan",
        cycle: "monthly",
        pricePkr: 999,
        whmPackage: "quantumn_Starter",
      })
    )
  );

  // 4) getPlanByCode
  results.push(
    await labelTest("getPlanByCode", () =>
      cmdGetPlanByCode({ code: "QN_TEST_PLAN" })
    )
  );

  // 5) createServiceWithInvoice
  results.push(
    await labelTest("createServiceWithInvoice", () =>
      cmdCreateServiceWithInvoice({
        customerId: "CUST_TEST_1",
        planCode: "QN_TEST_PLAN",
        domain: "test-domain.com",
        billingCycle: "monthly",
      })
    )
  );

  // 6) markInvoicePaid
  results.push(
    await labelTest("markInvoicePaid", () =>
      cmdMarkInvoicePaid({ invoiceId: "INV_TEST_1" })
    )
  );

  // 7) listCustomerServices
  results.push(
    await labelTest("listCustomerServices", () =>
      cmdListCustomerServices({ customerId: "CUST_TEST_1" })
    )
  );

  // 8) listCustomerInvoices
  results.push(
    await labelTest("listCustomerInvoices", () =>
      cmdListCustomerInvoices({ customerId: "CUST_TEST_1" })
    )
  );

  // 9) recordPayment
  results.push(
    await labelTest("recordPayment", () =>
      cmdRecordPayment({
        invoiceId: "INV_TEST_1",
        amountPkr: 999,
        method: "manual",
      })
    )
  );

  // 10) findOverdueInvoices
  results.push(
    await labelTest("findOverdueInvoices", () =>
      cmdFindOverdueInvoices({ daysOverdue: 10 })
    )
  );

  const allOk = results.every((r) => r.ok);

  return {
    ok: allOk,
    summary: {
      passed: results.filter((r) => r.ok).map((r) => r.name),
      failed: results.filter((r) => !r.ok),
    },
    tests: results,
  };
}

async function labelTest(name, fn) {
  try {
    const out = await fn();
    return {
      name,
      ok: !!out.ok,
      result: out,
    };
  } catch (err) {
    return {
      name,
      ok: false,
      error: err.message || String(err),
    };
  }
}
