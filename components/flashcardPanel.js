import { escapeHtml } from "../assets/js/utils.js";

export function renderFlashcardPanel(deck, index, flipped) {
  if (!deck.length) {
    return `<article class="empty-state">Chưa có thẻ cho bài này.</article>`;
  }

  const card = deck[index];
  const face = flipped ? "back" : "front";
  const text = flipped ? card.back : card.front;

  return `
    <article class="flashcard-stack">
      <div class="flashcard-meta">
        <span class="tag">${escapeHtml(card.tag)}</span>
        <span>${index + 1} / ${deck.length}</span>
      </div>
      <button class="flashcard ${face}" type="button" id="flashcardFlip" aria-pressed="${flipped}">
        <span class="flashcard-label">${flipped ? "Mặt sau" : "Mặt trước"}</span>
        <p class="flashcard-text">${escapeHtml(text).replace(/\n/g, "<br>")}</p>
        <span class="flashcard-hint">Chạm để lật thẻ</span>
      </button>
      <div class="flashcard-nav">
        <button class="btn secondary" type="button" id="flashcardPrev"${index === 0 ? " disabled" : ""}>← Trước</button>
        <button class="btn quiet" type="button" id="flashcardKnown">Đã nhớ</button>
        <button class="btn secondary" type="button" id="flashcardNext"${index >= deck.length - 1 ? " disabled" : ""}>Sau →</button>
      </div>
      <p class="flashcard-progress" id="flashcardProgress"></p>
    </article>
  `;
}
