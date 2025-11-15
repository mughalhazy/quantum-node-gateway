// api/commands/whm.js
//
// Quantum Node - WHM Commands v1 (stub logic + self-test)
// -------------------------------------------------------
// Single HTTP endpoint:
//   /api/commands/whm?cmd=<commandName>
// or POST with JSON { cmd: "<commandName>", payload: {...} }
//
// Commands (Phase 1 - stub/echo):
//   - createAccount
//   - suspendAccount
//   - unsuspendAccount
//   - changePackage
//   - getAccountSummary
//   - listAccounts
//   - setupEmailForDomain
//   - resetPassword
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
        module: "whm",
        message: "No cmd provided. See 'commands' for available options.",
        commands: [
          "createAccount",
          "suspendAccount",
          "unsuspendAccount",
          "changePackage",
          "getAccountSummary",
          "listAccounts",
          "setupEmailForDomain",
          "resetPassword",
          "selftest",
        ],
      });
    }

    let result;

    switch (cmd) {
      case "createAccount":
        result = await cmdCreateAccount(payload);
        break;
      case "suspendAccount":
        result = await cmdSuspendAccount(payload);
        break;
      case "unsuspendAccount":
        result = await cmdUnsuspendAccount(payload);
        break;
      case "changePackage":
        result = await cmdChangePackage(payload);
        break;
      case "getAccountSummary":
        result = await cmdGetAccountSummary(payload);
        break;
      case "listAccounts":
        result = await cmdListAccounts(payload);
        break;
      case "setupEmailForDomain":
        result = await cmdSetupEmailForDomain(payload);
        break;
      case "resetPassword":
        result = await cmdResetPassword(payload);
        break;
      case "selftest":
        result = await runWhmSelfTest();
        break;
      default:
        return res.status(400).json({
          ok: false,
          module: "whm",
          error: "unknown_command",
          cmd,
        });
    }

    return res.status(result.ok ? 200 : 400).json({
      module: "whm",
      cmd,
      ...result,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      module: "whm",
      error: "internal_error",
      details: err.message || String(err),
    });
  }
}

/* ------------------------------------------------------------------ */
/*  Atomic Command Implementations (Phase 1: Stub/Echo)               */
/* ------------------------------------------------------------------ */

// NOTE: These are stubbed/echo commands for now.
// Later we will replace internals with real calls to your WHM gateway,
// keeping the same input/output shapes.

async function cmdCreateAccount(input) {
  const {
    username,
    domain,
    planCode,
    whmPackage,
    contactEmail,
    password,
  } = input;

  if (!username || !domain || (!planCode && !whmPackage) || !contactEmail) {
    return {
      ok: false,
      error: "missing_fields",
      required: ["username", "domain", "contactEmail", "planCode or whmPackage"],
    };
  }

  return {
    ok: true,
    account: {
      username,
      domain,
      package: whmPackage || planCode || "quantumn_Starter",
      contactEmail,
      status: "active",
      ip: "190.92.170.162", // stub
      nameservers: [
        "ns1.mysecurecloudhost.com",
        "ns2.mysecurecloudhost.com",
        "ns3.mysecurecloudhost.com",
        "ns4.mysecurecloudhost.com",
      ],
      createdAt: new Date().toISOString(),
      note: "Stub createAccount – no real WHM call yet.",
    },
  };
}

async function cmdSuspendAccount(input) {
  const { username, domain, reason } = input;
  if (!username && !domain) {
    return {
      ok: false,
      error: "missing_identifier",
      required: ["username or domain"],
    };
  }

  return {
    ok: true,
    suspension: {
      username: username || null,
      domain: domain || null,
      reason: reason || "Unspecified",
      status: "suspended",
      suspendedAt: new Date().toISOString(),
      note: "Stub suspendAccount – no real WHM call yet.",
    },
  };
}

async function cmdUnsuspendAccount(input) {
  const { username, domain } = input;
  if (!username && !domain) {
    return {
      ok: false,
      error: "missing_identifier",
      required: ["username or domain"],
    };
  }

  return {
    ok: true,
    unsuspension: {
      username: username || null,
      domain: domain || null,
      status: "active",
      unsuspendedAt: new Date().toISOString(),
      note: "Stub unsuspendAccount – no real WHM call yet.",
    },
  };
}

async function cmdChangePackage(input) {
  const { username, domain, newPackage } = input;
  if ((!username && !domain) || !newPackage) {
    return {
      ok: false,
      error: "missing_fields",
      required: ["username or domain", "newPackage"],
    };
  }

  return {
    ok: true,
    change: {
      username: username || null,
      domain: domain || null,
      newPackage,
      changedAt: new Date().toISOString(),
      note: "Stub changePackage – no real WHM call yet.",
    },
  };
}

async function cmdGetAccountSummary(input) {
  const { username, domain } = input;
  if (!username && !domain) {
    return {
      ok: false,
      error: "missing_identifier",
      required: ["username or domain"],
    };
  }

  // Stubbed summary
  return {
    ok: true,
    account: {
      username: username || "stubuser",
      domain: domain || "stubdomain.com",
      package: "quantumn_Starter",
      status: "active",
      diskUsedMb: 512,
      diskLimitMb: 10240,
      bandwidthUsedMb: 1024,
      bandwidthLimitMb: 102400,
      createdAt: "2025-01-01T00:00:00.000Z",
      lastLoginAt: "2025-11-01T12:00:00.000Z",
      note: "Stub getAccountSummary – no real WHM call yet.",
    },
  };
}

async function cmdListAccounts(input) {
  const { limit } = input;
  const n = Math.min(Number(limit || 3), 20);

  const accounts = [];
  for (let i = 1; i <= n; i++) {
    accounts.push({
      username: "stubuser" + i,
      domain: "stub" + i + ".example.com",
      status: i % 2 === 0 ? "active" : "suspended",
      package: i % 2 === 0 ? "quantumn_Starter" : "quantumn_Pro",
    });
  }

  return {
    ok: true,
    accounts,
    note: "Stub listAccounts – no real WHM call yet.",
  };
}

async function cmdSetupEmailForDomain(input) {
  const { domain, mxTarget, spfPolicy } = input;

  if (!domain) {
    return { ok: false, error: "missing_domain" };
  }

  return {
    ok: true,
    emailSetup: {
      domain,
      mxTarget: mxTarget || "mx.mysecurecloudhost.com",
      spfPolicy: spfPolicy || "v=spf1 a mx ~all",
      dkimEnabled: true,
      updatedAt: new Date().toISOString(),
      note: "Stub setupEmailForDomain – no real DNS/WHM call yet.",
    },
  };
}

async function cmdResetPassword(input) {
  const { username, domain, newPassword } = input;
  if (!username && !domain) {
    return {
      ok: false,
      error: "missing_identifier",
      required: ["username or domain"],
    };
  }

  return {
    ok: true,
    passwordReset: {
      username: username || null,
      domain: domain || null,
      newPassword: newPassword ? "***hidden***" : null,
      status: "queued",
      requestedAt: new Date().toISOString(),
      note: "Stub resetPassword – no real WHM call yet.",
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Self-Test Runner                                                   */
/* ------------------------------------------------------------------ */

async function runWhmSelfTest() {
  const results = [];

  // 1) createAccount
  results.push(
    await labelTest("createAccount", () =>
      cmdCreateAccount({
        username: "qnaitest01",
        domain: "qnaitest01.com.pk",
        planCode: "QN_TEST_PLAN",
        contactEmail: "owner@qnaitest01.com.pk",
        password: "TempPass@123",
      })
    )
  );

  // 2) suspendAccount
  results.push(
    await labelTest("suspendAccount", () =>
      cmdSuspendAccount({
        username: "qnaitest01",
        reason: "Selftest suspend",
      })
    )
  );

  // 3) unsuspendAccount
  results.push(
    await labelTest("unsuspendAccount", () =>
      cmdUnsuspendAccount({
        username: "qnaitest01",
      })
    )
  );

  // 4) changePackage
  results.push(
    await labelTest("changePackage", () =>
      cmdChangePackage({
        username: "qnaitest01",
        newPackage: "quantumn_Starter",
      })
    )
  );

  // 5) getAccountSummary
  results.push(
    await labelTest("getAccountSummary", () =>
      cmdGetAccountSummary({
        username: "qnaitest01",
      })
    )
  );

  // 6) listAccounts
  results.push(
    await labelTest("listAccounts", () =>
      cmdListAccounts({
        limit: 3,
      })
    )
  );

  // 7) setupEmailForDomain
  results.push(
    await labelTest("setupEmailForDomain", () =>
      cmdSetupEmailForDomain({
        domain: "qnaitest01.com.pk",
      })
    )
  );

  // 8) resetPassword
  results.push(
    await labelTest("resetPassword", () =>
      cmdResetPassword({
        username: "qnaitest01",
        newPassword: "TempPass@456",
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
