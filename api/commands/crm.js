// api/commands/crm.js
//
// Quantum Node - CRM Commands v1 (stub logic + self-test)
// -------------------------------------------------------
// Single HTTP endpoint:
//   /api/commands/crm?cmd=<commandName>
// or POST with JSON { cmd: "<commandName>", payload: {...} }
//
// Commands (Phase 1 - stub/echo):
//   - attachCustomerProfile
//   - updateCustomerProfile
//   - addTagToCustomer
//   - logInteraction
//   - getCustomerOverview
//   - listInteractionsForCustomer
//
// Special meta-command:
//   - selftest   (runs internal tests for all commands)

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
        module: "crm",
        message: "No cmd provided. See 'commands' for available options.",
        commands: [
          "attachCustomerProfile",
          "updateCustomerProfile",
          "addTagToCustomer",
          "logInteraction",
          "getCustomerOverview",
          "listInteractionsForCustomer",
          "selftest",
        ],
      });
    }

    let result;

    switch (cmd) {
      case "attachCustomerProfile":
        result = await cmdAttachCustomerProfile(payload);
        break;
      case "updateCustomerProfile":
        result = await cmdUpdateCustomerProfile(payload);
        break;
      case "addTagToCustomer":
        result = await cmdAddTagToCustomer(payload);
        break;
      case "logInteraction":
        result = await cmdLogInteraction(payload);
        break;
      case "getCustomerOverview":
        result = await cmdGetCustomerOverview(payload);
        break;
      case "listInteractionsForCustomer":
        result = await cmdListInteractionsForCustomer(payload);
        break;
      case "selftest":
        result = await runCrmSelfTest();
        break;
      default:
        return res.status(400).json({
          ok: false,
          module: "crm",
          error: "unknown_command",
          cmd,
        });
    }

    return res.status(result.ok ? 200 : 400).json({
      module: "crm",
      cmd,
      ...result,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      module: "crm",
      error: "internal_error",
      details: err.message || String(err),
    });
  }
}

/* ------------------------------------------------------------------ */
/*  Atomic Command Implementations (Phase 1: Stub/Echo)               */
/* ------------------------------------------------------------------ */

async function cmdAttachCustomerProfile(input) {
  const { customerId, email, name, phone, company } = input;

  if (!customerId || !email) {
    return {
      ok: false,
      error: "missing_fields",
      required: ["customerId", "email"],
    };
  }

  return {
    ok: true,
    profile: {
      customerId,
      email,
      name: name || "Unknown",
      phone: phone || null,
      company: company || null,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      note: "Stub attachCustomerProfile – no real DB yet.",
    },
  };
}

async function cmdUpdateCustomerProfile(input) {
  const { customerId, ...fields } = input;
  if (!customerId) {
    return { ok: false, error: "missing_customerId" };
  }

  return {
    ok: true,
    profile: {
      customerId,
      ...fields,
      updatedAt: new Date().toISOString(),
      note: "Stub updateCustomerProfile – merge only in memory.",
    },
  };
}

async function cmdAddTagToCustomer(input) {
  const { customerId, tag } = input;
  if (!customerId || !tag) {
    return {
      ok: false,
      error: "missing_fields",
      required: ["customerId", "tag"],
    };
  }

  return {
    ok: true,
    customerId,
    tagAdded: tag,
    tags: [tag], // stubbed list
    updatedAt: new Date().toISOString(),
    note: "Stub addTagToCustomer – no real persistence yet.",
  };
}

async function cmdLogInteraction(input) {
  const { customerId, channel, subject, message, agent, direction } = input;
  if (!customerId || !channel || !message) {
    return {
      ok: false,
      error: "missing_fields",
      required: ["customerId", "channel", "message"],
    };
  }

  return {
    ok: true,
    interaction: {
      id: "INT_TEMP_" + Date.now(),
      customerId,
      channel, // email | chat | phone | whatsapp | system
      subject: subject || null,
      message,
      agent: agent || "system",
      direction: direction || "outbound",
      createdAt: new Date().toISOString(),
      note: "Stub logInteraction – no real DB yet.",
    },
  };
}

async function cmdGetCustomerOverview(input) {
  const { customerId } = input;
  if (!customerId) {
    return { ok: false, error: "missing_customerId" };
  }

  // Stubbed overview; later we'll pull from billing + support + crm tables.
  return {
    ok: true,
    overview: {
      customerId,
      profile: {
        email: "test@example.com",
        name: "Test User",
        phone: "0300-0000000",
        company: "Quantum Node",
        tags: ["hosting", "pk"],
      },
      services: [
        {
          id: "SRV_EXAMPLE_1",
          planCode: "QN_BIZ_LITE",
          domain: "example.com",
          status: "active",
        },
      ],
      invoices: [
        {
          id: "INV_EXAMPLE_1",
          status: "paid",
          amountPkr: 999,
        },
      ],
      lastInteractions: [
        {
          id: "INT_EXAMPLE_1",
          channel: "email",
          subject: "Welcome",
          direction: "outbound",
          at: "2025-11-01T10:00:00.000Z",
        },
      ],
      note: "Stub getCustomerOverview – combined view.",
    },
  };
}

async function cmdListInteractionsForCustomer(input) {
  const { customerId, limit } = input;
  if (!customerId) {
    return { ok: false, error: "missing_customerId" };
  }

  const n = Math.min(Number(limit || 5), 50);

  const interactions = [];
  for (let i = 1; i <= n; i++) {
    interactions.push({
      id: "INT_EXAMPLE_" + i,
      customerId,
      channel: i % 2 === 0 ? "email" : "chat",
      subject: i % 2 === 0 ? "Update " + i : null,
      message: "Stub interaction message " + i,
      direction: i % 2 === 0 ? "outbound" : "inbound",
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    });
  }

  return {
    ok: true,
    interactions,
    note: "Stub listInteractionsForCustomer – no real DB yet.",
  };
}

/* ------------------------------------------------------------------ */
/*  Self-Test Runner                                                   */
/* ------------------------------------------------------------------ */

async function runCrmSelfTest() {
  const results = [];

  // 1) attachCustomerProfile
  results.push(
    await labelTest("attachCustomerProfile", () =>
      cmdAttachCustomerProfile({
        customerId: "CUST_TEST_1",
        email: "test@example.com",
        name: "Test User",
        phone: "0300-0000000",
        company: "Quantum Node",
      })
    )
  );

  // 2) updateCustomerProfile
  results.push(
    await labelTest("updateCustomerProfile", () =>
      cmdUpdateCustomerProfile({
        customerId: "CUST_TEST_1",
        phone: "0300-1111111",
      })
    )
  );

  // 3) addTagToCustomer
  results.push(
    await labelTest("addTagToCustomer", () =>
      cmdAddTagToCustomer({
        customerId: "CUST_TEST_1",
        tag: "vip",
      })
    )
  );

  // 4) logInteraction
  results.push(
    await labelTest("logInteraction", () =>
      cmdLogInteraction({
        customerId: "CUST_TEST_1",
        channel: "email",
        subject: "Welcome",
        message: "Welcome to Quantum Node!",
        agent: "system",
        direction: "outbound",
      })
    )
  );

  // 5) getCustomerOverview
  results.push(
    await labelTest("getCustomerOverview", () =>
      cmdGetCustomerOverview({
        customerId: "CUST_TEST_1",
      })
    )
  );

  // 6) listInteractionsForCustomer
  results.push(
    await labelTest("listInteractionsForCustomer", () =>
      cmdListInteractionsForCustomer({
        customerId: "CUST_TEST_1",
        limit: 3,
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
