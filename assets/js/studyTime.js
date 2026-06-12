/**
 * Tính và ghi nhận thời gian học (phút) — dùng chung *Flow apps.
 */

export function todayDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function formatStudyMinutes(totalMinutes = 0) {
  const minutes = Math.max(0, Math.round(totalMinutes));
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}g ${rest}p` : `${hours} giờ`;
}

export function normalizeStudyFields(progress) {
  if (!progress.studyLastDate) progress.studyLastDate = null;
  if (progress.studyMinutesToday == null) progress.studyMinutesToday = 0;
  if (progress.studyMinutesTotal == null) progress.studyMinutesTotal = 0;
  if (!Array.isArray(progress.studyDailyLog)) progress.studyDailyLog = [];
  return progress;
}

export function getStudyMinutesToday(progress) {
  const normalized = normalizeStudyFields({ ...progress });
  if (normalized.studyLastDate !== todayDateKey()) return 0;
  return normalized.studyMinutesToday || 0;
}

export function applyStudyMinutes(progress, minutes) {
  if (!minutes || minutes <= 0) return progress;
  const next = normalizeStudyFields(progress);
  const today = todayDateKey();

  if (next.studyLastDate !== today) {
    next.studyMinutesToday = 0;
    next.studyLastDate = today;
  }

  next.studyMinutesToday += minutes;
  next.studyMinutesTotal += minutes;

  const log = next.studyDailyLog;
  const last = log[log.length - 1];
  if (last?.date === today) last.minutes += minutes;
  else log.push({ date: today, minutes });
  next.studyDailyLog = log.slice(-60);

  return next;
}

export function getStudyTimeSummary(state = {}) {
  const todayMinutes = getStudyMinutesToday(state);
  const totalMinutes = state.studyMinutesTotal || 0;
  return {
    todayMinutes,
    totalMinutes,
    todayLabel: formatStudyMinutes(todayMinutes),
    totalLabel: formatStudyMinutes(totalMinutes)
  };
}

export function createStudyTimeTracker({ updateState, intervalMs = 60000, tickMs = 15000 }) {
  let sessionStart = null;
  let tickTimer = null;

  function isActive() {
    return document.visibilityState === "visible" && !document.hidden;
  }

  function recordMinutes(minutes) {
    if (!minutes || minutes <= 0) return;
    updateState((progress) => applyStudyMinutes(progress, minutes));
  }

  function flushSession() {
    if (!sessionStart) return;
    const elapsedMs = Date.now() - sessionStart;
    sessionStart = null;
    const minutes = Math.floor(elapsedMs / intervalMs);
    if (minutes > 0) recordMinutes(minutes);
  }

  function startSession() {
    if (!isActive()) return;
    if (!sessionStart) sessionStart = Date.now();
  }

  function tick() {
    if (!isActive() || !sessionStart) return;
    const elapsedMs = Date.now() - sessionStart;
    const minutes = Math.floor(elapsedMs / intervalMs);
    if (minutes > 0) {
      recordMinutes(minutes);
      sessionStart = Date.now() - (elapsedMs % intervalMs);
    }
  }

  function bind() {
    document.addEventListener("visibilitychange", () => {
      if (isActive()) startSession();
      else flushSession();
    });
    window.addEventListener("beforeunload", flushSession);
    window.addEventListener("pagehide", flushSession);
    window.addEventListener("hashchange", startSession);
    tickTimer = setInterval(tick, tickMs);
    startSession();
  }

  return { bind, flushSession, startSession, recordMinutes };
}
