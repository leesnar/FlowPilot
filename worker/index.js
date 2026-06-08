import { createSeedData } from "../src/data.js";

const TABLES = {
  users: ["id", "name", "email", "role", "avatar", "persona", "workspaceId"],
  workspaces: ["id", "name", "industry", "plan", "createdAt"],
  workflows: ["id", "workspaceId", "name", "description", "category", "status", "trigger", "actions", "ownerId", "successRate", "estimatedHoursSaved", "lastRunAt", "createdAt", "updatedAt"],
  workflowSteps: ["id", "workflowId", "type", "title", "description", "config", "position"],
  automationRuns: ["id", "workflowId", "status", "triggerSource", "duration", "logs", "createdAt"],
  tasks: ["id", "workspaceId", "workflowId", "title", "description", "status", "priority", "assigneeId", "dueDate", "createdAt", "updatedAt"],
  integrations: ["id", "workspaceId", "provider", "status", "lastSyncedAt", "configSummary"],
  activityLogs: ["id", "workspaceId", "actorId", "action", "entityType", "entityId", "message", "createdAt"],
  templates: ["id", "name", "category", "description", "trigger", "actions", "estimatedSetupTime", "estimatedHoursSaved", "requiredIntegrations"]
};

const TABLE_NAMES = {
  users: "users",
  workspaces: "workspaces",
  workflows: "workflows",
  workflowSteps: "workflow_steps",
  automationRuns: "automation_runs",
  tasks: "tasks",
  integrations: "integrations",
  activityLogs: "activity_logs",
  templates: "templates"
};

const COLUMN_NAMES = {
  workspaceId: "workspace_id",
  ownerId: "owner_id",
  successRate: "success_rate",
  estimatedHoursSaved: "estimated_hours_saved",
  lastRunAt: "last_run_at",
  createdAt: "created_at",
  updatedAt: "updated_at",
  workflowId: "workflow_id",
  triggerSource: "trigger_source",
  assigneeId: "assignee_id",
  dueDate: "due_date",
  lastSyncedAt: "last_synced_at",
  configSummary: "config_summary",
  actorId: "actor_id",
  entityType: "entity_type",
  entityId: "entity_id",
  estimatedSetupTime: "estimated_setup_time",
  requiredIntegrations: "required_integrations",
  trigger: "\"trigger\""
};

const JSON_FIELDS = new Set(["actions", "config", "logs", "requiredIntegrations"]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env, url);
    }

    if (env.ASSETS) return env.ASSETS.fetch(request);
    return json({ ok: true, message: "FlowPilot Worker is ready. Static assets are served by Sites." });
  }
};

async function handleApi(request, env, url) {
  if (!env.DB) return json({ ok: false, error: "D1 binding DB is not configured." }, 503);

  if (request.method === "GET" && url.pathname === "/api/health") {
    return json({ ok: true, storage: "d1" });
  }

  if (request.method === "GET" && url.pathname === "/api/bootstrap") {
    await seedIfEmpty(env.DB);
    return json({ ok: true, state: await readState(env.DB) });
  }

  if (request.method === "POST" && (url.pathname === "/api/state" || url.pathname === "/api/reset")) {
    const payload = await request.json();
    const state = payload.state || createSeedData(payload.personaId || "founder");
    await replaceState(env.DB, state);
    return json({ ok: true, state });
  }

  return json({ ok: false, error: "Not found" }, 404);
}

async function seedIfEmpty(db) {
  const result = await db.prepare("SELECT COUNT(*) AS count FROM users").first();
  if (!result?.count) {
    await replaceState(db, createSeedData("founder"));
  }
}

async function readState(db) {
  const state = createSeedData("founder");

  for (const [key, fields] of Object.entries(TABLES)) {
    const rows = await db.prepare(`SELECT * FROM ${TABLE_NAMES[key]}`).all();
    state[key] = (rows.results || []).map((row) => fromDbRow(row, fields));
  }

  const settings = await db.prepare("SELECT * FROM settings LIMIT 1").first();
  if (settings) {
    state.settings = {
      workspaceId: settings.workspace_id,
      theme: settings.theme,
      notifications: parseJson(settings.notifications, {}),
      billingPlan: settings.billing_plan,
      usageLimit: settings.usage_limit
    };
  }

  const usage = await db.prepare("SELECT * FROM usage_stats LIMIT 1").first();
  if (usage) {
    state.usageStats = {
      workspaceId: usage.workspace_id,
      monthlyRuns: usage.monthly_runs,
      runLimit: usage.run_limit,
      aiCredits: usage.ai_credits,
      aiCreditLimit: usage.ai_credit_limit,
      teamSeats: usage.team_seats,
      seatLimit: usage.seat_limit
    };
  }

  const firstUser = state.users.find((user) => user.workspaceId === state.settings.workspaceId) || state.users[0];
  const firstWorkspace = state.workspaces.find((workspace) => workspace.id === state.settings.workspaceId) || state.workspaces[0];
  state.currentWorkspaceId = firstWorkspace?.id || state.currentWorkspaceId;
  state.currentUserId = firstUser?.id || state.currentUserId;
  state.currentPersonaId = firstUser?.id?.replace("user-", "") || state.currentPersonaId;
  return state;
}

async function replaceState(db, state) {
  const deleteStatements = [
    ...Object.values(TABLE_NAMES).map((table) => db.prepare(`DELETE FROM ${table}`)),
    db.prepare("DELETE FROM settings"),
    db.prepare("DELETE FROM usage_stats")
  ];
  await db.batch(deleteStatements);

  const statements = [];
  for (const [key, fields] of Object.entries(TABLES)) {
    for (const row of state[key] || []) {
      statements.push(insertStatement(db, TABLE_NAMES[key], fields, row));
    }
  }

  statements.push(db.prepare("INSERT INTO settings (workspace_id, theme, notifications, billing_plan, usage_limit) VALUES (?, ?, ?, ?, ?)")
    .bind(state.settings.workspaceId, state.settings.theme, JSON.stringify(state.settings.notifications || {}), state.settings.billingPlan, state.settings.usageLimit));
  statements.push(db.prepare("INSERT INTO usage_stats (workspace_id, monthly_runs, run_limit, ai_credits, ai_credit_limit, team_seats, seat_limit) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(state.usageStats.workspaceId, state.usageStats.monthlyRuns, state.usageStats.runLimit, state.usageStats.aiCredits, state.usageStats.aiCreditLimit, state.usageStats.teamSeats, state.usageStats.seatLimit));

  if (statements.length) await db.batch(statements);
}

function insertStatement(db, table, fields, row) {
  const columns = fields.map((field) => COLUMN_NAMES[field] || field);
  const placeholders = fields.map(() => "?").join(", ");
  const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`;
  const values = fields.map((field) => JSON_FIELDS.has(field) ? JSON.stringify(row[field] || []) : row[field] ?? null);
  return db.prepare(sql).bind(...values);
}

function fromDbRow(row, fields) {
  return fields.reduce((item, field) => {
    const column = (COLUMN_NAMES[field] || field).replaceAll("\"", "");
    item[field] = JSON_FIELDS.has(field) ? parseJson(row[column], []) : row[column];
    return item;
  }, {});
}

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
