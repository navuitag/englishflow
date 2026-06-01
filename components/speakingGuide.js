import { escapeHtml } from "../assets/js/utils.js";
import { isSpeechSupported, speakWord } from "../modules/speech.js";

export function renderSpeakingGuide(step = {}) {
  const prompts = step.prompts || [];

  return `
    <div class="speaking-guide">
      <p class="speaking-tip">Nhấn câu để nghe mẫu, sau đó nói to theo (có thể lặp 2–3 lần).</p>
      ${prompts.length ? `
        <ol class="speaking-prompts">
          ${prompts.map((line) => `
            <li>
              <button type="button" class="speak-line" data-text="${escapeHtml(line)}">${escapeHtml(line)}</button>
            </li>
          `).join("")}
        </ol>
      ` : ""}
      ${step.model ? `<p class="speaking-model"><strong>Câu trả lời mẫu:</strong> ${escapeHtml(step.model)}</p>` : ""}
      ${!isSpeechSupported() ? `<p class="listen-fallback">Trình duyệt có thể không đọc được tiếng Anh — hãy đọc to câu mẫu.</p>` : ""}
    </div>
  `;
}

export function bindSpeakingGuide(root = document) {
  root.querySelectorAll(".speak-line").forEach((button) => {
    button.addEventListener("click", () => {
      const text = button.dataset.text;
      if (text) speakWord(text, { rate: 0.82 });
    });
  });
}
