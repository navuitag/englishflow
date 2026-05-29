import { masteryLabel } from "../assets/js/utils.js";
import { labelLevel } from "./navbar.js";
import { isSkillUnlocked, getSkillProgress } from "../modules/progress.js";

export function renderLessonCard(skill, state, questions) {
  const unlocked = isSkillUnlocked(skill, state);
  const progress = getSkillProgress(skill, state, questions);
  const status = progress.completed ? "Hoàn thành" : unlocked ? "Sẵn sàng" : "Đang khóa";
  const action = unlocked
    ? `<a class="btn primary" href="#/lesson/${skill.id}">Học</a><a class="btn quiet" href="#/practice/${skill.id}">Luyện</a>`
    : `<button class="btn disabled" disabled>Khóa</button>`;

  return `
    <article class="skill-card ${unlocked ? "" : "locked"}">
      <div>
        <span class="tag">${labelLevel(skill.grade)} · ${skill.domain}</span>
        <h3>${skill.title}</h3>
        <p>${skill.description}</p>
        ${skill.formula ? `<code class="formula-inline">${skill.formula}</code>` : ""}
      </div>
      <div class="mastery">
        <div class="progress-track"><span style="width:${progress.mastery}%"></span></div>
        <small>${status} · ${masteryLabel(progress.mastery)}</small>
      </div>
      <div class="card-actions">${action}</div>
    </article>
  `;
}
