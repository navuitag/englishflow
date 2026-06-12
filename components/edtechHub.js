import { listApps } from "../assets/js/edtechApps.js";
import { escapeHtml } from "../assets/js/utils.js";

export function renderEdtechHubButton() {
  const apps = listApps();
  const menu = apps.map((app) => `
      <a class="edtech-hub-item${app.isCurrent ? " is-current" : ""}" href="${escapeHtml(app.url)}"${app.isCurrent ? ' aria-current="page"' : ""}>
        <span class="edtech-hub-emoji" aria-hidden="true">${app.emoji}</span>
        <span class="edtech-hub-meta">
          <strong>${escapeHtml(app.short)}</strong>
          <small>${escapeHtml(app.name)}</small>
        </span>
        ${app.isCurrent ? '<span class="edtech-hub-here">Đang học</span>' : ""}
      </a>`).join("");

  return `
    <div class="edtech-hub">
      <button type="button" class="edtech-hub-btn" id="edtechHubBtn" aria-haspopup="true" aria-expanded="false">
        <span class="edtech-hub-icon" aria-hidden="true">📚</span>
        <span class="edtech-hub-label-btn">Môn học</span>
        <span class="edtech-hub-caret" aria-hidden="true">▾</span>
      </button>
      <div class="edtech-hub-menu" id="edtechHubMenu" hidden>
        <p class="edtech-hub-menu-title">Chuyển môn học</p>
        ${menu}
      </div>
    </div>`;
}

export function renderEdtechHubGrid(title = "Khám phá môn học khác") {
  const apps = listApps().filter((app) => !app.isCurrent);
  if (!apps.length) return "";

  return `
    <section class="edtech-hub-grid-section">
      <div class="section-head">
        <h2>${escapeHtml(title)}</h2>
      </div>
      <div class="edtech-hub-grid">
        ${apps.map((app) => `
          <a class="edtech-hub-card" href="${escapeHtml(app.url)}">
            <span class="edtech-hub-card-emoji" aria-hidden="true">${app.emoji}</span>
            <strong>${escapeHtml(app.short)}</strong>
            <span>${escapeHtml(app.name)}</span>
          </a>`).join("")}
      </div>
    </section>`;
}

let documentBound = false;

export function bindEdtechHub() {
  const button = document.getElementById("edtechHubBtn");
  const menu = document.getElementById("edtechHubMenu");
  if (!button || !menu) return;

  button.onclick = (event) => {
    event.stopPropagation();
    const open = menu.hidden;
    menu.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
  };

  menu.onclick = (event) => event.stopPropagation();

  if (documentBound) return;
  documentBound = true;

  document.addEventListener("click", () => {
    const activeMenu = document.getElementById("edtechHubMenu");
    const activeBtn = document.getElementById("edtechHubBtn");
    if (!activeMenu || !activeBtn) return;
    activeMenu.hidden = true;
    activeBtn.setAttribute("aria-expanded", "false");
  });
}
