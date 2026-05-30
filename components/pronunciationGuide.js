import { escapeHtml } from "../assets/js/utils.js";
import { isSpeechSupported, speakWord } from "../modules/speech.js";

export function renderPronunciationGuide(step = {}) {
  const points = step.points || [];
  const examples = step.examples || [];
  const pairs = step.pairs || [];

  return `
    <div class="pronunciation-guide">
      ${step.focus ? `<div class="pron-focus">${escapeHtml(step.focus)}</div>` : ""}
      ${points.length ? `<ul class="pron-points">${points.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>` : ""}
      ${pairs.length ? `<div class="pron-pairs">${pairs
        .map(
          (pair) => `
          <div class="pron-pair">
            <button type="button" class="pron-speak" data-word="${escapeHtml(pair.a)}">${escapeHtml(pair.a)}</button>
            <span class="pron-vs">≠</span>
            <button type="button" class="pron-speak" data-word="${escapeHtml(pair.b)}">${escapeHtml(pair.b)}</button>
            ${pair.note ? `<small>${escapeHtml(pair.note)}</small>` : ""}
          </div>`
        )
        .join("")}</div>` : ""}
      ${examples.length ? `<div class="pron-examples">${examples
        .map(
          (ex) =>
            `<button type="button" class="pron-example pron-speak" data-word="${escapeHtml(ex.word || ex)}">
              <span class="pron-word">${escapeHtml(ex.word || ex)}</span>
              ${ex.stress ? `<span class="pron-stress">${escapeHtml(ex.stress)}</span>` : ""}
              ${ex.note ? `<small>${escapeHtml(ex.note)}</small>` : ""}
            </button>`
        )
        .join("")}</div>` : ""}
      ${!isSpeechSupported() ? `<p class="listen-fallback">Nhấn từ để xem; trình duyệt có thể không đọc được tiếng Anh.</p>` : ""}
    </div>
  `;
}

export function bindPronunciationGuide(root = document) {
  root.querySelectorAll(".pron-speak").forEach((button) => {
    button.addEventListener("click", () => {
      const word = button.dataset.word;
      if (word) speakWord(word);
    });
  });
}
