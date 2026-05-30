/** Browser TTS helpers for listening & pronunciation practice. */

export function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
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
