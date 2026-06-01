import { shuffle } from "../assets/js/utils.js";

function truncate(text, max = 72) {
  const value = String(text).replace(/\s+/g, " ").trim();
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

/** Sinh bộ thẻ từ bài học + câu hỏi của kỹ năng. */
export function buildFlashcardDeck(skillId, lesson, questions, skill) {
  const cards = [];

  if (skill?.skillType === "vocabulary" && lesson) {
    const vocabStep = lesson.steps.find((step) => step.type === "vocabulary");
    if (vocabStep?.words?.length) {
      vocabStep.words.forEach((word, index) => {
        cards.push({
          id: `${skillId}-word-${index}`,
          front: word.en,
          back: [word.vi, word.example].filter(Boolean).join("\n"),
          tag: "Từ vựng",
          emoji: word.emoji,
          image: word.image
        });
      });
    }
  }

  if (skill?.description) {
    cards.push({
      id: `${skillId}-desc`,
      front: skill.title,
      back: skill.description,
      tag: "Khái niệm"
    });
  }

  if (lesson) {
    const intro = lesson.steps.find((step) => step.type === "intro");
    if (intro) {
      cards.push({
        id: `${skillId}-intro`,
        front: "Mục tiêu bài học",
        back: intro.content,
        tag: "Mục tiêu"
      });
    }

    lesson.steps
      .filter((step) => step.type === "visualization" || step.type === "simulation")
      .forEach((step, index) => {
        cards.push({
          id: `${skillId}-viz-${index}`,
          front: step.title,
          back: step.content,
          tag: "Trực quan"
        });
      });

    const example = lesson.steps.find((step) => step.type === "example");
    if (example) {
      cards.push({
        id: `${skillId}-example`,
        front: example.title,
        back: example.content,
        tag: "Ví dụ SGK"
      });
    }

    const summary = lesson.steps.find((step) => step.type === "summary");
    if (summary) {
      cards.push({
        id: `${skillId}-summary`,
        front: summary.title,
        back: summary.content,
        tag: "Ghi nhớ"
      });
    }
  }

  questions
    .filter((question) => question.skill === skillId)
    .forEach((question) => {
      cards.push({
        id: question.id,
        front: question.question,
        back: question.hint ? `${question.answer}\n\nGợi ý: ${question.hint}` : question.answer,
        tag: "Câu hỏi"
      });
    });

  return shuffle(cards);
}

/** Cặp thẻ cho Memory Training (tối đa 6 cặp). */
export function buildMemoryPairs(skillId, lesson, questions) {
  const pairs = [];
  const skillQuestions = questions.filter((question) => question.skill === skillId);

  skillQuestions.slice(0, 6).forEach((question, index) => {
    pairs.push({
      id: `pair-q-${index}`,
      a: { label: "Câu hỏi", text: truncate(question.question, 90) },
      b: { label: "Đáp án", text: truncate(question.answer, 90) }
    });
  });

  if (lesson && pairs.length < 6) {
    const summary = lesson.steps.find((step) => step.type === "summary");
    if (summary) {
      pairs.push({
        id: "pair-summary",
        a: { label: "Chủ đề", text: summary.title },
        b: { label: "Ghi nhớ", text: truncate(summary.content, 90) }
      });
    }
  }

  if (lesson && pairs.length < 4) {
    lesson.steps
      .filter((step) => step.type === "visualization" || step.type === "simulation")
      .slice(0, 4 - pairs.length)
      .forEach((step, index) => {
        pairs.push({
          id: `pair-viz-${index}`,
          a: { label: "Chủ đề", text: step.title },
          b: { label: "Nội dung", text: truncate(step.content, 90) }
        });
      });
  }

  return shuffle(pairs).slice(0, 6);
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
