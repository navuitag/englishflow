import { updateState } from "../assets/js/state.js";
import { normalizeText, escapeHtml, resolveMediaUrl } from "../assets/js/utils.js";
import { renderFlashcardPanel, bindFlashcardImages } from "../components/flashcardPanel.js";
import { renderMemoryPanel } from "../components/memoryPanel.js";
import { xpForAnswer } from "./gamification.js";
import { bindShadowingPanel, renderShadowingPanel } from "../components/shadowingPanel.js";
import { renderQuizCard } from "../components/quizCard.js";
import { validateAnswer } from "./quizEngine.js";
import { bindSpeechInput } from "./speech.js";
import { bindListeningPlayer } from "../components/listeningPlayer.js";

function defaultTopicProgress() {
  return {
    knownCards: [],
    quizBest: 0,
    memoryBest: null,
    exerciseBest: 0,
    exercisesDone: [],
    shadowingDone: [],
    modesDone: [],
    xp: 0
  };
}

function getTopicProgress(state, topicId) {
  if (!state.specialTopics) state.specialTopics = {};
  const defaults = defaultTopicProgress();
  if (!state.specialTopics[topicId]) {
    state.specialTopics[topicId] = { ...defaults };
    return state.specialTopics[topicId];
  }
  const progress = state.specialTopics[topicId];
  for (const [key, value] of Object.entries(defaults)) {
    if (progress[key] === undefined) {
      progress[key] = Array.isArray(value) ? [] : value;
    }
  }
  return progress;
}

function awardXp(amount, topicId) {
  updateState((state) => {
    const progress = getTopicProgress(state, topicId);
    progress.xp += amount;
    state.xp += amount;
    state.todayXp += amount;
    state.dailyQuest.progress = Math.min(state.dailyQuest.target, state.dailyQuest.progress + (amount >= 10 ? 1 : 0));
  });
}

function markModeDone(topicId, mode) {
  updateState((state) => {
    const progress = getTopicProgress(state, topicId);
    if (!progress.modesDone.includes(mode)) progress.modesDone.push(mode);
  });
}

function closePosterLightbox() {
  document.querySelector(".st-lightbox-backdrop")?.remove();
  document.body.classList.remove("st-lightbox-open");
}

function showPosterLightbox(src, caption = "") {
  closePosterLightbox();
  const imageUrl = resolveMediaUrl(src);
  const backdrop = document.createElement("div");
  backdrop.className = "st-lightbox-backdrop";
  backdrop.innerHTML = `
    <div class="st-lightbox-toolbar">
      <p class="st-lightbox-caption">${escapeHtml(caption)}</p>
      <div class="st-lightbox-actions">
        <a class="btn quiet st-lightbox-open" href="${escapeHtml(imageUrl)}" target="_blank" rel="noopener">Mở tab mới</a>
        <button class="btn secondary st-lightbox-close" type="button" aria-label="Đóng">Đóng</button>
      </div>
    </div>
    <div class="st-lightbox-scroll">
      <img class="st-lightbox-img" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(caption)}">
    </div>
  `;

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      closePosterLightbox();
      document.removeEventListener("keydown", onKeyDown);
    }
  };

  backdrop.querySelector(".st-lightbox-close")?.addEventListener("click", () => {
    closePosterLightbox();
    document.removeEventListener("keydown", onKeyDown);
  });
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop || event.target.classList.contains("st-lightbox-scroll")) {
      closePosterLightbox();
      document.removeEventListener("keydown", onKeyDown);
    }
  });
  backdrop.querySelector(".st-lightbox-img")?.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.body.classList.add("st-lightbox-open");
  document.body.append(backdrop);
  document.addEventListener("keydown", onKeyDown);
}

function renderPosterPreview(poster, caption, escape, { compact = false, topicId = "" } = {}) {
  if (!poster) return compact ? "" : "<p class='empty-state'>Chưa có ảnh.</p>";
  const imageUrl = resolveMediaUrl(poster);
  const safeSrc = escape(imageUrl);
  const safeCaption = escape(caption);
  const fileName = escape(poster.split("/").pop() || "infographic.png");
  if (compact) {
    return `
      <button type="button" class="st-zoom-btn" data-st-fullscreen="${safeSrc}" data-st-caption="${safeCaption}" aria-label="Xem ảnh full-size">
        <span aria-hidden="true">⤢</span>
      </button>`;
  }
  const posterPageLink = topicId
    ? `<a class="btn primary" href="#/special-topics/${escape(topicId)}/poster">Xem ảnh gốc</a>`
    : "";
  return `
    <div class="st-poster-wrap">
      <button type="button" class="st-poster-btn" data-st-fullscreen="${safeSrc}" data-st-caption="${safeCaption}" aria-label="Xem infographic full-size">
        <img class="st-poster" src="${safeSrc}" alt="${safeCaption}" loading="lazy">
        <span class="st-poster-hint">Nhấn để phóng to</span>
      </button>
      <div class="st-poster-actions">
        ${posterPageLink}
        <a class="btn secondary st-open-image" href="${safeSrc}" target="_blank" rel="noopener">Mở tab mới</a>
        <a class="btn quiet" href="${safeSrc}" download="${fileName}">Tải ảnh</a>
      </div>
    </div>`;
}

let posterLightboxReady = false;

function ensurePosterLightboxBinding() {
  if (posterLightboxReady) return;
  posterLightboxReady = true;
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-st-fullscreen]");
    if (!trigger) return;
    event.preventDefault();
    event.stopPropagation();
    const src = trigger.getAttribute("data-st-fullscreen") || "";
    const caption = trigger.getAttribute("data-st-caption") || "";
    showPosterLightbox(src, caption);
  });
}

function bindPosterLightbox() {
  ensurePosterLightboxBinding();
}

export function createSpecialTopicsModule(ctx) {
  ensurePosterLightboxBinding();
  const sessions = {
    topicId: null,
    flashIndex: 0,
    flashFlipped: false,
    flashDeck: [],
    quizIndex: 0,
    quizScore: 0,
    quizOrder: [],
    memory: null,
    shadowIndex: 0,
    shadowHideText: false,
    exerciseIndex: 0,
    exerciseScore: 0,
    exerciseOrder: []
  };

  function getExercises(topic) {
    return topic?.exercises || [];
  }

  function topicHasDrills(topic) {
    return getExercises(topic).length > 0;
  }

  function getShadowingLines(topic) {
    if (topic?.shadowing?.length) return topic.shadowing;
    if (topic?.category !== "pronunciation") return [];
    return (topic.flashcards || [])
      .filter((card) => card.tag === "Từ vựng" && /^[A-Za-z0-9 .,'!?-]+$/.test(card.front))
      .map((card, index) => ({
        id: `sh_auto_${index}`,
        text: card.front.replace(/\s+/g, " ").trim(),
        hint: card.back || ""
      }));
  }

  function topicSupportsShadowing(topic) {
    return getShadowingLines(topic).length > 0;
  }

  function modeTabCount(topic) {
    let count = 6;
    if (topicSupportsShadowing(topic)) count += 1;
    return count;
  }

  function renderModeTabs(topic, active) {
    const shadow = topicSupportsShadowing(topic);
    const count = modeTabCount(topic);
    return `
      <div class="practice-tabs practice-tabs--${count} st-mode-tabs">
        <a class="practice-tab${active === "hub" ? " active" : ""}" href="#/special-topics/${topic.id}">Tài liệu</a>
        <a class="practice-tab${active === "poster" ? " active" : ""}" href="#/special-topics/${topic.id}/poster">Infographic</a>
        ${shadow ? `<a class="practice-tab${active === "shadowing" ? " active" : ""}" href="#/special-topics/${topic.id}/shadowing">Shadowing</a>` : ""}
        <a class="practice-tab${active === "drills" ? " active" : ""}" href="#/special-topics/${topic.id}/drills">Luyện tập</a>
        <a class="practice-tab${active === "flash" ? " active" : ""}" href="#/special-topics/${topic.id}/flash">Flash</a>
        <a class="practice-tab${active === "quiz" ? " active" : ""}" href="#/special-topics/${topic.id}/quiz">Quiz</a>
        <a class="practice-tab${active === "memory" ? " active" : ""}" href="#/special-topics/${topic.id}/memory">Memory</a>
      </div>`;
  }

  function getTopic(id) {
    return ctx.data.specialTopics?.topics?.find((item) => item.id === id) || null;
  }

  function getTopics() {
    return ctx.data.specialTopics?.topics || [];
  }

  function getCategories() {
    return ctx.data.specialTopics?.categories || [];
  }

  function topicProgressSummary(state, topic) {
    const progress = getTopicProgress(state, topic.id);
    const known = progress.knownCards.length;
    const total = topic.flashcards.length || 1;
    const modes = progress.modesDone.length;
    const shadowTotal = getShadowingLines(topic).length;
    const shadowDone = (progress.shadowingDone || []).length;
    const exerciseTotal = getExercises(topic).length;
    const exerciseDone = (progress.exercisesDone || []).length;
    return {
      known, total, modes, xp: progress.xp, quizBest: progress.quizBest,
      shadowDone, shadowTotal, exerciseDone, exerciseTotal,
      exerciseBest: progress.exerciseBest || 0
    };
  }

  function renderCatalog(state) {
    const topics = getTopics();
    const categories = getCategories();
    const totalXp = topics.reduce((sum, topic) => sum + (getTopicProgress(state, topic.id).xp || 0), 0);
    const completed = topics.filter((topic) => getTopicProgress(state, topic.id).modesDone.length >= 2).length;

    const categoryBlocks = categories.map((cat) => {
      const items = topics.filter((topic) => topic.category === cat.id);
      if (!items.length) return "";
      const cards = items.map((topic) => {
        const summary = topicProgressSummary(state, topic);
        const pct = Math.round((summary.known / summary.total) * 100);
        return `
          <a class="st-topic-card" href="#/special-topics/${topic.id}">
            <div class="st-topic-thumb">
              ${topic.poster ? `<img src="${ctx.escapeHtml(resolveMediaUrl(topic.poster))}" alt="" loading="lazy">` : `<span class="st-topic-fallback">${topic.order}</span>`}
              ${topic.poster ? renderPosterPreview(topic.poster, topic.title, ctx.escapeHtml, { compact: true, topicId: topic.id }) : ""}
            </div>
            <div class="st-topic-body">
              <span class="tag">${ctx.escapeHtml(cat.label)}</span>
              <h3>${ctx.escapeHtml(topic.title)}</h3>
              ${topic.titleEn ? `<p class="st-topic-en">${ctx.escapeHtml(topic.titleEn)}</p>` : ""}
              <div class="progress-track"><span style="width:${pct}%"></span></div>
              <p class="st-topic-meta">${summary.known}/${summary.total} thẻ · ${summary.exerciseDone}/${summary.exerciseTotal} bài tập · Quiz ${summary.quizBest}%</p>
            </div>
          </a>`;
      }).join("");

      return `
        <section class="st-category">
          <header class="section-head">
            <h2>${ctx.escapeHtml(cat.label)}</h2>
            <span>${items.length} chuyên đề</span>
          </header>
          <div class="st-topic-grid">${cards}</div>
        </section>`;
    }).join("");

    return `
      <section class="hero-panel st-hero">
        <div>
          <span class="eyebrow">47 chuyên đề THCS</span>
          <h1>Chuyên đề tiếng Anh</h1>
          <p>Flashcard, quiz, memory, shadowing và bài tập đa dạng (Langmaster · ILA · MS Hoa · ELSA) — ôn THCS toàn diện.</p>
          <div class="hero-actions">
            <a class="btn primary" href="#/special-topics/${topics[0]?.id || ""}">Bắt đầu chuyên đề 1</a>
          </div>
        </div>
        <div class="daily-card">
          <span class="tag">Special Topics XP</span>
          <h2>${totalXp} XP</h2>
          <p>${completed}/${topics.length} chuyên đề đã luyện ≥2 chế độ</p>
        </div>
      </section>
      ${categoryBlocks || ctx.notFound("Chưa có dữ liệu chuyên đề.")}`;
  }

  function renderTopicHub(state, topicId) {
    const topic = getTopic(topicId);
    if (!topic) return ctx.notFound("Không tìm thấy chuyên đề.");
    const summary = topicProgressSummary(state, topic);

    return `
      <section class="st-detail">
        <a class="back-link" href="#/special-topics">← Tất cả chuyên đề</a>
        <div class="st-detail-head">
          <div>
            <span class="tag">${ctx.escapeHtml(topic.categoryLabel)}</span>
            <h1>Chuyên đề ${topic.order}. ${ctx.escapeHtml(topic.title)}</h1>
            ${topic.titleEn ? `<p class="st-topic-en">${ctx.escapeHtml(topic.titleEn)}</p>` : ""}
            ${topic.objective ? `<p>${ctx.escapeHtml(topic.objective)}</p>` : ""}
          </div>
          <div class="st-detail-stats">
            <article><strong>${summary.known}/${summary.total}</strong><span>Thẻ đã nhớ</span></article>
            <article><strong>${summary.quizBest}%</strong><span>Quiz tốt nhất</span></article>
            <article><strong>${summary.exerciseDone}/${summary.exerciseTotal}</strong><span>Bài tập</span></article>
            <article><strong>${summary.exerciseBest}%</strong><span>Điểm luyện tập</span></article>
            <article><strong>${summary.shadowTotal ? `${summary.shadowDone}/${summary.shadowTotal}` : "—"}</strong><span>Shadowing</span></article>
            <article><strong>${summary.xp}</strong><span>XP chuyên đề</span></article>
          </div>
        </div>

        ${renderModeTabs(topic, "hub")}

        <article class="st-drills-promo card-panel">
          <h2>Luyện tập đa dạng</h2>
          <p>${summary.exerciseTotal} bài theo phong cách <strong>Langmaster</strong>, <strong>ILA</strong>, <strong>MS Hoa Giao Tiếp</strong>, <strong>ELSA Speak</strong> — trắc nghiệm, nghe, nói, sắp xếp câu, sửa lỗi.</p>
          <a class="btn primary" href="#/special-topics/${topic.id}/drills">Làm bài tập</a>
        </article>

        ${topicSupportsShadowing(topic) ? `
          <article class="st-shadowing-promo card-panel">
            <h2>Luyện phát âm Shadowing</h2>
            <p>Nghe mẫu → nói theo ngay (cùng nhịp) — phương pháp shadowing cho ${summary.shadowTotal} câu/từ trong chuyên đề này.</p>
            <a class="btn primary" href="#/special-topics/${topic.id}/shadowing">Bắt đầu Shadowing</a>
          </article>
        ` : ""}

        <div class="st-material-grid">
          <article class="st-material-card">
            <h2>Infographic</h2>
            ${renderPosterPreview(topic.poster, topic.title, ctx.escapeHtml, { topicId: topic.id })}
          </article>
          <article class="st-material-card">
            <h2>Tài liệu PDF</h2>
            <p>Đọc đầy đủ lý thuyết, ví dụ và bài tập trong file gốc.</p>
            <a class="btn primary" href="${ctx.escapeHtml(resolveMediaUrl(topic.pdf))}" target="_blank" rel="noopener">Mở PDF</a>
            <iframe class="st-pdf-frame" src="${ctx.escapeHtml(resolveMediaUrl(topic.pdf))}" title="${ctx.escapeHtml(topic.title)}"></iframe>
          </article>
        </div>

        <section class="st-preview">
          <h2>Xem trước flashcard (${topic.flashcards.length})</h2>
          <div class="st-preview-list">
            ${topic.flashcards.slice(0, 6).map((card) => `
              <div class="st-preview-item">
                <strong>${ctx.escapeHtml(card.front)}</strong>
                <span>${ctx.escapeHtml(card.back)}</span>
              </div>`).join("")}
          </div>
          <a class="btn secondary" href="#/special-topics/${topic.id}/flash">Học flashcard →</a>
        </section>
      </section>`;
  }

  function renderPosterView(state, topicId) {
    const topic = getTopic(topicId);
    if (!topic) return ctx.notFound("Không tìm thấy chuyên đề.");
    if (!topic.poster) return ctx.notFound("Chuyên đề này chưa có infographic.");

    const imageUrl = resolveMediaUrl(topic.poster);
    const fileName = topic.poster.split("/").pop() || "infographic.png";

    return `
      <section class="st-poster-view">
        <a class="back-link" href="#/special-topics/${topic.id}">← ${ctx.escapeHtml(topic.title)}</a>
        <div class="st-poster-view-head">
          <div>
            <span class="tag">${ctx.escapeHtml(topic.categoryLabel)}</span>
            <h1>Infographic gốc · Chuyên đề ${topic.order}</h1>
            <p>${ctx.escapeHtml(topic.title)}${topic.titleEn ? ` (${ctx.escapeHtml(topic.titleEn)})` : ""}</p>
          </div>
          <div class="st-poster-actions">
            <button type="button" class="btn secondary" data-st-fullscreen="${ctx.escapeHtml(imageUrl)}" data-st-caption="${ctx.escapeHtml(topic.title)}">Phóng to</button>
            <a class="btn secondary" href="${ctx.escapeHtml(imageUrl)}" target="_blank" rel="noopener">Mở tab mới</a>
            <a class="btn quiet" href="${ctx.escapeHtml(imageUrl)}" download="${ctx.escapeHtml(fileName)}">Tải ảnh</a>
          </div>
        </div>
        <div class="st-poster-viewport">
          <img class="st-poster-original" src="${ctx.escapeHtml(imageUrl)}" alt="${ctx.escapeHtml(topic.title)}" loading="eager">
        </div>
        <p class="st-poster-view-hint">Cuộn để xem toàn bộ ảnh ở độ phân giải gốc. Nhấn ảnh hoặc nút Phóng to để xem lightbox.</p>
      </section>`;
  }

  function bindPosterView(topicId) {
    const topic = getTopic(topicId);
    if (!topic?.poster) return;
    document.querySelector(".st-poster-original")?.addEventListener("click", () => {
      showPosterLightbox(resolveMediaUrl(topic.poster), topic.title);
    });
  }

  function renderFlash(state, topicId) {
    const topic = getTopic(topicId);
    if (!topic) return ctx.notFound("Không tìm thấy chuyên đề.");
    resetFlashIfNeeded(topicId, topic);
    const progress = getTopicProgress(state, topicId);
    const deck = sessions.flashDeck;
    const knownCount = progress.knownCards.length;

    return `
      <section class="st-practice">
        <a class="back-link" href="#/special-topics/${topic.id}">← ${ctx.escapeHtml(topic.title)}</a>
        ${renderModeTabs(topic, "flash")}
        <p class="st-practice-lead">Đã nhớ ${knownCount}/${deck.length} thẻ · +5 XP mỗi thẻ mới</p>
        ${renderFlashcardPanel(deck, sessions.flashIndex, sessions.flashFlipped)}
        <div id="stFlashFeedback" class="feedback-panel" hidden></div>
      </section>`;
  }

  function renderQuiz(state, topicId) {
    const topic = getTopic(topicId);
    if (!topic) return ctx.notFound("Không tìm thấy chuyên đề.");
    resetQuizIfNeeded(topicId, topic);
    const question = sessions.quizOrder[sessions.quizIndex];
    const total = sessions.quizOrder.length;
    const done = sessions.quizIndex >= total;

    if (done) {
      const pct = total ? Math.round((sessions.quizScore / total) * 100) : 0;
      return `
        <section class="st-practice">
          <a class="back-link" href="#/special-topics/${topic.id}">← ${ctx.escapeHtml(topic.title)}</a>
          <article class="st-quiz-result">
            <h2>Hoàn thành quiz!</h2>
            <p class="st-quiz-score">${sessions.quizScore}/${total} câu đúng · ${pct}%</p>
            <p>${pct >= 80 ? "Xuất sắc! Bạn nắm chắc chuyên đề này." : pct >= 50 ? "Khá tốt — xem lại PDF và flashcard nhé." : "Hãy đọc lại tài liệu rồi thử lại."}</p>
            <div class="hero-actions">
              <button class="btn primary" type="button" id="stQuizRetry">Làm lại</button>
              <a class="btn secondary" href="#/special-topics/${topic.id}/flash">Ôn flashcard</a>
            </div>
          </article>
        </section>`;
    }

    const options = question.options.map((opt, i) => `
      <button class="st-quiz-option" type="button" data-option="${ctx.escapeHtml(opt)}" data-index="${i}">
        ${ctx.escapeHtml(opt)}
      </button>`).join("");

    return `
      <section class="st-practice">
        <a class="back-link" href="#/special-topics/${topic.id}">← ${ctx.escapeHtml(topic.title)}</a>
        ${renderModeTabs(topic, "quiz")}
        <div class="st-quiz-progress">Câu ${sessions.quizIndex + 1}/${total} · Đúng ${sessions.quizScore}</div>
        <article class="quiz-card st-quiz-card">
          <span class="tag">Quiz chuyên đề</span>
          <h2>${ctx.escapeHtml(question.prompt)}</h2>
          <div class="st-quiz-options">${options}</div>
        </article>
        <div id="stQuizFeedback" class="feedback-panel" hidden></div>
      </section>`;
  }

  function renderMemory(state, topicId) {
    const topic = getTopic(topicId);
    if (!topic) return ctx.notFound("Không tìm thấy chuyên đề.");
    resetMemoryIfNeeded(topicId, topic);
    const memory = sessions.memory;

    return `
      <section class="st-practice">
        <a class="back-link" href="#/special-topics/${topic.id}">← ${ctx.escapeHtml(topic.title)}</a>
        ${renderModeTabs(topic, "memory")}
        <p class="st-practice-lead">Ghép cặp từ–nghĩa · +15 XP khi hoàn thành</p>
        ${renderMemoryPanel(memory.deck, memory.flipped, memory.matched, memory.moves, memory.won)}
      </section>`;
  }

  function renderShadowing(state, topicId) {
    const topic = getTopic(topicId);
    if (!topic) return ctx.notFound("Không tìm thấy chuyên đề.");
    const lines = getShadowingLines(topic);
    if (!lines.length) return ctx.notFound("Chuyên đề này chưa có bài shadowing.");
    resetShadowIfNeeded(topicId);
    const progress = getTopicProgress(state, topicId);

    if (sessions.shadowIndex >= lines.length) {
      return `
        <section class="st-practice">
          <a class="back-link" href="#/special-topics/${topic.id}">← ${ctx.escapeHtml(topic.title)}</a>
          <article class="st-quiz-result st-shadowing-complete">
            <h2>Hoàn thành Shadowing!</h2>
            <p>Bạn đã luyện ${(progress.shadowingDone || []).length}/${lines.length} câu shadow thành công.</p>
            <div class="hero-actions">
              <button class="btn primary" type="button" id="stShadowRestart">Luyện lại từ đầu</button>
              <a class="btn secondary" href="#/special-topics/${topic.id}/flash">Ôn flashcard</a>
            </div>
          </article>
        </section>`;
    }

    return `
      <section class="st-practice">
        <a class="back-link" href="#/special-topics/${topic.id}">← ${ctx.escapeHtml(topic.title)}</a>
        ${renderModeTabs(topic, "shadowing")}
        <p class="st-practice-lead">Shadowing phát âm · +8 XP mỗi câu shadow đúng · ${(progress.shadowingDone || []).length}/${lines.length} đã đạt</p>
        ${renderShadowingPanel(lines, {
          index: sessions.shadowIndex,
          doneIds: progress.shadowingDone || [],
          hideText: sessions.shadowHideText
        })}
      </section>`;
  }

  function resetShadowIfNeeded(topicId) {
    if (sessions.topicId !== topicId) {
      sessions.shadowIndex = 0;
      sessions.shadowHideText = false;
    }
  }

  function resetDrillsIfNeeded(topicId, topic) {
    if (sessions.topicId !== topicId || !sessions.exerciseOrder.length) {
      sessions.topicId = topicId;
      sessions.exerciseOrder = getExercises(topic).slice().sort(() => Math.random() - 0.5);
      sessions.exerciseIndex = 0;
      sessions.exerciseScore = 0;
    }
  }

  function renderDrills(state, topicId) {
    const topic = getTopic(topicId);
    if (!topic) return ctx.notFound("Không tìm thấy chuyên đề.");
    const exercises = getExercises(topic);
    if (!exercises.length) return ctx.notFound("Chuyên đề này chưa có bài luyện tập.");
    resetDrillsIfNeeded(topicId, topic);
    const total = sessions.exerciseOrder.length;

    if (sessions.exerciseIndex >= total) {
      const pct = Math.round((sessions.exerciseScore / total) * 100);
      return `
        <section class="st-practice">
          <a class="back-link" href="#/special-topics/${topic.id}">← ${ctx.escapeHtml(topic.title)}</a>
          ${renderModeTabs(topic, "drills")}
          <article class="st-quiz-result">
            <h2>Hoàn thành luyện tập!</h2>
            <p class="st-quiz-score">${sessions.exerciseScore}/${total} câu đúng · ${pct}%</p>
            <p>${pct >= 80 ? "Xuất sắc! Bạn đã nắm chắc chuyên đề này." : pct >= 50 ? "Khá tốt — thử lại hoặc ôn flashcard nhé." : "Đọc lại tài liệu rồi làm lại bài tập."}</p>
            <div class="hero-actions">
              <button class="btn primary" type="button" id="stDrillRetry">Làm lại</button>
              <a class="btn secondary" href="#/special-topics/${topic.id}/flash">Ôn flashcard</a>
            </div>
          </article>
        </section>`;
    }

    const exercise = sessions.exerciseOrder[sessions.exerciseIndex];
    const progress = getTopicProgress(state, topicId);
    const doneCount = (progress.exercisesDone || []).length;

    return `
      <section class="st-practice">
        <a class="back-link" href="#/special-topics/${topic.id}">← ${ctx.escapeHtml(topic.title)}</a>
        ${renderModeTabs(topic, "drills")}
        <p class="st-practice-lead">Luyện tập đa dạng · Câu ${sessions.exerciseIndex + 1}/${total} · Đúng ${sessions.exerciseScore} · Đã hoàn thành ${doneCount}/${exercises.length}</p>
        ${renderQuizCard(exercise, { workbook: true })}
      </section>`;
  }

  function showDrillFeedback(correct, exercise, topicId) {
    const card = document.querySelector(".quiz-card");
    const panel = card?.querySelector(".feedback-panel");
    if (!panel) return;

    if (correct) {
      sessions.exerciseScore += 1;
      awardXp(xpForAnswer(true), topicId);
      updateState((state) => {
        const progress = getTopicProgress(state, topicId);
        if (!progress.exercisesDone.includes(exercise.id)) {
          progress.exercisesDone.push(exercise.id);
        }
      });
      panel.innerHTML = `<strong>Chính xác! +${xpForAnswer(true)} XP</strong>`;
    } else {
      panel.innerHTML = `
        <strong>Chưa đúng</strong>
        <p>Đáp án: ${ctx.escapeHtml(exercise.answer)}</p>
        ${exercise.hint ? `<p>${ctx.escapeHtml(exercise.hint)}</p>` : ""}`;
    }
    panel.hidden = false;

    card?.querySelectorAll(".choice-btn, .answer-input, .answer-form button, .builder-actions button").forEach((el) => {
      el.disabled = true;
    });

    setTimeout(() => {
      sessions.exerciseIndex += 1;
      if (sessions.exerciseIndex >= sessions.exerciseOrder.length) {
        const pct = Math.round((sessions.exerciseScore / sessions.exerciseOrder.length) * 100);
        updateState((state) => {
          const progress = getTopicProgress(state, topicId);
          progress.exerciseBest = Math.max(progress.exerciseBest || 0, pct);
          if (pct >= 60 && !progress.modesDone.includes("drills")) {
            progress.modesDone.push("drills");
          }
        });
      }
      ctx.renderRoute();
    }, correct ? 650 : 1100);
  }

  function handleDrillAnswer(answer, exercise, topicId) {
    showDrillFeedback(validateAnswer(answer, exercise), exercise, topicId);
  }

  function bindDrillCard(card, exercise, topicId) {
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
        placed.type = "button";
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

    builder.querySelector('[data-action="reset"]')?.addEventListener("click", () => {
      target.innerHTML = "";
      builder.querySelectorAll(".word-chip").forEach((chip) => { chip.dataset.used = "false"; });
      refresh();
    });

    builder.querySelector('[data-action="check"]')?.addEventListener("click", () => {
      const sentence = [...target.querySelectorAll(".word-chip")].map((node) => node.textContent).join(" ");
      handleDrillAnswer(sentence, exercise, topicId);
    });
  }

  function bindDrills(topicId) {
    const retry = document.querySelector("#stDrillRetry");
    if (retry) {
      retry.addEventListener("click", () => {
        sessions.exerciseOrder = [];
        sessions.exerciseIndex = 0;
        sessions.exerciseScore = 0;
        ctx.renderRoute();
      });
      return;
    }

    const exercise = sessions.exerciseOrder[sessions.exerciseIndex];
    if (!exercise) return;

    const card = document.querySelector(".quiz-card");
    bindListeningPlayer(document);
    bindSpeechInput(document);

    card?.querySelectorAll(".choice-btn").forEach((button) => {
      button.addEventListener("click", () => handleDrillAnswer(button.dataset.answer, exercise, topicId));
    });

    const form = card?.querySelector(".answer-form");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        handleDrillAnswer(new FormData(form).get("answer"), exercise, topicId);
      });
    }

    if (card) bindDrillCard(card, exercise, topicId);

    card?.querySelectorAll(".hint-btn").forEach((button) => {
      if (button.classList.contains("solution-btn")) return;
      button.addEventListener("click", () => {
        const hint = button.dataset.hint;
        const panel = card?.querySelector(".feedback-panel");
        if (!hint || !panel) return;
        panel.hidden = false;
        panel.innerHTML = `<p><strong>Gợi ý:</strong> ${ctx.escapeHtml(hint)}</p>`;
      });
    });
  }

  function bindShadowing(topicId) {
    const topic = getTopic(topicId);
    if (!topic) return;
    const lines = getShadowingLines(topic);
    if (!lines.length) return;

    const restart = document.querySelector("#stShadowRestart");
    if (restart) {
      restart.addEventListener("click", () => {
        sessions.shadowIndex = 0;
        ctx.renderRoute();
      });
      return;
    }

    bindShadowingPanel(document, lines, {
      onLineSuccess: (line) => {
        let firstSuccess = false;
        updateState((state) => {
          const progress = getTopicProgress(state, topicId);
          if (!progress.shadowingDone.includes(line.id)) {
            progress.shadowingDone.push(line.id);
            firstSuccess = true;
          }
          if (progress.shadowingDone.length >= Math.ceil(lines.length * 0.7)) {
            if (!progress.modesDone.includes("shadowing")) progress.modesDone.push("shadowing");
          }
        });
        if (firstSuccess) awardXp(8, topicId);
      },
      onToggleHide: (checked) => {
        sessions.shadowHideText = checked;
        ctx.renderRoute();
      },
      onPrev: () => {
        if (sessions.shadowIndex > 0) {
          sessions.shadowIndex -= 1;
          ctx.renderRoute();
        }
      },
      onNext: () => {
        sessions.shadowIndex += 1;
        ctx.renderRoute();
      }
    });
  }

  function resetFlashIfNeeded(topicId, topic) {
    if (sessions.topicId !== topicId || !sessions.flashDeck.length) {
      sessions.topicId = topicId;
      sessions.flashDeck = topic.flashcards.slice();
      sessions.flashIndex = 0;
      sessions.flashFlipped = false;
    }
  }

  function resetQuizIfNeeded(topicId, topic) {
    if (sessions.topicId !== topicId || !sessions.quizOrder.length) {
      sessions.topicId = topicId;
      sessions.quizOrder = topic.quiz.slice().sort(() => Math.random() - 0.5);
      sessions.quizIndex = 0;
      sessions.quizScore = 0;
    }
  }

  function resetMemoryIfNeeded(topicId, topic) {
    if (sessions.topicId !== topicId || !sessions.memory) {
      sessions.topicId = topicId;
      const pairs = topic.flashcards
        .filter((card) => card.tag === "Từ vựng")
        .slice(0, 6);
      const fallback = topic.flashcards.slice(0, 6);
      const source = pairs.length >= 4 ? pairs : fallback;
      const deck = [];
      source.forEach((card, index) => {
        const pairId = `p${index}`;
        deck.push({ id: `${pairId}a`, pairId, label: "EN", text: card.front });
        deck.push({ id: `${pairId}b`, pairId, label: "VI", text: card.back });
      });
      for (let i = deck.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      sessions.memory = { deck, flipped: [], matched: [], moves: 0, won: false };
    }
  }

  function bindFlash(topicId) {
    bindFlashcardImages(document);
    document.querySelector("#flashcardFlip")?.addEventListener("click", () => {
      sessions.flashFlipped = !sessions.flashFlipped;
      ctx.renderRoute();
    });
    document.querySelector("#flashcardPrev")?.addEventListener("click", () => {
      if (sessions.flashIndex > 0) {
        sessions.flashIndex -= 1;
        sessions.flashFlipped = false;
        ctx.renderRoute();
      }
    });
    document.querySelector("#flashcardNext")?.addEventListener("click", () => {
      if (sessions.flashIndex < sessions.flashDeck.length - 1) {
        sessions.flashIndex += 1;
        sessions.flashFlipped = false;
        ctx.renderRoute();
      }
    });
    document.querySelector("#flashcardKnown")?.addEventListener("click", () => {
      const card = sessions.flashDeck[sessions.flashIndex];
      if (!card) return;
      let awarded = false;
      updateState((state) => {
        const progress = getTopicProgress(state, topicId);
        if (!progress.knownCards.includes(card.id)) {
          progress.knownCards.push(card.id);
          progress.xp += 5;
          state.xp += 5;
          state.todayXp += 5;
          awarded = true;
        }
        if (progress.knownCards.length >= sessions.flashDeck.length * 0.8) {
          if (!progress.modesDone.includes("flash")) progress.modesDone.push("flash");
        }
      });
      const feedback = document.querySelector("#stFlashFeedback");
      if (feedback) {
        feedback.hidden = false;
        feedback.innerHTML = awarded
          ? "<strong>+5 XP</strong><p>Đã đánh dấu nhớ thẻ này.</p>"
          : "<strong>Đã nhớ trước đó</strong><p>Tiếp tục thẻ khác nhé.</p>";
      }
      if (sessions.flashIndex < sessions.flashDeck.length - 1) {
        sessions.flashIndex += 1;
        sessions.flashFlipped = false;
        ctx.renderRoute();
      }
    });
  }

  function bindQuiz(topicId) {
    const retry = document.querySelector("#stQuizRetry");
    if (retry) {
      retry.addEventListener("click", () => {
        sessions.quizOrder = [];
        ctx.renderRoute();
      });
      return;
    }

    document.querySelectorAll(".st-quiz-option").forEach((button) => {
      button.addEventListener("click", () => {
        const question = sessions.quizOrder[sessions.quizIndex];
        const chosen = button.dataset.option;
        const correct = normalizeText(chosen) === normalizeText(question.answer);
        const feedback = document.querySelector("#stQuizFeedback");
        if (correct) {
          sessions.quizScore += 1;
          awardXp(xpForAnswer(true), topicId);
        }
        if (feedback) {
          feedback.hidden = false;
          feedback.innerHTML = correct
            ? `<strong>Chính xác! +${xpForAnswer(true)} XP</strong>`
            : `<strong>Chưa đúng</strong><p>Đáp án: ${ctx.escapeHtml(question.answer)}</p>${question.hint ? `<p>${ctx.escapeHtml(question.hint)}</p>` : ""}`;
        }
        document.querySelectorAll(".st-quiz-option").forEach((el) => { el.disabled = true; });
        setTimeout(() => {
          sessions.quizIndex += 1;
          if (sessions.quizIndex >= sessions.quizOrder.length) {
            const pct = Math.round((sessions.quizScore / sessions.quizOrder.length) * 100);
            updateState((state) => {
              const progress = getTopicProgress(state, topicId);
              progress.quizBest = Math.max(progress.quizBest || 0, pct);
              if (pct >= 60 && !progress.modesDone.includes("quiz")) progress.modesDone.push("quiz");
            });
          }
          ctx.renderRoute();
        }, correct ? 650 : 1100);
      });
    });
  }

  function bindMemory(topicId) {
    const memory = sessions.memory;
    if (!memory) return;

    document.querySelector("#memoryRestart")?.addEventListener("click", () => {
      sessions.memory = null;
      ctx.renderRoute();
    });

    document.querySelectorAll(".memory-card:not([disabled])").forEach((button) => {
      button.addEventListener("click", () => {
        if (memory.won) return;
        const cardId = button.dataset.cardId;
        const card = memory.deck.find((item) => item.id === cardId);
        if (!card || memory.flipped.includes(cardId) || memory.matched.includes(card.pairId)) return;

        memory.flipped.push(cardId);
        if (memory.flipped.length === 2) {
          memory.moves += 1;
          const [aId, bId] = memory.flipped;
          const a = memory.deck.find((item) => item.id === aId);
          const b = memory.deck.find((item) => item.id === bId);
          if (a && b && a.pairId === b.pairId) {
            memory.matched.push(a.pairId);
            memory.flipped = [];
            if (memory.matched.length === memory.deck.length / 2) {
              memory.won = true;
              awardXp(15, topicId);
              markModeDone(topicId, "memory");
              updateState((state) => {
                const progress = getTopicProgress(state, topicId);
                if (!progress.memoryBest || memory.moves < progress.memoryBest) {
                  progress.memoryBest = memory.moves;
                }
              });
            }
          } else {
            setTimeout(() => { memory.flipped = []; ctx.renderRoute(); }, 700);
          }
        }
        ctx.renderRoute();
      });
    });
  }

  function resetOnLeave(route) {
    if (!route.startsWith("special-topics")) {
      sessions.topicId = null;
      sessions.flashDeck = [];
      sessions.quizOrder = [];
      sessions.memory = null;
      sessions.shadowIndex = 0;
      sessions.exerciseOrder = [];
    }
  }

  return {
    renderCatalog,
    renderTopicHub,
    renderPosterView,
    renderFlash,
    renderQuiz,
    renderMemory,
    renderShadowing,
    renderDrills,
    bindFlash,
    bindQuiz,
    bindMemory,
    bindShadowing,
    bindDrills,
    bindPosterLightbox,
    bindPosterView,
    resetOnLeave
  };
}

export function getSpecialTopicsSummary(state, topics = []) {
  const progressMap = state.specialTopics || {};
  const studied = topics.filter((topic) => (progressMap[topic.id]?.modesDone?.length || 0) > 0).length;
  const xp = Object.values(progressMap).reduce((sum, item) => sum + (item.xp || 0), 0);
  return { studied, xp, total: topics.length };
}
