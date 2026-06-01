import { getState, resetProgress, setSelectedLevel, completeOnboarding, restartOnboarding, updateState } from "./state.js";
import { setRoute, escapeHtml, normalizeText } from "./utils.js";
import { renderNavbar, renderBottomNav, labelLevel } from "../../components/navbar.js";
import { renderLessonCard } from "../../components/lessonCard.js";
import { renderQuizCard } from "../../components/quizCard.js";
import { renderFlashcardPanel } from "../../components/flashcardPanel.js";
import { renderMemoryPanel } from "../../components/memoryPanel.js";
import { showModal } from "../../components/modal.js";
import { renderVisualization, bindVisualizations } from "../../modules/visualization.js";
import { createPracticeModule } from "../../modules/practiceModes.js";
import { completeLesson } from "../../modules/lessonEngine.js";
import { submitAnswer } from "../../modules/quizEngine.js";
import { getGamificationSummary } from "../../modules/gamification.js";
import { getOverallAccuracy, getWeakSkills } from "../../modules/progress.js";
import { bindVocabList, renderVocabList } from "../../components/vocabList.js";
import { renderListeningPlayer, bindListeningPlayer } from "../../components/listeningPlayer.js";
import { renderPronunciationGuide, bindPronunciationGuide } from "../../components/pronunciationGuide.js";
import { renderSpeakingGuide, bindSpeakingGuide } from "../../components/speakingGuide.js";
import { renderWritingGuide } from "../../components/writingGuide.js";

let data = {
  skills: [],
  lessons: [],
  questions: [],
  errors: [],
  exercises: []
};

let practice;

export function configureRouter(appData) {
  data = appData;
  practice = createPracticeModule({
    data,
    getState,
    updateState,
    renderRoute,
    setRoute,
    escapeHtml,
    showModal,
    renderVisualization,
    bindVisualizations,
    renderQuizCard,
    renderFlashcardPanel,
    renderMemoryPanel,
    labelSkill,
    notFound,
    handleAnswer,
    getVizConfig: (skill) => ({ visualization: skill?.visualization, formula: skill?.formula }),
    shouldShowPracticeViz: (skill) => !["vocabulary", "listening", "pronunciation", "speaking", "writing"].includes(skill?.skillType),
    bindPracticeExtras: (skillId, question) => {
      const card = document.querySelector(".quiz-card");
      if (!card || !question) return;
      bindBuilder(card, question, skillId);
      bindListeningPlayer(card);
      bindPronunciationGuide(card);
      bindSpeakingGuide(card);
    }
  });
  window.addEventListener("hashchange", renderRoute);
}

export function renderRoute() {
  const state = getState();
  const hash = window.location.hash || "#/home";
  const parts = hash.replace("#/", "").split("/").filter(Boolean);
  const route = parts[0] || "home";
  const id = parts[1];
  const sub = parts[2];

  practice?.resetOnLeavePractice(route);

  if (!state.onboarded) {
    render(renderOnboarding(state));
    bindOnboarding();
    return;
  }

  const shell = (content) => `
    ${renderNavbar(state, availableLevels())}
    <main class="app-shell">
      ${content}
    </main>
    ${renderBottomNav()}
  `;

  let content;
  let after;

  if (route === "lesson") {
    content = renderLesson(id, state);
    after = () => bindLesson(id);
  } else if (route === "practice") {
    if (sub === "flashcards") {
      content = practice.renderPracticeFlashcards(id, state);
      after = () => practice.bindPracticeFlashcards();
    } else if (sub === "memory") {
      content = practice.renderPracticeMemory(id, state);
      after = () => practice.bindPracticeMemory(id);
    } else if (sub === "workbook") {
      content = practice.renderPracticeWorkbook(id, state);
      after = () => practice.bindPracticeWorkbook(id);
    } else {
      content = practice.renderPracticeQuiz(id, state);
      after = () => practice.bindPracticeQuiz(id);
    }
  } else if (route === "skills") {
    content = renderSkills(state);
    after = bindSkills;
  } else if (route === "review") {
    content = renderErrors(state);
  } else if (route === "profile") {
    content = renderProfile(state);
    after = bindProfile;
  } else {
    content = renderHome(state);
  }

  render(shell(content));
  bindNavbar();
  if (after) after();
}

function bindNavbar() {
  const select = document.querySelector("#levelSelect");
  if (!select) return;
  select.addEventListener("change", () => {
    setSelectedLevel(Number(select.value));
    renderRoute();
  });
}

function renderOnboarding(state) {
  const levels = availableLevels();
  const cards = levels.map((level) => {
    const count = data.skills.filter((skill) => skill.grade === level).length;
    const chapters = new Set(data.skills.filter((skill) => skill.grade === level).map((skill) => skill.chapterIndex)).size;
    return `
      <button class="grade-pick" data-level="${level}">
        <span class="grade-pick-num">${labelLevel(level)}</span>
        <span class="grade-pick-meta">${chapters} chủ đề · ${count} bài</span>
      </button>
    `;
  }).join("");

  return `
    <main class="onboarding">
      <section class="onboarding-card">
        <span class="brand-mark">E</span>
        <span class="eyebrow">Chào mừng đến EnglishFlow</span>
        <h1>Bạn đang học lớp mấy?</h1>
        <p>Chọn trình độ để mình mở đúng lộ trình tiếng Anh theo SGK Global Success (lớp 1–5 và THCS). Bạn có thể đổi bất cứ lúc nào trên thanh điều hướng.</p>
        <div class="grade-pick-grid">
          ${cards}
        </div>
      </section>
    </main>
  `;
}

function bindOnboarding() {
  document.querySelectorAll(".grade-pick").forEach((button) => {
    button.addEventListener("click", () => {
      completeOnboarding(Number(button.dataset.level));
      if (window.location.hash === "#/home") {
        renderRoute();
      } else {
        setRoute("#/home");
      }
    });
  });
}

function render(content) {
  document.querySelector("#app").innerHTML = content;
}

function renderHome(state) {
  const summary = getGamificationSummary(state);
  const activeLevel = resolveLevel(state);
  const levelSkills = data.skills.filter((skill) => skill.grade === activeLevel);
  const nextSkill = levelSkills.find((skill) => !state.completedLessons.includes(skill.id)) || levelSkills[0] || data.skills[0];
  const questPercent = Math.round((state.dailyQuest.progress / state.dailyQuest.target) * 100);
  const weakSkill = getWeakSkills(state)[0];

  return `
    <section class="hero-panel">
      <div>
        <span class="eyebrow">Lộ trình hôm nay · ${labelLevel(activeLevel)}</span>
        <h1>Học tiếng Anh mỗi ngày, hiểu rõ từng lỗi sai.</h1>
        <p>Xem cấu trúc ngữ pháp trực quan, học từ vựng, luyện nghe và phát âm theo Unit.</p>
        <div class="hero-actions">
          <a class="btn primary" href="#/lesson/${nextSkill.id}">Tiếp tục học</a>
          <a class="btn secondary" href="#/practice/${nextSkill.id}">Luyện nhanh</a>
        </div>
      </div>
      <div class="daily-card">
        <span class="tag">Daily Quest</span>
        <h2>${state.dailyQuest.progress}/${state.dailyQuest.target} câu đúng</h2>
        <div class="progress-track"><span style="width:${questPercent}%"></span></div>
        <p>${weakSkill ? `Nên ôn thêm: ${labelSkill(weakSkill.skill)}` : "Bạn chưa có lỗi nổi bật. Khởi động nhẹ thôi."}</p>
      </div>
    </section>
    <section class="stat-grid">
      <article><strong>${state.todayXp}</strong><span>XP hôm nay</span></article>
      <article><strong>${state.streak}</strong><span>Chuỗi ngày</span></article>
      <article><strong>${getOverallAccuracy(state)}%</strong><span>Độ chính xác</span></article>
      <article><strong>${summary.level}</strong><span>Cấp độ</span></article>
    </section>
    <section class="section-head">
      <h2>Bài học tiếp theo · ${labelLevel(activeLevel)}</h2>
      <a href="#/skills">Xem tất cả bài</a>
    </section>
    <div class="skill-grid">
      ${levelSkills.slice(0, 3).map((skill) => renderLessonCard(skill, state, data.questions)).join("")}
    </div>
  `;
}

function availableLevels() {
  return [...new Set(data.skills.map((skill) => skill.grade))].sort((a, b) => a - b);
}

function resolveLevel(state) {
  const levels = availableLevels();
  return levels.includes(state.selectedLevel) ? state.selectedLevel : levels[0];
}

function groupByChapter(skills) {
  const groups = new Map();
  skills
    .slice()
    .sort((a, b) => (a.chapterIndex - b.chapterIndex) || (a.lessonNo - b.lessonNo))
    .forEach((skill) => {
      const key = `${skill.chapterIndex}|${skill.chapter}`;
      if (!groups.has(key)) {
        groups.set(key, { chapter: skill.chapter, chapterIndex: skill.chapterIndex, book: skill.book, items: [] });
      }
      groups.get(key).items.push(skill);
    });
  return [...groups.values()];
}

function renderSkills(state) {
  const levels = availableLevels();
  const activeLevel = resolveLevel(state);
  const levelSkills = data.skills.filter((skill) => skill.grade === activeLevel);
  const completedCount = levelSkills.filter((skill) => state.completedLessons.includes(skill.id)).length;
  const chapters = groupByChapter(levelSkills);

  const tabs = levels.map((level) => {
    const count = data.skills.filter((skill) => skill.grade === level).length;
    const isActive = level === activeLevel ? " active" : "";
    return `<button class="grade-tab${isActive}" data-level="${level}" aria-pressed="${level === activeLevel}">
      <strong>${labelLevel(level)}</strong>
      <span>${count} bài</span>
    </button>`;
  }).join("");

  const chapterSections = chapters.map((group) => `
    <section class="chapter-group">
      <header class="chapter-head">
        <span class="tag">Chủ đề ${group.chapterIndex} · ${group.book}</span>
        <h2>${group.chapter}</h2>
      </header>
      <div class="skill-path">
        ${group.items.map((skill) => renderLessonCard(skill, state, data.questions)).join("")}
      </div>
    </section>
  `).join("");

  return `
    <section class="page-title">
      <span class="eyebrow">Lộ trình học</span>
      <h1>Cây bài học tiếng Anh</h1>
      <p>Chọn trình độ để bắt đầu. Mỗi Unit có ngữ pháp, từ vựng, phát âm, nghe, nói và viết.</p>
    </section>
    <div class="grade-tabs" role="group" aria-label="Chọn trình độ">
      ${tabs}
    </div>
    <div class="grade-summary">
      <span>${labelLevel(activeLevel)} · ${chapters.length} chủ đề · ${levelSkills.length} bài</span>
      <span>${completedCount}/${levelSkills.length} bài đã hoàn thành</span>
    </div>
    ${chapterSections}
  `;
}

function bindSkills() {
  document.querySelectorAll(".grade-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      setSelectedLevel(Number(tab.dataset.level));
      renderRoute();
      document.querySelector(".grade-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderLesson(id, state) {
  const lesson = data.lessons.find((item) => item.id === id);
  if (!lesson) return notFound("Không tìm thấy bài học.");
  const skill = data.skills.find((item) => item.id === lesson.skill);
  const mastery = state.skillMastery[lesson.skill] || (state.completedLessons.includes(lesson.skill) ? 65 : 0);

  return `
    <section class="lesson-layout">
      <aside class="lesson-sidebar">
        <a class="back-link" href="#/skills">← Bài học</a>
        <h1>${lesson.title}</h1>
        ${skill?.formula ? `<code class="formula-inline">${skill.formula}</code>` : ""}
        ${skill?.skillType === "vocabulary" ? `<p class="vocab-lesson-note">${packWordCount(lesson)} từ vựng · nhấn thẻ để nghe</p>` : ""}
        ${skill?.skillType === "listening" ? `<p class="skill-lesson-note">Luyện nghe hội thoại + trắc nghiệm</p>` : ""}
        ${skill?.skillType === "pronunciation" ? `<p class="skill-lesson-note">Luyện phát âm · nhấn từ để nghe</p>` : ""}
        ${skill?.skillType === "speaking" ? `<p class="skill-lesson-note">Luyện nói theo mẫu hội thoại · nhấn câu để nghe</p>` : ""}
        ${skill?.skillType === "writing" ? `<p class="skill-lesson-note">Luyện viết câu hoàn chỉnh · đúng ngữ pháp & dấu câu</p>` : ""}
        <p>${mastery}% mastery</p>
        <div class="progress-track"><span style="width:${mastery}%"></span></div>
      </aside>
      <div class="lesson-steps">
        ${lesson.steps.map((step, index) => `
          <article class="lesson-step">
            <span class="step-count">${index + 1}</span>
            <div>
              <h2>${step.title}</h2>
              <p>${step.content}</p>
              ${step.type === "visualization" ? renderVisualization({ visualization: step.visualization, formula: step.formula }) : ""}
              ${step.type === "vocabulary" ? renderVocabList(step.words) : ""}
              ${step.type === "listening" ? renderListeningPlayer(step.script, { showTranscript: step.showTranscript }) : ""}
              ${step.type === "pronunciation" ? renderPronunciationGuide(step) : ""}
              ${step.type === "speaking" ? renderSpeakingGuide(step) : ""}
              ${step.type === "writing" ? renderWritingGuide(step) : ""}
              ${step.example ? `<div class="example-box"><span class="ex-good">✔ ${escapeHtml(step.example.correct)}</span><span class="ex-bad">✘ ${escapeHtml(step.example.wrong)}</span></div>` : ""}
            </div>
          </article>
        `).join("")}
        <div class="completion-panel">
          <div>
            <h2>Sẵn sàng luyện tập?</h2>
            <p>Hoàn thành bài để nhận ${lesson.xp} XP rồi làm mini quiz.</p>
          </div>
          <button class="btn primary" id="completeLesson">Hoàn thành</button>
        </div>
      </div>
    </section>
  `;
}

function bindLesson(id) {
  bindVisualizations();
  bindVocabList(document);
  bindListeningPlayer(document);
  bindPronunciationGuide(document);
  bindSpeakingGuide(document);
  const lesson = data.lessons.find((item) => item.id === id);
  const button = document.querySelector("#completeLesson");
  if (!lesson || !button) return;
  button.addEventListener("click", () => {
    completeLesson(lesson);
    showModal({
      title: "Bài học đã hoàn thành",
      body: `Bạn nhận ${lesson.xp} XP. Giờ mình chuyển sang phần luyện tập nhé.`,
      actionLabel: "Luyện ngay"
    });
    setTimeout(() => setRoute(`#/practice/${lesson.skill}`), 500);
  });
}

function bindBuilder(card, question, id) {
  const builder = card.querySelector(".builder");
  if (!builder) return;
  const target = builder.querySelector(".builder-target");

  const refresh = () => {
    builder.querySelectorAll(".word-chip").forEach((chip) => {
      chip.classList.toggle("used", chip.dataset.used === "true");
    });
  };

  builder.querySelectorAll(".word-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      if (chip.dataset.used === "true") return;
      chip.dataset.used = "true";
      const placed = document.createElement("button");
      placed.className = "word-chip placed";
      placed.textContent = chip.dataset.token;
      placed.addEventListener("click", () => {
        chip.dataset.used = "false";
        placed.remove();
        refresh();
      });
      target.append(placed);
      refresh();
    });
  });

  builder.querySelector('[data-action="reset"]').addEventListener("click", () => {
    target.innerHTML = "";
    builder.querySelectorAll(".word-chip").forEach((chip) => { chip.dataset.used = "false"; });
    refresh();
  });

  builder.querySelector('[data-action="check"]').addEventListener("click", () => {
    const sentence = [...target.querySelectorAll(".word-chip")].map((node) => node.textContent).join(" ");
    handleAnswer(sentence, question, id);
  });
}

function handleAnswer(answer, question, skillId) {
  const result = submitAnswer(answer, question, data.errors);
  const panel = document.querySelector(".feedback-panel");
  const card = document.querySelector(".quiz-card");
  card.classList.remove("is-correct", "is-wrong");
  card.classList.add(result.correct ? "is-correct" : "is-wrong");
  const isWorkbook = String(question.id || "").startsWith("ex_");

  if (result.correct) {
    const completed = isWorkbook
      ? practice.onWorkbookAnswerCorrect(skillId)
      : practice.onPracticeAnswerCorrect(skillId);
    panel.innerHTML = `
      <strong>Chính xác! +${result.xp} XP</strong>
      <p>${completed ? "Bạn đã trả lời đúng tất cả câu hỏi của bài này." : "Câu tiếp theo sẽ xuất hiện sau một nhịp."}</p>
    `;
    return;
  }

  panel.innerHTML = `
    <strong>${result.error.code ? `[${result.error.code}] ` : ""}${escapeHtml(result.error.title)}</strong>
    <p>${escapeHtml(result.error.message)}</p>
    <p><b>Đáp án đúng:</b> ${escapeHtml(question.answer)}</p>
    <p><b>Gợi ý:</b> ${escapeHtml(result.error.hint)}</p>
    <a class="btn quiet" href="#/lesson/${result.error.recommendation}">Ôn lại bài liên quan</a>
  `;
}

function renderErrors(state) {
  const weakSkills = getWeakSkills(state);
  return `
    <section class="page-title">
      <span class="eyebrow">Error Review</span>
      <h1>Sổ tay lỗi sai</h1>
      <p>Ứng dụng lưu lỗi ngữ pháp gần đây để gợi ý điểm cần ôn.</p>
    </section>
    <div class="review-grid">
      <article class="review-summary">
        <h2>Điểm ngữ pháp cần chú ý</h2>
        ${weakSkills.length ? weakSkills.map((item) => `
          <div class="weak-row">
            <span>${labelSkill(item.skill)}</span>
            <strong>${item.count} lỗi</strong>
          </div>
        `).join("") : "<p>Chưa có lỗi nào được ghi nhận.</p>"}
      </article>
      <div class="error-list">
        ${state.errors.length ? state.errors.map((error) => `
          <article class="error-card">
            <span class="tag">${error.code ? `${error.code} · ` : ""}${labelSkill(error.skill)}</span>
            <h2>${escapeHtml(error.title)}</h2>
            <p>${escapeHtml(error.message)}</p>
            <p><b>Gợi ý:</b> ${escapeHtml(error.hint)}</p>
            <a class="btn quiet" href="#/practice/${error.recommendation}">Luyện lại</a>
          </article>
        `).join("") : "<article class='empty-state'>Làm vài câu quiz để sổ tay bắt đầu ghi nhận lỗi nhé.</article>"}
      </div>
    </div>
  `;
}

function renderProfile(state) {
  const summary = getGamificationSummary(state);
  return `
    <section class="page-title">
      <span class="eyebrow">Hồ sơ</span>
      <h1>${escapeHtml(state.user.name)}</h1>
      <p>Đang học ${labelLevel(resolveLevel(state))} · Level ${summary.level} · ${state.xp} XP</p>
    </section>
    <section class="profile-grid">
      <article>
        <h2>Huy hiệu</h2>
        <div class="badge-list">
          ${summary.badges.length ? summary.badges.map((badge) => `<span>${badge}</span>`).join("") : "<p>Hoàn thành bài đầu tiên để nhận huy hiệu.</p>"}
        </div>
      </article>
      <article>
        <h2>Tiến độ cấp độ</h2>
        <div class="progress-track"><span style="width:${Math.round((summary.currentLevelXp / summary.nextLevelXp) * 100)}%"></span></div>
        <p>${summary.currentLevelXp}/${summary.nextLevelXp} XP tới level tiếp theo</p>
      </article>
      <article>
        <h2>Trình độ đang học</h2>
        <p>Bạn đang theo lộ trình ${labelLevel(resolveLevel(state))}. Đổi trình độ sẽ mở lại màn hình chọn lớp (tiến độ được giữ nguyên).</p>
        <button class="btn secondary" id="changeLevel">Đổi trình độ</button>
      </article>
      <article>
        <h2>Dữ liệu học tập</h2>
        <button class="btn danger" id="resetProgress">Xóa tiến độ local</button>
      </article>
    </section>
  `;
}

function bindProfile() {
  const reset = document.querySelector("#resetProgress");
  if (reset) {
    reset.addEventListener("click", () => {
      resetProgress();
      setRoute("#/home");
    });
  }

  const changeLevel = document.querySelector("#changeLevel");
  if (changeLevel) {
    changeLevel.addEventListener("click", () => {
      restartOnboarding();
      renderRoute();
    });
  }
}

function labelSkill(id) {
  return data.skills.find((skill) => skill.id === id)?.title || id;
}

function packWordCount(lesson) {
  const vocabStep = lesson?.steps?.find((step) => step.type === "vocabulary");
  return vocabStep?.words?.length || 0;
}

function notFound(message) {
  return `<section class="empty-state">${message}<br><a class="btn primary" href="#/home">Về trang chính</a></section>`;
}
