// api/commands/flows.js
//
// Quantum Node - Cross-Module Flows v1 (stub + self-test)
// -------------------------------------------------------
// Single HTTP endpoint:
//   /api/commands/flows?cmd=<commandName>
// or POST with JSON { cmd: "<commandName>", payload: {...} }
//
// Flows (Phase 1 - stub/echo, but shaped like real world):
//   - provisionFromPayment
//   - autoSuspendOverdue
//
// Special meta-command:
//   - selftest   (runs internal tests for both flows)

export default async function handler(req, res) {
  try {
    const method = req.method || "GET";
    const isGet = method === "GET";
    const source = isGet ? req.query : (req.body || {});

    const cmd = source.cmd || source.command || null;
    const payload = source.payload || source;

    if (!cmd) {
      return res.status(200).json({
        ok: true,
        module: "flows",
        message: "No cmd provided. See 'commands' for available options.",
        commands: [
          "provisionFromPayment",
          "autoSuspendOverdue",
          "selftest",
        ],
      });
    }

    let result;

    switch (cmd) {
      case "provisionFromPayment":
        result = await flowProvisionFromPayment(payload);
        break;
      case "autoSuspendOverdue":
        result = await flowAutoSuspendOverdue(payload);
        break;
      case "selftest":
        result = await runFlowsSelfTest();
        break;
      default:
        return res.status(400).json({
          ok: false,
          module: "flows",
          error: "unknown_command",
          cmd,
        });
    }

    return res.status(result.ok ? 200 : 400).json({
      module: "flows",
      cmd,
      ...result,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      module: "flows",
      error: "internal_error",
      details: err.message || String(err),
    });
  }
}

/* ------------------------------------------------------------------ */
/*  Flow 1: provisionFromPayment                                      */
/* ------------------------------------------------------------------ */
// This represents the full end-to-end onboarding flow:
//
// External trigger (payment gateway / form) provides:
//   - customer (name, email, phone)
//   - planCode (e.g. QN_BIZ_LITE)
//   - domain  (e.g. hazyhost.com.pk)
//
// Flow does conceptually:
//   1) Create or fetch billing customer
//   2) Attach CRM profile
//   3) Create service + invoice in billing
//   4) Mark invoice as paid
//   5) Create WHM account
//   6) Send welcome email via Support
//   7) Log interaction in CRM
//
// Here, we stub the final shape without calling other modules yet.

async function flowProvisionFromPayment(input) {
  const { customer, planCode, domain } = input || {};
  const { name, email, phone } = customer || {};

  if (!customer || !name || !email || !planCode || !domain) {
    return {
      ok: false,
      error: "missing_fields",
      required: ["customer.name", "customer.email", "planCode", "domain"],
    };
  }

  // Billing side (stubbed)
  const billingCustomer = {
    id: "CUST_FLOW_" + Date.now(),
    name,
    email,
    phone: phone || null,
  };

  const billingService = {
    id: "SRV_FLOW_" + Date.now(),
    customerId: billingCustomer.id,
    planCode,
    domain,
    status: "active",
  };

  const billingInvoice = {
    id: "INV_FLOW_" + Date.now(),
    customerId: billingCustomer.id,
    serviceId: billingService.id,
    amountPkr: 999, // later: from plan
    status: "paid",
  };

  // WHM side (stubbed)
  const whmAccount = {
    username: deriveUsernameFromDomain(domain),
    domain,
    package: planCode,
    status: "active",
    ip: "190.92.170.162",
    nameservers: [
      "ns1.mysecurecloudhost.com",
      "ns2.mysecurecloudhost.com",
      "ns3.mysecurecloudhost.com",
      "ns4.mysecurecloudhost.com",
    ],
  };

  // CRM side (stubbed)
  const crmProfile = {
    customerId: billingCustomer.id,
    email,
    name,
    phone: phone || null,
    tags: ["hosting", "new_customer"],
  };

  const crmInteraction = {
    id: "INT_FLOW_" + Date.now(),
    customerId: billingCustomer.id,
    channel: "email",
    subject: "Welcome to Quantum Node",
    message: "Your hosting account is ready.",
    direction: "outbound",
  };

  // Support side (stubbed)
  const supportEmail = {
    to: email,
    subject: "Welcome to Quantum Node",
    body:
      "Hi " +
      name +
      ", your hosting for " +
      domain +
      " is now active. Thank you!",
    status: "queued",
  };

  const supportTicket = {
    id: "TCK_FLOW_" + Date.now(),
    customerId: billingCustomer.id,
    subject: "Auto: New account provisioned",
    status: "closed",
  };

  return {
    ok: true,
    flow: "provisionFromPayment",
    billing: {
      customer: billingCustomer,
      service: billingService,
      invoice: billingInvoice,
    },
    whm: {
      account: whmAccount,
    },
    crm: {
      profile: crmProfile,
      interaction: crmInteraction,
    },
    support: {
      email: supportEmail,
      ticket: supportTicket,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Flow 2: autoSuspendOverdue                                        */
/* ------------------------------------------------------------------ */
// Conceptual nightly job:
//   1) Find overdue invoices (billing)
//   2) Suspend WHM accounts
//   3) Log CRM interactions
//   4) Notify customer via email/WhatsApp

async function flowAutoSuspendOverdue(input) {
  const { daysOverdue } = input || {};
  const threshold = Number(daysOverdue || 10);

  // Stub overdue invoices
  const overdueInvoices = [
    {
      id: "INV_OVERDUE_FLOW_1",
      customerId: "CUST_OVERDUE_1",
      serviceId: "SRV_OVERDUE_1",
      domain: "overdue1.example.com",
      daysOverdue: threshold + 3,
      amountPkr: 1999,
      customerEmail: "client1@example.com",
      customerName: "Client One",
    },
  ];

  // Build suspension actions
  const actions = overdueInvoices.map((inv) => {
    const username = deriveUsernameFromDomain(inv.domain);

    return {
      invoiceId: inv.id,
      customerId: inv.customerId,
      serviceId: inv.serviceId,
      domain: inv.domain,
      billing: {
        markStatus: "overdue",
      },
      whm: {
        suspendAccount: {
          username,
          reason: `Overdue ${inv.daysOverdue} days`,
        },
      },
      crm: {
        interaction: {
          channel: "email",
          subject: "Service Suspended – Payment Overdue",
          message:
            `Dear ${inv.customerName}, your service for ${inv.domain} ` +
            `has been suspended due to non-payment.`,
          direction: "outbound",
        },
      },
      support: {
        email: {
          to: inv.customerEmail,
          subject: "Your hosting has been suspended",
          body:
            `Dear ${inv.customerName}, your hosting for ${inv.domain} ` +
            `has been suspended due to an overdue invoice (${inv.id}).`,
        },
      },
    };
  });

  return {
    ok: true,
    flow: "autoSuspendOverdue",
    thresholdDays: threshold,
    items: actions,
  };
}

/* ------------------------------------------------------------------ */
/*  Self-Test Runner                                                   */
/* ------------------------------------------------------------------ */

async function runFlowsSelfTest() {
  const results = [];

  // 1) provisionFromPayment
  results.push(
    await labelTest("provisionFromPayment", () =>
      flowProvisionFromPayment({
        customer: {
          name: "Test User",
          email: "test@example.com",
          phone: "0300-0000000",
        },
        planCode: "QN_BIZ_LITE",
        domain: "test-domain.com.pk",
      })
    )
  );

  // 2) autoSuspendOverdue
  results.push(
    await labelTest("autoSuspendOverdue", () =>
      flowAutoSuspendOverdue({
        daysOverdue: 10,
      })
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

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function deriveUsernameFromDomain(domain) {
  if (!domain) return "stubuser";
  const base = domain.split(".")[0] || "user";
  return base.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8) || "user";
}
