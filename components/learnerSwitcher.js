import { escapeHtml } from "../assets/js/utils.js";
import { getProfiles } from "../assets/js/state.js";

function initials(name = "") {
  return name.trim().slice(0, 1).toUpperCase() || "?";
}

export function renderLearnerSwitcher(state) {
  const profiles = getProfiles();
  if (!profiles.length) return "";

  const activeId = state.profileId;
  const active = profiles.find((profile) => profile.id === activeId) || profiles[0];
  const menu = profiles.map((profile) => {
    const activeClass = profile.id === activeId ? " is-active" : "";
    return `
      <button type="button" class="learner-menu-item${activeClass}" data-profile-id="${escapeHtml(profile.id)}">
        <span class="learner-avatar" style="background:${escapeHtml(profile.avatarColor)}">${escapeHtml(initials(profile.name))}</span>
        <span class="learner-menu-meta">
          <strong>${escapeHtml(profile.name)}</strong>
          <small>${profile.summary.xp} XP · ${profile.summary.completedLessons} bài</small>
        </span>
      </button>`;
  }).join("");

  return `
    <div class="learner-switcher">
      <button type="button" class="learner-switcher-btn" id="learnerSwitcherBtn" aria-haspopup="true" aria-expanded="false">
        <span class="learner-avatar" style="background:${escapeHtml(active.avatarColor)}">${escapeHtml(initials(active.name))}</span>
        <span class="learner-switcher-name">${escapeHtml(active.name)}</span>
        <span class="learner-switcher-caret">▾</span>
      </button>
      <div class="learner-menu" id="learnerMenu" hidden>
        <p class="learner-menu-label">Chọn người học</p>
        ${menu}
        <button type="button" class="learner-menu-add" id="addLearnerQuick">+ Thêm người học</button>
      </div>
    </div>`;
}

let menuHandlers = {};

export function bindLearnerSwitcher(handlers = {}) {
  menuHandlers = handlers;
  const button = document.querySelector("#learnerSwitcherBtn");
  const menu = document.querySelector("#learnerMenu");
  if (!button || !menu) return;

  if (button.dataset.bound === "true") return;
  button.dataset.bound = "true";

  const closeMenu = () => {
    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
  };

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = menu.hidden;
    menu.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", closeMenu);
  menu.addEventListener("click", (event) => event.stopPropagation());

  menu.addEventListener("click", (event) => {
    const switchBtn = event.target.closest("[data-profile-id]");
    if (switchBtn) {
      menuHandlers.onSwitch?.(switchBtn.dataset.profileId);
      closeMenu();
      return;
    }
    if (event.target.closest("#addLearnerQuick")) {
      menuHandlers.onAdd?.();
      closeMenu();
    }
  });
}

export function renderLearnerList(state, profiles) {
  if (!profiles.length) {
    return `<article class="empty-state">Chưa có người học nào.</article>`;
  }

  return profiles.map((profile) => {
    const isActive = profile.id === state.profileId;
    return `
      <article class="learner-card${isActive ? " is-active" : ""}">
        <div class="learner-card-head">
          <span class="learner-avatar learner-avatar-lg" style="background:${escapeHtml(profile.avatarColor)}">${escapeHtml(initials(profile.name))}</span>
          <div>
            <h3>${escapeHtml(profile.name)}${isActive ? ' <span class="tag">Đang học</span>' : ""}</h3>
            <p>${profile.summary.xp} XP · ${profile.summary.completedLessons} bài · ${profile.summary.accuracy}% chính xác</p>
          </div>
        </div>
        <div class="learner-card-actions">
          ${isActive ? "" : `<button class="btn secondary" type="button" data-switch-profile="${escapeHtml(profile.id)}">Chuyển sang</button>`}
          <button class="btn quiet" type="button" data-rename-profile="${escapeHtml(profile.id)}">Đổi tên</button>
          ${profiles.length > 1 ? `<button class="btn danger quiet" type="button" data-delete-profile="${escapeHtml(profile.id)}">Xóa</button>` : ""}
        </div>
      </article>`;
  }).join("");
}

export function renderAddLearnerForm() {
  return `
    <form class="add-learner-form" id="addLearnerForm">
      <label>
        <span>Tên người học</span>
        <input type="text" name="name" maxlength="40" placeholder="Ví dụ: Minh, Lan..." required>
      </label>
      <button class="btn primary" type="submit">Thêm và chuyển sang</button>
    </form>`;
}
