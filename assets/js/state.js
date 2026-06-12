import { getStudyTimeSummary } from "./studyTime.js";

const LEGACY_KEY = "englishflow_state";
const STORAGE_KEY = "englishflow_accounts";

const AVATAR_COLORS = ["#20a36b", "#193f65", "#e07b39", "#7c3aed", "#db2777", "#0891b2"];

const defaultProgress = () => ({
  selectedLevel: 6,
  onboarded: false,
  xp: 0,
  todayXp: 0,
  streak: 1,
  completedLessons: [],
  skillMastery: {},
  answers: [],
  errors: [],
  dailyQuest: {
    target: 5,
    progress: 0
  },
  studyMinutesToday: 0,
  studyMinutesTotal: 0,
  studyLastDate: null,
  studyDailyLog: [],
  lastStudiedDate: new Date().toISOString().slice(0, 10)
});

function createEmptyAccounts() {
  return {
    activeProfileId: "",
    profiles: [],
    progress: {}
  };
}

function profileColor(id) {
  let hash = 0;
  for (const char of id) hash = (hash + char.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[hash];
}

function createProfileId() {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function extractProgress(raw = {}) {
  const progress = defaultProgress();
  for (const key of Object.keys(progress)) {
    if (raw[key] !== undefined) progress[key] = raw[key];
  }
  if (raw.user?.level) progress.selectedLevel = raw.user.level;
  return progress;
}

function migrateLegacyState() {
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (!legacy) return null;
    const old = JSON.parse(legacy);
    const id = createProfileId();
    const accounts = {
      activeProfileId: id,
      profiles: [{
        id,
        name: old.user?.name || "Học viên",
        avatarColor: profileColor(id),
        createdAt: new Date().toISOString().slice(0, 10)
      }],
      progress: {
        [id]: extractProgress(old)
      }
    };
    localStorage.removeItem(LEGACY_KEY);
    return accounts;
  } catch {
    return null;
  }
}

function loadAccounts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const accounts = JSON.parse(stored);
      if (!accounts.progress) accounts.progress = {};
      if (!Array.isArray(accounts.profiles)) accounts.profiles = [];
      return accounts;
    }
  } catch {
    /* fall through */
  }

  const migrated = migrateLegacyState();
  if (migrated) {
    saveAccounts(migrated);
    return migrated;
  }

  return createEmptyAccounts();
}

function saveAccounts(accounts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

function getActiveProfile(accounts) {
  return accounts.profiles.find((profile) => profile.id === accounts.activeProfileId) || null;
}

function getActiveProgress(accounts) {
  const id = accounts.activeProfileId;
  if (!id) return defaultProgress();
  if (!accounts.progress[id]) accounts.progress[id] = defaultProgress();
  return accounts.progress[id];
}

function buildPublicState(accounts) {
  const profile = getActiveProfile(accounts);
  const progress = getActiveProgress(accounts);

  return {
    profileId: profile?.id || "",
    user: {
      name: profile?.name || "Học viên",
      level: progress.selectedLevel
    },
    avatarColor: profile?.avatarColor || AVATAR_COLORS[0],
    ...progress
  };
}

let accounts = loadAccounts();
let state = buildPublicState(accounts);
const listeners = new Set();

function persist(mutator) {
  mutator(accounts);
  saveAccounts(accounts);
  state = buildPublicState(accounts);
  listeners.forEach((listener) => listener(state));
}

export function getProfiles() {
  return accounts.profiles.map((profile) => ({
    ...profile,
    summary: summarizeProgress(accounts.progress[profile.id] || defaultProgress())
  }));
}

export function summarizeProgress(progress = defaultProgress()) {
  const totalAnswers = progress.answers?.length || 0;
  const correctAnswers = (progress.answers || []).filter((item) => item.correct).length;
  const study = getStudyTimeSummary(progress);
  return {
    xp: progress.xp || 0,
    completedLessons: progress.completedLessons?.length || 0,
    accuracy: totalAnswers ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
    onboarded: Boolean(progress.onboarded),
    studyTodayLabel: study.todayLabel,
    studyTotalLabel: study.totalLabel
  };
}

export function getState() {
  return state;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function updateState(mutator) {
  persist((next) => {
    const progress = getActiveProgress(next);
    mutator(progress);
    next.progress[next.activeProfileId] = progress;
  });
}

export function setSelectedLevel(level) {
  updateState((next) => {
    next.selectedLevel = level;
  });
}

export function completeOnboarding(level, name) {
  persist((next) => {
    const profile = getActiveProfile(next);
    if (profile && name?.trim()) profile.name = name.trim();
    const progress = getActiveProgress(next);
    progress.selectedLevel = level;
    progress.onboarded = true;
    next.progress[next.activeProfileId] = progress;
  });
}

export function restartOnboarding() {
  updateState((next) => {
    next.onboarded = false;
  });
}

export function createProfile(name) {
  const trimmed = String(name || "").trim();
  if (!trimmed) return null;

  const id = createProfileId();
  persist((next) => {
    next.profiles.push({
      id,
      name: trimmed,
      avatarColor: profileColor(id),
      createdAt: new Date().toISOString().slice(0, 10)
    });
    next.progress[id] = defaultProgress();
    next.activeProfileId = id;
  });
  return id;
}

export function switchProfile(profileId) {
  if (!accounts.profiles.some((profile) => profile.id === profileId)) return false;
  persist((next) => {
    next.activeProfileId = profileId;
  });
  return true;
}

export function renameProfile(profileId, name) {
  const trimmed = String(name || "").trim();
  if (!trimmed) return false;

  persist((next) => {
    const profile = next.profiles.find((item) => item.id === profileId);
    if (!profile) return;
    profile.name = trimmed;
  });
  return true;
}

export function deleteProfile(profileId) {
  if (accounts.profiles.length <= 1) return false;
  if (!accounts.profiles.some((profile) => profile.id === profileId)) return false;

  persist((next) => {
    next.profiles = next.profiles.filter((profile) => profile.id !== profileId);
    delete next.progress[profileId];
    if (next.activeProfileId === profileId) {
      next.activeProfileId = next.profiles[0]?.id || "";
    }
  });
  return true;
}

export function resetProgress(profileId = accounts.activeProfileId) {
  persist((next) => {
    if (!next.profiles.some((profile) => profile.id === profileId)) return;
    next.progress[profileId] = defaultProgress();
    if (profileId === next.activeProfileId) {
      next.progress[profileId].onboarded = true;
      next.progress[profileId].selectedLevel = state.selectedLevel;
    }
  });
}

export function hasProfiles() {
  return accounts.profiles.length > 0;
}
