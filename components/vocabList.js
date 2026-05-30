import { escapeHtml } from "../assets/js/utils.js";

export function renderVocabList(words = []) {
  if (!words.length) return "";

  const cards = words
    .map(
      (word) => `
      <article class="vocab-card">
        <div class="vocab-en">${escapeHtml(word.en)}</div>
        ${word.ipa ? `<div class="vocab-ipa">${escapeHtml(word.ipa)}</div>` : ""}
        <div class="vocab-vi">${escapeHtml(word.vi)}</div>
        ${word.example ? `<p class="vocab-example">${escapeHtml(word.example)}</p>` : ""}
      </article>
    `
    )
    .join("");

  return `
    <div class="vocab-grid" aria-label="Danh sách từ vựng">
      ${cards}
    </div>
  `;
}
