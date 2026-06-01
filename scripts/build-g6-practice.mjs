#!/usr/bin/env node
/**
 * Bổ sung đầy đủ dạng bài tập cơ bản (MC, Đ/S, điền) và nâng cao
 * (sửa lỗi, sắp xếp, nghe) cho Tiếng Anh lớp 6.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "url";

const GRADE = 6;
const dataDir = join(dirname(fileURLToPath(import.meta.url)), "..", "data");

const TRUE_FALSE = {
  g6_u1_present_simple: { question: "Thì hiện tại đơn: S + V(s/es) + O.", answer: "Đúng" },
  g6_u1_present_simple_q: { question: "Câu hỏi hiện tại đơn: Do/Does + S + V nguyên thể.", answer: "Đúng" },
  g6_u2_there_be: { question: "There is + danh từ số ít; There are + danh từ số nhiều.", answer: "Đúng" },
  g6_u2_prepositions: { question: "Giới từ in/on/under/behind chỉ vị trí.", answer: "Đúng" },
  g6_u3_present_continuous: { question: "Hiện tại tiếp diễn: am/is/are + V-ing.", answer: "Đúng" },
  g6_u3_adjectives: { question: "Tính từ đứng sau động từ to be (S + be + adj).", answer: "Đúng" },
  g6_u4_comparative: { question: "So sánh hơn với tính từ ngắn: adj-er + than.", answer: "Đúng" },
  g6_u4_directions: { question: "Go straight / Turn left/right dùng để chỉ đường.", answer: "Đúng" },
  g6_u5_countable: { question: "Many dùng với danh từ đếm được số nhiều; much với danh từ không đếm được.", answer: "Đúng" },
  g6_u5_superlative: { question: "So sánh nhất: the + adj-est.", answer: "Đúng" },
  g6_u5_must: { question: "Must + V nguyên thể diễn tả nghĩa vụ/bắt buộc.", answer: "Đúng" },
  g6_u6_should: { question: "Should + V-ing là cấu trúc đúng cho lời khuyên.", answer: "Sai" },
  g6_u6_some_any: { question: "Some dùng trong câu khẳng định; any thường dùng trong câu phủ định và nghi vấn.", answer: "Đúng" },
  g6_u7_wh: { question: "Câu hỏi Wh-: Wh-word + do/does + S + V nguyên thể.", answer: "Đúng" },
  g6_u7_conjunctions: { question: "And, but, so, because là liên từ nối các mệnh đề/cụm từ.", answer: "Đúng" },
  g6_u8_past_simple: { question: "Quá khứ đơn: động từ thêm -ed hoặc dạng bất quy tắc V2.", answer: "Đúng" },
  g6_u8_imperatives: { question: "Câu mệnh lệnh: (Don't) + V nguyên thể.", answer: "Đúng" },
  g6_u9_present_perfect: { question: "Hiện tại hoàn thành: have/has + V3.", answer: "Đúng" },
  g6_u9_possessive_pronouns: { question: "Mine, yours, his, hers là đại từ sở hữu thay cho danh từ.", answer: "Đúng" },
  g6_u10_will: { question: "Tương lai đơn với will: will + V nguyên thể.", answer: "Đúng" },
  g6_u10_might: { question: "Might + V nguyên thể diễn tả khả năng có thể xảy ra.", answer: "Đúng" },
  g6_u11_conditional1: { question: "Câu điều kiện loại 1: mệnh đề If dùng will.", answer: "Sai" },
  g6_u11_articles: { question: "A/an dùng trước danh từ đếm được số ít; the khi xác định.", answer: "Đúng" },
  g6_u12_could: { question: "Could + V nguyên thể diễn tả khả năng trong quá khứ hoặc lịch sự.", answer: "Đúng" },
  g6_u12_will_be_able: { question: "Will be able to + V thay cho will trong nghĩa có thể làm gì.", answer: "Đúng" }
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
