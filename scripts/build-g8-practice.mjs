#!/usr/bin/env node
/**
 * Bổ sung đầy đủ dạng bài tập cơ bản (MC, Đ/S, điền) và nâng cao
 * (sửa lỗi, sắp xếp, nghe) cho Tiếng Anh lớp 8.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "url";

const GRADE = 8;
const dataDir = join(dirname(fileURLToPath(import.meta.url)), "..", "data");

const TRUE_FALSE = {
  g8_u1_gerunds: { question: "Sau enjoy, fancy, detest… dùng danh động từ V-ing.", answer: "Đúng" },
  g8_u1_gerund_toinf: { question: "Love/like/hate có thể theo sau bởi V-ing hoặc to-V.", answer: "Đúng" },
  g8_u2_comparative_adverbs: { question: "So sánh hơn với trạng từ ngắn thường thêm -er (fast → faster).", answer: "Đúng" },
  g8_u3_simple_compound: { question: "Câu ghép dùng and, but, or, so để nối hai mệnh đề độc lập.", answer: "Đúng" },
  g8_u4_questions: { question: "Câu hỏi Yes/No: trợ động từ đứng trước chủ ngữ.", answer: "Đúng" },
  g8_u4_countable: { question: "Much dùng với danh từ đếm được số nhiều.", answer: "Sai" },
  g8_u5_zero_article: { question: "Danh từ chung số nhiều không đếm thường không cần mạo từ.", answer: "Đúng" },
  g8_u6_future_simple: { question: "Thì tương lai đơn: will + V nguyên thể.", answer: "Đúng" },
  g8_u6_conditional1: { question: "Câu điều kiện loại 1: mệnh đề If dùng will.", answer: "Sai" },
  g8_u7_adverbial_time: { question: "Mệnh đề trạng ngữ thời gian (when, while…) theo sau bởi S + V.", answer: "Đúng" },
  g8_u8_present_for_future: { question: "Hiện tại đơn có thể diễn tả lịch trình tương lai (The train leaves at 8).", answer: "Đúng" },
  g8_u8_adverbs_frequency: { question: "Trạng từ tần suất luôn đứng trước động từ thường (always go).", answer: "Đúng" },
  g8_u9_past_continuous: { question: "Quá khứ tiếp diễn: was/were + V-ing.", answer: "Đúng" },
  g8_u10_prep_time_place: { question: "In/on/at dùng cho cả thời gian và nơi chốn tùy ngữ cảnh.", answer: "Đúng" },
  g8_u10_possessive: { question: "Mine, yours, his, hers là đại từ sở hữu thay cho danh từ.", answer: "Đúng" },
  g8_u11_reported_statements: { question: "Tường thuật câu trần thuật: lùi thì và đổi đại từ/trạng từ.", answer: "Đúng" },
  g8_u12_reported_questions: { question: "Tường thuật câu hỏi Wh-: asked + Wh-word + S + V (không đảo ngữ).", answer: "Đúng" }
};

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function makeTrueFalse(skill, template) {
  const body = template || {
    question: `${skill.formula || skill.description} là quy tắc đúng theo SGK lớp ${GRADE}.`,
    answer: "Đúng"
  };
  return {
    type: "true_false",
    question: body.question,
    choices: ["Đúng", "Sai"],
    answer: body.answer,
    hint: skill.formula || skill.description
  };
}

function makeInputFromExisting(existing) {
  const err = existing.find((q) => q.type === "error_detection");
  const mc = existing.find((q) => q.type === "multiple_choice");
  if (err?.answer) {
    const words = err.answer.split(/\s+/);
    const answer = words.length > 3 ? words.slice(-2).join(" ") : words[words.length - 1];
    return {
      type: "input",
      question: `Điền từ/cụm còn thiếu: ${(err.prompt || err.question).replace(/\.$/, "")}.`,
      answer,
      hint: err.hint || err.answer
    };
  }
  if (mc?.answer) {
    return {
      type: "input",
      question: `Viết đáp án đúng: ${mc.question}`,
      answer: mc.answer,
      hint: mc.hint || mc.answer
    };
  }
  return null;
}

function makeWordOrderFromExisting(existing) {
  const source = existing.find((q) => q.type === "error_detection") || existing.find((q) => q.type === "multiple_choice");
  if (!source?.answer) return null;
  const text = String(source.answer).replace(/[.!?]+$/g, "");
  const tokens = text.split(/\s+/).filter(Boolean);
  if (tokens.length < 4) return null;
  return {
    type: "word_order",
    question: "Sắp xếp thành câu đúng:",
    tokens: shuffle(tokens),
    answer: text,
    hint: source.hint || text
  };
}

function ensureSkillQuestions(skill, lesson, existing) {
  const additions = [];
  const types = new Set(existing.map((q) => q.type));

  if (!types.has("true_false")) {
    additions.push(makeTrueFalse(skill, TRUE_FALSE[skill.id]));
  }

  if (!types.has("input") && skill.skillType !== "listening") {
    const input = makeInputFromExisting(existing);
    if (input) additions.push(input);
  }

  if (!types.has("word_order") && !["listening", "pronunciation"].includes(skill.skillType)) {
    const wordOrder = makeWordOrderFromExisting(existing);
    if (wordOrder) additions.push(wordOrder);
  }

  if (!types.has("listening")) {
    const listenStep = lesson?.steps?.find((s) => s.type === "listening");
    const script = listenStep?.script;
    if (script?.length) {
      const line = script[script.length - 1]?.text || script[0]?.text;
      additions.push({
        type: "listening",
        question: "Nghe hội thoại và chọn ý đúng nhất:",
        listenScript: script,
        choices: shuffle([line, "Wrong answer.", "I don't know.", "Not mentioned."]).slice(0, 4),
        answer: line,
        hint: "Nghe kỹ từng câu trong mẫu hội thoại."
      });
    } else if (!skill.skillType) {
      const alt = existing.find((q) => q.type === "error_detection");
      if (alt) {
        additions.push({
          type: "listening",
          question: "Nghe và chọn câu đúng ngữ pháp:",
          listenScript: [{ speaker: "Teacher", text: alt.answer }],
          choices: shuffle([alt.answer, alt.prompt || "Wrong sentence.", "Incorrect form.", "Not correct."]).slice(0, 4),
          answer: alt.answer,
          hint: alt.hint || alt.answer
        });
      }
    }
  }

  if (skill.skillType === "vocabulary") {
    const words = lesson?.steps?.find((s) => s.type === "vocabulary")?.words || [];
    if (words[0] && !types.has("error_detection")) {
      const w = words[0];
      additions.push({
        type: "error_detection",
        question: w.example || `${w.en} is useful.`,
        prompt: w.example ? w.example.replace(w.en, w.en.toLowerCase()) : `${w.en.toLowerCase()} is useful`,
        answer: w.example || `${w.en} is useful.`,
        hint: `Chữ cái đầu và chính tả: ${w.en}.`
      });
    }
  }

  if (skill.skillType === "pronunciation" && !types.has("error_detection")) {
    const pron = lesson?.steps?.find((s) => s.type === "pronunciation");
    const word = pron?.examples?.[0]?.word || pron?.focus || "word";
    additions.push({
      type: "error_detection",
      question: `Correct pronunciation focus: ${word}`,
      prompt: `Correct pronunciation focus: ${String(word).toLowerCase()}`,
      answer: `Correct pronunciation focus: ${word}`,
      hint: pron?.focus || "Nhấn âm trọng tâm."
    });
  }

  return additions.map((item, index) => ({
    id: `q_${skill.id}_${existing.length + index + 1}`,
    skill: skill.id,
    grammar: skill.grammar || skill.skillType || "general",
    ...item
  }));
}

const skills = JSON.parse(await readFile(join(dataDir, "skills.json"), "utf8"));
const lessons = JSON.parse(await readFile(join(dataDir, "lessons.json"), "utf8"));
const allQuestions = JSON.parse(await readFile(join(dataDir, "questions.json"), "utf8"));

const gradeSkills = skills.filter((s) => s.grade === GRADE);
const gradeIds = new Set(gradeSkills.map((s) => s.id));
const lessonBySkill = Object.fromEntries(lessons.map((l) => [l.skill, l]));

const kept = allQuestions.filter((q) => !gradeIds.has(q.skill));
const gradeQuestions = [];
let added = 0;

for (const skill of gradeSkills) {
  const existing = allQuestions.filter((q) => q.skill === skill.id);
  const extras = ensureSkillQuestions(skill, lessonBySkill[skill.id], existing);
  added += extras.length;
  gradeQuestions.push(...existing, ...extras);
}

const questions = [...kept, ...gradeQuestions];
await writeFile(join(dataDir, "questions.json"), `${JSON.stringify(questions, null, 2)}\n`);

const byType = {};
gradeQuestions.forEach((q) => {
  byType[q.type] = (byType[q.type] || 0) + 1;
});

console.log(`Grade ${GRADE} questions: ${gradeQuestions.length} (+${added} new)`);
console.log("By type:", byType);
