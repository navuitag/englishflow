import { updateState } from "../assets/js/state.js";
import { normalizeText } from "../assets/js/utils.js";
import { renderFlashcardPanel, bindFlashcardImages } from "../components/flashcardPanel.js";
import { renderMemoryPanel } from "../components/memoryPanel.js";
import { xpForAnswer } from "./gamification.js";

function defaultTopicProgress() {
  return {
    knownCards: [],
    quizBest: 0,
    memoryBest: null,
    modesDone: [],
    xp: 0
  };
}

function getTopicProgress(state, topicId) {
  if (!state.specialTopics) state.specialTopics = {};
  if (!state.specialTopics[topicId]) state.specialTopics[topicId] = defaultTopicProgress();
  return state.specialTopics[topicId];
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

export function createSpecialTopicsModule(ctx) {
  const sessions = {
    topicId: null,
    flashIndex: 0,
    flashFlipped: false,
    flashDeck: [],
    quizIndex: 0,
    quizScore: 0,
    quizOrder: [],
    memory: null
  };

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
    return { known, total, modes, xp: progress.xp, quizBest: progress.quizBest };
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
              ${topic.poster ? `<img src="${ctx.escapeHtml(topic.poster)}" alt="" loading="lazy">` : `<span class="st-topic-fallback">${topic.order}</span>`}
            </div>
            <div class="st-topic-body">
              <span class="tag">${ctx.escapeHtml(cat.label)}</span>
              <h3>${ctx.escapeHtml(topic.title)}</h3>
              ${topic.titleEn ? `<p class="st-topic-en">${ctx.escapeHtml(topic.titleEn)}</p>` : ""}
              <div class="progress-track"><span style="width:${pct}%"></span></div>
              <p class="st-topic-meta">${summary.known}/${summary.total} thẻ · Quiz cao ${summary.quizBest}% · ${summary.modes}/3 chế độ</p>
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
          <p>Flashcard, quiz, memory game và tài liệu PDF/infographic — ôn ngữ pháp, từ vựng, kỹ năng nghe–nói–đọc–viết.</p>
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
            <article><strong>${summary.xp}</strong><span>XP chuyên đề</span></article>
          </div>
        </div>

        <div class="practice-tabs practice-tabs--4 st-mode-tabs">
          <a class="practice-tab active" href="#/special-topics/${topic.id}">Tài liệu</a>
          <a class="practice-tab" href="#/special-topics/${topic.id}/flash">Flash study</a>
          <a class="practice-tab" href="#/special-topics/${topic.id}/quiz">Quiz</a>
          <a class="practice-tab" href="#/special-topics/${topic.id}/memory">Memory</a>
        </div>

        <div class="st-material-grid">
          <article class="st-material-card">
            <h2>Infographic</h2>
            ${topic.poster ? `<img class="st-poster" src="${ctx.escapeHtml(topic.poster)}" alt="${ctx.escapeHtml(topic.title)}">` : "<p class='empty-state'>Chưa có ảnh.</p>"}
          </article>
          <article class="st-material-card">
            <h2>Tài liệu PDF</h2>
            <p>Đọc đầy đủ lý thuyết, ví dụ và bài tập trong file gốc.</p>
            <a class="btn primary" href="${ctx.escapeHtml(topic.pdf)}" target="_blank" rel="noopener">Mở PDF</a>
            <iframe class="st-pdf-frame" src="${ctx.escapeHtml(topic.pdf)}" title="${ctx.escapeHtml(topic.title)}"></iframe>
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
        <div class="practice-tabs practice-tabs--4 st-mode-tabs">
          <a class="practice-tab" href="#/special-topics/${topic.id}">Tài liệu</a>
          <a class="practice-tab active" href="#/special-topics/${topic.id}/flash">Flash study</a>
          <a class="practice-tab" href="#/special-topics/${topic.id}/quiz">Quiz</a>
          <a class="practice-tab" href="#/special-topics/${topic.id}/memory">Memory</a>
        </div>
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
        <div class="practice-tabs practice-tabs--4 st-mode-tabs">
          <a class="practice-tab" href="#/special-topics/${topic.id}">Tài liệu</a>
          <a class="practice-tab" href="#/special-topics/${topic.id}/flash">Flash study</a>
          <a class="practice-tab active" href="#/special-topics/${topic.id}/quiz">Quiz</a>
          <a class="practice-tab" href="#/special-topics/${topic.id}/memory">Memory</a>
        </div>
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
        <div class="practice-tabs practice-tabs--4 st-mode-tabs">
          <a class="practice-tab" href="#/special-topics/${topic.id}">Tài liệu</a>
          <a class="practice-tab" href="#/special-topics/${topic.id}/flash">Flash study</a>
          <a class="practice-tab" href="#/special-topics/${topic.id}/quiz">Quiz</a>
          <a class="practice-tab active" href="#/special-topics/${topic.id}/memory">Memory</a>
        </div>
        <p class="st-practice-lead">Ghép cặp từ–nghĩa · +15 XP khi hoàn thành</p>
        ${renderMemoryPanel(memory.deck, memory.flipped, memory.matched, memory.moves, memory.won)}
      </section>`;
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
    }
  }

  return {
    renderCatalog,
    renderTopicHub,
    renderFlash,
    renderQuiz,
    renderMemory,
    bindFlash,
    bindQuiz,
    bindMemory,
    resetOnLeave
  };
}

export function getSpecialTopicsSummary(state, topics = []) {
  const progressMap = state.specialTopics || {};
  const studied = topics.filter((topic) => (progressMap[topic.id]?.modesDone?.length || 0) > 0).length;
  const xp = Object.values(progressMap).reduce((sum, item) => sum + (item.xp || 0), 0);
  return { studied, xp, total: topics.length };
}
