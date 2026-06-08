import { render } from "./pages.js";
import { exportState, loadState, resetState, saveState } from "./storage.js";
import { generateWorkflowDraft, improveDraft, explainDraft } from "./ai.js";
import {
  getCurrentUser,
  getCurrentWorkspace,
  scopedWorkflows,
  stepsForWorkflow,
  uid,
  workflowById
} from "./data.js";

const root = document.getElementById("app");

let state = null;
const ui = {
  loading: true,
  path: location.pathname,
  query: readQuery(),
  toasts: [],
  billingCycle: "monthly",
  workflowView: "cards",
  taskView: "list",
  onboardingStep: 1,
  onboarding: {
    businessType: "",
    goals: [],
    integrations: [],
    prompt: ""
  }
};

let focusRestore = null;

boot();

async function boot() {
  renderNow();
  state = await loadState();
  ui.loading = false;
  ui.onboarding.businessType = state.onboarding?.businessType || "";
  ui.onboarding.goals = state.onboarding?.goals || [];
  ui.onboarding.integrations = state.onboarding?.integrations || [];
  renderNow();
}

function renderNow() {
  if (state?.settings?.theme) {
    document.documentElement.dataset.theme = state.settings.theme;
    document.querySelector("meta[name='theme-color']")?.setAttribute("content", state.settings.theme === "dark" ? "#07111f" : "#f7fbff");
  }
  root.innerHTML = render(state, ui);
  restoreFocus();
}

function navigate(path) {
  const url = new URL(path, location.origin);
  history.pushState({}, "", `${url.pathname}${url.search}`);
  ui.path = url.pathname;
  ui.query = Object.fromEntries(url.searchParams.entries());
  ui.modal = null;
  window.scrollTo({ top: 0, behavior: "smooth" });
  renderNow();
}

window.addEventListener("popstate", () => {
  ui.path = location.pathname;
  ui.query = readQuery();
  ui.modal = null;
  renderNow();
});

document.addEventListener("click", async (event) => {
  const routeTarget = event.target.closest("[data-route]");
  if (routeTarget) {
    event.preventDefault();
    navigate(routeTarget.dataset.route);
    return;
  }

  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;

  const action = actionTarget.dataset.action;
  const id = actionTarget.dataset.id || "";

  if (action === "close-modal" && actionTarget.classList.contains("modal-backdrop") && event.target.closest("[data-modal-panel]")) {
    return;
  }

  event.preventDefault();
  await handleAction(action, id);
});

document.addEventListener("submit", async (event) => {
  const form = event.target.closest("[data-form]");
  if (!form) return;
  event.preventDefault();
  await handleForm(form.dataset.form, form);
});

document.addEventListener("input", (event) => {
  const target = event.target.closest("[data-filter]");
  if (!target) return;
  ui[target.dataset.filter] = target.value;
  focusRestore = {
    filter: target.dataset.filter,
    start: target.selectionStart,
    end: target.selectionEnd
  };
  renderNow();
});

document.addEventListener("change", (event) => {
  const target = event.target.closest("[data-filter]");
  if (!target) return;
  ui[target.dataset.filter] = target.value;
  focusRestore = { filter: target.dataset.filter };
  renderNow();
});

async function handleAction(action, id) {
  switch (action) {
    case "billing-cycle":
      ui.billingCycle = id;
      renderNow();
      break;
    case "open-checkout":
      ui.checkoutPlan = id;
      ui.checkoutStep = 1;
      ui.modal = { type: "checkout" };
      renderNow();
      break;
    case "checkout-next":
      ui.checkoutStep = Math.min(3, (ui.checkoutStep || 1) + 1);
      renderNow();
      break;
    case "checkout-finish":
      state.settings.billingPlan = ui.checkoutPlan || "Pro";
      getCurrentWorkspace(state).plan = state.settings.billingPlan;
      await persist("Checkout simulation complete. Billing settings were updated.");
      closeModal();
      break;
    case "select-persona":
      await switchPersona(id);
      break;
    case "onboarding-business":
      ui.onboarding.businessType = id;
      renderNow();
      break;
    case "onboarding-goal":
      toggleArray(ui.onboarding.goals, id);
      renderNow();
      break;
    case "onboarding-integration":
      toggleArray(ui.onboarding.integrations, id);
      renderNow();
      break;
    case "onboarding-next":
      ui.onboardingStep = Math.min(4, (ui.onboardingStep || 1) + 1);
      renderNow();
      break;
    case "onboarding-back":
      ui.onboardingStep = Math.max(1, (ui.onboardingStep || 1) - 1);
      renderNow();
      break;
    case "create-onboarding-workflow":
      await createWorkflowFromDraft(ui.onboardingDraft, "Your onboarding workflow draft is ready.");
      state.onboarding = { completed: true, ...ui.onboarding };
      await persist();
      break;
    case "open-workflow-create":
      ui.modal = { type: "workflow", mode: "create" };
      renderNow();
      break;
    case "open-workflow-edit":
      ui.modal = { type: "workflow", mode: "edit", id };
      renderNow();
      break;
    case "confirm-delete-workflow":
      ui.modal = { type: "delete-workflow", id };
      renderNow();
      break;
    case "delete-workflow":
      await deleteWorkflow(id);
      break;
    case "duplicate-workflow":
      await duplicateWorkflow(id);
      break;
    case "toggle-workflow-status":
      await toggleWorkflowStatus(id);
      break;
    case "workflow-view":
      ui.workflowView = id;
      renderNow();
      break;
    case "select-step":
      ui.selectedStepId = id;
      renderNow();
      break;
    case "save-builder":
      await persist("Workflow draft saved.");
      break;
    case "test-workflow":
      await testWorkflow(id);
      break;
    case "test-first-workflow":
      await testWorkflow(scopedWorkflows(state).find((workflow) => workflow.status === "Active")?.id || scopedWorkflows(state)[0]?.id);
      break;
    case "set-generator-prompt":
      ui.generatorPrompt = id;
      renderNow();
      break;
    case "improve-generated-workflow":
      ui.generatedDraft = improveDraft(ui.generatedDraft);
      toast("FlowPilot added fallback ownership and audit logging.");
      renderNow();
      break;
    case "explain-generated-workflow":
      ui.explanation = explainDraft(ui.generatedDraft);
      ui.modal = { type: "explanation" };
      renderNow();
      break;
    case "create-generated-workflow":
      await createWorkflowFromDraft(ui.generatedDraft, "Generated workflow created.");
      break;
    case "preview-template":
      ui.modal = { type: "template", id };
      renderNow();
      break;
    case "use-template":
      await createWorkflowFromTemplate(id);
      break;
    case "open-run-log":
      ui.modal = { type: "run-log", id };
      renderNow();
      break;
    case "retry-run":
      await retryRun(id);
      break;
    case "task-view":
      ui.taskView = id;
      renderNow();
      break;
    case "open-task-create":
      ui.modal = { type: "task", mode: "create" };
      renderNow();
      break;
    case "open-task-edit":
      ui.modal = { type: "task", mode: "edit", id };
      renderNow();
      break;
    case "complete-task":
      await completeTask(id);
      break;
    case "delete-task":
      await deleteTask(id);
      break;
    case "add-ai-task":
      await addAiTask();
      break;
    case "open-integration":
      ui.modal = { type: "integration", id };
      renderNow();
      break;
    case "toggle-integration":
      await toggleIntegration(id);
      break;
    case "open-member":
      ui.modal = { type: "member" };
      renderNow();
      break;
    case "open-api-keys":
      ui.modal = { type: "api-keys" };
      renderNow();
      break;
    case "open-notifications":
      ui.modal = { type: "notifications" };
      renderNow();
      break;
    case "open-persona-menu":
      ui.modal = { type: "persona-menu" };
      renderNow();
      break;
    case "toggle-theme":
      state.settings.theme = state.settings.theme === "dark" ? "light" : "dark";
      await persist(`Theme changed to ${state.settings.theme} mode.`);
      break;
    case "confirm-reset":
      ui.modal = { type: "reset" };
      renderNow();
      break;
    case "reset-data":
      state = await resetState(state.currentPersonaId || "founder");
      closeModal();
      toast("Demo seed data reset.");
      renderNow();
      break;
    case "export-data":
      exportState(state);
      toast("Demo data export prepared.");
      renderNow();
      break;
    case "close-modal":
      closeModal();
      break;
    case "toggle-sidebar":
      document.body.classList.toggle("sidebar-open");
      break;
    default:
      break;
  }
}

async function handleForm(type, form) {
  const data = Object.fromEntries(new FormData(form).entries());
  switch (type) {
    case "onboarding-generate":
      ui.onboarding.prompt = data.prompt || "";
      ui.onboardingDraft = generateWorkflowDraft(ui.onboarding.prompt);
      toast("Your workflow draft is ready.");
      renderNow();
      break;
    case "generate-workflow":
      ui.generatorPrompt = data.prompt || "";
      ui.generatedDraft = generateWorkflowDraft(ui.generatorPrompt);
      toast("FlowPilot generated a workflow draft.");
      renderNow();
      break;
    case "workflow":
      await saveWorkflow(form.dataset.id, data);
      break;
    case "step-config":
      await saveStepConfig(form.dataset.id, data);
      break;
    case "task":
      await saveTask(form.dataset.id, data);
      break;
    case "profile":
      await saveProfile(data);
      break;
    case "workspace":
      await saveWorkspace(data);
      break;
    case "notifications":
      await saveNotifications(form);
      break;
    case "member":
      await addMember(data);
      break;
    default:
      break;
  }
}

async function switchPersona(personaId) {
  const wasInApp = ui.path.startsWith("/app");
  state = await resetState(personaId);
  ui.modal = null;
  ui.onboardingStep = 1;
  ui.onboardingDraft = null;
  ui.onboarding = {
    businessType: state.onboarding.businessType,
    goals: [],
    integrations: [],
    prompt: ""
  };
  toast(`Switched to ${getCurrentUser(state).persona}.`);
  navigate(wasInApp ? "/app/dashboard" : "/onboarding");
}

async function saveWorkflow(id, data) {
  const existing = workflowById(state, id);
  const actions = String(data.actions || "")
    .split(/\r?\n/)
    .map((action) => action.trim())
    .filter(Boolean);
  const now = new Date().toISOString();
  const workflow = {
    id: existing?.id || uid("wf"),
    workspaceId: state.currentWorkspaceId,
    name: data.name,
    description: data.description,
    category: data.category,
    status: data.status,
    trigger: data.trigger,
    actions,
    ownerId: data.ownerId || state.currentUserId,
    successRate: clamp(Number(data.successRate || 92), 0, 100),
    estimatedHoursSaved: Number(data.estimatedHoursSaved || 3),
    lastRunAt: existing?.lastRunAt || null,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };

  if (existing) {
    Object.assign(existing, workflow);
    state.workflowSteps = state.workflowSteps.filter((step) => step.workflowId !== workflow.id);
  } else {
    state.workflows.push(workflow);
  }
  state.workflowSteps.push(...stepsFromWorkflow(workflow));
  addActivity(existing ? "updated" : "created", "workflow", workflow.id, `${workflow.name} ${existing ? "updated" : "created"}.`);
  await persist(existing ? "Workflow updated." : "Workflow created.");
  closeModal();
}

async function createWorkflowFromDraft(draft, message = "Workflow created from AI draft.") {
  if (!draft) {
    toast("Generate a workflow draft first.", "warning");
    renderNow();
    return;
  }
  const now = new Date().toISOString();
  const workflow = {
    id: uid("wf"),
    workspaceId: state.currentWorkspaceId,
    name: draft.name,
    description: draft.explanation,
    category: draft.category,
    status: "Draft",
    trigger: draft.trigger,
    actions: draft.actions,
    ownerId: state.currentUserId,
    successRate: draft.confidence,
    estimatedHoursSaved: draft.estimatedHoursSaved,
    lastRunAt: null,
    createdAt: now,
    updatedAt: now
  };
  state.workflows.push(workflow);
  state.workflowSteps.push(...stepsFromWorkflow(workflow, draft.integrations));
  addActivity("created", "workflow", workflow.id, `AI generated ${workflow.name}.`);
  await persist(message);
  navigate(`/app/builder?id=${workflow.id}`);
}

async function createWorkflowFromTemplate(templateId) {
  const template = state.templates.find((item) => item.id === templateId);
  if (!template) return;
  const now = new Date().toISOString();
  const workflow = {
    id: uid("wf"),
    workspaceId: state.currentWorkspaceId,
    name: template.name,
    description: template.description,
    category: template.category,
    status: "Draft",
    trigger: template.trigger,
    actions: template.actions,
    ownerId: state.currentUserId,
    successRate: 92,
    estimatedHoursSaved: template.estimatedHoursSaved,
    lastRunAt: null,
    createdAt: now,
    updatedAt: now
  };
  state.workflows.push(workflow);
  state.workflowSteps.push(...stepsFromWorkflow(workflow, template.requiredIntegrations));
  addActivity("created", "workflow", workflow.id, `Template used: ${template.name}.`);
  await persist("Template workflow created.");
  navigate(`/app/builder?id=${workflow.id}`);
}

async function duplicateWorkflow(id) {
  const source = workflowById(state, id);
  if (!source) return;
  const now = new Date().toISOString();
  const copy = {
    ...structuredCloneSafe(source),
    id: uid("wf"),
    name: `${source.name} Copy`,
    status: "Draft",
    lastRunAt: null,
    createdAt: now,
    updatedAt: now
  };
  state.workflows.push(copy);
  state.workflowSteps.push(...stepsFromWorkflow(copy));
  addActivity("created", "workflow", copy.id, `Duplicated ${source.name}.`);
  await persist("Workflow duplicated.");
}

async function deleteWorkflow(id) {
  const workflow = workflowById(state, id);
  state.workflows = state.workflows.filter((item) => item.id !== id);
  state.workflowSteps = state.workflowSteps.filter((step) => step.workflowId !== id);
  state.automationRuns = state.automationRuns.filter((run) => run.workflowId !== id);
  state.tasks = state.tasks.map((task) => task.workflowId === id ? { ...task, workflowId: "" } : task);
  addActivity("deleted", "workflow", id, `${workflow?.name || "Workflow"} deleted.`);
  await persist("Workflow deleted.");
  closeModal();
}

async function toggleWorkflowStatus(id) {
  const workflow = workflowById(state, id);
  if (!workflow) return;
  workflow.status = workflow.status === "Active" ? "Paused" : "Active";
  workflow.updatedAt = new Date().toISOString();
  addActivity("updated", "workflow", workflow.id, `${workflow.name} set to ${workflow.status}.`);
  await persist(`${workflow.name} is now ${workflow.status.toLowerCase()}.`);
}

async function saveStepConfig(id, data) {
  const step = state.workflowSteps.find((item) => item.id === id);
  if (!step) return;
  let config = {};
  try {
    config = data.config ? JSON.parse(data.config) : {};
  } catch {
    toast("Configuration must be valid JSON.", "warning");
    renderNow();
    return;
  }
  step.title = data.title;
  step.description = data.description;
  step.config = config;
  await persist("Step configuration saved.");
}

async function testWorkflow(id) {
  const workflow = workflowById(state, id);
  if (!workflow) return;
  const run = {
    id: uid("run"),
    workflowId: workflow.id,
    status: "Success",
    triggerSource: workflow.trigger.includes("Friday") ? "Scheduler" : "Demo trigger",
    duration: 18 + Math.floor(Math.random() * 42),
    logs: [
      `Received demo trigger for ${workflow.name}.`,
      "Validated trigger and condition blocks.",
      "Executed configured actions in simulation mode.",
      "Demo mode: no real emails or payments were sent."
    ],
    createdAt: new Date().toISOString()
  };
  workflow.lastRunAt = run.createdAt;
  workflow.successRate = Math.min(99, Number(workflow.successRate || 92) + 1);
  state.automationRuns.unshift(run);
  addActivity("created", "automation_run", run.id, `${workflow.name} test run completed.`);
  await persist("Workflow test completed successfully.");
}

async function retryRun(id) {
  const run = state.automationRuns.find((item) => item.id === id);
  if (!run) return;
  run.status = "Success";
  run.logs = [...run.logs, "Retry completed successfully in demo mode."];
  run.duration += 9;
  addActivity("updated", "automation_run", run.id, "Failed run retried successfully.");
  await persist("Run retried successfully.");
  closeModal();
}

async function saveTask(id, data) {
  const existing = state.tasks.find((task) => task.id === id);
  const now = new Date().toISOString();
  const task = {
    id: existing?.id || uid("task"),
    workspaceId: state.currentWorkspaceId,
    workflowId: data.workflowId || "",
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    assigneeId: data.assigneeId || state.currentUserId,
    dueDate: new Date(data.dueDate || Date.now()).toISOString(),
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };
  if (existing) Object.assign(existing, task);
  else state.tasks.unshift(task);
  addActivity(existing ? "updated" : "created", "task", task.id, `${task.title} ${existing ? "updated" : "created"}.`);
  await persist(existing ? "Task updated." : "Task created.");
  closeModal();
}

async function completeTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  task.status = "Done";
  task.updatedAt = new Date().toISOString();
  addActivity("updated", "task", task.id, `${task.title} completed.`);
  await persist("Task marked complete.");
}

async function deleteTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  state.tasks = state.tasks.filter((item) => item.id !== id);
  addActivity("deleted", "task", id, `${task?.title || "Task"} deleted.`);
  await persist("Task deleted.");
}

async function addAiTask() {
  const workflow = scopedWorkflows(state)[0];
  const now = new Date();
  now.setDate(now.getDate() + 2);
  state.tasks.unshift({
    id: uid("task"),
    workspaceId: state.currentWorkspaceId,
    workflowId: workflow?.id || "",
    title: "Review AI fallback owner recommendation",
    description: "FlowPilot suggests adding a backup owner for low-confidence automation runs.",
    status: "To do",
    priority: "High",
    assigneeId: state.currentUserId,
    dueDate: now.toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  addActivity("created", "task", "ai-suggestion", "AI-suggested task added.");
  await persist("AI-suggested task added.");
}

async function toggleIntegration(id) {
  const integration = state.integrations.find((item) => item.id === id);
  if (!integration) return;
  const connected = integration.status === "Connected";
  integration.status = connected ? "Disconnected" : "Connected";
  integration.lastSyncedAt = connected ? null : new Date().toISOString();
  integration.configSummary = connected ? "Not connected in demo mode." : `${integration.provider} demo workspace connected with read-only sample scopes.`;
  addActivity("updated", "integration", integration.id, `${integration.provider} ${integration.status.toLowerCase()}.`);
  await persist(`${integration.provider} ${connected ? "disconnected" : "connected"} in demo mode.`);
  closeModal();
}

async function saveProfile(data) {
  const user = getCurrentUser(state);
  user.name = data.name;
  user.email = data.email;
  user.role = data.role;
  addActivity("updated", "user", user.id, "Profile settings updated.");
  await persist("Profile saved.");
}

async function saveWorkspace(data) {
  const workspace = getCurrentWorkspace(state);
  workspace.name = data.name;
  workspace.industry = data.industry;
  workspace.plan = data.plan;
  state.settings.billingPlan = data.plan;
  addActivity("updated", "workspace", workspace.id, "Workspace settings updated.");
  await persist("Workspace saved.");
}

async function saveNotifications(form) {
  const formData = new FormData(form);
  state.settings.notifications = {
    failedRuns: formData.has("failedRuns"),
    weeklyDigest: formData.has("weeklyDigest"),
    approvals: formData.has("approvals"),
    productUpdates: formData.has("productUpdates")
  };
  await persist("Notification preferences saved.");
}

async function addMember(data) {
  const avatar = data.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "TM";
  const member = {
    id: uid("user"),
    name: data.name,
    email: data.email,
    role: data.role,
    avatar,
    persona: "Demo teammate",
    workspaceId: state.currentWorkspaceId
  };
  state.users.push(member);
  state.usageStats.teamSeats = Math.min(state.usageStats.seatLimit, state.usageStats.teamSeats + 1);
  addActivity("created", "user", member.id, `${member.name} invited as ${member.role}.`);
  await persist("Team member added.");
  closeModal();
}

function stepsFromWorkflow(workflow, integrations = []) {
  const actions = workflow.actions.length ? workflow.actions : ["Create follow-up task"];
  const firstIntegration = integrations[0] || "FlowPilot";
  return [
    {
      id: uid("step"),
      workflowId: workflow.id,
      type: "trigger",
      title: "Trigger",
      description: workflow.trigger,
      config: { source: firstIntegration, mode: "demo" },
      position: 1
    },
    {
      id: uid("step"),
      workflowId: workflow.id,
      type: "condition",
      title: "Qualification check",
      description: `Confirm this ${workflow.category.toLowerCase()} run should continue.`,
      config: { rule: "Continue when required fields are present" },
      position: 2
    },
    ...actions.slice(0, 4).map((action, index) => ({
      id: uid("step"),
      workflowId: workflow.id,
      type: "action",
      title: `Action ${index + 1}`,
      description: action,
      config: { integration: integrations[index % Math.max(integrations.length, 1)] || "FlowPilot", ownerId: workflow.ownerId },
      position: index + 3
    })),
    {
      id: uid("step"),
      workflowId: workflow.id,
      type: "ai",
      title: "AI suggestion",
      description: "Review run context and suggest the next best operational improvement.",
      config: { confidenceThreshold: 80, simulated: true },
      position: actions.slice(0, 4).length + 3
    }
  ];
}

function addActivity(action, entityType, entityId, message) {
  state.activityLogs.unshift({
    id: uid("log"),
    workspaceId: state.currentWorkspaceId,
    actorId: state.currentUserId,
    action,
    entityType,
    entityId,
    message,
    createdAt: new Date().toISOString()
  });
}

async function persist(message = "") {
  await saveState(state);
  if (message) toast(message);
  renderNow();
}

function closeModal() {
  ui.modal = null;
  ui.checkoutStep = 1;
  renderNow();
}

function toast(message, type = "success") {
  const item = { id: uid("toast"), message, type, title: type === "warning" ? "Check this" : "Saved" };
  ui.toasts = [...(ui.toasts || []), item].slice(-3);
  setTimeout(() => {
    ui.toasts = (ui.toasts || []).filter((toastItem) => toastItem.id !== item.id);
    renderNow();
  }, 3200);
}

function toggleArray(values, value) {
  const index = values.indexOf(value);
  if (index >= 0) values.splice(index, 1);
  else values.push(value);
}

function readQuery() {
  return Object.fromEntries(new URLSearchParams(location.search).entries());
}

function restoreFocus() {
  if (!focusRestore) return;
  const target = document.querySelector(`[data-filter="${focusRestore.filter}"]`);
  if (target) {
    target.focus();
    if (typeof focusRestore.start === "number") {
      target.setSelectionRange(focusRestore.start, focusRestore.end ?? focusRestore.start);
    }
  }
  focusRestore = null;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}
