import {
  automationGoals,
  businessTypes,
  calculateKpis,
  dataModelOverview,
  formatDate,
  formatNumber,
  getCurrentUser,
  getCurrentWorkspace,
  integrationProviders,
  priorities,
  runStatuses,
  runsForWorkspace,
  scopedActivity,
  scopedIntegrations,
  scopedTasks,
  scopedWorkflows,
  statusTone,
  stepsForWorkflow,
  taskStatuses,
  templateCategories,
  userById,
  workflowById,
  workflowRuns,
  workflowStatuses
} from "./data.js";
import {
  activityFeed,
  badge,
  button,
  card,
  chartBars,
  emptyState,
  escapeHtml,
  field,
  iconButton,
  logo,
  metricCard,
  modal,
  progressBar,
  select,
  skeletonGrid,
  textarea,
  toastStack
} from "./components.js";
import { explainDraft, suggestedPrompts } from "./ai.js";

export function render(state, ui) {
  if (ui.loading || !state) {
    return `
      <main id="main" class="loading-shell">
        <div class="loading-mark" aria-hidden="true"></div>
        <p>Loading structured demo data...</p>
        ${skeletonGrid(4)}
      </main>
    `;
  }

  const path = ui.path || "/";
  const content = routeContent(state, ui, path);
  return `
    ${content}
    ${renderModal(state, ui)}
    ${toastStack(ui.toasts || [])}
  `;
}

function routeContent(state, ui, path) {
  if (path.startsWith("/app")) {
    const appRoute = path.replace(/\/$/, "");
    const page = renderAppPage(state, ui, appRoute === "/app" ? "/app/dashboard" : appRoute);
    return appShell(state, ui, page);
  }

  if (path === "/pricing") return publicLayout(state, ui, pricingPage(state, ui), "pricing");
  if (path === "/templates") return publicLayout(state, ui, templatesPage(state, ui, false), "templates");
  if (path === "/case-study") return publicLayout(state, ui, caseStudyPage(state, ui), "case-study");
  if (path === "/login") return publicLayout(state, ui, loginPage(state), "login");
  if (path === "/onboarding") return onboardingPage(state, ui);
  return publicLayout(state, ui, homePage(state), "home");
}

function publicLayout(state, ui, content, active) {
  return `
    <div class="site-shell">
      <header class="public-nav">
        <a href="/" class="brand-link" data-route="/" aria-label="FlowPilot home">${logo()}</a>
        <nav aria-label="Primary">
          ${navLink("Home", "/", active === "home")}
          ${navLink("Pricing", "/pricing", active === "pricing")}
          ${navLink("Templates", "/templates", active === "templates")}
          ${navLink("Case Study", "/case-study", active === "case-study")}
        </nav>
        <div class="nav-actions">
          ${button("Launch demo", { route: "/login", variant: "primary", icon: ">" })}
        </div>
      </header>
      <main id="main">${content}</main>
    </div>
  `;
}

function navLink(label, route, active = false) {
  return `<a href="${route}" data-route="${route}" class="${active ? "active" : ""}">${escapeHtml(label)}</a>`;
}

function homePage(state) {
  return `
    <section class="hero-section">
      <div class="hero-copy">
        <p class="eyebrow">Automate busywork with AI-powered workflows.</p>
        <h1>Turn repeatable work into AI-powered workflows.</h1>
        <p class="hero-sub">FlowPilot helps small teams automate client onboarding, follow-ups, task routing, and weekly reports without building custom internal tools.</p>
        <div class="hero-actions">
          ${button("Launch demo dashboard", { route: "/login", variant: "primary", icon: ">" })}
          ${button("View workflow templates", { route: "/templates", variant: "ghost" })}
        </div>
        <div class="hero-proof" aria-label="Product proof points">
          <span>6 workflow categories</span>
          <span>Simulated AI builder</span>
          <span>D1-ready data model</span>
        </div>
      </div>
      <div class="product-visual" aria-label="FlowPilot dashboard preview">
        <div class="mock-window">
          <div class="mock-window-bar"><span></span><span></span><span></span></div>
          <div class="mock-dashboard">
            <aside>
              <b>FlowPilot</b>
              <span></span><span></span><span></span><span></span>
            </aside>
            <section>
              <div class="mock-topline">
                <span>Active workflows</span>
                <strong>18</strong>
              </div>
              <div class="mock-grid">
                <div class="mock-card tall"><span></span><strong>94%</strong><p>Success rate</p></div>
                <div class="mock-card"><span></span><strong>42h</strong><p>Saved this month</p></div>
                <div class="mock-card"><span></span><strong>3</strong><p>Needs review</p></div>
              </div>
              <div class="mock-flow">
                <span>Trigger</span><i></i><span>AI classify</span><i></i><span>Route task</span><i></i><span>Report</span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>

    <section class="proof-strip" aria-label="Social proof">
      <span>Built for freelancers</span>
      <span>Small agencies</span>
      <span>Local service teams</span>
      <span>Startup operators</span>
      <span>Portfolio reviewers</span>
    </section>

    <section class="section split-section">
      <div>
        <p class="eyebrow">How it works</p>
        <h2>Describe the workflow. FlowPilot structures the automation.</h2>
      </div>
      <div class="steps-grid">
        ${stepCard("1", "Capture the repeatable process", "Start from a template or describe the work in plain English.")}
        ${stepCard("2", "Review the AI draft", "Edit triggers, actions, owners, and integration assumptions before anything runs.")}
        ${stepCard("3", "Operate from one dashboard", "Track runs, tasks, failures, savings, and suggested improvements.")}
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <p class="eyebrow">Features</p>
        <h2>A real SaaS surface, not a static landing page.</h2>
      </div>
      <div class="feature-grid">
        ${featureCard("AI workflow generator", "Plain-English prompts become editable triggers, actions, confidence scores, and implementation notes.")}
        ${featureCard("Workflow builder", "Clickable automation blocks with trigger, condition, action, and AI suggestion configuration.")}
        ${featureCard("Run observability", "Execution history, status badges, log drawers, retries, and activity records for every workflow.")}
        ${featureCard("Task operations", "List and kanban views, priorities, assignees, due dates, and linked workflow context.")}
        ${featureCard("Integrations marketplace", "Simulated connections for Gmail, Slack, Notion, Sheets, Stripe, HubSpot, and more.")}
        ${featureCard("Persistent demo state", "Structured state persists locally and is ready for Sites D1 storage when the binding is available.")}
      </div>
    </section>

    <section class="section examples-band">
      <div class="section-head">
        <p class="eyebrow">Automation examples</p>
        <h2>Common small-business operations, modeled as workflows.</h2>
      </div>
      <div class="workflow-ribbon">
        ${["New Client Onboarding", "Invoice Follow-up", "Support Ticket Triage", "Weekly Performance Report", "Content Approval Reminder", "Lead Qualification"].map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
      </div>
    </section>

    <section class="section ai-preview">
      <div>
        <p class="eyebrow">AI assistant preview</p>
        <h2>FlowPilot turns messy instructions into an operational draft.</h2>
        <p>Use the demo generator to review a realistic AI product flow with confidence scoring, suggested integrations, editable steps, and improvement prompts.</p>
        ${button("Try the generator", { route: "/app/generator", variant: "secondary" })}
      </div>
      <div class="assistant-card">
        <span class="chat-line user">When a new client signs a proposal...</span>
        <span class="chat-line ai">Your workflow draft is ready.</span>
        <ul>
          <li>Create onboarding checklist</li>
          <li>Send welcome email</li>
          <li>Wait 3 days and remind for missing documents</li>
        </ul>
        ${badge("94% confidence", "good")}
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <p class="eyebrow">Integrations</p>
        <h2>Connect the tools small teams already use.</h2>
      </div>
      <div class="integration-strip">
        ${integrationProviders.map((provider) => `<span>${escapeHtml(provider)}</span>`).join("")}
      </div>
    </section>

    <section class="section metrics-section">
      ${metricCard("Average hours saved", "42/month", "Across seeded demo workflows", "good")}
      ${metricCard("Automation success rate", "94%", "Based on 20 recent runs", "info")}
      ${metricCard("Manual follow-ups reduced", "31%", "Estimated operations impact", "warn")}
    </section>

    <section class="section testimonials">
      ${testimonial("The demo feels like a real operating system for client work. The workflow builder makes the product thinking obvious.", "Portfolio reviewer")}
      ${testimonial("FlowPilot's simulated AI flow shows exactly where a real model would plug in without hiding product constraints.", "Startup founder")}
      ${testimonial("The dashboard has the density I expect from a B2B tool while still feeling polished.", "Agency operator")}
    </section>

    <section class="section pricing-preview">
      <div>
        <p class="eyebrow">Pricing preview</p>
        <h2>Plans for solo operators through operations-heavy teams.</h2>
      </div>
      ${button("Compare plans", { route: "/pricing", variant: "primary" })}
    </section>

    ${faqSection()}

    <section class="final-cta">
      <h2>Launch the FlowPilot demo workspace.</h2>
      <p>Explore the dashboard, generate workflows, manage tasks, connect demo integrations, and review the case study architecture.</p>
      ${button("Launch demo dashboard", { route: "/login", variant: "primary", icon: ">" })}
    </section>

    ${footer()}
  `;
}

function stepCard(number, title, copy) {
  return `<article class="step-card"><strong>${number}</strong><h3>${escapeHtml(title)}</h3><p>${escapeHtml(copy)}</p></article>`;
}

function featureCard(title, copy) {
  return `<article class="feature-card"><span class="feature-icon" aria-hidden="true"></span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(copy)}</p></article>`;
}

function testimonial(copy, person) {
  return `<blockquote><p>${escapeHtml(copy)}</p><footer>${escapeHtml(person)}</footer></blockquote>`;
}

function faqSection() {
  const faqs = [
    ["Does the demo send real emails?", "No. Demo mode uses simulated integrations and no real messages, payments, or API calls are sent."],
    ["Is the AI live?", "The default assistant is deterministic and simulated, with a clear architecture for connecting a real AI API later."],
    ["Does data persist?", "Yes. Local review persists in browser storage, and the Sites Worker includes D1-backed structured persistence."],
    ["What should reviewers inspect?", "The app demonstrates product UX, responsive design, data modeling, stateful interactions, and fullstack architecture."]
  ];
  return `
    <section class="section faq-section">
      <div class="section-head">
        <p class="eyebrow">FAQ</p>
        <h2>Demo behavior is transparent.</h2>
      </div>
      <div class="faq-list">
        ${faqs.map(([q, a]) => `<details><summary>${escapeHtml(q)}</summary><p>${escapeHtml(a)}</p></details>`).join("")}
      </div>
    </section>
  `;
}

function footer() {
  return `
    <footer class="site-footer">
      <div>${logo()}<p>Automate busywork with AI-powered workflows.</p></div>
      <nav aria-label="Footer">
        ${navLink("Pricing", "/pricing")}
        ${navLink("Templates", "/templates")}
        ${navLink("Case Study", "/case-study")}
        ${navLink("Launch Demo", "/login")}
      </nav>
    </footer>
  `;
}

function pricingPage(state, ui) {
  const yearly = ui.billingCycle === "yearly";
  const plans = [
    ["Starter", 19, "For freelancers and solo operators.", ["5 active workflows", "250 monthly runs", "AI workflow drafts", "Email support"]],
    ["Pro", 49, "For small teams and agencies.", ["25 active workflows", "1,500 monthly runs", "Team members", "Run history", "Priority support"]],
    ["Scale", 149, "For operations-heavy teams.", ["Unlimited demo workflows", "5,000 monthly runs", "Advanced analytics", "Role permissions", "Architecture review notes"]]
  ];
  return `
    <section class="page-hero compact">
      <p class="eyebrow">Pricing</p>
      <h1>Pick the operating layer that matches your team.</h1>
      <p>No real payments are processed in this portfolio demo.</p>
      <div class="segmented" role="group" aria-label="Billing cycle">
        <button type="button" class="${!yearly ? "active" : ""}" data-action="billing-cycle" data-id="monthly">Monthly</button>
        <button type="button" class="${yearly ? "active" : ""}" data-action="billing-cycle" data-id="yearly">Yearly <span>Save 20%</span></button>
      </div>
    </section>
    <section class="pricing-grid full">
      ${plans.map(([name, price, copy, features], index) => pricingCard(name, yearly ? Math.round(price * 12 * 0.8) : price, copy, features, yearly, index === 1)).join("")}
    </section>
    <section class="section comparison">
      <div class="section-head"><p class="eyebrow">Comparison</p><h2>Feature depth by plan.</h2></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Feature</th><th>Starter</th><th>Pro</th><th>Scale</th></tr></thead>
          <tbody>
            ${[
              ["Active workflows", "5", "25", "Unlimited"],
              ["AI workflow drafts", "25/mo", "150/mo", "500/mo"],
              ["Run history", "30 days", "12 months", "Unlimited"],
              ["Team roles", "Viewer", "Admin + Operator", "Custom permissions"],
              ["Analytics", "Basic", "Advanced", "ROI and productivity"]
            ].map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>
    ${faqSection()}
    <section class="section cta-grid">
      <article><h3>Need to see the product first?</h3><p>Open the demo workspace and test the full workflow lifecycle.</p>${button("Launch demo", { route: "/login", variant: "primary" })}</article>
      <article><h3>Reviewing the build?</h3><p>The case study explains the architecture, UX decisions, and data model.</p>${button("Read case study", { route: "/case-study", variant: "secondary" })}</article>
    </section>
    ${footer()}
  `;
}

function pricingCard(name, price, copy, features, yearly, highlighted) {
  return `
    <article class="pricing-card ${highlighted ? "highlighted" : ""}">
      ${highlighted ? badge("Most popular", "good") : ""}
      <h2>${escapeHtml(name)}</h2>
      <p>${escapeHtml(copy)}</p>
      <div class="price"><strong>$${price}</strong><span>/${yearly ? "year" : "month"}</span></div>
      <ul>${features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}</ul>
      ${button(`Choose ${name}`, { action: "open-checkout", id: name, variant: highlighted ? "primary" : "secondary" })}
    </article>
  `;
}

function loginPage(state) {
  return `
    <section class="login-shell">
      <div class="login-copy">
        ${logo()}
        <h1>Choose a demo persona.</h1>
        <p>This is a portfolio demo. No real emails, payments, or customer records are used.</p>
      </div>
      <div class="persona-grid">
        ${state.personas.map((persona) => `
          <article class="persona-card">
            <span class="avatar">${escapeHtml(persona.avatar)}</span>
            <h2>Continue as ${escapeHtml(persona.label.replace("Demo ", ""))}</h2>
            <p>${escapeHtml(persona.note)}</p>
            <dl><dt>Workspace</dt><dd>${escapeHtml(persona.workspaceName)}</dd><dt>Focus</dt><dd>${escapeHtml(persona.focus)}</dd></dl>
            ${button(`Continue as ${persona.label}`, { action: "select-persona", id: persona.id, variant: "primary" })}
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function onboardingPage(state, ui) {
  const step = ui.onboardingStep || 1;
  const selections = ui.onboarding || { businessType: "", goals: [], integrations: [], prompt: "" };
  const stepContent = {
    1: `
      <h2>What kind of business are we configuring?</h2>
      <div class="option-grid">
        ${businessTypes.map((type) => optionButton(type, "onboarding-business", selections.businessType === type)).join("")}
      </div>
    `,
    2: `
      <h2>Choose automation goals.</h2>
      <div class="option-grid">
        ${automationGoals.map((goal) => optionButton(goal, "onboarding-goal", selections.goals?.includes(goal))).join("")}
      </div>
    `,
    3: `
      <h2>Select demo integrations.</h2>
      <div class="option-grid compact-options">
        ${integrationProviders.slice(0, 7).map((provider) => optionButton(provider, "onboarding-integration", selections.integrations?.includes(provider))).join("")}
      </div>
    `,
    4: `
      <h2>Generate your first workflow.</h2>
      <form class="generator-inline" data-form="onboarding-generate">
        ${textarea("Workflow prompt", "prompt", selections.prompt || "When a new client signs a proposal, create onboarding tasks, send a welcome email, and remind me after 3 days if documents are missing.", { rows: 5 })}
        ${button("Generate workflow draft", { type: "submit", variant: "primary" })}
      </form>
      ${ui.onboardingDraft ? generatedPreview(ui.onboardingDraft, "create-onboarding-workflow") : ""}
    `
  }[step];

  return `
    <main id="main" class="onboarding-shell">
      <a href="/" data-route="/" class="brand-link">${logo()}</a>
      <section class="onboarding-panel">
        <div class="progress-steps" aria-label="Onboarding progress">
          ${[1, 2, 3, 4].map((item) => `<span class="${item <= step ? "active" : ""}">${item}</span>`).join("")}
        </div>
        ${stepContent}
        <div class="onboarding-actions">
          ${step > 1 ? button("Back", { action: "onboarding-back", variant: "ghost" }) : ""}
          ${step < 4 ? button("Continue", { action: "onboarding-next", variant: "primary" }) : button("Skip to dashboard", { route: "/app/dashboard", variant: "ghost" })}
        </div>
      </section>
    </main>
  `;
}

function optionButton(label, action, selected = false) {
  return `<button type="button" class="option-tile ${selected ? "selected" : ""}" data-action="${action}" data-id="${escapeHtml(label)}">${escapeHtml(label)}</button>`;
}

function appShell(state, ui, page) {
  const user = getCurrentUser(state);
  const workspace = getCurrentWorkspace(state);
  const appLinks = [
    ["Dashboard", "/app/dashboard", "D"],
    ["Workflows", "/app/workflows", "W"],
    ["Builder", "/app/builder", "B"],
    ["AI Generator", "/app/generator", "AI"],
    ["Templates", "/app/templates", "T"],
    ["Run History", "/app/runs", "R"],
    ["Tasks", "/app/tasks", "K"],
    ["Analytics", "/app/analytics", "A"],
    ["Integrations", "/app/integrations", "I"],
    ["Settings", "/app/settings", "S"],
    ["Demo Admin", "/app/admin", "AD"]
  ];

  return `
    <div class="app-layout">
      <aside class="sidebar" aria-label="Application navigation">
        <a href="/app/dashboard" data-route="/app/dashboard" class="brand-link">${logo()}</a>
        <div class="workspace-pill"><span>${escapeHtml(workspace.name)}</span>${badge(workspace.plan, "info")}</div>
        <nav>
          ${appLinks.map(([label, route, icon]) => `<a href="${route}" data-route="${route}" class="${ui.path === route || (route === "/app/dashboard" && ui.path === "/app") ? "active" : ""}"><span>${icon}</span>${escapeHtml(label)}</a>`).join("")}
        </nav>
      </aside>
      <div class="app-main">
        <header class="topbar">
          <button type="button" class="icon-btn mobile-menu" data-action="toggle-sidebar" aria-label="Toggle navigation">=</button>
          <label class="command-search">
            <span class="sr-only">Search</span>
            <input type="search" placeholder="Search workflows, runs, tasks..." data-filter="globalSearch" value="${escapeHtml(ui.globalSearch || "")}" />
          </label>
          <div class="topbar-actions">
            ${iconButton("Notifications", "open-notifications", "!")}
            ${iconButton("Toggle theme", "toggle-theme", state.settings.theme === "dark" ? "L" : "D")}
            <button type="button" class="user-menu" data-action="open-persona-menu">
              <span class="avatar tiny">${escapeHtml(user.avatar)}</span>
              <span>${escapeHtml(user.name)}</span>
            </button>
          </div>
        </header>
        <main id="main" class="content-shell">${page}</main>
      </div>
      <nav class="mobile-nav" aria-label="Mobile navigation">
        ${appLinks.slice(0, 5).map(([label, route, icon]) => `<a href="${route}" data-route="${route}" class="${ui.path === route ? "active" : ""}"><span>${icon}</span><small>${escapeHtml(label.replace("AI ", ""))}</small></a>`).join("")}
      </nav>
    </div>
  `;
}

function renderAppPage(state, ui, route) {
  if (route === "/app/workflows") return workflowsPage(state, ui);
  if (route === "/app/builder") return builderPage(state, ui);
  if (route === "/app/generator") return generatorPage(state, ui);
  if (route === "/app/templates") return templatesPage(state, ui, true);
  if (route === "/app/runs") return runsPage(state, ui);
  if (route === "/app/tasks") return tasksPage(state, ui);
  if (route === "/app/analytics") return analyticsPage(state, ui);
  if (route === "/app/integrations") return integrationsPage(state, ui);
  if (route === "/app/settings") return settingsPage(state, ui);
  if (route === "/app/admin") return adminPage(state);
  return dashboardPage(state, ui);
}

function pageHeader(title, copy, actions = "") {
  return `<section class="page-title"><div><p class="eyebrow">FlowPilot</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(copy)}</p></div><div class="page-actions">${actions}</div></section>`;
}

function dashboardPage(state) {
  const kpis = calculateKpis(state);
  const workflows = scopedWorkflows(state);
  const runs = runsForWorkspace(state).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const tasks = scopedTasks(state).filter((task) => task.status !== "Done").slice(0, 5);
  const activity = scopedActivity(state).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const usage = state.usageStats;
  const chartItems = workflows.slice(0, 6).map((workflow) => ({ label: workflow.name.split(" ")[0], value: workflow.successRate }));

  return `
    ${pageHeader("Dashboard", "A realistic operating view for workflows, tasks, run health, AI suggestions, and usage.", button("Create workflow", { action: "open-workflow-create", variant: "primary" }) + button("Generate with AI", { route: "/app/generator", variant: "secondary" }))}
    <section class="metric-grid">
      ${metricCard("Active workflows", String(kpis.activeWorkflows), `${workflows.length} total workflows`, "good")}
      ${metricCard("Tasks automated", formatNumber(kpis.tasksAutomated), "From recent successful runs", "info")}
      ${metricCard("Hours saved", `${kpis.hoursSaved.toFixed(1)}h`, "Estimated monthly savings", "good")}
      ${metricCard("Failed runs", String(kpis.failedRuns), "Review retry queue", kpis.failedRuns ? "danger" : "good")}
      ${metricCard("Monthly savings", `$${formatNumber(kpis.monthlySavings)}`, "At $85 blended hourly rate", "warn")}
    </section>
    <section class="dashboard-grid">
      <article class="panel span-2">
        <div class="panel-head"><h2>Workflow performance</h2>${badge("Live demo data", "info")}</div>
        ${chartBars(chartItems, 100)}
      </article>
      <article class="panel">
        <div class="panel-head"><h2>Usage meter</h2></div>
        ${progressBar(usage.monthlyRuns, usage.runLimit, "Automation runs")}
        ${progressBar(usage.aiCredits, usage.aiCreditLimit, "AI credits")}
        ${progressBar(usage.teamSeats, usage.seatLimit, "Team seats")}
      </article>
      <article class="panel">
        <div class="panel-head"><h2>Recent automation runs</h2><a href="/app/runs" data-route="/app/runs">View all</a></div>
        ${runList(state, runs.slice(0, 5))}
      </article>
      <article class="panel">
        <div class="panel-head"><h2>Tasks due soon</h2><a href="/app/tasks" data-route="/app/tasks">Open tasks</a></div>
        ${taskMiniList(state, tasks)}
      </article>
      <article class="panel ai-panel">
        <div class="panel-head"><h2>AI suggestions</h2>${badge("3 ideas", "good")}</div>
        <ul class="suggestion-list">
          <li>FlowPilot found 3 ways to reduce manual follow-up in onboarding.</li>
          <li>Add a fallback owner to workflows with failed Stripe runs.</li>
          <li>This automation could save about 4.5 hours per month.</li>
        </ul>
        ${button("Review suggestions", { route: "/app/generator", variant: "secondary" })}
      </article>
      <article class="panel">
        <div class="panel-head"><h2>Activity feed</h2></div>
        ${activityFeed(activity, state.users)}
      </article>
    </section>
  `;
}

function runList(state, runs) {
  if (!runs.length) return emptyState("No runs yet", "Test a workflow to create a run log.");
  return `<div class="run-list">${runs.map((run) => {
    const workflow = workflowById(state, run.workflowId);
    return `<button type="button" class="run-row" data-action="open-run-log" data-id="${run.id}"><span>${escapeHtml(workflow?.name || "Workflow")}</span>${badge(run.status)}<small>${formatDate(run.createdAt)}</small></button>`;
  }).join("")}</div>`;
}

function taskMiniList(state, tasks) {
  if (!tasks.length) return emptyState("No urgent tasks", "Completed tasks and workflow-created tasks will appear here.");
  return `<div class="task-mini-list">${tasks.map((task) => `<article><div><strong>${escapeHtml(task.title)}</strong><span>${escapeHtml(userById(state, task.assigneeId).name)} · ${formatDate(task.dueDate, { dateOnly: true })}</span></div>${badge(task.priority)}</article>`).join("")}</div>`;
}

function workflowsPage(state, ui) {
  const workflows = filterWorkflows(state, ui);
  const view = ui.workflowView || "cards";
  return `
    ${pageHeader("Workflows", "Create, edit, duplicate, pause, activate, test, and delete structured automations.", button("Create workflow", { action: "open-workflow-create", variant: "primary" }) + button("AI generator", { route: "/app/generator", variant: "secondary" }))}
    <section class="toolbar">
      <input type="search" aria-label="Search workflows" placeholder="Search workflows" data-filter="workflowSearch" value="${escapeHtml(ui.workflowSearch || "")}" />
      <select data-filter="workflowStatus" aria-label="Filter by status"><option value="">All statuses</option>${workflowStatuses.map((status) => `<option ${ui.workflowStatus === status ? "selected" : ""}>${status}</option>`).join("")}</select>
      <select data-filter="workflowCategory" aria-label="Filter by category"><option value="">All categories</option>${templateCategories.map((category) => `<option ${ui.workflowCategory === category ? "selected" : ""}>${category}</option>`).join("")}</select>
      <select data-filter="workflowIntegration" aria-label="Filter by integration"><option value="">All integrations</option>${integrationProviders.map((provider) => `<option ${ui.workflowIntegration === provider ? "selected" : ""}>${provider}</option>`).join("")}</select>
      <div class="segmented small" role="group" aria-label="Workflow view">
        <button type="button" class="${view === "cards" ? "active" : ""}" data-action="workflow-view" data-id="cards">Cards</button>
        <button type="button" class="${view === "table" ? "active" : ""}" data-action="workflow-view" data-id="table">Table</button>
      </div>
    </section>
    ${workflows.length ? (view === "table" ? workflowTable(state, workflows) : workflowCards(state, workflows)) : emptyState("No workflows match your filters", "Clear filters or create a new automation draft.", "Create workflow", "open-workflow-create")}
  `;
}

function filterWorkflows(state, ui) {
  const q = String(ui.workflowSearch || ui.globalSearch || "").toLowerCase();
  return scopedWorkflows(state).filter((workflow) => {
    const integrationMatch = !ui.workflowIntegration || workflow.actions.join(" ").toLowerCase().includes(ui.workflowIntegration.toLowerCase()) || workflow.trigger.toLowerCase().includes(ui.workflowIntegration.toLowerCase());
    return (!q || [workflow.name, workflow.description, workflow.category, workflow.status].join(" ").toLowerCase().includes(q))
      && (!ui.workflowStatus || workflow.status === ui.workflowStatus)
      && (!ui.workflowCategory || workflow.category === ui.workflowCategory)
      && integrationMatch;
  });
}

function workflowCards(state, workflows) {
  return `
    <section class="workflow-grid">
      ${workflows.map((workflow) => {
        const owner = userById(state, workflow.ownerId);
        return `
          <article class="workflow-card">
            <div class="card-head"><h2>${escapeHtml(workflow.name)}</h2>${badge(workflow.status)}</div>
            <p>${escapeHtml(workflow.description)}</p>
            <dl class="detail-list">
              <dt>Trigger</dt><dd>${escapeHtml(workflow.trigger)}</dd>
              <dt>Owner</dt><dd>${escapeHtml(owner.name)}</dd>
              <dt>Success rate</dt><dd>${workflow.successRate}%</dd>
              <dt>Saved</dt><dd>${workflow.estimatedHoursSaved}h/mo</dd>
            </dl>
            <div class="chip-row">${workflow.actions.slice(0, 3).map((action) => `<span>${escapeHtml(action)}</span>`).join("")}</div>
            <div class="card-actions">
              ${button("Edit", { action: "open-workflow-edit", id: workflow.id, variant: "secondary" })}
              ${button("Builder", { route: `/app/builder?id=${workflow.id}`, variant: "ghost" })}
              ${iconButton(workflow.status === "Active" ? "Pause workflow" : "Activate workflow", "toggle-workflow-status", workflow.status === "Active" ? "||" : ">", workflow.id)}
              ${iconButton("Duplicate workflow", "duplicate-workflow", "+", workflow.id)}
              ${iconButton("Delete workflow", "confirm-delete-workflow", "x", workflow.id)}
            </div>
          </article>
        `;
      }).join("")}
    </section>
  `;
}

function workflowTable(state, workflows) {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Name</th><th>Status</th><th>Category</th><th>Owner</th><th>Last run</th><th>Success</th><th>Actions</th></tr></thead>
        <tbody>
          ${workflows.map((workflow) => `<tr>
            <td><strong>${escapeHtml(workflow.name)}</strong><span>${escapeHtml(workflow.trigger)}</span></td>
            <td>${badge(workflow.status)}</td>
            <td>${escapeHtml(workflow.category)}</td>
            <td>${escapeHtml(userById(state, workflow.ownerId).name)}</td>
            <td>${formatDate(workflow.lastRunAt)}</td>
            <td>${workflow.successRate}%</td>
            <td class="table-actions">${iconButton("Edit", "open-workflow-edit", "e", workflow.id)}${iconButton("Duplicate", "duplicate-workflow", "+", workflow.id)}${iconButton("Delete", "confirm-delete-workflow", "x", workflow.id)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function builderPage(state, ui) {
  const workflows = scopedWorkflows(state);
  const workflow = workflowById(state, ui.query.id) || workflows[0];
  if (!workflow) return emptyState("No workflow selected", "Create a workflow first, then return to the builder.", "Create workflow", "open-workflow-create");
  const steps = stepsForWorkflow(state, workflow.id);
  const selectedStep = steps.find((step) => step.id === ui.selectedStepId) || steps[0];
  const runs = workflowRuns(state, workflow.id).slice(0, 4);

  return `
    ${pageHeader("Workflow Builder", "Configure triggers, conditions, actions, and AI suggestions in a visual workflow canvas.", button("Save draft", { action: "save-builder", id: workflow.id, variant: "secondary" }) + button(workflow.status === "Active" ? "Pause workflow" : "Activate workflow", { action: "toggle-workflow-status", id: workflow.id, variant: "primary" }) + button("Test workflow", { action: "test-workflow", id: workflow.id, variant: "ghost" }))}
    <section class="builder-layout">
      <aside class="builder-steps">
        <h2>${escapeHtml(workflow.name)}</h2>
        ${steps.map((step) => `<button type="button" class="${selectedStep?.id === step.id ? "active" : ""}" data-action="select-step" data-id="${step.id}"><span>${escapeHtml(step.type)}</span><strong>${escapeHtml(step.title)}</strong><small>${escapeHtml(step.description)}</small></button>`).join("")}
      </aside>
      <section class="workflow-canvas" aria-label="Automation flow canvas">
        ${steps.map((step, index) => `
          <button type="button" class="flow-block flow-${step.type} ${selectedStep?.id === step.id ? "active" : ""}" data-action="select-step" data-id="${step.id}">
            <span>${escapeHtml(step.type)}</span>
            <strong>${escapeHtml(step.title)}</strong>
            <small>${escapeHtml(step.description)}</small>
          </button>
          ${index < steps.length - 1 ? `<span class="flow-arrow" aria-hidden="true">-></span>` : ""}
        `).join("")}
      </section>
      <aside class="config-panel">
        <h2>Step configuration</h2>
        ${selectedStep ? stepConfigForm(selectedStep) : ""}
        <div class="run-history-mini">
          <h3>Run history</h3>
          ${runList(state, runs)}
        </div>
      </aside>
    </section>
  `;
}

function stepConfigForm(step) {
  return `
    <form data-form="step-config" data-id="${step.id}" class="stack-form">
      ${field("Step title", "title", step.title, { required: true })}
      ${textarea("Description", "description", step.description, { rows: 4, required: true })}
      ${textarea("Configuration JSON", "config", JSON.stringify(step.config, null, 2), { rows: 6 })}
      ${button("Save step", { type: "submit", variant: "primary" })}
    </form>
  `;
}

function generatorPage(state, ui) {
  return `
    ${pageHeader("AI Workflow Generator", "Describe a workflow in plain English and turn it into a structured automation draft.", button("View templates", { route: "/app/templates", variant: "secondary" }))}
    <section class="generator-layout">
      <article class="panel generator-input">
        <h2>Describe the workflow</h2>
        <form data-form="generate-workflow" class="stack-form">
          ${textarea("Workflow prompt", "prompt", ui.generatorPrompt || suggestedPrompts[4], { rows: 8, required: true })}
          <div class="chip-row prompt-chips">
            ${suggestedPrompts.map((prompt) => `<button type="button" data-action="set-generator-prompt" data-id="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`).join("")}
          </div>
          ${button("Generate workflow", { type: "submit", variant: "primary" })}
        </form>
      </article>
      <article class="panel generator-output">
        ${ui.generatedDraft ? generatedPreview(ui.generatedDraft, "create-generated-workflow", true) : emptyState("No generated draft yet", "Describe a workflow to preview triggers, actions, integrations, confidence, and explanation.")}
      </article>
    </section>
  `;
}

function generatedPreview(draft, createAction, includeImprove = false) {
  return `
    <div class="generated-preview">
      <div class="panel-head"><h2>${escapeHtml(draft.name)}</h2>${badge(`${draft.confidence}% confidence`, "good")}</div>
      <dl class="detail-list">
        <dt>Trigger</dt><dd>${escapeHtml(draft.trigger)}</dd>
        <dt>Category</dt><dd>${escapeHtml(draft.category)}</dd>
        <dt>Estimated savings</dt><dd>${escapeHtml(String(draft.estimatedHoursSaved))} hours/month</dd>
      </dl>
      <h3>Actions</h3>
      <ol class="action-list">${draft.actions.map((action) => `<li>${escapeHtml(action)}</li>`).join("")}</ol>
      <h3>Suggested integrations</h3>
      <div class="chip-row">${draft.integrations.map((integration) => `<span>${escapeHtml(integration)}</span>`).join("")}</div>
      <p class="explanation">${escapeHtml(explainDraft(draft))}</p>
      <div class="card-actions">
        ${button("Create workflow", { action: createAction, variant: "primary" })}
        ${includeImprove ? button("Improve this workflow", { action: "improve-generated-workflow", variant: "secondary" }) : ""}
        ${includeImprove ? button("Explain automation", { action: "explain-generated-workflow", variant: "ghost" }) : ""}
      </div>
    </div>
  `;
}

function templatesPage(state, ui, inApp) {
  const q = String(ui.templateSearch || "").toLowerCase();
  const category = ui.templateCategory || "";
  const templates = state.templates.filter((template) => {
    return (!q || [template.name, template.description, template.category].join(" ").toLowerCase().includes(q))
      && (!category || template.category === category);
  });

  const content = `
    ${pageHeader("Template Library", "Start from realistic workflow recipes for sales, onboarding, finance, support, marketing, operations, and reporting.", inApp ? button("Generate with AI", { route: "/app/generator", variant: "primary" }) : button("Launch demo", { route: "/login", variant: "primary" }))}
    <section class="toolbar">
      <input type="search" aria-label="Search templates" placeholder="Search templates" data-filter="templateSearch" value="${escapeHtml(ui.templateSearch || "")}" />
      <select data-filter="templateCategory" aria-label="Template category"><option value="">All categories</option>${templateCategories.map((item) => `<option ${category === item ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select>
    </section>
    <section class="template-grid">
      ${templates.map((template) => templateCard(template, inApp)).join("")}
    </section>
    ${!templates.length ? emptyState("No templates found", "Try another category or search term.") : ""}
    ${!inApp ? footer() : ""}
  `;
  return content;
}

function templateCard(template, inApp) {
  return `
    <article class="template-card">
      <div class="card-head"><h2>${escapeHtml(template.name)}</h2>${badge(template.category, "info")}</div>
      <p>${escapeHtml(template.description)}</p>
      <dl class="detail-list">
        <dt>Trigger</dt><dd>${escapeHtml(template.trigger)}</dd>
        <dt>Setup</dt><dd>${escapeHtml(template.estimatedSetupTime)}</dd>
        <dt>Saved</dt><dd>${template.estimatedHoursSaved}h/month</dd>
      </dl>
      <div class="chip-row">${template.requiredIntegrations.map((integration) => `<span>${escapeHtml(integration)}</span>`).join("")}</div>
      <div class="card-actions">
        ${button("Preview", { action: "preview-template", id: template.id, variant: "secondary" })}
        ${inApp ? button("Use template", { action: "use-template", id: template.id, variant: "primary" }) : button("Launch demo", { route: "/login", variant: "primary" })}
      </div>
    </article>
  `;
}

function runsPage(state, ui) {
  const q = String(ui.runSearch || "").toLowerCase();
  const status = ui.runStatus || "";
  const workflowId = ui.runWorkflow || "";
  const workflows = scopedWorkflows(state);
  const runs = runsForWorkspace(state)
    .filter((run) => {
      const workflow = workflowById(state, run.workflowId);
      return (!q || [workflow?.name, run.status, run.triggerSource].join(" ").toLowerCase().includes(q))
        && (!status || run.status === status)
        && (!workflowId || run.workflowId === workflowId);
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return `
    ${pageHeader("Automation Run History", "Inspect workflow execution results, logs, durations, trigger sources, warnings, and failed-run retries.", button("Test active workflow", { action: "test-first-workflow", variant: "primary" }))}
    <section class="toolbar">
      <input type="search" aria-label="Search runs" placeholder="Search runs" data-filter="runSearch" value="${escapeHtml(ui.runSearch || "")}" />
      <select data-filter="runStatus" aria-label="Run status"><option value="">All statuses</option>${runStatuses.map((item) => `<option ${status === item ? "selected" : ""}>${item}</option>`).join("")}</select>
      <select data-filter="runWorkflow" aria-label="Workflow"><option value="">All workflows</option>${workflows.map((workflow) => `<option value="${workflow.id}" ${workflowId === workflow.id ? "selected" : ""}>${escapeHtml(workflow.name)}</option>`).join("")}</select>
    </section>
    <div class="table-wrap responsive-cards">
      <table>
        <thead><tr><th>Status</th><th>Workflow</th><th>Trigger source</th><th>Duration</th><th>Timestamp</th><th>Logs</th></tr></thead>
        <tbody>
          ${runs.map((run) => `<tr>
            <td>${badge(run.status)}</td>
            <td>${escapeHtml(workflowById(state, run.workflowId)?.name || "Workflow")}</td>
            <td>${escapeHtml(run.triggerSource)}</td>
            <td>${run.duration}s</td>
            <td>${formatDate(run.createdAt)}</td>
            <td>${button(run.status === "Failed" ? "Retry" : "View logs", { action: run.status === "Failed" ? "retry-run" : "open-run-log", id: run.id, variant: "secondary", size: "small" })}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function tasksPage(state, ui) {
  const view = ui.taskView || "list";
  const q = String(ui.taskSearch || "").toLowerCase();
  const tasks = scopedTasks(state).filter((task) => !q || [task.title, task.description, task.status, task.priority].join(" ").toLowerCase().includes(q));
  return `
    ${pageHeader("Tasks", "Manage work created by automations, mark tasks complete, and compare list and kanban views.", button("Create task", { action: "open-task-create", variant: "primary" }))}
    <section class="toolbar">
      <input type="search" aria-label="Search tasks" placeholder="Search tasks" data-filter="taskSearch" value="${escapeHtml(ui.taskSearch || "")}" />
      <div class="segmented small" role="group" aria-label="Task view">
        <button type="button" class="${view === "list" ? "active" : ""}" data-action="task-view" data-id="list">List</button>
        <button type="button" class="${view === "kanban" ? "active" : ""}" data-action="task-view" data-id="kanban">Kanban</button>
      </div>
    </section>
    <section class="ai-task-strip">
      <div><strong>AI-suggested tasks</strong><p>FlowPilot recommends checking failed runs, adding backup owners, and documenting approval fallbacks.</p></div>
      ${button("Add suggested task", { action: "add-ai-task", variant: "secondary" })}
    </section>
    ${view === "kanban" ? taskKanban(state, tasks) : taskList(state, tasks)}
  `;
}

function taskList(state, tasks) {
  if (!tasks.length) return emptyState("No tasks found", "Create a task or clear the search filter.", "Create task", "open-task-create");
  return `
    <section class="task-list">
      ${tasks.map((task) => taskRow(state, task)).join("")}
    </section>
  `;
}

function taskRow(state, task) {
  return `
    <article class="task-row">
      <div>
        <h2>${escapeHtml(task.title)}</h2>
        <p>${escapeHtml(task.description)}</p>
        <span>${escapeHtml(userById(state, task.assigneeId).name)} · ${formatDate(task.dueDate, { dateOnly: true })}</span>
      </div>
      <div class="task-meta">${badge(task.status)}${badge(task.priority)}</div>
      <div class="row-actions">
        ${task.status !== "Done" ? iconButton("Mark complete", "complete-task", "✓", task.id) : ""}
        ${iconButton("Edit task", "open-task-edit", "e", task.id)}
        ${iconButton("Delete task", "delete-task", "x", task.id)}
      </div>
    </article>
  `;
}

function taskKanban(state, tasks) {
  return `
    <section class="kanban-board">
      ${taskStatuses.map((status) => {
        const items = tasks.filter((task) => task.status === status);
        return `<div class="kanban-column"><h2>${escapeHtml(status)} <span>${items.length}</span></h2>${items.map((task) => taskRow(state, task)).join("") || `<p class="kanban-empty">No ${status.toLowerCase()} tasks.</p>`}</div>`;
      }).join("")}
    </section>
  `;
}

function analyticsPage(state, ui) {
  const workflows = scopedWorkflows(state);
  const runs = runsForWorkspace(state);
  const hours = workflows.map((workflow) => ({ label: workflow.name.split(" ")[0], value: workflow.estimatedHoursSaved }));
  const maxHours = Math.max(...hours.map((item) => item.value), 1);
  const rate = Math.round((runs.filter((run) => run.status === "Success").length / Math.max(runs.length, 1)) * 100);
  const hourlyRate = Number(ui.roiRate || 85);
  const monthlyHours = workflows.reduce((sum, workflow) => sum + workflow.estimatedHoursSaved, 0);

  return `
    ${pageHeader("Analytics", "Measure time saved, automation health, top workflows, failed-run causes, integration usage, productivity, and ROI.", "")}
    <section class="metric-grid">
      ${metricCard("Success rate", `${rate}%`, "Across recent runs", rate > 90 ? "good" : "warn")}
      ${metricCard("Hours saved", `${monthlyHours.toFixed(1)}h`, "Estimated monthly", "good")}
      ${metricCard("ROI estimate", `$${formatNumber(monthlyHours * hourlyRate)}`, `At $${hourlyRate}/hour`, "warn")}
      ${metricCard("Connected tools", String(scopedIntegrations(state).filter((integration) => integration.status === "Connected").length), "Demo integrations", "info")}
    </section>
    <section class="dashboard-grid">
      <article class="panel span-2"><div class="panel-head"><h2>Hours saved by workflow</h2></div>${chartBars(hours, maxHours)}</article>
      <article class="panel"><div class="panel-head"><h2>Automation success rate</h2></div><div class="donut" style="--value:${rate}"><strong>${rate}%</strong><span>success</span></div></article>
      <article class="panel"><div class="panel-head"><h2>Failed run breakdown</h2></div>${breakdown(["Timeout", "Missing field", "Disconnected tool"], [3, 2, 1])}</article>
      <article class="panel"><div class="panel-head"><h2>Integration usage</h2></div>${breakdown(scopedIntegrations(state).slice(0, 5).map((item) => item.provider), [42, 36, 28, 19, 12])}</article>
      <article class="panel"><div class="panel-head"><h2>ROI calculator</h2></div><label class="field"><span>Blended hourly rate</span><input type="number" min="25" max="250" data-filter="roiRate" value="${hourlyRate}" /></label><p class="roi-result">${monthlyHours.toFixed(1)} saved hours x $${hourlyRate}/hr = <strong>$${formatNumber(monthlyHours * hourlyRate)}/month</strong></p></article>
      <article class="panel"><div class="panel-head"><h2>Team productivity</h2></div>${breakdown(["Automated tasks", "Manual tasks", "Waiting tasks"], [68, 23, 9])}</article>
    </section>
  `;
}

function breakdown(labels, values) {
  const max = Math.max(...values, 1);
  return `<div class="breakdown">${labels.map((label, index) => `<div><span>${escapeHtml(label)}</span><strong>${values[index]}</strong><i style="width:${Math.max(8, Math.round((values[index] / max) * 100))}%"></i></div>`).join("")}</div>`;
}

function integrationsPage(state, ui) {
  const q = String(ui.integrationSearch || "").toLowerCase();
  const integrations = scopedIntegrations(state).filter((integration) => !q || integration.provider.toLowerCase().includes(q));
  return `
    ${pageHeader("Integrations", "Simulate connecting tools and review how FlowPilot would safely summarize configuration state.", "")}
    <section class="toolbar"><input type="search" aria-label="Search integrations" placeholder="Search integrations" data-filter="integrationSearch" value="${escapeHtml(ui.integrationSearch || "")}" /></section>
    <section class="integration-grid">
      ${integrations.map((integration) => `
        <article class="integration-card">
          <span class="integration-logo">${escapeHtml(integration.provider.slice(0, 2).toUpperCase())}</span>
          <div class="card-head"><h2>${escapeHtml(integration.provider)}</h2>${badge(integration.status)}</div>
          <p>${escapeHtml(integration.configSummary)}</p>
          <small>${integration.lastSyncedAt ? `Last synced ${formatDate(integration.lastSyncedAt)}` : "Ready to connect"}</small>
          ${button(integration.status === "Connected" ? "Manage" : "Connect", { action: "open-integration", id: integration.id, variant: integration.status === "Connected" ? "secondary" : "primary" })}
        </article>
      `).join("")}
    </section>
  `;
}

function settingsPage(state) {
  const workspace = getCurrentWorkspace(state);
  const currentUser = getCurrentUser(state);
  const members = state.users.filter((user) => user.workspaceId === state.currentWorkspaceId);
  return `
    ${pageHeader("Settings", "Manage profile, workspace, team, billing simulation, notifications, security, API keys, export, and theme.", button("Export data", { action: "export-data", variant: "secondary" }) + button("Reset demo data", { action: "confirm-reset", variant: "ghost" }))}
    <section class="settings-grid">
      ${card("Profile", `<form data-form="profile" class="stack-form">${field("Name", "name", currentUser.name, { required: true })}${field("Email", "email", currentUser.email, { required: true, type: "email" })}${select("Role", "role", ["Owner", "Admin", "Operator", "Viewer"], currentUser.role)}${button("Save profile", { type: "submit", variant: "primary" })}</form>`, { className: "settings-card" })}
      ${card("Workspace", `<form data-form="workspace" class="stack-form">${field("Workspace name", "name", workspace.name, { required: true })}${field("Industry", "industry", workspace.industry, { required: true })}${select("Plan", "plan", ["Starter", "Pro", "Scale"], workspace.plan)}${button("Save workspace", { type: "submit", variant: "primary" })}</form>`, { className: "settings-card" })}
      ${card("Team members", `<div class="member-list">${members.map((member) => `<article><span class="avatar tiny">${escapeHtml(member.avatar)}</span><div><strong>${escapeHtml(member.name)}</strong><small>${escapeHtml(member.role)}</small></div></article>`).join("")}</div>${button("Add member", { action: "open-member", variant: "secondary" })}<div class="permissions-table"><span>Owner</span><b>Full access</b><span>Admin</span><b>Manage workflows</b><span>Operator</span><b>Run and edit tasks</b><span>Viewer</span><b>Read-only</b></div>`, { className: "settings-card wide" })}
      ${card("Billing simulation", `<p>Current plan: <strong>${escapeHtml(state.settings.billingPlan)}</strong>. Checkout is simulated for portfolio review.</p>${button("Change plan", { route: "/pricing", variant: "secondary" })}`, { className: "settings-card" })}
      ${card("Notifications", `<form data-form="notifications" class="toggle-list">${toggle("Failed runs", "failedRuns", state.settings.notifications.failedRuns)}${toggle("Weekly digest", "weeklyDigest", state.settings.notifications.weeklyDigest)}${toggle("Approvals", "approvals", state.settings.notifications.approvals)}${toggle("Product updates", "productUpdates", state.settings.notifications.productUpdates)}${button("Save notifications", { type: "submit", variant: "primary" })}</form>`, { className: "settings-card" })}
      ${card("Security", `<p>Demo sessions are local and resettable. Production architecture would add SSO, audit logs, scoped API tokens, and workspace-level policies.</p>${button("Review API keys", { action: "open-api-keys", variant: "secondary" })}`, { className: "settings-card" })}
      ${card("Theme", `<p>Switch between dark-first and light UI modes.</p>${button(state.settings.theme === "dark" ? "Use light mode" : "Use dark mode", { action: "toggle-theme", variant: "primary" })}`, { className: "settings-card" })}
    </section>
  `;
}

function toggle(label, name, checked) {
  return `<label class="toggle-row"><span>${escapeHtml(label)}</span><input type="checkbox" name="${name}" ${checked ? "checked" : ""} /><i aria-hidden="true"></i></label>`;
}

function adminPage(state) {
  return `
    ${pageHeader("Demo Admin", "A portfolio reviewer page for seed data, personas, architecture notes, feature coverage, and product rationale.", button("Reset seed data", { action: "confirm-reset", variant: "primary" }))}
    <section class="admin-grid">
      <article class="panel"><h2>Demo personas</h2>${state.personas.map((persona) => `<button type="button" class="persona-switch" data-action="select-persona" data-id="${persona.id}"><span class="avatar tiny">${escapeHtml(persona.avatar)}</span><span>${escapeHtml(persona.label)}</span><small>${escapeHtml(persona.workspaceName)}</small></button>`).join("")}</article>
      <article class="panel span-2"><h2>Data model overview</h2><div class="model-grid">${dataModelOverview.map(([name, description]) => `<div><strong>${escapeHtml(name)}</strong><p>${escapeHtml(description)}</p></div>`).join("")}</div></article>
      <article class="panel"><h2>Feature checklist</h2><ul class="check-list">${["Marketing homepage", "Pricing and simulated checkout", "Demo persona login", "Onboarding", "Dashboard", "Workflow CRUD", "Workflow builder", "AI generator", "Template library", "Run logs", "Task management", "Analytics", "Integrations", "Settings", "Case study"].map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
      <article class="panel"><h2>Architecture notes</h2><p>Dependency-free SPA, componentized ES modules, deterministic AI engine, local structured persistence, Cloudflare Worker API, and D1 schema for Sites storage.</p></article>
      <article class="panel"><h2>Why this project matters</h2><p>FlowPilot demonstrates senior product judgment: realistic SaaS flows, accessible UI states, durable data modeling, responsive dashboard UX, and a clear path from portfolio demo to production integration.</p></article>
    </section>
  `;
}

function caseStudyPage() {
  const sections = [
    ["Problem", "Small teams lose hours to repetitive client follow-ups, routing, reporting, approvals, and invoice reminders, but custom internal tooling is too expensive."],
    ["Target users", "Freelancers, agencies, local service businesses, startup founders, and operators who need practical automation without engineering overhead."],
    ["Product goals", "Make automation feel understandable: plain-English generation, editable workflow steps, clear run history, and measurable savings."],
    ["Key features", "Marketing site, pricing simulation, persona login, onboarding, dashboard, workflow CRUD, builder, AI generator, templates, tasks, analytics, integrations, settings, and demo admin."],
    ["UX decisions", "Dark-first premium SaaS styling, dense dashboard surfaces, accessible controls, destructive confirmations, toasts, skeleton loading, responsive navigation, and mobile-safe tables."],
    ["Data model", "Structured objects mirror production SaaS needs: users, workspaces, workflows, steps, runs, tasks, integrations, activity logs, templates, settings, and usage stats."],
    ["Fullstack architecture", "The local demo persists with structured browser storage, while the Sites Worker exposes D1-backed bootstrap, save, and reset endpoints using the same model."],
    ["Accessibility", "Semantic regions, labeled forms, visible focus states, keyboard-safe buttons, non-color status labels, and contrast-aware light/dark themes."],
    ["Performance", "No runtime dependencies, optimized CSS, lightweight ES modules, subtle animations, and lazy-feeling route rendering."],
    ["Future improvements", "Real auth, workspace invitations, granular API endpoints, background jobs, live AI model calls, integration OAuth, and production billing."]
  ];
  return `
    <section class="page-hero compact">
      <p class="eyebrow">Case Study</p>
      <h1>FlowPilot shows product thinking across the full SaaS surface.</h1>
      <p>A portfolio-ready explanation of the problem, UX choices, data model, architecture, accessibility, performance, and next steps.</p>
      ${button("Launch demo", { route: "/login", variant: "primary" })}
    </section>
    <section class="case-study-grid">
      ${sections.map(([title, copy]) => `<article><h2>${escapeHtml(title)}</h2><p>${escapeHtml(copy)}</p></article>`).join("")}
    </section>
    ${footer()}
  `;
}

function renderModal(state, ui) {
  if (!ui.modal) return "";
  const { type, id } = ui.modal;

  if (type === "workflow") return modal(ui.modal.mode === "edit" ? "Edit workflow" : "Create workflow", workflowForm(state, id), { wide: true });
  if (type === "delete-workflow") {
    const workflow = workflowById(state, id);
    return modal("Delete workflow", `<p>Delete <strong>${escapeHtml(workflow?.name || "this workflow")}</strong>? This removes its steps and related demo runs.</p><div class="modal-actions">${button("Cancel", { action: "close-modal", variant: "ghost" })}${button("Delete workflow", { action: "delete-workflow", id, variant: "danger" })}</div>`);
  }
  if (type === "reset") {
    return modal("Reset demo data", `<p>This restores the selected persona seed data and clears local edits for this demo workspace.</p><div class="modal-actions">${button("Cancel", { action: "close-modal", variant: "ghost" })}${button("Reset data", { action: "reset-data", variant: "danger" })}</div>`);
  }
  if (type === "checkout") return modal("Simulated checkout", checkoutModal(ui), { wide: true });
  if (type === "template") {
    const template = state.templates.find((item) => item.id === id);
    return modal(template?.name || "Template preview", templateDetail(template), { wide: true });
  }
  if (type === "run-log") {
    const run = state.automationRuns.find((item) => item.id === id);
    return modal("Run logs", runLogDetail(state, run), { wide: true });
  }
  if (type === "task") return modal(ui.modal.mode === "edit" ? "Edit task" : "Create task", taskForm(state, id), { wide: true });
  if (type === "integration") {
    const integration = state.integrations.find((item) => item.id === id);
    return modal(`${integration?.provider || "Integration"} connection`, integrationDetail(integration));
  }
  if (type === "member") return modal("Add team member", memberForm());
  if (type === "api-keys") return modal("API keys simulation", `<p>Production FlowPilot would create scoped API tokens here. This portfolio demo does not generate or store secrets.</p><div class="fake-key"><span>fp_demo_************************</span>${badge("Demo only", "warn")}</div>${button("Close", { action: "close-modal", variant: "primary" })}`);
  if (type === "explanation") return modal("Automation explanation", `<p>${escapeHtml(ui.explanation || "")}</p>${button("Close", { action: "close-modal", variant: "primary" })}`);
  if (type === "notifications") return modal("Notifications", `<div class="notification-list"><article>${badge("Needs review", "warn")} Invoice Follow-up has one failed run.</article><article>${badge("Suggestion", "good")} FlowPilot found 3 ways to reduce manual follow-up.</article><article>${badge("Demo", "info")} No real emails or payments will be sent.</article></div>`);
  if (type === "persona-menu") return modal("Switch demo persona", `<div class="persona-list">${state.personas.map((persona) => `<button type="button" class="persona-switch" data-action="select-persona" data-id="${persona.id}"><span class="avatar tiny">${escapeHtml(persona.avatar)}</span><span>${escapeHtml(persona.label)}</span><small>${escapeHtml(persona.workspaceName)}</small></button>`).join("")}</div>`);
  return "";
}

function workflowForm(state, id) {
  const workflow = workflowById(state, id) || {
    name: "",
    description: "",
    category: "Operations",
    status: "Draft",
    trigger: "",
    actions: [],
    ownerId: state.currentUserId,
    successRate: 92,
    estimatedHoursSaved: 3
  };
  const members = state.users.filter((user) => user.workspaceId === state.currentWorkspaceId || user.id === state.currentUserId);
  return `
    <form data-form="workflow" data-id="${escapeHtml(id || "")}" class="stack-form">
      <div class="form-grid">
        ${field("Workflow name", "name", workflow.name, { required: true })}
        ${select("Status", "status", workflowStatuses, workflow.status)}
        ${select("Category", "category", templateCategories, workflow.category)}
        ${select("Owner", "ownerId", members.map((user) => ({ value: user.id, label: user.name })), workflow.ownerId)}
      </div>
      ${textarea("Description", "description", workflow.description, { rows: 3, required: true })}
      ${field("Trigger", "trigger", workflow.trigger, { required: true })}
      ${textarea("Actions", "actions", workflow.actions.join("\n"), { rows: 6, required: true })}
      <div class="form-grid">
        ${field("Success rate", "successRate", workflow.successRate, { type: "number", min: "0", max: "100" })}
        ${field("Estimated hours saved", "estimatedHoursSaved", workflow.estimatedHoursSaved, { type: "number", min: "0" })}
      </div>
      <div class="modal-actions">${button("Cancel", { action: "close-modal", variant: "ghost" })}${button("Save workflow", { type: "submit", variant: "primary" })}</div>
    </form>
  `;
}

function checkoutModal(ui) {
  const plan = ui.checkoutPlan || "Pro";
  const step = ui.checkoutStep || 1;
  const steps = {
    1: `<p>Plan selected: <strong>${escapeHtml(plan)}</strong>. This simulated checkout shows product flow without collecting payment details.</p>${field("Workspace email", "email", "demo@flowpilot.local", { type: "email" })}`,
    2: `<p>Review demo order.</p><div class="checkout-summary"><span>${escapeHtml(plan)} plan</span><strong>No charge</strong><small>Portfolio checkout simulation</small></div>`,
    3: `<p>Checkout simulation complete. Billing settings will update in the demo workspace.</p>${badge("No real payment processed", "warn")}`
  };
  return `
    <form data-form="checkout" class="stack-form">
      <div class="progress-steps">${[1, 2, 3].map((item) => `<span class="${item <= step ? "active" : ""}">${item}</span>`).join("")}</div>
      ${steps[step]}
      <div class="modal-actions">
        ${button("Cancel", { action: "close-modal", variant: "ghost" })}
        ${step < 3 ? button("Continue", { action: "checkout-next", variant: "primary" }) : button("Finish", { action: "checkout-finish", variant: "primary" })}
      </div>
    </form>
  `;
}

function templateDetail(template) {
  if (!template) return "<p>Template not found.</p>";
  return `
    <div class="template-detail">
      <p>${escapeHtml(template.description)}</p>
      <dl class="detail-list">
        <dt>Trigger</dt><dd>${escapeHtml(template.trigger)}</dd>
        <dt>Estimated setup</dt><dd>${escapeHtml(template.estimatedSetupTime)}</dd>
        <dt>Estimated hours saved</dt><dd>${template.estimatedHoursSaved} hours/month</dd>
      </dl>
      <h3>Actions</h3>
      <ol class="action-list">${template.actions.map((action) => `<li>${escapeHtml(action)}</li>`).join("")}</ol>
      <h3>Required integrations</h3>
      <div class="chip-row">${template.requiredIntegrations.map((integration) => `<span>${escapeHtml(integration)}</span>`).join("")}</div>
      <div class="modal-actions">${button("Close", { action: "close-modal", variant: "ghost" })}${button("Use template", { action: "use-template", id: template.id, variant: "primary" })}</div>
    </div>
  `;
}

function runLogDetail(state, run) {
  if (!run) return "<p>Run not found.</p>";
  const workflow = workflowById(state, run.workflowId);
  return `
    <div class="run-log-detail">
      <div class="detail-list"><dt>Workflow</dt><dd>${escapeHtml(workflow?.name || "Workflow")}</dd><dt>Status</dt><dd>${badge(run.status)}</dd><dt>Trigger source</dt><dd>${escapeHtml(run.triggerSource)}</dd><dt>Duration</dt><dd>${run.duration}s</dd></div>
      <ol class="log-lines">${run.logs.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ol>
      <div class="modal-actions">${button("Close", { action: "close-modal", variant: "ghost" })}${run.status === "Failed" ? button("Retry run", { action: "retry-run", id: run.id, variant: "primary" }) : ""}</div>
    </div>
  `;
}

function taskForm(state, id) {
  const task = state.tasks.find((item) => item.id === id) || {
    title: "",
    description: "",
    status: "To do",
    priority: "Medium",
    assigneeId: state.currentUserId,
    workflowId: scopedWorkflows(state)[0]?.id || "",
    dueDate: new Date().toISOString().slice(0, 10)
  };
  const members = state.users.filter((user) => user.workspaceId === state.currentWorkspaceId || user.id === state.currentUserId);
  return `
    <form data-form="task" data-id="${escapeHtml(id || "")}" class="stack-form">
      ${field("Task title", "title", task.title, { required: true })}
      ${textarea("Description", "description", task.description, { rows: 4 })}
      <div class="form-grid">
        ${select("Status", "status", taskStatuses, task.status)}
        ${select("Priority", "priority", priorities, task.priority)}
        ${select("Assignee", "assigneeId", members.map((user) => ({ value: user.id, label: user.name })), task.assigneeId)}
        ${select("Linked workflow", "workflowId", scopedWorkflows(state).map((workflow) => ({ value: workflow.id, label: workflow.name })), task.workflowId)}
      </div>
      ${field("Due date", "dueDate", task.dueDate.slice(0, 10), { type: "date" })}
      <div class="modal-actions">${button("Cancel", { action: "close-modal", variant: "ghost" })}${button("Save task", { type: "submit", variant: "primary" })}</div>
    </form>
  `;
}

function integrationDetail(integration) {
  if (!integration) return "<p>Integration not found.</p>";
  const connected = integration.status === "Connected";
  return `
    <p>${escapeHtml(integration.configSummary)}</p>
    <div class="integration-flow">
      <span>1. Review scopes</span><span>2. Simulate OAuth</span><span>3. Save connection state</span>
    </div>
    <p class="demo-note">Demo mode: connect flows do not leave the browser or request real credentials.</p>
    <div class="modal-actions">${button("Close", { action: "close-modal", variant: "ghost" })}${button(connected ? "Disconnect demo" : "Connect demo", { action: "toggle-integration", id: integration.id, variant: connected ? "danger" : "primary" })}</div>
  `;
}

function memberForm() {
  return `
    <form data-form="member" class="stack-form">
      ${field("Name", "name", "", { required: true, placeholder: "Taylor Kim" })}
      ${field("Email", "email", "", { required: true, type: "email", placeholder: "taylor@example.com" })}
      ${select("Role", "role", ["Admin", "Operator", "Viewer"], "Operator")}
      <div class="modal-actions">${button("Cancel", { action: "close-modal", variant: "ghost" })}${button("Add member", { type: "submit", variant: "primary" })}</div>
    </form>
  `;
}
