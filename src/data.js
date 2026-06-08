export const personaOptions = [
  {
    id: "founder",
    label: "Demo Founder",
    name: "Maya Chen",
    email: "maya@northstar.studio",
    role: "Owner",
    avatar: "MC",
    workspaceId: "ws-founder",
    workspaceName: "Northstar Studio",
    industry: "Agency",
    plan: "Pro",
    focus: "client onboarding and reporting",
    note: "Runs a lean strategy studio with recurring client work."
  },
  {
    id: "ops",
    label: "Operations Manager",
    name: "Rafael Ortiz",
    email: "rafael@blueharbor.co",
    role: "Admin",
    avatar: "RO",
    workspaceId: "ws-ops",
    workspaceName: "Blue Harbor Services",
    industry: "Local Service",
    plan: "Scale",
    focus: "dispatch, follow-ups, and support triage",
    note: "Coordinates a local service team with high-volume requests."
  },
  {
    id: "agency",
    label: "Agency Owner",
    name: "Ari Morgan",
    email: "ari@pixelthread.agency",
    role: "Owner",
    avatar: "AM",
    workspaceId: "ws-agency",
    workspaceName: "Pixelthread Agency",
    industry: "Marketing",
    plan: "Pro",
    focus: "content approvals and lead qualification",
    note: "Manages approvals, leads, and weekly client reporting."
  }
];

export const businessTypes = ["Agency", "Freelancer", "Local Service", "SaaS", "E-commerce", "Consulting"];
export const automationGoals = [
  "Client onboarding",
  "Follow-up emails",
  "Support triage",
  "Task assignment",
  "Weekly reports",
  "Invoice reminders",
  "Content approvals"
];
export const integrationProviders = [
  "Gmail",
  "Slack",
  "Notion",
  "Google Sheets",
  "Stripe",
  "Trello",
  "HubSpot",
  "Asana",
  "Airtable",
  "Calendly"
];
export const templateCategories = [
  "Sales",
  "Client Onboarding",
  "Finance",
  "Support",
  "Marketing",
  "Operations",
  "Reporting"
];
export const workflowStatuses = ["Active", "Draft", "Paused", "Needs Review"];
export const taskStatuses = ["To do", "In progress", "Waiting", "Done"];
export const priorities = ["Low", "Medium", "High", "Urgent"];
export const runStatuses = ["Success", "Failed", "Warning", "Skipped"];

export const dataModelOverview = [
  ["User", "Demo identity, role, avatar, selected persona, and workspace mapping."],
  ["Workspace", "Industry, billing plan, creation timestamp, and shared team context."],
  ["Workflow", "Automation definition with trigger, actions, status, owner, performance, and time savings."],
  ["WorkflowStep", "Structured trigger, condition, action, and AI suggestion blocks for the builder."],
  ["AutomationRun", "Execution history with status, trigger source, duration, timestamp, and logs."],
  ["Task", "Operational tasks linked to workflows with status, priority, assignee, and due date."],
  ["Integration", "Provider connection state, sync metadata, and safe configuration summary."],
  ["ActivityLog", "Human-readable timeline events tied to actors and entities."],
  ["Template", "Reusable workflow recipes with required integrations and expected value."],
  ["Settings", "Workspace preferences for theme, notifications, billing, and usage limits."]
];

export function createSeedData(personaId = "founder") {
  const selectedPersona = personaOptions.find((persona) => persona.id === personaId) || personaOptions[0];
  const now = new Date("2026-06-09T09:00:00+07:00");
  const iso = (daysAgo = 0, hoursAgo = 0) => {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(date.getHours() - hoursAgo);
    return date.toISOString();
  };

  const users = personaOptions.map((persona) => ({
    id: `user-${persona.id}`,
    name: persona.name,
    email: persona.email,
    role: persona.role,
    avatar: persona.avatar,
    persona: persona.label,
    workspaceId: persona.workspaceId
  }));

  const teammateSeed = [
    ["user-ops-lead", "Jordan Lee", "Operator", "JL"],
    ["user-client-success", "Sam Rivera", "Admin", "SR"],
    ["user-analyst", "Priya Shah", "Viewer", "PS"]
  ].map(([id, name, role, avatar]) => ({
    id,
    name,
    email: `${name.toLowerCase().replaceAll(" ", ".")}@flowpilot.demo`,
    role,
    avatar,
    persona: "Demo teammate",
    workspaceId: selectedPersona.workspaceId
  }));

  const workspaces = personaOptions.map((persona, index) => ({
    id: persona.workspaceId,
    name: persona.workspaceName,
    industry: persona.industry,
    plan: persona.plan,
    createdAt: iso(120 + index * 12)
  }));

  const templates = createTemplates();
  const workflows = createWorkflows(selectedPersona, users, iso);
  const workflowSteps = workflows.flatMap((workflow, index) => createStepsForWorkflow(workflow, index));
  const automationRuns = createRuns(workflows, iso);
  const tasks = createTasks(selectedPersona, [...users, ...teammateSeed], workflows, iso);
  const integrations = createIntegrations(selectedPersona.workspaceId, iso);
  const activityLogs = createActivityLogs(selectedPersona.workspaceId, users[personaOptions.findIndex((p) => p.id === selectedPersona.id)]?.id || "user-founder", workflows, iso);

  return {
    version: 1,
    currentPersonaId: selectedPersona.id,
    currentUserId: `user-${selectedPersona.id}`,
    currentWorkspaceId: selectedPersona.workspaceId,
    personas: personaOptions,
    users: [...users, ...teammateSeed],
    workspaces,
    workflows,
    workflowSteps,
    automationRuns,
    tasks,
    integrations,
    activityLogs,
    templates,
    settings: {
      workspaceId: selectedPersona.workspaceId,
      theme: "dark",
      notifications: {
        failedRuns: true,
        weeklyDigest: true,
        approvals: true,
        productUpdates: false
      },
      billingPlan: selectedPersona.plan,
      usageLimit: selectedPersona.plan === "Scale" ? 5000 : 1500
    },
    usageStats: {
      workspaceId: selectedPersona.workspaceId,
      monthlyRuns: selectedPersona.id === "ops" ? 2140 : 842,
      runLimit: selectedPersona.plan === "Scale" ? 5000 : 1500,
      aiCredits: selectedPersona.id === "agency" ? 420 : 275,
      aiCreditLimit: 1000,
      teamSeats: selectedPersona.id === "founder" ? 4 : 6,
      seatLimit: selectedPersona.plan === "Scale" ? 20 : 10
    },
    onboarding: {
      completed: false,
      businessType: selectedPersona.industry,
      goals: [],
      integrations: [],
      firstPrompt: ""
    }
  };
}

function createTemplates() {
  return [
    {
      id: "tpl-client-onboarding",
      name: "New Client Onboarding",
      category: "Client Onboarding",
      description: "Turn signed proposals into kickoff tasks, welcome messages, folders, and missing-document reminders.",
      trigger: "Proposal marked as signed",
      actions: ["Create onboarding checklist", "Send welcome email", "Create shared folder", "Assign kickoff preparation", "Remind client after 3 days"],
      estimatedSetupTime: "12 minutes",
      estimatedHoursSaved: 4.5,
      requiredIntegrations: ["Gmail", "Notion", "Google Sheets"]
    },
    {
      id: "tpl-invoice-followup",
      name: "Invoice Follow-up",
      category: "Finance",
      description: "Detect unpaid invoices, send polite reminders, and create escalation tasks when payment is late.",
      trigger: "Invoice remains unpaid for 3 days",
      actions: ["Check invoice status", "Send payment reminder", "Create finance task", "Notify account owner"],
      estimatedSetupTime: "9 minutes",
      estimatedHoursSaved: 3.2,
      requiredIntegrations: ["Stripe", "Gmail", "Slack"]
    },
    {
      id: "tpl-support-triage",
      name: "Support Ticket Triage",
      category: "Support",
      description: "Classify urgent requests, route them to the right owner, and summarize context before handoff.",
      trigger: "New support message received",
      actions: ["Classify urgency", "Summarize customer issue", "Assign owner", "Post Slack alert"],
      estimatedSetupTime: "14 minutes",
      estimatedHoursSaved: 6,
      requiredIntegrations: ["Gmail", "Slack", "HubSpot"]
    },
    {
      id: "tpl-weekly-report",
      name: "Weekly Performance Report",
      category: "Reporting",
      description: "Compile completed work, stuck tasks, open risks, and metrics into a weekly client-ready report.",
      trigger: "Every Friday at 2 PM",
      actions: ["Collect completed tasks", "Summarize blockers", "Update Google Sheet", "Send report email"],
      estimatedSetupTime: "16 minutes",
      estimatedHoursSaved: 5.5,
      requiredIntegrations: ["Google Sheets", "Gmail", "Notion"]
    },
    {
      id: "tpl-content-approval",
      name: "Content Approval Reminder",
      category: "Marketing",
      description: "Watch content items waiting for approval and nudge reviewers before deadlines slip.",
      trigger: "Content status changes to awaiting approval",
      actions: ["Notify reviewer", "Create due-soon reminder", "Escalate after 48 hours"],
      estimatedSetupTime: "8 minutes",
      estimatedHoursSaved: 2.8,
      requiredIntegrations: ["Notion", "Slack", "Trello"]
    },
    {
      id: "tpl-lead-qualification",
      name: "Lead Qualification",
      category: "Sales",
      description: "Score new leads, enrich context, and create personalized follow-up tasks for qualified prospects.",
      trigger: "Lead submits contact form",
      actions: ["Score lead fit", "Create CRM record", "Assign follow-up task", "Draft response email"],
      estimatedSetupTime: "13 minutes",
      estimatedHoursSaved: 4,
      requiredIntegrations: ["HubSpot", "Gmail", "Calendly"]
    },
    {
      id: "tpl-task-routing",
      name: "Task Routing Assistant",
      category: "Operations",
      description: "Route incoming requests by topic, priority, and capacity so operators only see the next best action.",
      trigger: "New request enters operations inbox",
      actions: ["Classify request type", "Check owner capacity", "Assign operator", "Create due date"],
      estimatedSetupTime: "15 minutes",
      estimatedHoursSaved: 7,
      requiredIntegrations: ["Slack", "Asana", "Airtable"]
    },
    {
      id: "tpl-meeting-followup",
      name: "Meeting Follow-up Pack",
      category: "Client Onboarding",
      description: "After a kickoff call, create action items, send notes, and schedule reminders automatically.",
      trigger: "Calendar event tagged kickoff ends",
      actions: ["Extract action items", "Create client tasks", "Send recap email", "Schedule next checkpoint"],
      estimatedSetupTime: "11 minutes",
      estimatedHoursSaved: 3.6,
      requiredIntegrations: ["Calendly", "Gmail", "Notion"]
    }
  ];
}

function createWorkflows(persona, users, iso) {
  const ownerId = `user-${persona.id}`;
  const personaFlavor = {
    founder: [
      ["wf-onboarding", "New Client Onboarding", "Create kickoff tasks, folders, and client reminders after a proposal is signed.", "Client Onboarding", "Active", "Proposal marked as signed", 98, 4.5],
      ["wf-invoice", "Invoice Follow-up", "Send thoughtful follow-ups and alert the owner before an invoice becomes overdue.", "Finance", "Active", "Invoice remains unpaid for 3 days", 94, 3.2],
      ["wf-weekly", "Weekly Client Report", "Compile completed tasks and blockers into a clean Friday report.", "Reporting", "Active", "Friday at 2 PM", 96, 5.5],
      ["wf-approval", "Content Approval Reminder", "Nudge reviewers and escalate stalled approvals.", "Marketing", "Paused", "Content waiting for review", 91, 2.8],
      ["wf-leads", "Lead Qualification", "Score new inquiries and create follow-up tasks for high-fit leads.", "Sales", "Draft", "Lead submits inquiry form", 89, 4],
      ["wf-routing", "Internal Task Router", "Assign incoming operations tasks by topic and team capacity.", "Operations", "Needs Review", "New task enters shared inbox", 87, 6.2]
    ],
    ops: [
      ["wf-dispatch", "Service Request Dispatch", "Route new service requests by location, urgency, and operator availability.", "Operations", "Active", "New request arrives in shared inbox", 97, 8.4],
      ["wf-support", "Urgent Support Triage", "Detect urgent customer messages and notify the right manager with context.", "Support", "Active", "Support message includes urgent language", 95, 7.1],
      ["wf-invoice", "Payment Reminder Ladder", "Send staged reminders and create escalation tasks for unpaid invoices.", "Finance", "Active", "Invoice remains unpaid for 3 days", 93, 4.8],
      ["wf-weekly", "Field Team Weekly Report", "Summarize completed jobs, delays, and customer risks every Friday.", "Reporting", "Active", "Friday at 3 PM", 96, 6.4],
      ["wf-onboarding", "New Customer Intake", "Collect required details and create first-visit preparation tasks.", "Client Onboarding", "Draft", "New customer form submitted", 90, 3.9],
      ["wf-routing", "Operator Capacity Balancer", "Reassign waiting tasks when the queue gets uneven.", "Operations", "Needs Review", "Operator queue exceeds threshold", 85, 5.3]
    ],
    agency: [
      ["wf-approval", "Campaign Approval Loop", "Nudge approvers, collect feedback, and keep launch dates visible.", "Marketing", "Active", "Campaign asset changes to review", 97, 5.2],
      ["wf-leads", "Inbound Lead Qualification", "Score prospects and prepare tailored follow-up tasks for the sales owner.", "Sales", "Active", "Lead submits contact form", 94, 4.6],
      ["wf-weekly", "Client Results Report", "Turn completed tasks and performance stats into a weekly client update.", "Reporting", "Active", "Friday at 1 PM", 95, 6.1],
      ["wf-onboarding", "Client Kickoff Pack", "Prepare kickoff docs, tasks, welcome email, and folder structure.", "Client Onboarding", "Active", "Proposal marked as signed", 98, 4.3],
      ["wf-support", "Client Feedback Triage", "Classify feedback by severity and route to account owners.", "Support", "Paused", "New feedback message received", 88, 3.5],
      ["wf-finance", "Retainer Renewal Reminder", "Alert account leads and draft renewal emails before retainers expire.", "Finance", "Draft", "Retainer is 14 days from renewal", 90, 2.9]
    ]
  };

  return personaFlavor[persona.id].map(([id, name, description, category, status, trigger, successRate, estimatedHoursSaved], index) => ({
    id,
    workspaceId: persona.workspaceId,
    name,
    description,
    category,
    status,
    trigger,
    actions: actionsForCategory(category),
    ownerId,
    successRate,
    estimatedHoursSaved,
    lastRunAt: status === "Draft" ? null : iso(index + 1, index * 2),
    createdAt: iso(35 + index * 4),
    updatedAt: iso(index + 1)
  }));
}

function actionsForCategory(category) {
  const byCategory = {
    "Client Onboarding": ["Create onboarding task checklist", "Send welcome email", "Create shared folder", "Assign kickoff preparation", "Send missing-documents reminder"],
    Finance: ["Check payment status", "Send reminder email", "Create owner follow-up task", "Escalate if unpaid after 7 days"],
    Reporting: ["Collect completed tasks", "Summarize blockers", "Update reporting sheet", "Send weekly summary"],
    Marketing: ["Notify reviewer", "Create approval reminder", "Escalate stale review", "Update content status"],
    Sales: ["Score lead fit", "Create CRM record", "Draft follow-up email", "Assign sales task"],
    Support: ["Classify urgency", "Summarize message", "Assign owner", "Send internal alert"],
    Operations: ["Classify request", "Check owner capacity", "Assign next owner", "Set due date", "Notify channel"]
  };
  return byCategory[category] || byCategory.Operations;
}

function createStepsForWorkflow(workflow, index) {
  const stepTypes = [
    ["trigger", "Trigger", workflow.trigger, { source: inferSource(workflow.trigger), schedule: workflow.trigger.includes("Friday") ? workflow.trigger : "" }],
    ["condition", "Qualification check", `Confirm this run matches ${workflow.category.toLowerCase()} rules.`, { rule: "Continue when confidence is above 80%" }],
    ["action", "Primary automation", workflow.actions[0], { owner: workflow.ownerId, integration: inferIntegration(workflow.category) }],
    ["action", "Follow-up action", workflow.actions[1] || "Create follow-up task", { delay: workflow.category === "Finance" ? "3 days" : "same day" }],
    ["ai", "AI suggestion", `FlowPilot reviews the run and suggests the next best ${workflow.category.toLowerCase()} action.`, { model: "simulated-ai", confidence: 88 + (index % 8) }]
  ];

  return stepTypes.map(([type, title, description, config], position) => ({
    id: `${workflow.id}-step-${position + 1}`,
    workflowId: workflow.id,
    type,
    title,
    description,
    config,
    position: position + 1
  }));
}

function createRuns(workflows, iso) {
  const statuses = ["Success", "Success", "Success", "Warning", "Failed", "Skipped"];
  const sources = ["Gmail", "Slack", "Notion", "Stripe", "HubSpot", "Scheduler", "Google Sheets"];
  return Array.from({ length: 20 }, (_, index) => {
    const workflow = workflows[index % workflows.length];
    const status = statuses[index % statuses.length];
    return {
      id: `run-${index + 1}`,
      workflowId: workflow.id,
      status,
      triggerSource: sources[index % sources.length],
      duration: 16 + ((index * 7) % 70),
      logs: [
        `Received trigger from ${sources[index % sources.length]}.`,
        `Loaded workflow "${workflow.name}".`,
        status === "Failed" ? "Integration response timed out after retry." : "Completed configured actions.",
        status === "Warning" ? "One optional enrichment step was skipped." : "Run summary saved to activity feed."
      ],
      createdAt: iso(Math.floor(index / 3), index % 6)
    };
  });
}

function createTasks(persona, users, workflows, iso) {
  const titles = [
    "Review onboarding checklist",
    "Approve reminder email copy",
    "Confirm invoice escalation owner",
    "QA support triage labels",
    "Prepare weekly report notes",
    "Connect Slack channel",
    "Update client folder template",
    "Check failed automation run",
    "Invite operations teammate",
    "Map lead scoring fields",
    "Refresh Google Sheets report",
    "Document approval handoff",
    "Close completed follow-up",
    "Add backup assignee",
    "Test generated workflow"
  ];
  return titles.map((title, index) => {
    const workflow = workflows[index % workflows.length];
    const status = taskStatuses[index % taskStatuses.length];
    const dueDate = new Date("2026-06-09T09:00:00+07:00");
    dueDate.setDate(dueDate.getDate() + ((index % 8) - 1));
    return {
      id: `task-${index + 1}`,
      workspaceId: persona.workspaceId,
      workflowId: workflow.id,
      title,
      description: `Follow up for ${workflow.name.toLowerCase()} so the demo workflow stays production-ready.`,
      status,
      priority: priorities[(index + 1) % priorities.length],
      assigneeId: users[index % users.length].id,
      dueDate: dueDate.toISOString(),
      createdAt: iso(index + 1),
      updatedAt: iso(index % 5)
    };
  });
}

function createIntegrations(workspaceId, iso) {
  return integrationProviders.map((provider, index) => ({
    id: `int-${provider.toLowerCase().replaceAll(" ", "-")}`,
    workspaceId,
    provider,
    status: index < 6 ? "Connected" : "Disconnected",
    lastSyncedAt: index < 6 ? iso(index, index) : null,
    configSummary: index < 6 ? `${provider} demo workspace connected with read-only sample scopes.` : "Not connected in demo mode."
  }));
}

function createActivityLogs(workspaceId, actorId, workflows, iso) {
  const messages = [
    "FlowPilot found 3 ways to reduce manual follow-up.",
    "Your workflow draft is ready.",
    "New client onboarding run completed successfully.",
    "Support triage warning reviewed by operations.",
    "Weekly report draft generated for client review.",
    "Invoice reminder step paused for copy approval.",
    "Demo mode: no real emails or payments will be sent.",
    "Connected Gmail demo integration.",
    "Task routing rule updated.",
    "AI assistant suggested a missing escalation step.",
    "Run retry completed after integration timeout.",
    "Workspace usage limit reviewed."
  ];

  return messages.map((message, index) => ({
    id: `log-${index + 1}`,
    workspaceId,
    actorId,
    action: index % 3 === 0 ? "created" : index % 3 === 1 ? "updated" : "reviewed",
    entityType: index % 2 === 0 ? "workflow" : "task",
    entityId: workflows[index % workflows.length].id,
    message,
    createdAt: iso(index, index % 4)
  }));
}

function inferIntegration(category) {
  const map = {
    "Client Onboarding": "Notion",
    Finance: "Stripe",
    Reporting: "Google Sheets",
    Marketing: "Trello",
    Sales: "HubSpot",
    Support: "Slack",
    Operations: "Asana"
  };
  return map[category] || "Slack";
}

function inferSource(trigger) {
  if (/invoice|payment/i.test(trigger)) return "Stripe";
  if (/Friday|Every/i.test(trigger)) return "Scheduler";
  if (/lead|form/i.test(trigger)) return "HubSpot";
  if (/support|message/i.test(trigger)) return "Gmail";
  if (/content|campaign/i.test(trigger)) return "Notion";
  return "Gmail";
}

export function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

export function getCurrentUser(state) {
  return state.users.find((user) => user.id === state.currentUserId) || state.users[0];
}

export function getCurrentWorkspace(state) {
  return state.workspaces.find((workspace) => workspace.id === state.currentWorkspaceId) || state.workspaces[0];
}

export function scopedWorkflows(state) {
  return state.workflows.filter((workflow) => workflow.workspaceId === state.currentWorkspaceId);
}

export function scopedTasks(state) {
  return state.tasks.filter((task) => task.workspaceId === state.currentWorkspaceId);
}

export function scopedIntegrations(state) {
  return state.integrations.filter((integration) => integration.workspaceId === state.currentWorkspaceId);
}

export function scopedActivity(state) {
  return state.activityLogs.filter((log) => log.workspaceId === state.currentWorkspaceId);
}

export function runsForWorkspace(state) {
  const workflowIds = new Set(scopedWorkflows(state).map((workflow) => workflow.id));
  return state.automationRuns.filter((run) => workflowIds.has(run.workflowId));
}

export function userById(state, id) {
  return state.users.find((user) => user.id === id) || getCurrentUser(state);
}

export function workflowById(state, id) {
  return state.workflows.find((workflow) => workflow.id === id);
}

export function stepsForWorkflow(state, workflowId) {
  return state.workflowSteps
    .filter((step) => step.workflowId === workflowId)
    .sort((a, b) => a.position - b.position);
}

export function workflowRuns(state, workflowId) {
  return state.automationRuns
    .filter((run) => run.workflowId === workflowId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function formatDate(value, options = {}) {
  if (!value) return "Not run yet";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: options.dateOnly ? undefined : "numeric",
    minute: options.dateOnly ? undefined : "2-digit"
  }).format(new Date(value));
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en").format(Math.round(value));
}

export function calculateKpis(state) {
  const workflows = scopedWorkflows(state);
  const tasks = scopedTasks(state);
  const runs = runsForWorkspace(state);
  const activeWorkflows = workflows.filter((workflow) => workflow.status === "Active").length;
  const tasksAutomated = runs.filter((run) => run.status === "Success").length * 9 + tasks.filter((task) => task.status === "Done").length;
  const hoursSaved = workflows.reduce((sum, workflow) => sum + Number(workflow.estimatedHoursSaved || 0), 0);
  const failedRuns = runs.filter((run) => run.status === "Failed").length;
  const monthlySavings = hoursSaved * 85;

  return {
    activeWorkflows,
    tasksAutomated,
    hoursSaved,
    failedRuns,
    monthlySavings
  };
}

export function statusTone(status) {
  const normalized = String(status || "").toLowerCase();
  if (["active", "success", "done", "connected"].includes(normalized)) return "good";
  if (["draft", "warning", "waiting", "needs review"].includes(normalized)) return "warn";
  if (["paused", "skipped", "disconnected"].includes(normalized)) return "muted";
  if (["failed", "urgent"].includes(normalized)) return "danger";
  if (["high", "in progress", "medium"].includes(normalized)) return "info";
  return "neutral";
}
