import { escapeHtml } from "../assets/js/utils.js";
import {
  compareSpokenAnswer,
  isRecognitionSupported,
  isSpeechSupported,
  listenOnce,
  recognitionErrorMessage,
  speakThenListen,
  speakWord,
  stopListening,
  stopSpeech
} from "../modules/speech.js";

function matchLabel(result) {
  if (result.match === "exact" || result.match === "close") return "Tốt lắm — shadow khớp mẫu!";
  if (result.match === "partial") return "Gần đúng — nghe lại và shadow một lần nữa.";
  return "Chưa khớp — nói chậm, bám sát nhịp mẫu.";
}

function matchClass(result) {
  if (result.match === "exact" || result.match === "close") return "is-good";
  if (result.match === "partial") return "is-partial";
  return "is-warn";
}

export function renderShadowingPanel(lines, state = {}) {
  const index = state.index ?? 0;
  const done = state.doneIds || [];
  const hideText = Boolean(state.hideText);
  const line = lines[index];
  if (!line) {
    return `<article class="empty-state">Chưa có bài shadowing cho chuyên đề này.</article>`;
  }

  const pct = lines.length ? Math.round((done.length / lines.length) * 100) : 0;
  const group = line.group ? `<span class="sh-group">${escapeHtml(line.group)}</span>` : "";
  const textBlock = hideText
    ? `<p class="sh-text sh-text--hidden" aria-hidden="true">••••••</p><p class="sh-hide-note">Chế độ thử thách — nghe và shadow không nhìn chữ</p>`
    : `<p class="sh-text">${escapeHtml(line.text)}</p>`;

  return `
    <div class="shadowing-panel" data-sh-index="${index}">
      <div class="sh-progress">
        <span>Câu ${index + 1}/${lines.length}</span>
        <div class="progress-track"><span style="width:${pct}%"></span></div>
        <span>${done.length} đã shadow</span>
      </div>
      ${group}
      <article class="sh-card">
        ${textBlock}
        ${line.hint ? `<p class="sh-hint">${escapeHtml(line.hint)}</p>` : ""}
        <div class="sh-actions">
          <button type="button" class="btn secondary" id="shListen" ${!isSpeechSupported() ? "disabled" : ""}>Nghe mẫu</button>
          <button type="button" class="btn primary" id="shShadow" ${!isRecognitionSupported() ? "disabled" : ""}>Shadow</button>
          <button type="button" class="btn quiet" id="shRepeatMic" ${!isRecognitionSupported() ? "disabled" : ""}>Nói lại</button>
        </div>
        <label class="sh-hide-toggle">
          <input type="checkbox" id="shHideText" ${hideText ? "checked" : ""}>
          Ẩn chữ khi shadow
        </label>
        <p class="sh-method">Phương pháp shadowing: nghe mẫu → nói ngay theo (cùng nhịp) → lặp 2–3 lần. Nút <strong>Shadow</strong> tự phát mẫu rồi bật micro.</p>
        ${!isSpeechSupported() ? `<p class="listen-fallback">Trình duyệt không đọc được tiếng Anh.</p>` : ""}
        ${!isRecognitionSupported() ? `<p class="listen-fallback">Cần Chrome/Edge/Safari và quyền micro để shadow.</p>` : ""}
        <p class="sh-feedback" id="shFeedback" hidden aria-live="polite"></p>
      </article>
      <div class="sh-nav">
        <button type="button" class="btn quiet" id="shPrev" ${index <= 0 ? "disabled" : ""}>← Trước</button>
        <button type="button" class="btn secondary" id="shSkip">Bỏ qua</button>
        <button type="button" class="btn primary" id="shNext">${index >= lines.length - 1 ? "Hoàn thành" : "Tiếp →"}</button>
      </div>
    </div>`;
}

export function bindShadowingPanel(root, lines, handlers = {}) {
  const panel = root.querySelector(".shadowing-panel");
  if (!panel || !lines.length) return;

  const index = Number(panel.dataset.shIndex || 0);
  const line = lines[index];
  const feedback = panel.querySelector("#shFeedback");

  const showFeedback = (html, className = "") => {
    if (!feedback) return;
    feedback.hidden = false;
    feedback.className = `sh-feedback${className ? ` ${className}` : ""}`;
    feedback.innerHTML = html;
  };

  const setBusy = (busy) => {
    panel.querySelectorAll("#shListen, #shShadow, #shRepeatMic, #shNext, #shSkip, #shPrev").forEach((btn) => {
      if (!btn) return;
      btn.disabled = busy && btn.id !== "shPrev";
    });
    const shadowBtn = panel.querySelector("#shShadow");
    if (shadowBtn && busy) {
      shadowBtn.classList.add("is-listening");
      shadowBtn.textContent = "Đang shadow…";
    } else if (shadowBtn) {
      shadowBtn.classList.remove("is-listening");
      shadowBtn.textContent = "Shadow";
    }
  };

  panel.querySelector("#shListen")?.addEventListener("click", () => {
    stopListening();
    speakWord(line.text, { rate: 0.78 });
  });

  panel.querySelector("#shShadow")?.addEventListener("click", async () => {
    stopListening();
    stopSpeech();
    setBusy(true);
    if (feedback) feedback.hidden = true;
    try {
      const result = await speakThenListen(line.text, { rate: 0.78, gapMs: 350 });
      const match = compareSpokenAnswer(result.alternatives?.length ? result.alternatives : result.transcript, line.text);
      showFeedback(
        `<strong>${matchLabel(match)}</strong><p>Bạn nói: ${escapeHtml(result.transcript || "—")}</p>`,
        matchClass(match)
      );
      if (match.match === "exact" || match.match === "close") {
        handlers.onLineSuccess?.(line, match);
      }
    } catch (error) {
      showFeedback(escapeHtml(recognitionErrorMessage(error)), "is-warn");
    } finally {
      setBusy(false);
    }
  });

  panel.querySelector("#shRepeatMic")?.addEventListener("click", async () => {
    stopListening();
    stopSpeech();
    setBusy(true);
    if (feedback) feedback.hidden = true;
    try {
      const { transcript, alternatives } = await listenOnce();
      const match = compareSpokenAnswer(alternatives.length ? alternatives : transcript, line.text);
      showFeedback(
        `<strong>${matchLabel(match)}</strong><p>Bạn nói: ${escapeHtml(transcript || "—")}</p>`,
        matchClass(match)
      );
      if (match.match === "exact" || match.match === "close") {
        handlers.onLineSuccess?.(line, match);
      }
    } catch (error) {
      showFeedback(escapeHtml(recognitionErrorMessage(error)), "is-warn");
    } finally {
      setBusy(false);
    }
  });

  panel.querySelector("#shHideText")?.addEventListener("change", (event) => {
    handlers.onToggleHide?.(event.target.checked);
  });

  panel.querySelector("#shPrev")?.addEventListener("click", () => handlers.onPrev?.());
  panel.querySelector("#shSkip")?.addEventListener("click", () => handlers.onNext?.());
  panel.querySelector("#shNext")?.addEventListener("click", () => handlers.onNext?.());
}
