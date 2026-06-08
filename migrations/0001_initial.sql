CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT NOT NULL,
  persona TEXT NOT NULL,
  workspace_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  plan TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  "trigger" TEXT NOT NULL,
  actions TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  success_rate REAL NOT NULL,
  estimated_hours_saved REAL NOT NULL,
  last_run_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workflow_steps (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  config TEXT NOT NULL,
  position INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS automation_runs (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  status TEXT NOT NULL,
  trigger_source TEXT NOT NULL,
  duration INTEGER NOT NULL,
  logs TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  workflow_id TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  assignee_id TEXT NOT NULL,
  due_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS integrations (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL,
  last_synced_at TEXT,
  config_summary TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  "trigger" TEXT NOT NULL,
  actions TEXT NOT NULL,
  estimated_setup_time TEXT NOT NULL,
  estimated_hours_saved REAL NOT NULL,
  required_integrations TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  workspace_id TEXT PRIMARY KEY,
  theme TEXT NOT NULL,
  notifications TEXT NOT NULL,
  billing_plan TEXT NOT NULL,
  usage_limit INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS usage_stats (
  workspace_id TEXT PRIMARY KEY,
  monthly_runs INTEGER NOT NULL,
  run_limit INTEGER NOT NULL,
  ai_credits INTEGER NOT NULL,
  ai_credit_limit INTEGER NOT NULL,
  team_seats INTEGER NOT NULL,
  seat_limit INTEGER NOT NULL
);
