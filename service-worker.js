const CACHE_NAME = "englishflow-v16";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/css/main.css",
  "./assets/css/layout.css",
  "./assets/css/animation.css",
  "./assets/css/responsive.css",
  "./assets/css/practice-features.css",
  "./assets/js/app.js",
  "./assets/js/router.js",
  "./assets/js/state.js",
  "./assets/js/utils.js",
  "./modules/lessonEngine.js",
  "./modules/quizEngine.js",
  "./modules/errorEngine.js",
  "./modules/visualization.js",
  "./modules/vocabImages.js",
  "./modules/practiceContent.js",
  "./modules/practiceModes.js",
  "./modules/progress.js",
  "./modules/gamification.js",
  "./modules/speech.js",
  "./components/navbar.js",
  "./components/lessonCard.js",
  "./components/quizCard.js",
  "./components/flashcardPanel.js",
  "./components/memoryPanel.js",
  "./components/vocabList.js",
  "./components/learnerSwitcher.js",
  "./components/listeningPlayer.js",
  "./components/pronunciationGuide.js",
  "./components/speakingGuide.js",
  "./components/writingGuide.js",
  "./components/modal.js",
  "./data/skills.json",
  "./data/lessons.json",
  "./data/questions.json",
  "./data/errors.json",
  "./data/exercises.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
