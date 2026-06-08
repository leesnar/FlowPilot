import { access, readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createSeedData } from "../src/data.js";

const requiredFiles = [
  "index.html",
  "src/main.js",
  "src/styles.css",
  "src/data.js",
  "src/storage.js",
  "src/ai.js",
  "worker/index.js",
  "migrations/0001_initial.sql",
  "wrangler.toml"
];

for (const file of requiredFiles) {
  await access(file);
}

const sourceFiles = [
  ...(await readdir("src")).filter((file) => file.endsWith(".js")).map((file) => `src/${file}`),
  "worker/index.js",
  "scripts/build.mjs",
  "scripts/dev-server.mjs"
];

for (const file of sourceFiles) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`${file} failed syntax validation:\n${result.stderr}`);
  }
}

const state = createSeedData("founder");
const checks = [
  ["personas", state.personas.length >= 3],
  ["workspaces", state.workspaces.length >= 3],
  ["templates", state.templates.length >= 8],
  ["workflows", state.workflows.length >= 6],
  ["automation runs", state.automationRuns.length >= 20],
  ["tasks", state.tasks.length >= 15],
  ["activity logs", state.activityLogs.length >= 10],
  ["integrations", state.integrations.length >= 8]
];

const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
if (failed.length) {
  throw new Error(`Seed data checks failed: ${failed.join(", ")}`);
}

const build = spawnSync("npm", ["run", "build"], { stdio: "inherit", shell: true });
if (build.status !== 0) {
  throw new Error("Build command failed.");
}

console.log("FlowPilot validation passed.");
