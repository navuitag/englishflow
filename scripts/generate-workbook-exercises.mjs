#!/usr/bin/env node
/**
 * Sinh data/exercises.json — bài tập rèn luyện theo SGK & SBT cho *Flow projects.
 * Usage: node scripts/generate-workbook-exercises.mjs [bioflow|chemflow|mathflow|englishflow|phyflow|all]
 */
import { readFile, writeFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROJECTS = ["bioflow", "chemflow", "mathflow", "englishflow", "phyflow"];

const CONFIG = {
  bioflow: { label: "Sinh học", sgk: 4, sbt: 6 },
  chemflow: { label: "Hóa học", sgk: 4, sbt: 6 },
  mathflow: { label: "Toán", sgk: 4, sbt: 6 },
  phyflow: { label: "Vật lí", sgk: 4, sbt: 6 },
  englishflow: { label: "Tiếng Anh", sgk: 4, sbt: 8, english: true }
};

function step(lesson, type) {
  return lesson?.steps?.find((item) => item.type === type);
}

function pickDistractors(pool, correct, count = 3) {
  const unique = [...new Set(pool.filter((item) => item && item !== correct))];
  const out = [];
  for (let i = 0; i < unique.length && out.length < count; i += 1) {
    out.push(unique[i]);
  }
  while (out.length < count) {
    out.push(["Không đúng", "Chưa chính xác", "Cần xem lại SGK", "Phát biểu khác"][out.length] || "Khác");
  }
  return out.slice(0, count);
}

function keyPhrase(text, maxWords = 4) {
  const words = String(text).replace(/[.,;:!?()]/g, " ").split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return words.slice(0, maxWords).join(" ");
}

function invertStatement(text) {
  const rules = [
    [/^(.*?)không (.*)$/i, "$1$2"],
    [/^(.*?)có (.*)$/i, "$1không có $2"],
    [/^(.*?)luôn (.*)$/i, "$1không luôn $2"],
    [/^(.*?)tăng(.*?)$/i, "$1giảm$2"],
    [/^(.*?)giảm(.*?)$/i, "$1tăng$2"],
    [/^(.*?)đúng(.*?)$/i, "$1sai$2"]
  ];
  for (const [pattern, repl] of rules) {
    if (pattern.test(text)) return text.replace(pattern, repl);
  }
  return `Không phải lúc nào cũng ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
}

function buildSgkExercises(skill, lesson, questions, cfg) {
  const items = [];
  const intro = step(lesson, "intro");
  const viz = step(lesson, "visualization");
  const example = step(lesson, "example");
  const summary = step(lesson, "summary");
  const pool = questions.flatMap((q) => (q.choices || []).concat(q.answer));

  if (intro) {
    items.push({
      type: "multiple_choice",
      section: "A. Nhận biết",
      question: `Theo SGK, mục tiêu chính của bài "${skill.title.replace(/^Bài \d+\.\s*/, "")}" là gì?`,
      choices: shuffle([
        intro.content,
        ...pickDistractors(pool, intro.content)
      ]),
      answer: intro.content,
      hint: "Xem phần mục tiêu bài học trong SGK.",
      solution: intro.content
    });
  }

  if (viz) {
    items.push({
      type: "true_false",
      section: "B. Ghi nhớ",
      question: viz.content.endsWith(".") ? viz.content : `${viz.content}.`,
      choices: ["Đúng", "Sai"],
      answer: "Đúng",
      hint: `Ôn lại phần "${viz.title}" trong SGK.`,
      solution: "Phát biểu đúng theo nội dung SGK."
    });
  }

  if (example) {
    items.push({
      type: "multiple_choice",
      section: "C. Ví dụ SGK",
      question: "Ví dụ nào phù hợp với nội dung bài học?",
      choices: shuffle([
        example.content,
        ...pickDistractors(pool, example.content)
      ]),
      answer: example.content,
      hint: "Tham khảo mục ví dụ minh họa trong SGK.",
      solution: example.content
    });
  }

  if (summary) {
    const term = keyPhrase(summary.content, 3);
    const blankQ = summary.content.includes(term)
      ? summary.content.replace(term, "___")
      : `Theo SGK, em hãy điền: ___ — ${summary.content}`;
    items.push({
      type: cfg.english ? "input" : "fill_blank",
      section: "D. Ghi nhớ nhanh",
      question: cfg.english ? `Complete: ${blankQ}` : `Điền vào chỗ trống: ${blankQ}`,
      answer: term,
      hint: summary.content,
      solution: summary.content
    });
  }

  return items.slice(0, cfg.sgk);
}

function buildEnglishSgkExercises(skill, lesson, questions, cfg) {
  const items = [];
  const intro = step(lesson, "intro");
  const summary = step(lesson, "summary");
  const vocabulary = step(lesson, "vocabulary");
  const listening = step(lesson, "listening");
  const speaking = step(lesson, "speaking");
  const writing = step(lesson, "writing");
  const pronunciation = step(lesson, "pronunciation");
  const skillQs = questions.filter((q) => q.skill === skill.id);
  const pool = skillQs.flatMap((q) => (q.choices || []).concat(q.answer));

  if (intro) {
    items.push({
      type: "multiple_choice",
      section: "A. Nhận biết",
      question: `Mục tiêu bài "${skill.title}" là gì?`,
      choices: shuffle([intro.content, ...pickDistractors(pool, intro.content)]),
      answer: intro.content,
      hint: "Xem phần mục tiêu trong SGK.",
      solution: intro.content
    });
  }

  if (vocabulary?.words?.length) {
    const word = vocabulary.words[0];
    items.push({
      type: "input",
      section: "B. Từ vựng",
      question: `Viết từ tiếng Anh: ${word.vi}`,
      answer: word.en,
      hint: word.example || word.en,
      solution: word.en
    });
    items.push({
      type: "true_false",
      section: "C. Câu mẫu",
      question: word.example || `${word.en} means ${word.vi}.`,
      choices: ["Đúng", "Sai"],
      answer: "Đúng",
      hint: word.example,
      solution: word.example || `${word.en} = ${word.vi}`
    });
  } else if (listening?.script?.length) {
    const line = listening.script[0]?.text || "Sample dialogue line.";
    items.push({
      type: "true_false",
      section: "B. Nghe hiểu",
      question: `Trong hội thoại mẫu có câu: "${line}"`,
      choices: ["Đúng", "Sai"],
      answer: "Đúng",
      hint: "Nghe lại mẫu hội thoại.",
      solution: line
    });
  } else if (speaking?.prompts?.length) {
    items.push({
      type: "word_order",
      section: "B. Luyện nói",
      question: "Sắp xếp thành câu trả lời đúng:",
      tokens: shuffle(speaking.prompts[0].replace(/[.!?]/g, "").split(/\s+/)),
      answer: speaking.prompts[0].replace(/[.!?]/g, ""),
      hint: speaking.model || speaking.prompts[0],
      solution: speaking.prompts[0]
    });
  } else if (writing?.model) {
    items.push({
      type: "error_detection",
      section: "B. Viết câu",
      question: writing.model,
      prompt: writing.model.replace(/^[A-Z]/, (c) => c.toLowerCase()),
      answer: writing.model,
      hint: (writing.checklist || []).join("; "),
      solution: writing.model
    });
  } else if (pronunciation?.focus) {
    items.push({
      type: "true_false",
      section: "B. Phát âm",
      question: `${pronunciation.focus} là điểm phát âm trọng tâm của bài.`,
      choices: ["Đúng", "Sai"],
      answer: "Đúng",
      hint: pronunciation.content,
      solution: pronunciation.focus
    });
  }

  if (summary) {
    items.push({
      type: "input",
      section: "D. Ghi nhớ",
      question: `Viết lại cấu trúc/công thức chính của bài: ${summary.title}`,
      answer: summary.content,
      hint: summary.content,
      solution: summary.content
    });
  }

  const generic = buildSgkExercises(skill, lesson, skillQs, cfg);
  generic.forEach((item) => {
    if (items.length >= cfg.sgk) return;
    if (!items.some((existing) => existing.type === item.type && existing.question === item.question)) {
      items.push(item);
    }
  });

  return items.slice(0, cfg.sgk);
}

function questionToExercise(q, section, cfg) {
  const base = {
    section,
    question: rephraseQuestion(q.question, cfg.label),
    answer: q.answer,
    hint: q.hint || "Xem lại SGK/SBT.",
    solution: q.answer
  };
  if (q.grammar) base.grammar = q.grammar;

  if (q.type === "multiple_choice" || q.type === "true_false") {
    return {
      ...base,
      type: q.type,
      choices: shuffle(q.choices || (q.type === "true_false" ? ["Đúng", "Sai"] : []))
    };
  }
  if (q.type === "listening") {
    return {
      ...base,
      type: "listening",
      listenScript: q.listenScript,
      choices: shuffle(q.choices || [])
    };
  }
  return {
    ...base,
    type: q.type,
    prompt: q.prompt,
    tokens: q.tokens ? shuffle([...q.tokens]) : undefined
  };
}

function rephraseQuestion(text, subject) {
  const prefixes = [
    `Theo SBT ${subject}, `,
    `Bài tập rèn luyện — `,
    `Em hãy chọn đáp án đúng: `
  ];
  const prefix = prefixes[Math.abs(hash(text)) % prefixes.length];
  if (text.startsWith("Theo ") || text.startsWith("Bài tập")) return text;
  return `${prefix}${text.charAt(0).toLowerCase()}${text.slice(1)}`;
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
}

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildSbtExercises(skill, lesson, questions, cfg) {
  const items = [];
  const viz = step(lesson, "visualization");
  const summary = step(lesson, "summary");
  const example = step(lesson, "example");
  const pool = questions.flatMap((q) => (q.choices || []).concat(q.answer));
  const skillQs = questions.filter((q) => q.skill === skill.id);

  const typeSections = {
    multiple_choice: "E. Trắc nghiệm SBT",
    true_false: "F. Đúng – Sai SBT",
    input: "G. Điền từ SBT",
    error_detection: "H. Sửa lỗi SBT",
    word_order: "I. Sắp xếp SBT",
    listening: "J. Nghe hiểu SBT"
  };
  const typeOrder = ["multiple_choice", "true_false", "input", "error_detection", "word_order", "listening"];

  typeOrder.forEach((type) => {
    if (items.length >= cfg.sbt) return;
    const q = skillQs.find((item) => item.type === type);
    if (!q) return;
    if (items.some((item) => item.type === type)) return;
    items.push(questionToExercise(q, typeSections[type], cfg));
  });

  skillQs.forEach((q) => {
    if (items.length >= cfg.sbt) return;
    if (items.some((item) => item.type === q.type && item.answer === q.answer)) return;
    if (!typeOrder.includes(q.type)) return;
    items.push(questionToExercise(q, `${typeSections[q.type]} (mở rộng)`, cfg));
  });

  if (summary && items.length < cfg.sbt) {
    items.push({
      type: "input",
      section: "H. Điền từ SBT",
      question: cfg.english
        ? `Write the key phrase from this lesson (SBT review): ${summary.title}`
        : `Viết lại ý chính cần ghi nhớ của bài (theo SBT): ${summary.title}`,
      answer: summary.content,
      hint: summary.content,
      solution: summary.content
    });
  }

  if (viz && items.length < cfg.sbt) {
    items.push({
      type: "true_false",
      section: "I. Đúng – Sai SBT",
      question: invertStatement(viz.content.endsWith(".") ? viz.content : `${viz.content}.`),
      choices: ["Đúng", "Sai"],
      answer: "Sai",
      hint: `Đối chiếu với "${viz.title}" trong SGK/SBT.`,
      solution: viz.content
    });
  }

  if (example && items.length < cfg.sbt) {
    items.push({
      type: "multiple_choice",
      section: "J. Vận dụng SBT",
      question: cfg.english
        ? `Which statement best applies the lesson idea?`
        : `Phát biểu vận dụng đúng nhất cho bài học:`,
      choices: shuffle([
        example.content,
        viz?.content || example.content,
        summary?.content || example.content,
        ...pickDistractors(pool, example.content, 1)
      ]).slice(0, 4),
      answer: example.content,
      hint: "Kết hợp ví dụ SGK và bài tập mở rộng SBT.",
      solution: example.content
    });
  }

  if (skill.description && items.length < cfg.sbt) {
    items.push({
      type: "multiple_choice",
      section: "K. Tổng hợp SBT",
      question: cfg.english
        ? `What is the main focus of "${skill.title}"?`
        : `Ý chính của bài "${skill.title.replace(/^Bài \d+\.\s*/, "")}" là:`,
      choices: shuffle([
        skill.description,
        ...pickDistractors(pool, skill.description)
      ]),
      answer: skill.description,
      hint: "Tổng hợp kiến thức cuối chương trong SBT.",
      solution: skill.description
    });
  }

  while (items.length < cfg.sbt && skillQs.length) {
    const q = skillQs[items.length % skillQs.length];
    items.push({
      type: q.type === "multiple_choice" ? "multiple_choice" : "input",
      section: "L. Ôn tập SBT",
      question: `${rephraseQuestion(q.question, cfg.label)} (câu ${items.length + 1})`,
      choices: q.choices ? shuffle(q.choices) : undefined,
      prompt: q.prompt,
      tokens: q.tokens,
      answer: q.answer,
      hint: q.hint,
      solution: q.answer
    });
  }

  return items.slice(0, cfg.sbt);
}

function buildSkillExercises(skill, lesson, questions, cfg) {
  const skillQs = questions.filter((q) => q.skill === skill.id);
  const sgk = cfg.english
    ? buildEnglishSgkExercises(skill, lesson, questions, cfg)
    : buildSgkExercises(skill, lesson, skillQs, cfg);
  const sbt = buildSbtExercises(skill, lesson, skillQs, cfg);

  return [
    ...sgk.map((item, i) => ({
      id: `ex_${skill.id}_sgk_${i + 1}`,
      skill: skill.id,
      source: "sgk",
      ...item
    })),
    ...sbt.map((item, i) => ({
      id: `ex_${skill.id}_sbt_${i + 1}`,
      skill: skill.id,
      source: "sbt",
      ...item
    }))
  ];
}

async function projectDir(name) {
  const nested = join(ROOT, name);
  try {
    await access(join(nested, "data", "skills.json"));
    return nested;
  } catch {
    return ROOT;
  }
}

async function generateForProject(name) {
  const cfg = CONFIG[name];
  if (!cfg) throw new Error(`Unknown project: ${name}`);
  const base = await projectDir(name);
  const [skills, lessons, questions] = await Promise.all([
    readFile(join(base, "data/skills.json"), "utf8").then(JSON.parse),
    readFile(join(base, "data/lessons.json"), "utf8").then(JSON.parse),
    readFile(join(base, "data/questions.json"), "utf8").then(JSON.parse)
  ]);

  const lessonBySkill = Object.fromEntries(lessons.map((l) => [l.skill, l]));
  const exercises = [];

  for (const skill of skills) {
    const lesson = lessonBySkill[skill.id];
    if (!lesson) continue;
    exercises.push(...buildSkillExercises(skill, lesson, questions, cfg));
  }

  await writeFile(join(base, "data/exercises.json"), `${JSON.stringify(exercises, null, 2)}\n`);

  const bySource = { sgk: 0, sbt: 0 };
  const bySkill = {};
  exercises.forEach((ex) => {
    bySource[ex.source] += 1;
    bySkill[ex.skill] = (bySkill[ex.skill] || 0) + 1;
  });

  const min = Math.min(...Object.values(bySkill));
  const max = Math.max(...Object.values(bySkill));

  console.log(`\n${name} (${cfg.label})`);
  console.log(`  ${exercises.length} bài tập — SGK: ${bySource.sgk}, SBT: ${bySource.sbt}`);
  console.log(`  ${Object.keys(bySkill).length} kỹ năng · ${min}–${max} bài/kỹ năng`);
  return exercises.length;
}

const target = process.argv[2] || "all";
const list = target === "all" ? PROJECTS : [target];
let total = 0;
for (const name of list) {
  if (!PROJECTS.includes(name)) {
    console.error(`Project không hợp lệ: ${name}. Chọn: ${PROJECTS.join(", ")}, all`);
    process.exit(1);
  }
  total += await generateForProject(name);
}
console.log(`\nTổng: ${total} bài tập rèn luyện.`);
