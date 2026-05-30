import { escapeHtml } from "../assets/js/utils.js";

export function renderMemoryPanel(deck, flippedIds, matchedIds, moves, won) {
  if (!deck.length) {
    return `<article class="empty-state">Chưa đủ nội dung cho Memory Training.</article>`;
  }

  const flipped = new Set(flippedIds);
  const matched = new Set(matchedIds);
  const pairCount = deck.length / 2;

  const cards = deck.map((card) => {
    const isOpen = flipped.has(card.id) || matched.has(card.pairId);
    const isMatched = matched.has(card.pairId);
    return `
      <button
        class="memory-card${isOpen ? " is-open" : ""}${isMatched ? " is-matched" : ""}"
        type="button"
        data-card-id="${escapeHtml(card.id)}"
        ${isMatched ? "disabled" : ""}
        aria-label="${isOpen ? escapeHtml(card.text) : "Thẻ úp"}"
      >
        <span class="memory-card-inner">
          <span class="memory-card-back">?</span>
          <span class="memory-card-front">
            <small>${escapeHtml(card.label)}</small>
            ${escapeHtml(card.text)}
          </span>
        </span>
      </button>
    `;
  }).join("");

  return `
    <article class="memory-board-wrap">
      <div class="memory-stats">
        <span>Lượt: <strong>${moves}</strong></span>
        <span>Cặp: <strong>${matched.size}/${pairCount}</strong></span>
      </div>
      <div class="memory-grid" style="--memory-cols:${deck.length <= 8 ? 4 : 4}">
        ${cards}
      </div>
      ${won ? `
        <div class="memory-win">
          <h2>Hoàn thành!</h2>
          <p>Bạn đã ghép đủ ${pairCount} cặp trong ${moves} lượt.</p>
          <button class="btn primary" type="button" id="memoryRestart">Chơi lại</button>
        </div>
      ` : ""}
    </article>
  `;
}
