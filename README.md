# FlowPilot

FlowPilot is a Sites-ready portfolio web app for an AI workflow automation SaaS. It includes a polished marketing site, demo auth/onboarding, a full dashboard, workflow management, a simulated AI workflow generator, analytics, integrations, settings, and a reviewer-focused case study/admin page.

## Local commands

```bash
npm run dev
npm run build
npm run validate
```

The app is dependency-free by design so it can be built and reviewed without installing packages. The UI persists demo data in `localStorage` during local review and uses the included Cloudflare Worker/D1 adapter when deployed in a Sites runtime with the `DB` binding available.

## Storage architecture

- `migrations/0001_initial.sql` defines structured D1 tables for users, workspaces, workflows, workflow steps, automation runs, tasks, integrations, activity logs, templates, settings, and usage stats.
- `worker/index.js` exposes `/api/bootstrap`, `/api/state`, and `/api/reset` for durable Sites storage.
- `src/storage.js` gracefully falls back to local structured persistence when the Worker API is not present.

No live AI, email, payment, or integration credentials are required. The AI assistant, checkout, and integrations are simulated for portfolio review.
