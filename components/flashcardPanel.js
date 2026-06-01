import { escapeHtml } from "../assets/js/utils.js";
import { vocabEmoji, vocabImagePath } from "../modules/vocabImages.js";

function renderVocabArt(card) {
  if (!card.image && !card.emoji) return "";
  const src = card.image || vocabImagePath(card);
  const emoji = card.emoji || vocabEmoji(card);
  return `
    <div class="flashcard-art" aria-hidden="true">
      <img src="${escapeHtml(src)}" alt="" width="96" height="96" loading="lazy">
      <span class="flashcard-emoji" hidden>${escapeHtml(emoji)}</span>
    </div>`;
}

export function renderFlashcardPanel(deck, index, flipped) {
  if (!deck.length) {
    return `<article class="empty-state">Chưa có thẻ cho bài này.</article>`;
  }

  const card = deck[index];
  const face = flipped ? "back" : "front";
  const text = flipped ? card.back : card.front;
  const showArt = !flipped && (card.image || card.emoji);

  return `
    <article class="flashcard-stack">
      <div class="flashcard-meta">
        <span class="tag">${escapeHtml(card.tag)}</span>
        <span>${index + 1} / ${deck.length}</span>
      </div>
      <button class="flashcard ${face}" type="button" id="flashcardFlip" aria-pressed="${flipped}">
        <span class="flashcard-label">${flipped ? "Mặt sau" : "Mặt trước"}</span>
        ${showArt ? renderVocabArt(card) : ""}
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

export function bindFlashcardImages(root = document) {
  root.querySelectorAll(".flashcard-art img").forEach((img) => {
    img.addEventListener("error", () => {
      img.hidden = true;
      img.nextElementSibling?.removeAttribute("hidden");
    });
  });
}
