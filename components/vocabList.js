import { escapeHtml } from "../assets/js/utils.js";
import { vocabEmoji, vocabImagePath } from "../modules/vocabImages.js";

export function renderVocabList(words = []) {
  if (!words.length) return "";

  const cards = words
    .map(
      (word) => `
      <button type="button" class="vocab-card vocab-speak" data-word="${escapeHtml(word.en)}" aria-label="Nghe từ ${escapeHtml(word.en)}">
        <div class="vocab-image" aria-hidden="true">
          <img src="${escapeHtml(vocabImagePath(word))}" alt="" loading="lazy" width="72" height="72">
          <span class="vocab-emoji-fallback" hidden>${escapeHtml(vocabEmoji(word))}</span>
        </div>
        <div class="vocab-en">${escapeHtml(word.en)}</div>
        ${word.ipa ? `<div class="vocab-ipa">${escapeHtml(word.ipa)}</div>` : ""}
        <div class="vocab-vi">${escapeHtml(word.vi)}</div>
        ${word.example ? `<p class="vocab-example">${escapeHtml(word.example)}</p>` : ""}
      </button>
    `
    )
    .join("");

  return `
    <div class="vocab-grid" aria-label="Danh sách từ vựng">
      ${cards}
    </div>
  `;
}

export function bindVocabList(root = document) {
  root.querySelectorAll(".vocab-image img").forEach((img) => {
    img.addEventListener("error", () => {
      img.hidden = true;
      img.nextElementSibling?.removeAttribute("hidden");
    });
  });

  root.querySelectorAll(".vocab-speak").forEach((button) => {
    button.addEventListener("click", () => {
      const word = button.dataset.word;
      if (word) {
        import("../modules/speech.js").then(({ speakWord }) => speakWord(word));
      }
    });
  });
}
