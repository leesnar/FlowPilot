import { formatDate, statusTone } from "./data.js";

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function logo(compact = false) {
  return `
    <span class="brand-lockup ${compact ? "brand-compact" : ""}">
      <span class="logo-mark" aria-hidden="true">
        <span class="logo-flow"></span>
        <span class="logo-bolt"></span>
        <span class="logo-spark"></span>
      </span>
      ${compact ? "" : "<span class=\"brand-name\">FlowPilot</span>"}
    </span>
  `;
}

export function badge(label, tone = statusTone(label)) {
  return `<span class="badge badge-${tone}"><span class="badge-dot" aria-hidden="true"></span>${escapeHtml(label)}</span>`;
}

export function button(label, options = {}) {
  const {
    action = "",
    route = "",
    variant = "primary",
    size = "",
    icon = "",
    id = "",
    type = "button",
    disabled = false,
    extra = ""
  } = options;
  const attrs = [
    `type="${type}"`,
    `class="btn btn-${variant} ${size ? `btn-${size}` : ""}"`,
    action ? `data-action="${action}"` : "",
    route ? `data-route="${route}"` : "",
    id ? `data-id="${id}"` : "",
    disabled ? "disabled" : "",
    extra
  ].filter(Boolean).join(" ");
  return `<button ${attrs}>${icon ? `<span class="btn-icon" aria-hidden="true">${icon}</span>` : ""}<span>${escapeHtml(label)}</span></button>`;
}

export function iconButton(label, action, icon, id = "", extra = "") {
  return `<button type="button" class="icon-btn" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}" data-action="${action}" ${id ? `data-id="${id}"` : ""} ${extra}><span aria-hidden="true">${icon}</span></button>`;
}

export function card(title, body, options = {}) {
  return `
    <article class="card ${options.className || ""}">
      ${title ? `<div class="card-head"><h3>${escapeHtml(title)}</h3>${options.meta || ""}</div>` : ""}
      ${body}
    </article>
  `;
}

export function metricCard(label, value, delta, tone = "info") {
  return `
    <article class="metric-card">
      <p>${escapeHtml(label)}</p>
      <strong>${escapeHtml(value)}</strong>
      <span class="metric-delta metric-${tone}">${escapeHtml(delta)}</span>
    </article>
  `;
}

export function emptyState(title, copy, ctaLabel = "", action = "") {
  return `
    <section class="empty-state">
      <div class="empty-orbit" aria-hidden="true"></div>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(copy)}</p>
      ${ctaLabel ? button(ctaLabel, { action, variant: "secondary" }) : ""}
    </section>
  `;
}

export function skeletonGrid(count = 6) {
  return `<div class="skeleton-grid">${Array.from({ length: count }, () => `<div class="skeleton-card"><span></span><strong></strong><p></p></div>`).join("")}</div>`;
}

export function modal(title, body, options = {}) {
  return `
    <div class="modal-backdrop" data-action="close-modal">
      <section class="modal ${options.wide ? "modal-wide" : ""}" role="dialog" aria-modal="true" aria-labelledby="modal-title" data-modal-panel>
        <div class="modal-head">
          <h2 id="modal-title">${escapeHtml(title)}</h2>
          ${iconButton("Close dialog", "close-modal", "x")}
        </div>
        <div class="modal-body">${body}</div>
      </section>
    </div>
  `;
}

export function toastStack(toasts) {
  return `
    <div class="toast-stack" aria-live="polite" aria-atomic="true">
      ${toasts.map((toast) => `<div class="toast toast-${toast.type || "success"}"><strong>${escapeHtml(toast.title || "Done")}</strong><span>${escapeHtml(toast.message)}</span></div>`).join("")}
    </div>
  `;
}

export function field(label, name, value = "", options = {}) {
  const id = `${name}-${Math.random().toString(36).slice(2, 6)}`;
  const attrs = [
    `id="${id}"`,
    `name="${name}"`,
    options.required ? "required" : "",
    options.placeholder ? `placeholder="${escapeHtml(options.placeholder)}"` : "",
    options.type ? `type="${options.type}"` : "type=\"text\"",
    options.min ? `min="${options.min}"` : "",
    options.max ? `max="${options.max}"` : ""
  ].filter(Boolean).join(" ");
  return `
    <label class="field" for="${id}">
      <span>${escapeHtml(label)}</span>
      <input ${attrs} value="${escapeHtml(value)}" />
    </label>
  `;
}

export function textarea(label, name, value = "", options = {}) {
  const id = `${name}-${Math.random().toString(36).slice(2, 6)}`;
  return `
    <label class="field" for="${id}">
      <span>${escapeHtml(label)}</span>
      <textarea id="${id}" name="${name}" ${options.required ? "required" : ""} rows="${options.rows || 4}" placeholder="${escapeHtml(options.placeholder || "")}">${escapeHtml(value)}</textarea>
    </label>
  `;
}

export function select(label, name, options, selected = "", extra = {}) {
  const id = `${name}-${Math.random().toString(36).slice(2, 6)}`;
  return `
    <label class="field" for="${id}">
      <span>${escapeHtml(label)}</span>
      <select id="${id}" name="${name}" ${extra.required ? "required" : ""}>
        ${options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          return `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(optionLabel)}</option>`;
        }).join("")}
      </select>
    </label>
  `;
}

export function progressBar(value, max, label = "") {
  const percent = Math.min(100, Math.round((Number(value) / Number(max || 1)) * 100));
  return `
    <div class="progress-wrap">
      <div class="progress-label"><span>${escapeHtml(label)}</span><strong>${percent}%</strong></div>
      <div class="progress" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">
        <span style="width:${percent}%"></span>
      </div>
    </div>
  `;
}

export function activityFeed(logs, users) {
  if (!logs.length) return emptyState("No activity yet", "Actions, run results, and AI suggestions will appear here.");
  return `
    <div class="activity-feed">
      ${logs.slice(0, 8).map((log) => {
        const user = users.find((candidate) => candidate.id === log.actorId);
        return `
          <article class="activity-item">
            <span class="avatar tiny">${escapeHtml(user?.avatar || "FP")}</span>
            <div>
              <p>${escapeHtml(log.message)}</p>
              <span>${escapeHtml(user?.name || "FlowPilot")} · ${formatDate(log.createdAt)}</span>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

export function chartBars(items, maxValue) {
  return `
    <div class="bar-chart" aria-label="Performance chart">
      ${items.map((item) => {
        const height = Math.max(14, Math.round((item.value / maxValue) * 100));
        return `
          <div class="bar-group">
            <span class="bar" style="height:${height}%"></span>
            <small>${escapeHtml(item.label)}</small>
          </div>
        `;
      }).join("")}
    </div>
  `;
}
