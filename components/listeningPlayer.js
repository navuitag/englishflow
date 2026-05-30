import { escapeHtml } from "../assets/js/utils.js";
import { isSpeechSupported, speakScript } from "../modules/speech.js";

export function renderListeningPlayer(script, options = {}) {
  const lines = Array.isArray(script) ? script : [];
  const showTranscript = Boolean(options.showTranscript);
  const scriptJson = escapeHtml(JSON.stringify(lines));

  const transcript = showTranscript
    ? `<div class="listen-transcript">${lines
        .map(
          (line) =>
            `<p><strong>${escapeHtml(line.speaker || "Speaker")}:</strong> ${escapeHtml(line.text)}</p>`
        )
        .join("")}</div>`
    : `<p class="listen-note">Nhấn <strong>Nghe</strong> và trả lời câu hỏi. Có thể nghe lại nhiều lần.</p>`;

  return `
    <div class="listening-player" data-listen-script="${scriptJson}">
      <div class="listen-actions">
        <button type="button" class="btn secondary listen-play">Nghe đoạn hội thoại</button>
        ${showTranscript ? "" : `<button type="button" class="btn quiet listen-toggle">Xem transcript</button>`}
      </div>
      ${transcript}
      ${!isSpeechSupported() ? `<p class="listen-fallback">Trình duyệt không hỗ trợ đọc tiếng Anh — hãy dùng transcript.</p>` : ""}
    </div>
  `;
}

export function bindListeningPlayer(root = document) {
  root.querySelectorAll(".listening-player").forEach((player) => {
    const script = JSON.parse(player.dataset.listenScript || "[]");
    const playBtn = player.querySelector(".listen-play");
    const toggleBtn = player.querySelector(".listen-toggle");

    playBtn?.addEventListener("click", () => {
      speakScript(script);
      playBtn.textContent = "Nghe lại";
    });

    toggleBtn?.addEventListener("click", () => {
      const hidden = player.querySelector(".listen-transcript-hidden");
      if (hidden) {
        hidden.classList.toggle("is-visible");
        toggleBtn.textContent = hidden.classList.contains("is-visible")
          ? "Ẩn transcript"
          : "Xem transcript";
        return;
      }

      const block = document.createElement("div");
      block.className = "listen-transcript listen-transcript-hidden is-visible";
      block.innerHTML = script
        .map(
          (line) =>
            `<p><strong>${escapeHtml(line.speaker || "Speaker")}:</strong> ${escapeHtml(line.text)}</p>`
        )
        .join("");
      player.appendChild(block);
      toggleBtn.textContent = "Ẩn transcript";
    });
  });
}
