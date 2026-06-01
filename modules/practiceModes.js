import { bindFlashcardImages } from "../components/flashcardPanel.js";
import { buildFlashcardDeck, buildMemoryDeck, buildMemoryPairs } from "./practiceContent.js";
import { bindSpeechInput } from "./speech.js";

export function createPracticeModule(ctx) {
  const practiceSession = {
    skillId: null,
    continueAfterComplete: false,
    workbookFilter: "all",
    flashcards: null,
    memory: null
  };


  function getSkillExercises(skillId) {
    return (ctx.data.exercises || []).filter((item) => item.skill === skillId);
  }

  function getFilteredExercises(skillId) {
    const all = getSkillExercises(skillId);
    if (practiceSession.workbookFilter === "sgk") return all.filter((item) => item.source === "sgk");
    if (practiceSession.workbookFilter === "sbt") return all.filter((item) => item.source === "sbt");
    return all;
  }

  function getCorrectExerciseIds(skillId, state) {
    return new Set(
      state.answers
        .filter((answer) => answer.skill === skillId && answer.correct && String(answer.questionId).startsWith("ex_"))
        .map((answer) => answer.questionId)
    );
  }

  function areAllExercisesCorrect(skillId, state) {
    const list = getFilteredExercises(skillId);
    if (!list.length) return false;
    const correctIds = getCorrectExerciseIds(skillId, state);
    return list.every((item) => correctIds.has(item.id));
  }

  function pickPracticeExercise(skillId, state) {
    const list = getFilteredExercises(skillId);
    const correctIds = getCorrectExerciseIds(skillId, state);
    const remaining = list.filter((item) => !correctIds.has(item.id));
    if (remaining.length) return remaining[0];
    if (!practiceSession.continueAfterComplete) return null;
    const attempts = state.answers.filter((answer) => answer.skill === skillId && String(answer.questionId).startsWith("ex_")).length;
    return list[attempts % list.length];
  }

  function renderWorkbookFilters(skillId, activeFilter) {
    const counts = { all: 0, sgk: 0, sbt: 0 };
    getSkillExercises(skillId).forEach((item) => {
      counts.all += 1;
      counts[item.source] = (counts[item.source] || 0) + 1;
    });
    const filters = [
      { id: "all", label: `Tất cả (${counts.all})` },
      { id: "sgk", label: `SGK (${counts.sgk})` },
      { id: "sbt", label: `SBT (${counts.sbt})` }
    ];
    return `
      <div class="workbook-filters" role="group" aria-label="Lọc bài tập">
        ${filters.map((filter) => `
          <button type="button" class="workbook-filter${filter.id === activeFilter ? " active" : ""}" data-workbook-filter="${filter.id}">${filter.label}</button>
        `).join("")}
      </div>
    `;
  }

  function getSkillQuestions(skillId) {
    return ctx.data.questions.filter((question) => question.skill === skillId);
  }

  function getCorrectQuestionIds(skillId, state) {
    return new Set(
      state.answers
        .filter((answer) => answer.skill === skillId && answer.correct)
        .map((answer) => answer.questionId)
    );
  }

  function areAllQuestionsCorrect(skillId, state) {
    const skillQuestions = getSkillQuestions(skillId);
    if (!skillQuestions.length) return false;
    const correctIds = getCorrectQuestionIds(skillId, state);
    return skillQuestions.every((question) => correctIds.has(question.id));
  }

  function pickPracticeQuestion(skillId, state) {
    const skillQuestions = getSkillQuestions(skillId);
    const correctIds = getCorrectQuestionIds(skillId, state);
    const remaining = skillQuestions.filter((question) => !correctIds.has(question.id));
    if (remaining.length) return remaining[0];
    if (!practiceSession.continueAfterComplete) return null;
    const attempts = state.answers.filter((answer) => answer.skill === skillId).length;
    return skillQuestions[attempts % skillQuestions.length];
  }

  function getNextSkill(currentSkillId) {
    const current = ctx.data.skills.find((skill) => skill.id === currentSkillId);
    if (!current) return null;
    const gradeSkills = ctx.data.skills
      .filter((skill) => skill.grade === current.grade)
      .sort((a, b) => (a.chapterIndex - b.chapterIndex) || (a.lessonNo - b.lessonNo));
    const index = gradeSkills.findIndex((skill) => skill.id === currentSkillId);
    return index >= 0 ? gradeSkills[index + 1] || null : null;
  }


  function renderPracticeWorkbook(skillId, state) {
    const list = getSkillExercises(skillId);
    if (!list.length) return ctx.notFound("Chưa có bài tập rèn luyện cho kỹ năng này.");
    resetPracticeModesIfNeeded(skillId);
    const allComplete = areAllExercisesCorrect(skillId, state);
    const exercise = allComplete && !practiceSession.continueAfterComplete ? null : pickPracticeExercise(skillId, state);
    const done = getCorrectExerciseIds(skillId, state).size;
    const progress = `
      <p class="workbook-progress">Đã hoàn thành ${done}/${getFilteredExercises(skillId).length} bài tập${practiceSession.workbookFilter !== "all" ? ` (${practiceSession.workbookFilter.toUpperCase()})` : ""}</p>
      ${renderWorkbookFilters(skillId, practiceSession.workbookFilter)}
    `;
    const body = exercise
      ? `${progress}${ctx.renderQuizCard(exercise, { workbook: true })}`
      : `${progress}${renderPracticeCompletionPanel(skillId)}`;
    return renderPracticeShell(skillId, state, "workbook", body);
  }

  function bindPracticeWorkbook(skillId) {
    ctx.bindVisualizations?.();
    document.querySelectorAll("[data-workbook-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        practiceSession.workbookFilter = button.dataset.workbookFilter;
        practiceSession.continueAfterComplete = false;
        ctx.renderRoute();
      });
    });
    document.querySelector("#practiceContinue")?.addEventListener("click", () => {
      practiceSession.continueAfterComplete = true;
      ctx.renderRoute();
    });
    document.querySelector("#practiceNextLesson")?.addEventListener("click", () => navigateToNextSkill(skillId));
    const exercise = (ctx.data.exercises || []).find((item) => item.id === document.querySelector(".quiz-card")?.dataset.questionId);
    if (!exercise) return;
    ctx.bindPracticeExtras?.(skillId, exercise);
    document.querySelectorAll(".choice-btn").forEach((button) => {
      button.addEventListener("click", () => ctx.handleAnswer(button.dataset.answer, exercise, skillId));
    });
    const form = document.querySelector(".answer-form");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        ctx.handleAnswer(new FormData(form).get("answer"), exercise, skillId);
      });
    }
    bindSpeechInput(document);
    document.querySelector(".hint-btn")?.addEventListener("click", (event) => {
      const hint = event.currentTarget.dataset.hint;
      if (hint) ctx.showModal({ title: "Gợi ý", body: hint });
    });
    document.querySelector(".solution-btn")?.addEventListener("click", (event) => {
      const solution = event.currentTarget.dataset.solution;
      if (solution) ctx.showModal({ title: "Lời giải SBT", body: solution });
    });
  }

  function onWorkbookAnswerCorrect(skillId) {
    const state = ctx.getState();
    const allComplete = areAllExercisesCorrect(skillId, state);
    if (allComplete && !practiceSession.continueAfterComplete) {
      setTimeout(() => promptPracticeCompletion(skillId), 400);
      return true;
    }
    setTimeout(() => {
      const nextRoute = `#/practice/${skillId}/workbook`;
      if (window.location.hash.startsWith(nextRoute)) ctx.renderRoute();
      else ctx.setRoute(nextRoute);
    }, 900);
    return false;
  }

  function resetPracticeModesIfNeeded(skillId) {
    if (practiceSession.skillId !== skillId) {
      practiceSession.skillId = skillId;
      practiceSession.continueAfterComplete = false;
      practiceSession.workbookFilter = "all";
      practiceSession.flashcards = null;
      practiceSession.memory = null;
    }
  }

  function getSkill(skillId) {
    return ctx.data.skills.find((item) => item.id === skillId);
  }

  function isVocabSkill(skillId) {
    return getSkill(skillId)?.skillType === "vocabulary";
  }

  function renderPracticeTabs(skillId, activeMode) {
    const vocabModes = isVocabSkill(skillId);
    const modes = [
      { id: "quiz", label: "Mini quiz", href: `#/practice/${skillId}` },
      ...(vocabModes ? [
        { id: "flashcards", label: "Flashcards", href: `#/practice/${skillId}/flashcards` },
        { id: "memory", label: "Memory", href: `#/practice/${skillId}/memory` }
      ] : []),
      { id: "workbook", label: "Bài tập", href: `#/practice/${skillId}/workbook` }
    ];
    return `
      <nav class="practice-tabs practice-tabs--${modes.length}" role="tablist" aria-label="Chế độ luyện tập">
        ${modes.map((mode) => `
          <a class="practice-tab${mode.id === activeMode ? " active" : ""}" href="${mode.href}" role="tab" aria-selected="${mode.id === activeMode}">${mode.label}</a>
        `).join("")}
      </nav>
    `;
  }

  function renderPracticeShell(skillId, state, activeMode, body) {
    const skill = ctx.data.skills.find((item) => item.id === skillId);
    const vizConfig = ctx.getVizConfig?.(skill) || { visualization: skill?.visualization };
    return `
      <section class="practice-layout">
        <div class="practice-header">
          <a class="back-link" href="#/skills">← Kỹ năng</a>
          <span class="tag">${ctx.labelSkill(skillId)}</span>
        </div>
        ${renderPracticeTabs(skillId, activeMode)}
        ${activeMode === "quiz" && ctx.shouldShowPracticeViz?.(skill) !== false ? ctx.renderVisualization(vizConfig) : ""}
        ${body}
      </section>
    `;
  }

  function renderPracticeCompletionPanel(skillId) {
    const nextSkill = getNextSkill(skillId);
    return `
      <article class="quiz-complete-panel">
        <h2>Đã trả lời đúng tất cả câu hỏi!</h2>
        <p>Bạn muốn chuyển sang bài tiếp theo hay luyện thêm các câu này?</p>
        <div class="quiz-complete-actions">
          ${nextSkill
            ? `<button class="btn primary" type="button" id="practiceNextLesson">Bài tiếp theo</button>`
            : `<a class="btn primary" href="#/skills">Về cây kỹ năng</a>`}
          <button class="btn secondary" type="button" id="practiceContinue">Luyện thêm</button>
        </div>
      </article>
    `;
  }

  function ensureFlashcardDeck(skillId) {
    if (practiceSession.flashcards?.deck) return;
    const lesson = ctx.data.lessons.find((item) => item.skill === skillId);
    const skill = ctx.data.skills.find((item) => item.id === skillId);
    practiceSession.flashcards = {
      deck: buildFlashcardDeck(skillId, lesson, ctx.data.questions, skill),
      index: 0,
      flipped: false,
      known: new Set(),
      xpAwarded: false
    };
  }

  function ensureMemorySession(skillId) {
    if (practiceSession.memory?.deck) return;
    const lesson = ctx.data.lessons.find((item) => item.skill === skillId);
    const skill = getSkill(skillId);
    const pairs = buildMemoryPairs(skillId, lesson, skill);
    practiceSession.memory = {
      pairs,
      deck: buildMemoryDeck(pairs),
      flipped: [],
      matched: [],
      moves: 0,
      locked: false,
      xpAwarded: false
    };
  }

  function awardPracticeBonus(amount, title, body) {
    ctx.updateState((next) => {
      next.xp += amount;
      next.todayXp += amount;
    });
    ctx.showModal({ title, body: `${body} (+${amount} XP)` });
  }

  function renderPracticeFlashcards(skillId, state) {
    const skill = getSkill(skillId);
    if (!skill) return ctx.notFound("Không tìm thấy kỹ năng.");
    if (!isVocabSkill(skillId)) return renderPracticeQuiz(skillId, state);

    resetPracticeModesIfNeeded(skillId);
    ensureFlashcardDeck(skillId);
    const session = practiceSession.flashcards;
    const body = session.deck.length
      ? ctx.renderFlashcardPanel(session.deck, session.index, session.flipped)
      : `<article class="empty-state">Chưa có từ vựng cho bài này.</article>`;
    return renderPracticeShell(skillId, state, "flashcards", body);
  }

  function renderPracticeMemory(skillId, state) {
    const skill = getSkill(skillId);
    if (!skill) return ctx.notFound("Không tìm thấy kỹ năng.");
    if (!isVocabSkill(skillId)) return renderPracticeQuiz(skillId, state);

    resetPracticeModesIfNeeded(skillId);
    ensureMemorySession(skillId);
    const session = practiceSession.memory;
    const body = session.pairs.length
      ? ctx.renderMemoryPanel(session.deck, session.flipped, session.matched, session.moves, session.matched.length === session.pairs.length)
      : `<article class="empty-state">Chưa có từ vựng cho bài này.</article>`;
    return renderPracticeShell(skillId, state, "memory", body);
  }

  function renderPracticeQuiz(skillId, state) {
    const skillQuestions = getSkillQuestions(skillId);
    if (!skillQuestions.length) return ctx.notFound("Chưa có câu hỏi cho kỹ năng này.");
    resetPracticeModesIfNeeded(skillId);
    const allComplete = areAllQuestionsCorrect(skillId, state);
    const question = allComplete && !practiceSession.continueAfterComplete ? null : pickPracticeQuestion(skillId, state);
    const body = question ? ctx.renderQuizCard(question) : renderPracticeCompletionPanel(skillId);
    return renderPracticeShell(skillId, state, "quiz", body);
  }

  function navigateToNextSkill(currentSkillId) {
    const nextSkill = getNextSkill(currentSkillId);
    if (nextSkill) {
      ctx.setRoute(`#/lesson/${nextSkill.id}`);
      return;
    }
    ctx.setRoute("#/skills");
  }

  function promptPracticeCompletion(skillId) {
    const nextSkill = getNextSkill(skillId);
    ctx.showModal({
      title: "Hoàn thành mini quiz!",
      body: nextSkill
        ? "Bạn đã trả lời đúng tất cả câu hỏi. Chuyển sang bài tiếp theo?"
        : "Bạn đã trả lời đúng tất cả câu hỏi của bài này.",
      actionLabel: nextSkill ? "Bài tiếp theo" : "Về cây kỹ năng",
      secondaryLabel: "Luyện thêm",
      onAction: () => navigateToNextSkill(skillId),
      onSecondary: () => {
        practiceSession.continueAfterComplete = true;
        ctx.renderRoute();
      }
    });
  }

  function handleMemoryFlip(skillId, cardId) {
    const session = practiceSession.memory;
    if (!session || session.locked) return;
    if (session.flipped.includes(cardId)) return;
    const card = session.deck.find((item) => item.id === cardId);
    if (!card || session.matched.includes(card.pairId)) return;
    session.flipped.push(cardId);
    if (session.flipped.length < 2) {
      ctx.renderRoute();
      return;
    }
    session.moves += 1;
    const [firstId, secondId] = session.flipped;
    const first = session.deck.find((item) => item.id === firstId);
    const second = session.deck.find((item) => item.id === secondId);
    if (first.pairId === second.pairId) {
      session.matched.push(first.pairId);
      session.flipped = [];
      ctx.renderRoute();
      if (session.matched.length === session.pairs.length && !session.xpAwarded) {
        session.xpAwarded = true;
        setTimeout(() => {
          awardPracticeBonus(20, "Hoàn thành Memory Training!", `Ghép đủ ${session.pairs.length} cặp trong ${session.moves} lượt.`);
        }, 350);
      }
      return;
    }
    session.locked = true;
    ctx.renderRoute();
    setTimeout(() => {
      session.flipped = [];
      session.locked = false;
      ctx.renderRoute();
    }, 850);
  }

  function bindPracticeFlashcards() {
    const session = practiceSession.flashcards;
    if (!session?.deck.length) return;
    bindFlashcardImages(document);
    const progress = document.querySelector("#flashcardProgress");
    if (progress) progress.textContent = `${session.known.size}/${session.deck.length} thẻ đã nhớ`;
    document.querySelector("#flashcardFlip")?.addEventListener("click", () => {
      session.flipped = !session.flipped;
      ctx.renderRoute();
    });
    document.querySelector("#flashcardPrev")?.addEventListener("click", () => {
      if (session.index <= 0) return;
      session.index -= 1;
      session.flipped = false;
      ctx.renderRoute();
    });
    document.querySelector("#flashcardNext")?.addEventListener("click", () => {
      if (session.index >= session.deck.length - 1) return;
      session.index += 1;
      session.flipped = false;
      ctx.renderRoute();
    });
    document.querySelector("#flashcardKnown")?.addEventListener("click", () => {
      const card = session.deck[session.index];
      session.known.add(card.id);
      if (session.known.size >= session.deck.length && !session.xpAwarded) {
        session.xpAwarded = true;
        ctx.renderRoute();
        awardPracticeBonus(15, "Hoàn thành Flashcards!", "Bạn đã xem và ghi nhớ hết bộ thẻ.");
        return;
      }
      if (session.index < session.deck.length - 1) {
        session.index += 1;
        session.flipped = false;
      }
      ctx.renderRoute();
    });
  }

  function bindPracticeMemory(skillId) {
    const session = practiceSession.memory;
    if (!session?.deck.length) return;
    document.querySelector("#memoryRestart")?.addEventListener("click", () => {
      practiceSession.memory = null;
      ensureMemorySession(skillId);
      ctx.renderRoute();
    });
    document.querySelectorAll(".memory-card:not(.is-matched):not([disabled])").forEach((button) => {
      button.addEventListener("click", () => handleMemoryFlip(skillId, button.dataset.cardId));
    });
  }

  function bindPracticeQuiz(skillId) {
    ctx.bindVisualizations?.();
    document.querySelector("#practiceContinue")?.addEventListener("click", () => {
      practiceSession.continueAfterComplete = true;
      ctx.renderRoute();
    });
    document.querySelector("#practiceNextLesson")?.addEventListener("click", () => navigateToNextSkill(skillId));
    const question = ctx.data.questions.find((item) => item.id === document.querySelector(".quiz-card")?.dataset.questionId);
    if (!question) return;
    ctx.bindPracticeExtras?.(skillId, question);
    document.querySelectorAll(".choice-btn").forEach((button) => {
      button.addEventListener("click", () => ctx.handleAnswer(button.dataset.answer, question, skillId));
    });
    const form = document.querySelector(".answer-form");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        ctx.handleAnswer(new FormData(form).get("answer"), question, skillId);
      });
    }
    bindSpeechInput(document);
    document.querySelector(".hint-btn")?.addEventListener("click", (event) => {
      const hint = event.currentTarget.dataset.hint;
      if (hint) ctx.showModal({ title: "Gợi ý", body: hint });
    });
  }

  function onPracticeAnswerCorrect(skillId) {
    const state = ctx.getState();
    const allComplete = areAllQuestionsCorrect(skillId, state);
    if (allComplete && !practiceSession.continueAfterComplete) {
      setTimeout(() => promptPracticeCompletion(skillId), 400);
      return true;
    }
    setTimeout(() => {
      const nextRoute = `#/practice/${skillId}`;
      if (window.location.hash.startsWith(nextRoute)) ctx.renderRoute();
      else ctx.setRoute(nextRoute);
    }, 900);
    return false;
  }

  function resetOnLeavePractice(route) {
    if (route !== "practice") practiceSession.continueAfterComplete = false;
  }

  return {
    practiceSession,
    resetOnLeavePractice,
    renderPracticeQuiz,
    renderPracticeFlashcards,
    renderPracticeMemory,
    bindPracticeQuiz,
    bindPracticeFlashcards,
    bindPracticeMemory,
    renderPracticeWorkbook,
    bindPracticeWorkbook,
    onPracticeAnswerCorrect,
    onWorkbookAnswerCorrect,
    navigateToNextSkill
  };
}
