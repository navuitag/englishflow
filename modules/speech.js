/** Browser TTS + speech recognition for listening & speaking practice. */

import { normalizeText } from "../assets/js/utils.js";

let activeRecognition = null;

export function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function isRecognitionSupported() {
  return typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function stopListening() {
  if (activeRecognition) {
    try {
      activeRecognition.abort();
    } catch {
      // ignore
    }
    activeRecognition = null;
  }
}

export function stopSpeech() {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * @param {Array<{speaker?: string, text: string}>|string} script
 */
export function speakScript(script, options = {}) {
  if (!isSpeechSupported()) return false;

  stopSpeech();
  const lines = Array.isArray(script)
    ? script
    : [{ text: String(script) }];

  const rate = options.rate ?? 0.88;
  const lang = options.lang ?? "en-US";
  let index = 0;

  const speakNext = () => {
    if (index >= lines.length) return;
    const line = lines[index];
    const utterance = new SpeechSynthesisUtterance(line.text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.onend = () => {
      index += 1;
      speakNext();
    };
    utterance.onerror = () => {
      index += 1;
      speakNext();
    };
    window.speechSynthesis.speak(utterance);
  };

  speakNext();
  return true;
}

export function speakWord(word, options = {}) {
  return speakScript([{ text: word }], { rate: options.rate ?? 0.75, lang: options.lang ?? "en-US" });
}

function scoreSpokenMatch(spoken, expected) {
  const spokenNorm = normalizeText(spoken).replace(/[.,!?;:]/g, "");
  const expectedNorm = normalizeText(expected).replace(/[.,!?;:]/g, "");
  if (!expectedNorm) return { match: "none", score: 0 };
  if (spokenNorm === expectedNorm) return { match: "exact", score: 1 };

  const spokenWords = spokenNorm.split(/\s+/).filter(Boolean);
  const expectedWords = expectedNorm.split(/\s+/).filter(Boolean);
  let matched = 0;
  let index = 0;

  for (const word of expectedWords) {
    while (index < spokenWords.length && spokenWords[index] !== word) index += 1;
    if (index < spokenWords.length) {
      matched += 1;
      index += 1;
    }
  }

  const score = matched / expectedWords.length;
  if (score >= 0.8) return { match: "close", score };
  if (score >= 0.55) return { match: "partial", score };
  return { match: "none", score };
}

/** Compare STT output against expected phrase (lenient for classroom speaking). */
export function compareSpokenAnswer(spoken, expected) {
  const candidates = Array.isArray(spoken) ? spoken.filter(Boolean) : [spoken];
  let best = { match: "none", score: 0, transcript: candidates[0] || "" };

  for (const candidate of candidates) {
    const result = scoreSpokenMatch(candidate, expected);
    if (result.score > best.score) {
      best = { ...result, transcript: candidate };
    }
    if (result.match === "exact") break;
  }

  return best;
}

export function listenOnce(options = {}) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return Promise.reject(new Error("unsupported"));
  }

  stopListening();
  stopSpeech();

  return new Promise((resolve, reject) => {
    const recognition = new SpeechRecognition();
    activeRecognition = recognition;
    recognition.lang = options.lang ?? "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    let settled = false;
    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      activeRecognition = null;
      fn(value);
    };

    recognition.onresult = (event) => {
      const result = event.results[0];
      const alternatives = [...result].map((item) => item.transcript.trim()).filter(Boolean);
      finish(resolve, {
        transcript: alternatives[0] || "",
        alternatives
      });
    };

    recognition.onerror = (event) => {
      finish(reject, new Error(event.error || "recognition-error"));
    };

    recognition.onend = () => {
      if (!settled) finish(reject, new Error("no-speech"));
    };

    try {
      recognition.start();
    } catch (error) {
      finish(reject, error);
    }
  });
}

export function recognitionErrorMessage(error) {
  const code = error?.message || "unknown";
  if (code === "unsupported") {
    return "Trình duyệt chưa hỗ trợ nhận giọng nói — thử Chrome, Edge hoặc Safari.";
  }
  if (code === "not-allowed" || code === "service-not-allowed") {
    return "Cần cho phép micro trong trình duyệt để luyện nói.";
  }
  if (code === "no-speech" || code === "aborted") {
    return "Không nghe thấy — thử nói to hơn gần micro.";
  }
  if (code === "network") {
    return "Cần kết nối mạng để nhận diện giọng nói.";
  }
  return "Không nhận diện được — thử lại hoặc gõ đáp án.";
}

export function bindSpeechInput(root = document) {
  if (!isRecognitionSupported()) return;

  root.querySelectorAll(".speech-input-mic").forEach((button) => {
    button.addEventListener("click", async () => {
      const form = button.closest(".answer-form");
      const input = form?.querySelector(".answer-input");
      if (!input || button.disabled) return;

      stopListening();
      stopSpeech();
      button.disabled = true;
      button.classList.add("is-listening");
      button.setAttribute("aria-label", "Đang nghe…");

      try {
        const { transcript, alternatives } = await listenOnce();
        input.value = transcript;
        input.dispatchEvent(new Event("input", { bubbles: true }));

        const expected = button.dataset.expected || "";
        if (expected) {
          const result = compareSpokenAnswer(alternatives.length ? alternatives : transcript, expected);
          input.classList.toggle("speech-match", result.match === "exact" || result.match === "close");
          input.classList.toggle("speech-partial", result.match === "partial");
        }
      } catch (error) {
        input.classList.remove("speech-match", "speech-partial");
        window.alert(recognitionErrorMessage(error));
      } finally {
        button.disabled = false;
        button.classList.remove("is-listening");
        button.setAttribute("aria-label", "Nói đáp án");
      }
    });
  });
}
