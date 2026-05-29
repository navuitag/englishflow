import { updateState } from "../assets/js/state.js";

export function completeLesson(lesson) {
  updateState((state) => {
    if (!state.completedLessons.includes(lesson.skill)) {
      state.completedLessons.push(lesson.skill);
      state.xp += lesson.xp;
      state.todayXp += lesson.xp;
    }
    state.skillMastery[lesson.skill] = Math.max(state.skillMastery[lesson.skill] || 0, 40);
  });
}
