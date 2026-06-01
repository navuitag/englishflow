import { escapeHtml } from "../assets/js/utils.js";
import {
  compareSpokenAnswer,
  isRecognitionSupported,
  isSpeechSupported,
  listenOnce,
  recognitionErrorMessage,
  speakWord,
  stopListening,
  stopSpeech
} from "../modules/speech.js";

function feedbackMessage(result) {
  if (result.match === "exact" || result.match === "close") {
    return "Tốt lắm! Giọng nói khớp với mẫu.";
  }
  if (result.match === "partial") {
    return "Gần đúng rồi — nghe mẫu và nói lại một lần nữa.";
  }
  return "Chưa khớp — thử nói chậm và rõ hơn.";
}

function renderPromptRow(line) {
  return `
    <li class="speaking-prompt-row">
      <div class="speaking-prompt-actions">
        <button type="button" class="speak-line" data-text="${escapeHtml(line)}" aria-label="Nghe mẫu">${escapeHtml(line)}</button>
        ${isRecognitionSupported() ? `
          <button type="button" class="speak-mic" data-text="${escapeHtml(line)}" aria-label="Nói thử">Nói thử</button>
        ` : ""}
      </div>
      <p class="speak-feedback" hidden aria-live="polite"></p>
    </li>
  `;
}

export function renderSpeakingGuide(step = {}) {
  const prompts = step.prompts || [];

  return `
    <div class="speaking-guide">
      <p class="speaking-tip">${isRecognitionSupported()
        ? "Nhấn câu để nghe mẫu, bấm <strong>Nói thử</strong> và nói to theo (lặp 2–3 lần)."
        : "Nhấn câu để nghe mẫu, sau đó nói to theo (có thể lặp 2–3 lần)."}</p>
      ${prompts.length ? `
        <ol class="speaking-prompts">
          ${prompts.map((line) => renderPromptRow(line)).join("")}
        </ol>
      ` : ""}
      ${step.model ? `
        <div class="speaking-model-row">
          <p class="speaking-model"><strong>Câu trả lời mẫu:</strong> ${escapeHtml(step.model)}</p>
          ${isRecognitionSupported() ? `
            <button type="button" class="speak-mic speak-mic--model" data-text="${escapeHtml(step.model)}" aria-label="Nói thử câu trả lời mẫu">Nói thử câu mẫu</button>
            <p class="speak-feedback speak-feedback--model" hidden aria-live="polite"></p>
          ` : ""}
        </div>
      ` : ""}
      ${!isSpeechSupported() ? `<p class="listen-fallback">Trình duyệt có thể không đọc được tiếng Anh — hãy đọc to câu mẫu.</p>` : ""}
      ${!isRecognitionSupported() ? `<p class="listen-fallback">Trình duyệt chưa hỗ trợ nhận giọng nói — hãy nói to theo mẫu hoặc dùng Chrome/Edge/Safari.</p>` : ""}
    </div>
  `;
}

async function handleMicClick(button) {
  const expected = button.dataset.text;
  if (!expected || button.disabled) return;

  const row = button.closest(".speaking-prompt-row, .speaking-model-row");
  const feedback = row?.querySelector(".speak-feedback");

  stopListening();
  stopSpeech();
  document.querySelectorAll(".speak-mic.is-listening").forEach((node) => {
    node.classList.remove("is-listening");
    node.textContent = node.classList.contains("speak-mic--model") ? "Nói thử câu mẫu" : "Nói thử";
    node.disabled = false;
  });

  button.disabled = true;
  button.classList.add("is-listening");
  button.textContent = "Đang nghe…";
  if (feedback) {
    feedback.hidden = true;
    feedback.className = feedback.classList.contains("speak-feedback--model")
      ? "speak-feedback speak-feedback--model"
      : "speak-feedback";
  }

  try {
    const { transcript, alternatives } = await listenOnce();
    const result = compareSpokenAnswer(alternatives.length ? alternatives : transcript, expected);
    if (feedback) {
      feedback.hidden = false;
      feedback.textContent = `${feedbackMessage(result)} (${transcript})`;
      feedback.classList.add(
        result.match === "exact" || result.match === "close" ? "is-good" : result.match === "partial" ? "is-partial" : "is-warn"
      );
    }
  } catch (error) {
    if (feedback) {
      feedback.hidden = false;
      feedback.textContent = recognitionErrorMessage(error);
      feedback.classList.add("is-warn");
    }
  } finally {
    button.disabled = false;
    button.classList.remove("is-listening");
    button.textContent = button.classList.contains("speak-mic--model") ? "Nói thử câu mẫu" : "Nói thử";
  }
}

export function bindSpeakingGuide(root = document) {
  root.querySelectorAll(".speak-line").forEach((button) => {
    button.addEventListener("click", () => {
      const text = button.dataset.text;
      if (text) speakWord(text, { rate: 0.82 });
    });
  });

  root.querySelectorAll(".speak-mic").forEach((button) => {
    button.addEventListener("click", () => handleMicClick(button));
  });
}
