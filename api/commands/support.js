// api/commands/support.js
//
// Quantum Node - Support Commands v1 (stub logic + self-test)
// -----------------------------------------------------------
// Single HTTP endpoint:
//   /api/commands/support?cmd=<commandName>
// or POST with JSON { cmd: "<commandName>", payload: {...} }
//
// Commands (Phase 1 - stub/echo):
//   - createTicket
//   - updateTicketStatus
//   - addTicketNote
//   - sendEmail
//   - sendWhatsAppMessage
//   - listTicketsForCustomer
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
        module: "support",
        message: "No cmd provided. See 'commands' for available options.",
        commands: [
          "createTicket",
          "updateTicketStatus",
          "addTicketNote",
          "sendEmail",
          "sendWhatsAppMessage",
          "listTicketsForCustomer",
          "selftest",
        ],
      });
    }

    let result;

    switch (cmd) {
      case "createTicket":
        result = await cmdCreateTicket(payload);
        break;
      case "updateTicketStatus":
        result = await cmdUpdateTicketStatus(payload);
        break;
      case "addTicketNote":
        result = await cmdAddTicketNote(payload);
        break;
      case "sendEmail":
        result = await cmdSendEmail(payload);
        break;
      case "sendWhatsAppMessage":
        result = await cmdSendWhatsAppMessage(payload);
        break;
      case "listTicketsForCustomer":
        result = await cmdListTicketsForCustomer(payload);
        break;
      case "selftest":
        result = await runSupportSelfTest();
        break;
      default:
        return res.status(400).json({
          ok: false,
          module: "support",
          error: "unknown_command",
          cmd,
        });
    }

    return res.status(result.ok ? 200 : 400).json({
      module: "support",
      cmd,
      ...result,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      module: "support",
      error: "internal_error",
      details: err.message || String(err),
    });
  }
}

/* ------------------------------------------------------------------ */
/*  Atomic Command Implementations (Phase 1: Stub/Echo)               */
/* ------------------------------------------------------------------ */

async function cmdCreateTicket(input) {
  const { customerId, subject, message, channel, priority } = input;
  if (!customerId || !subject || !message) {
    return {
      ok: false,
      error: "missing_fields",
      required: ["customerId", "subject", "message"],
    };
  }

  return {
    ok: true,
    ticket: {
      id: "TCK_TEMP_" + Date.now(),
      customerId,
      subject,
      message,
      channel: channel || "system",
      priority: priority || "normal",
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      note: "Stub createTicket – no real DB yet.",
    },
  };
}

async function cmdUpdateTicketStatus(input) {
  const { ticketId, status } = input;
  if (!ticketId || !status) {
    return {
      ok: false,
      error: "missing_fields",
      required: ["ticketId", "status"],
    };
  }

  return {
    ok: true,
    ticket: {
      id: ticketId,
      status,
      updatedAt: new Date().toISOString(),
      note: "Stub updateTicketStatus – no real DB yet.",
    },
  };
}

async function cmdAddTicketNote(input) {
  const { ticketId, note, internal, author } = input;
  if (!ticketId || !note) {
    return {
      ok: false,
      error: "missing_fields",
      required: ["ticketId", "note"],
    };
  }

  return {
    ok: true,
    ticketId,
    note: {
      id: "NOTE_TEMP_" + Date.now(),
      internal: internal !== false, // default true
      author: author || "system",
      body: note,
      createdAt: new Date().toISOString(),
    },
  };
}

async function cmdSendEmail(input) {
  const { to, subject, body, template, context } = input;
  if (!to || (!body && !template)) {
    return {
      ok: false,
      error: "missing_fields",
      required: ["to", "body or template"],
    };
  }

  return {
    ok: true,
    email: {
      to,
      subject: subject || "(no subject)",
      body: body || `Rendered from template ${template}`,
      context: context || null,
      status: "queued", // later: "sent"
      queuedAt: new Date().toISOString(),
      note: "Stub sendEmail – no SMTP/ESP integration yet.",
    },
  };
}

async function cmdSendWhatsAppMessage(input) {
  const { to, body } = input;
  if (!to || !body) {
    return {
      ok: false,
      error: "missing_fields",
      required: ["to", "body"],
    };
  }

  return {
    ok: true,
    whatsapp: {
      to,
      body,
      status: "queued",
      queuedAt: new Date().toISOString(),
      note: "Stub sendWhatsAppMessage – no provider integration yet.",
    },
  };
}

async function cmdListTicketsForCustomer(input) {
  const { customerId, limit } = input;
  if (!customerId) {
    return { ok: false, error: "missing_customerId" };
  }

  const n = Math.min(Number(limit || 3), 50);

  const tickets = [];
  for (let i = 1; i <= n; i++) {
    tickets.push({
      id: "TCK_EXAMPLE_" + i,
      customerId,
      subject: "Example ticket " + i,
      status: i === 1 ? "open" : "closed",
      priority: i === 1 ? "high" : "normal",
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    });
  }

  return {
    ok: true,
    tickets,
    note: "Stub listTicketsForCustomer – no real DB yet.",
  };
}

/* ------------------------------------------------------------------ */
/*  Self-Test Runner                                                   */
/* ------------------------------------------------------------------ */

async function runSupportSelfTest() {
  const results = [];

  // 1) createTicket
  results.push(
    await labelTest("createTicket", () =>
      cmdCreateTicket({
        customerId: "CUST_TEST_1",
        subject: "Test Issue",
        message: "Something is not working.",
        channel: "email",
        priority: "high",
      })
    )
  );

  // 2) updateTicketStatus
  results.push(
    await labelTest("updateTicketStatus", () =>
      cmdUpdateTicketStatus({
        ticketId: "TCK_TEST_1",
        status: "in_progress",
      })
    )
  );

  // 3) addTicketNote
  results.push(
    await labelTest("addTicketNote", () =>
      cmdAddTicketNote({
        ticketId: "TCK_TEST_1",
        note: "Investigating the issue.",
        internal: true,
        author: "system",
      })
    )
  );

  // 4) sendEmail
  results.push(
    await labelTest("sendEmail", () =>
      cmdSendEmail({
        to: "test@example.com",
        subject: "We received your ticket",
        body: "Thank you for contacting Quantum Node.",
      })
    )
  );

  // 5) sendWhatsAppMessage
  results.push(
    await labelTest("sendWhatsAppMessage", () =>
      cmdSendWhatsAppMessage({
        to: "03000000000",
        body: "Your ticket has been updated.",
      })
    )
  );

  // 6) listTicketsForCustomer
  results.push(
    await labelTest("listTicketsForCustomer", () =>
      cmdListTicketsForCustomer({
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
