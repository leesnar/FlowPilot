import { createSeedData } from "./data.js";

const STORAGE_KEY = "flowpilot.demo.state.v1";
const API_TIMEOUT = 900;

export async function loadState() {
  await wait(280);
  const apiState = await readFromApi();
  if (apiState) {
    persistLocal(apiState);
    return apiState;
  }

  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const seeded = createSeedData("founder");
  persistLocal(seeded);
  return seeded;
}

export async function saveState(state) {
  persistLocal(state);
  void writeToApi(state);
  return state;
}

export async function resetState(personaId = "founder") {
  const seeded = createSeedData(personaId);
  persistLocal(seeded);
  await writeToApi(seeded, "/api/reset");
  return seeded;
}

export function exportState(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "flowpilot-demo-data.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function persistLocal(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function readFromApi() {
  if (!shouldTryApi()) return null;
  try {
    const response = await fetchWithTimeout("/api/bootstrap", { method: "GET" });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.state || null;
  } catch {
    return null;
  }
}

async function writeToApi(state, path = "/api/state") {
  if (!shouldTryApi()) return false;
  try {
    const response = await fetchWithTimeout(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ state })
    });
    return response.ok;
  } catch {
    return false;
  }
}

function shouldTryApi() {
  return location.protocol !== "file:" && !location.hostname.includes("localhost") && !location.hostname.includes("127.0.0.1");
}

function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeout));
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
