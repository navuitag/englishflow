import { levelFromXp } from "../assets/js/utils.js";

export function getGamificationSummary(state) {
  const level = levelFromXp(state.xp);
  const currentLevelXp = state.xp % 120;
  const badges = [];

  if (state.completedLessons.includes("present_simple")) badges.push("Khởi động ngữ pháp");
  if (state.completedLessons.length >= 3) badges.push("Nhịp học đều");
  if (state.streak >= 7) badges.push("7 ngày liên tiếp");
  if (state.answers.filter((answer) => answer.correct).length >= 10) badges.push("Săn lỗi đại tài");
  if (state.errors.length === 0 && state.answers.length >= 5) badges.push("Không vương lỗi sai");

  return {
    level,
    currentLevelXp,
    nextLevelXp: 120,
    badges
  };
}

export function xpForAnswer(correct) {
  return correct ? 10 : 0;
}
