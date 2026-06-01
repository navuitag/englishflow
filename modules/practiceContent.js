import { shuffle } from "../assets/js/utils.js";

function vocabWords(lesson) {
  return lesson?.steps?.find((step) => step.type === "vocabulary")?.words || [];
}

/** Sinh bộ thẻ từ vựng (chỉ dùng cho bài vocabulary). */
export function buildFlashcardDeck(skillId, lesson, _questions, skill) {
  if (skill?.skillType !== "vocabulary") return [];

  return shuffle(
    vocabWords(lesson).map((word, index) => ({
      id: `${skillId}-word-${index}`,
      front: word.en,
      back: [word.vi, word.example].filter(Boolean).join("\n"),
      tag: "Từ vựng",
      emoji: word.emoji,
      image: word.image
    }))
  );
}

/** Cặp EN–VI cho Memory (tối đa 6 cặp, chỉ bài vocabulary). */
export function buildMemoryPairs(skillId, lesson, skill) {
  if (skill?.skillType !== "vocabulary") return [];

  const words = shuffle(vocabWords(lesson)).slice(0, 6);
  return words.map((word, index) => ({
    id: `${skillId}-pair-${index}`,
    a: { label: "Tiếng Anh", text: word.en },
    b: { label: "Tiếng Việt", text: word.vi }
  }));
}

export function buildMemoryDeck(pairs) {
  const cards = [];
  pairs.forEach((pair) => {
    cards.push({
      id: `${pair.id}-a`,
      pairId: pair.id,
      text: pair.a.text,
      label: pair.a.label
    });
    cards.push({
      id: `${pair.id}-b`,
      pairId: pair.id,
      text: pair.b.text,
      label: pair.b.label
    });
  });
  return shuffle(cards);
}
