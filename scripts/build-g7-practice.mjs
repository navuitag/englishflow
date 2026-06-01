#!/usr/bin/env node
/**
 * Bổ sung đầy đủ dạng bài tập cơ bản (MC, Đ/S, điền) và nâng cao
 * (sửa lỗi, sắp xếp, nghe) cho Tiếng Anh lớp 7.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "url";

const GRADE = 7;
const dataDir = join(dirname(fileURLToPath(import.meta.url)), "..", "data");

const TRUE_FALSE = {
  g7_u1_present_simple: { question: "Thì hiện tại đơn: S + V(s/es) + O.", answer: "Đúng" },
  g7_u1_verbs_liking: { question: "Sau like, love, enjoy, hate… dùng V-ing.", answer: "Đúng" },
  g7_u2_simple_sentences: { question: "Câu đơn tiếng Anh cần có chủ ngữ và động từ.", answer: "Đúng" },
  g7_u3_past_simple: { question: "Quá khứ đơn: động từ có quy tắc thêm -ed hoặc dạng bất quy tắc V2.", answer: "Đúng" },
  g7_u3_past_questions: { question: "Câu hỏi quá khứ đơn: Did + S + V nguyên thể.", answer: "Đúng" },
  g7_u4_as_as: { question: "Cấu trúc so sánh bằng nhau: (not) as + adj + as + N.", answer: "Đúng" },
  g7_u4_like_different: { question: "The same as nghĩa là giống với; different from là khác với.", answer: "Đúng" },
  g7_u5_quantifiers: { question: "Some / a lot of / lots of có thể dùng với danh từ đếm được và không đếm được.", answer: "Đúng" },
  g7_u5_how_many_much: { question: "How many dùng với danh từ không đếm được.", answer: "Sai" },
  g7_u6_prep_time: { question: "Giới từ in/on/at dùng cho thời gian tùy ngữ cảnh (in July, on Monday, at 7 o'clock).", answer: "Đúng" },
  g7_u6_prep_place: { question: "At dùng cho thành phố lớn; in dùng cho phòng nhỏ.", answer: "Sai" },
  g7_u7_it_distance: { question: "It is + distance + from A to B dùng để nói khoảng cách.", answer: "Đúng" },
  g7_u7_should: { question: "Should + V nguyên thể dùng để đưa ra lời khuyên.", answer: "Đúng" },
  g7_u8_although: { question: "Although nối hai mệnh đề trái nghĩa trong cùng một câu.", answer: "Đúng" },
  g7_u8_however: { question: "However thường đứng đầu câu mới, sau dấu chấm hoặc chấm phẩy.", answer: "Đúng" },
  g7_u9_yesno: { question: "Câu hỏi Yes/No: trợ động từ đứng trước chủ ngữ.", answer: "Đúng" },
  g7_u9_wh: { question: "Câu hỏi Wh-: Wh-word + do/does + S + V nguyên thể.", answer: "Đúng" },
  g7_u10_present_continuous: { question: "Hiện tại tiếp diễn: am/is/are + V-ing.", answer: "Đúng" },
  g7_u11_future_simple: { question: "Tương lai đơn: will + V nguyên thể.", answer: "Đúng" },
  g7_u11_possessive_pronouns: { question: "Mine, yours, his, hers thay thế cho danh từ, không đứng trước danh từ.", answer: "Đúng" },
  g7_u12_articles: { question: "A/an dùng trước danh từ đếm được số ít; the dùng khi xác định.", answer: "Đúng" }
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
