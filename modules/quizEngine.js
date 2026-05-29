import { normalizeText } from "../assets/js/utils.js";
import { analyzeError } from "./errorEngine.js";
import { xpForAnswer } from "./gamification.js";
import { updateState } from "../assets/js/state.js";

export function validateAnswer(answer, question) {
  const candidate = normalizeText(answer);
  const accepted = [question.answer, ...(question.alternatives || [])].map(normalizeText);
  return accepted.includes(candidate);
}

export function submitAnswer(answer, question, errorPatterns) {
  const correct = validateAnswer(answer, question);
  const error = correct ? null : analyzeError(answer, question, errorPatterns);

  updateState((state) => {
    state.xp += xpForAnswer(correct);
    state.todayXp += xpForAnswer(correct);
    state.dailyQuest.progress = Math.min(state.dailyQuest.target, state.dailyQuest.progress + (correct ? 1 : 0));
    state.answers.push({
      questionId: question.id,
      skill: question.skill,
      answer,
      correct,
      createdAt: Date.now()
    });

    const currentMastery = state.skillMastery[question.skill] || 0;
    state.skillMastery[question.skill] = Math.max(0, Math.min(100, currentMastery + (correct ? 12 : -6)));

    if (error) {
      state.errors.unshift({
        ...error,
        questionId: question.id,
        answer,
        createdAt: Date.now()
      });
      state.errors = state.errors.slice(0, 20);
    }
  });

  return {
    correct,
    error,
    xp: xpForAnswer(correct)
  };
}
