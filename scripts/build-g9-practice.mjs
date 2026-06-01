#!/usr/bin/env node
/**
 * Bổ sung đầy đủ dạng bài tập cơ bản (MC, Đ/S, điền) và nâng cao
 * (sửa lỗi, sắp xếp, nghe) cho Tiếng Anh lớp 9.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "url";

const dataDir = join(dirname(fileURLToPath(import.meta.url)), "..", "data");

const TRUE_FALSE = {
  g9_u1_wh_toinf: { question: "Sau know, wonder, ask… ta dùng Wh-word + to + V nguyên thể.", answer: "Đúng" },
  g9_u1_phrasal_verbs: { question: "Cụm động từ pass down nghĩa là truyền lại qua nhiều thế hệ.", answer: "Đúng" },
  g9_u2_comparisons: { question: "Tính từ ngắn good so sánh hơn là gooder.", answer: "Sai" },
  g9_u3_reported_statements: { question: "Khi tường thuật, ta lùi thì và đổi đại từ, trạng từ thời gian.", answer: "Đúng" },
  g9_u3_should: { question: "Sau should dùng V-ing.", answer: "Sai" },
  g9_u4_past_continuous: { question: "Quá khứ tiếp diễn: was/were + V-ing.", answer: "Đúng" },
  g9_u4_wish: { question: "Sau wish + chủ ngữ + be, ta luôn dùng was.", answer: "Sai" },
  g9_u5_present_perfect: { question: "Hiện tại hoàn thành: have/has + V3.", answer: "Đúng" },
  g9_u6_gerund: { question: "Sau enjoy, mind, avoid… dùng to + V.", answer: "Sai" },
  g9_u6_toinf: { question: "Sau decide, hope, want… dùng to + V nguyên thể.", answer: "Đúng" },
  g9_u7_reported_yesno: { question: "Tường thuật câu hỏi Yes/No: asked + if/whether + S + V (không đảo ngữ).", answer: "Đúng" },
  g9_u7_impersonal_passive: { question: "Bị động khách quan: It believes that… là cấu trúc đúng.", answer: "Sai" },
  g9_u8_relative_clauses: { question: "Danh từ chỉ vật trong mệnh đề quan hệ thường dùng who.", answer: "Sai" },
  g9_u9_conditional1: { question: "Câu điều kiện loại 1: If + hiện tại đơn, S + will + V.", answer: "Đúng" },
  g9_u10_conditional2: { question: "Câu điều kiện loại 2: If + were/V2, S + would + V.", answer: "Đúng" },
  g9_u11_past_perfect: { question: "Quá khứ hoàn thành diễn tả hành động xảy ra trước một mốc trong quá khứ.", answer: "Đúng" },
  g9_u11_passive_present: { question: "Bị động hiện tại: am/is/are + V3.", answer: "Đúng" },
  g9_u11_passive_past: { question: "Bị động quá khứ luôn dùng was + V3 cho mọi chủ ngữ.", answer: "Sai" },
  g9_u12_reported_wh: { question: "Tường thuật câu hỏi Wh-: asked + Wh-word + S + V (trật tự khẳng định).", answer: "Đúng" },
  g9_u12_relative_defining: { question: "Mệnh đề quan hệ xác định có thể dùng who, which hoặc that.", answer: "Đúng" }
};

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function nextId(skillId, questions) {
  const nums = questions.filter((q) => q.skill === skillId).map((q) => Number(q.id.match(/_(\d+)$/)?.[1] || 0));
  return `q_${skillId}_${Math.max(0, ...nums, 0) + 1}`;
}

function makeTrueFalse(skill, template) {
  const body = template || {
    question: `${skill.formula || skill.description} là quy tắc đúng theo SGK lớp 9.`,
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
        question: existing.find((q) => q.type === "listening")?.question || "Nghe hội thoại và chọn ý đúng nhất:",
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

const g9Skills = skills.filter((s) => s.grade === 9);
const g9Ids = new Set(g9Skills.map((s) => s.id));
const lessonBySkill = Object.fromEntries(lessons.map((l) => [l.skill, l]));

const kept = allQuestions.filter((q) => !g9Ids.has(q.skill));
const g9Questions = [];
let added = 0;

for (const skill of g9Skills) {
  const existing = allQuestions.filter((q) => q.skill === skill.id);
  const extras = ensureSkillQuestions(skill, lessonBySkill[skill.id], existing);
  added += extras.length;
  g9Questions.push(...existing, ...extras);
}

const questions = [...kept, ...g9Questions];
await writeFile(join(dataDir, "questions.json"), `${JSON.stringify(questions, null, 2)}\n`);

const byType = {};
g9Questions.forEach((q) => {
  byType[q.type] = (byType[q.type] || 0) + 1;
});

console.log(`Grade 9 questions: ${g9Questions.length} (+${added} new)`);
console.log("By type:", byType);
