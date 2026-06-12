import { loadJson } from "./utils.js";
import { updateState } from "./state.js";
import { createStudyTimeTracker } from "./studyTime.js";
import { configureRouter, renderRoute } from "./router.js";

async function boot() {
  const [skills, lessons, questions, errors, exercises] = await Promise.all([
    loadJson("data/skills.json"),
    loadJson("data/lessons.json"),
    loadJson("data/questions.json"),
    loadJson("data/errors.json"),
    loadJson("data/exercises.json")
  ]);

  configureRouter({ skills, lessons, questions, errors, exercises });

  if (!window.location.hash) {
    window.location.hash = "#/home";
  } else {
    renderRoute();
  }

  createStudyTimeTracker({ updateState }).bind();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
}

boot().catch((error) => {
  document.querySelector("#app").innerHTML = `
    <main class="app-shell">
      <section class="empty-state">
        Không khởi động được ứng dụng.<br>
        <small>${error.message}</small>
      </section>
    </main>
  `;
});
