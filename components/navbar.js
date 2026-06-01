import { getGamificationSummary } from "../modules/gamification.js";

const LEVEL_LABEL = {
  1: "Lớp 1",
  2: "Lớp 2",
  3: "Lớp 3",
  4: "Lớp 4",
  5: "Lớp 5",
  6: "Lớp 6",
  7: "Lớp 7",
  8: "Lớp 8",
  9: "Lớp 9"
};

export function labelLevel(level) {
  return LEVEL_LABEL[level] || `Lớp ${level}`;
}

export function renderNavbar(state, levels = []) {
  const summary = getGamificationSummary(state);
  const options = levels
    .map((level) => `<option value="${level}"${level === state.selectedLevel ? " selected" : ""}>${labelLevel(level)}</option>`)
    .join("");

  return `
    <header class="topbar">
      <a class="brand" href="#/home" aria-label="EnglishFlow home">
        <span class="brand-mark">E</span>
        <span>EnglishFlow</span>
      </a>
      <nav class="nav-links" aria-label="Điều hướng chính">
        <a href="#/home">Hôm nay</a>
        <a href="#/skills">Bài học</a>
        <a href="#/review/errors">Lỗi sai</a>
        <a href="#/profile">Hồ sơ</a>
      </nav>
      <div class="top-stats">
        ${levels.length ? `<label class="grade-switch">
          <span>Trình độ</span>
          <select id="levelSelect" aria-label="Chọn trình độ đang học">${options}</select>
        </label>` : ""}
        <span>${state.streak} ngày</span>
        <span>${state.xp} XP</span>
        <span>Lv ${summary.level}</span>
      </div>
    </header>
  `;
}

export function renderBottomNav() {
  return `
    <nav class="bottom-nav" aria-label="Điều hướng mobile">
      <a href="#/home">Nhà</a>
      <a href="#/skills">Bài học</a>
      <a href="#/review/errors">Lỗi</a>
      <a href="#/profile">Tôi</a>
    </nav>
  `;
}
