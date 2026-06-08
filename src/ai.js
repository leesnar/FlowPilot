const promptPatterns = [
  {
    test: /client|proposal|onboard|kickoff/i,
    name: "New Client Onboarding Autopilot",
    category: "Client Onboarding",
    trigger: "Proposal marked as signed",
    actions: [
      "Create onboarding task checklist",
      "Send welcome email",
      "Create shared client folder",
      "Assign kickoff preparation task",
      "Wait 3 days",
      "Send missing-documents reminder"
    ],
    integrations: ["Gmail", "Notion", "Google Sheets"],
    estimatedHoursSaved: 4.5,
    confidence: 94,
    explanation: "FlowPilot identified a client intake sequence with a clear signed-proposal trigger, document collection tasks, and a timed follow-up loop."
  },
  {
    test: /invoice|payment|unpaid|stripe/i,
    name: "Invoice Follow-up Autopilot",
    category: "Finance",
    trigger: "Invoice remains unpaid for 3 days",
    actions: [
      "Check invoice payment status",
      "Send polite payment reminder",
      "Create finance follow-up task",
      "Notify account owner in Slack",
      "Escalate after 7 days if still unpaid"
    ],
    integrations: ["Stripe", "Gmail", "Slack"],
    estimatedHoursSaved: 3.8,
    confidence: 91,
    explanation: "The request maps to a finance workflow with a time-based trigger and staged reminders, with escalation kept internal."
  },
  {
    test: /support|urgent|ticket|message|triage/i,
    name: "Support Triage Copilot",
    category: "Support",
    trigger: "New support message received",
    actions: [
      "Classify message urgency",
      "Summarize customer context",
      "Route urgent issues to the correct owner",
      "Create response task",
      "Post escalation note in Slack"
    ],
    integrations: ["Gmail", "Slack", "HubSpot"],
    estimatedHoursSaved: 6.2,
    confidence: 88,
    explanation: "FlowPilot found a routing pattern where AI classification should happen before assignment so urgent work reaches the right person faster."
  },
  {
    test: /weekly|report|completed|summary|performance/i,
    name: "Weekly Performance Report Autopilot",
    category: "Reporting",
    trigger: "Every Friday at 2 PM",
    actions: [
      "Collect completed client tasks",
      "Summarize blockers and risks",
      "Calculate workflow performance metrics",
      "Update reporting spreadsheet",
      "Email weekly report draft"
    ],
    integrations: ["Google Sheets", "Gmail", "Notion"],
    estimatedHoursSaved: 5.5,
    confidence: 92,
    explanation: "The prompt describes a recurring reporting workflow with structured data collection, synthesis, and scheduled delivery."
  },
  {
    test: /lead|contact form|qualify|prospect/i,
    name: "Lead Qualification Autopilot",
    category: "Sales",
    trigger: "Lead submits contact form",
    actions: [
      "Score lead fit from form details",
      "Create CRM record",
      "Draft personalized follow-up email",
      "Create sales owner task",
      "Offer booking link for qualified leads"
    ],
    integrations: ["HubSpot", "Gmail", "Calendly"],
    estimatedHoursSaved: 4,
    confidence: 90,
    explanation: "FlowPilot detected a sales intake workflow where qualification, CRM creation, and follow-up should happen in one pass."
  },
  {
    test: /content|approval|campaign|review/i,
    name: "Content Approval Autopilot",
    category: "Marketing",
    trigger: "Content item changes to awaiting approval",
    actions: [
      "Notify assigned reviewer",
      "Create due-soon reminder",
      "Collect comments in source document",
      "Escalate after 48 hours",
      "Update content status"
    ],
    integrations: ["Notion", "Slack", "Trello"],
    estimatedHoursSaved: 3.4,
    confidence: 89,
    explanation: "The workflow is approval-driven, so FlowPilot suggests reviewer nudges and escalation before the publish date is at risk."
  }
];

const defaultDraft = {
  name: "Custom Operations Autopilot",
  category: "Operations",
  trigger: "New request enters shared inbox",
  actions: [
    "Classify request type",
    "Create owner task",
    "Set priority and due date",
    "Notify responsible teammate",
    "Summarize next steps"
  ],
  integrations: ["Gmail", "Slack", "Asana"],
  estimatedHoursSaved: 3.5,
  confidence: 82,
  explanation: "FlowPilot mapped the prompt to a general operations workflow with classification, assignment, notification, and follow-up."
};

export const suggestedPrompts = [
  "When a lead fills out my contact form, qualify them and create follow-up tasks.",
  "Send a payment reminder three days after an unpaid invoice.",
  "Create a weekly report from completed client tasks.",
  "Route urgent support messages to the right team member.",
  "When a new client signs a proposal, create onboarding tasks, send a welcome email, and remind me after 3 days if documents are missing."
];

export function generateWorkflowDraft(prompt = "") {
  const normalizedPrompt = prompt.trim();
  const matched = promptPatterns.find((pattern) => pattern.test.test(normalizedPrompt)) || defaultDraft;
  const requestedDelay = normalizedPrompt.match(/after\s+(\d+)\s+(day|days|hour|hours)/i);
  const draft = structuredCloneSafe(matched);

  if (requestedDelay && !draft.actions.some((action) => /wait|remind/i.test(action))) {
    draft.actions.push(`Wait ${requestedDelay[1]} ${requestedDelay[2].toLowerCase()}`);
    draft.actions.push("Send follow-up reminder");
  }

  if (/no real email|demo/i.test(normalizedPrompt)) {
    draft.actions = draft.actions.map((action) => action.replace("Send", "Draft"));
  }

  return {
    ...draft,
    prompt: normalizedPrompt,
    improvements: suggestImprovements(draft),
    risks: suggestRisks(draft),
    createdAt: new Date().toISOString()
  };
}

export function improveDraft(draft) {
  if (!draft) return null;
  const improved = structuredCloneSafe(draft);
  if (!improved.actions.some((action) => /audit|log/i.test(action))) {
    improved.actions.push("Write an audit note to the activity log");
  }
  if (!improved.actions.some((action) => /fallback|backup/i.test(action))) {
    improved.actions.push("Assign backup owner when confidence is below 75%");
  }
  improved.confidence = Math.min(98, Number(improved.confidence || 80) + 4);
  improved.estimatedHoursSaved = Number((Number(improved.estimatedHoursSaved || 3) + 0.7).toFixed(1));
  improved.explanation = `${improved.explanation} The improved version adds auditability and fallback ownership so the workflow is safer for real operations.`;
  improved.improvements = suggestImprovements(improved);
  return improved;
}

export function explainDraft(draft) {
  if (!draft) return "Generate a workflow first to see FlowPilot's explanation.";
  return `${draft.name} starts when ${draft.trigger.toLowerCase()}. It then runs ${draft.actions.length} coordinated steps across ${draft.integrations.join(", ")}. The draft is estimated to save about ${draft.estimatedHoursSaved} hours per month with ${draft.confidence}% confidence in demo mode.`;
}

function suggestImprovements(draft) {
  return [
    `Add a human review step before sending anything externally through ${draft.integrations[0] || "Gmail"}.`,
    "Track failed runs in a weekly operations report.",
    "Create a fallback owner for stale tasks and low-confidence AI classifications."
  ];
}

function suggestRisks(draft) {
  const risks = ["Demo mode avoids live emails, payments, or customer data."];
  if (draft.integrations.includes("Stripe")) risks.push("Payment reminders should respect customer communication preferences.");
  if (draft.integrations.includes("Gmail")) risks.push("Email copy should be reviewed before connecting a real inbox.");
  return risks;
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}
