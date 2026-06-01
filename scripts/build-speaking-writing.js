#!/usr/bin/env node
/**
 * Add Speaking + Writing skills per Unit (grades 1–9).
 * Tiểu học: anchor = grammar skill. THCS: anchor = bài ngữ pháp chính (lessonNo 1) của Unit.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const GRADES_ELEM = [1, 2, 3, 4, 5];
const GRADES_THCS = [6, 7, 8, 9];
const SOURCE = "Bám sát SGK Global Success — luyện Nói & Viết theo Unit.";

const SUPPORT_TYPES = new Set(["vocabulary", "pronunciation", "listening", "speaking", "writing"]);

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function unitKey(id) {
  const match = id.match(/^(g\d+_u\d+)_/);
  return match ? match[1] : null;
}

function isGrammarLike(skill) {
  return !SUPPORT_TYPES.has(skill.skillType) && !/_speaking$|_writing$/.test(skill.id);
}

function speakingId(key) {
  return `${key}_speaking`;
}

function writingId(key) {
  return `${key}_writing`;
}

function modelSentence(anchorSkill, grammarQuestions) {
  const ordered = grammarQuestions.find((q) => q.type === "word_order");
  if (ordered?.answer) return ordered.answer.replace(/[.!?]+$/, "");
  const input = grammarQuestions.find(
    (q) => q.type === "input" && q.answer && !/[\u0300-\u036f\u00C0-\u1EF9]/i.test(q.answer)
  );
  if (input?.answer) return input.answer.replace(/[.!?]+$/, "");
  const part = String(anchorSkill.formula || "").split("·")[0].trim();
  if (/^[A-Za-z]/.test(part) && part.length > 8) return part;
  return "I go to school every day";
}

function listenScript(listenLesson) {
  const step = listenLesson?.steps?.find((item) => item.type === "listening");
  return step?.script || [];
}

function wrongForWriting(sentence) {
  const trimmed = sentence.trim();
  if (!trimmed) return "hello";
  if (/^[A-Z]/.test(trimmed)) return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
  return `${trimmed} .`;
}

function collectAnchorSkills(skills) {
  const anchors = [];

  skills
    .filter((s) => GRADES_ELEM.includes(s.grade) && s.skillType === "grammar" && unitKey(s.id))
    .forEach((s) => anchors.push(s));

  GRADES_THCS.forEach((grade) => {
    const chapterIndexes = [...new Set(skills.filter((s) => s.grade === grade).map((s) => s.chapterIndex))].sort(
      (a, b) => a - b
    );
    chapterIndexes.forEach((chapterIndex) => {
      const grammarLike = skills
        .filter((s) => s.grade === grade && s.chapterIndex === chapterIndex && isGrammarLike(s))
        .sort((a, b) => (a.lessonNo || 99) - (b.lessonNo || 99));
      if (grammarLike[0]) anchors.push(grammarLike[0]);
    });
  });

  return anchors;
}

function grammarQuestionPool(anchorSkill, skills, questionsBySkill) {
  const unitGrammarIds = skills
    .filter(
      (s) =>
        s.grade === anchorSkill.grade &&
        s.chapterIndex === anchorSkill.chapterIndex &&
        isGrammarLike(s)
    )
    .map((s) => s.id);

  const pool = [];
  unitGrammarIds.forEach((id) => {
    (questionsBySkill.get(id) || []).forEach((q) => pool.push(q));
  });
  return pool.length ? pool : questionsBySkill.get(anchorSkill.id) || [];
}

function buildSpeakingSkill(anchorSkill) {
  const key = unitKey(anchorSkill.id);
  return {
    id: speakingId(key),
    title: `Unit ${anchorSkill.chapterIndex} · Kỹ năng nói`,
    grade: anchorSkill.grade,
    book: anchorSkill.book,
    chapter: anchorSkill.chapter,
    chapterIndex: anchorSkill.chapterIndex,
    lessonNo: 13,
    domain: "Speaking",
    skillType: "speaking",
    grammar: "speaking",
    level: anchorSkill.grade,
    prerequisite: [],
    description: `Luyện nói hội thoại ngắn Unit ${anchorSkill.chapterIndex}: ${anchorSkill.formula}`,
    formula: "Nghe mẫu → nói to → trả lời",
    visualization: "speaking"
  };
}

function buildWritingSkill(anchorSkill) {
  const key = unitKey(anchorSkill.id);
  return {
    id: writingId(key),
    title: `Unit ${anchorSkill.chapterIndex} · Kỹ năng viết`,
    grade: anchorSkill.grade,
    book: anchorSkill.book,
    chapter: anchorSkill.chapter,
    chapterIndex: anchorSkill.chapterIndex,
    lessonNo: 14,
    domain: "Writing",
    skillType: "writing",
    grammar: "writing",
    level: anchorSkill.grade,
    prerequisite: [],
    description: `Viết câu hoàn chỉnh Unit ${anchorSkill.chapterIndex} theo ${anchorSkill.formula}`,
    formula: "Viết câu đúng ngữ pháp + chính tả",
    visualization: "writing"
  };
}

function buildSpeakingLesson(anchorSkill, script, model) {
  const id = speakingId(unitKey(anchorSkill.id));
  const prompts = script.map((line) => line.text).filter(Boolean);
  return {
    id,
    title: `Unit ${anchorSkill.chapterIndex} · Kỹ năng nói`,
    skill: id,
    chapter: anchorSkill.chapter,
    source: SOURCE,
    xp: anchorSkill.grade >= 6 ? 55 : 40,
    steps: [
      {
        type: "intro",
        title: "Mục tiêu",
        content: `Luyện nói theo chủ đề "${anchorSkill.chapter}". Dùng cấu trúc: ${anchorSkill.formula}`
      },
      {
        type: "listening",
        title: "Mẫu hội thoại",
        content: "Nghe và lặp lại từng câu.",
        script,
        showTranscript: true
      },
      {
        type: "speaking",
        title: "Luyện nói",
        content: "Nhấn từng câu để nghe, sau đó nói to không nhìn transcript.",
        prompts,
        model: `${model}.`
      },
      {
        type: "summary",
        title: "Ghi nhớ",
        content: anchorSkill.formula
      }
    ]
  };
}

function buildWritingLesson(anchorSkill, model) {
  const id = writingId(unitKey(anchorSkill.id));
  const wrong = wrongForWriting(`${model}.`);
  return {
    id,
    title: `Unit ${anchorSkill.chapterIndex} · Kỹ năng viết`,
    skill: id,
    chapter: anchorSkill.chapter,
    source: SOURCE,
    xp: anchorSkill.grade >= 6 ? 55 : 40,
    steps: [
      {
        type: "intro",
        title: "Mục tiêu",
        content: `Viết câu tiếng Anh đúng ngữ pháp về "${anchorSkill.chapter}".`
      },
      {
        type: "writing",
        title: "Mẫu viết",
        content: "Viết câu hoàn chỉnh, chữ đầu viết hoa và có dấu chấm cuối câu.",
        prompt: `Viết một câu dùng cấu trúc: ${anchorSkill.formula.split("·")[0].trim()}`,
        model: `${model}.`,
        checklist: ["Chữ cái đầu viết hoa", "Cuối câu có dấu chấm", "Đúng cấu trúc ngữ pháp"]
      },
      {
        type: "example",
        title: "Ví dụ",
        content: "So sánh câu đúng và câu sai.",
        example: { correct: `${model}.`, wrong }
      },
      {
        type: "summary",
        title: "Ghi nhớ",
        content: anchorSkill.formula
      }
    ]
  };
}

function buildSpeakingQuestions(anchorSkill, script, model, listenQuestions) {
  const id = speakingId(unitKey(anchorSkill.id));
  const listenQ = listenQuestions[0];
  const replyChoices = listenQ?.choices?.filter(Boolean) || [model, "Wrong answer", "I don't know", "Maybe"];
  const line = script[1]?.text || script[0]?.text || model;
  const tokens = line.replace(/[.!?]/g, "").split(/\s+/).filter(Boolean);

  return [
    {
      id: `q_${id}_1`,
      skill: id,
      grammar: "speaking",
      type: "multiple_choice",
      question: listenQ?.question || "Chọn câu trả lời phù hợp trong hội thoại:",
      choices: shuffle([...new Set(replyChoices)].slice(0, 4)),
      answer: listenQ?.answer || model,
      hint: "Nghe lại mẫu hội thoại."
    },
    {
      id: `q_${id}_2`,
      skill: id,
      grammar: "speaking",
      type: "word_order",
      question: "Sắp xếp thành câu trả lời đúng:",
      tokens: shuffle(tokens),
      answer: line.replace(/[.!?]/g, ""),
      hint: model
    },
    {
      id: `q_${id}_3`,
      skill: id,
      grammar: "speaking",
      type: "input",
      question: `Nói/viết câu trả lời mẫu (${anchorSkill.formula.split("·")[0].trim()}):`,
      answer: model,
      hint: `${model}.`
    },
    {
      id: `q_${id}_4`,
      skill: id,
      grammar: "speaking",
      type: "multiple_choice",
      question: "Cách luyện nói hiệu quả nhất?",
      choices: shuffle(["Nghe mẫu rồi nói to", "Đọc im lặng", "Nói thật nhanh", "Bỏ qua transcript"]),
      answer: "Nghe mẫu rồi nói to",
      hint: "Nghe → lặp → nói không nhìn."
    }
  ];
}

function buildWritingQuestions(anchorSkill, model) {
  const id = writingId(unitKey(anchorSkill.id));
  const sentence = `${model}.`;
  const wrong = wrongForWriting(sentence);
  const tokens = model.replace(/[.!?]/g, "").split(/\s+/).filter(Boolean);

  return [
    {
      id: `q_${id}_1`,
      skill: id,
      grammar: "writing",
      type: "input",
      question: `Viết câu hoàn chỉnh (${anchorSkill.formula.split("·")[0].trim()}):`,
      answer: model,
      alternatives: model.endsWith(".") ? [] : [sentence],
      hint: sentence
    },
    {
      id: `q_${id}_2`,
      skill: id,
      grammar: "writing",
      type: "word_order",
      question: "Sắp xếp thành câu viết đúng:",
      tokens: shuffle(tokens),
      answer: model.replace(/[.!?]/g, ""),
      hint: anchorSkill.formula
    },
    {
      id: `q_${id}_3`,
      skill: id,
      grammar: "writing",
      type: "multiple_choice",
      question: "Câu nào viết đúng?",
      choices: shuffle([sentence, wrong, `${model}`.toLowerCase(), `${model}  .`]),
      answer: sentence,
      hint: "Chữ đầu hoa + dấu chấm."
    },
    {
      id: `q_${id}_4`,
      skill: id,
      grammar: "writing",
      type: "error_detection",
      question: wrong,
      prompt: wrong,
      answer: sentence,
      hint: "Sửa chính tả và dấu câu."
    }
  ];
}

function merge() {
  const skills = JSON.parse(fs.readFileSync(path.join(dataDir, "skills.json"), "utf8"));
  const lessons = JSON.parse(fs.readFileSync(path.join(dataDir, "lessons.json"), "utf8"));
  const questions = JSON.parse(fs.readFileSync(path.join(dataDir, "questions.json"), "utf8"));

  const swIds = new Set();
  skills.forEach((s) => {
    if (/_speaking$|_writing$/.test(s.id) && /^g[1-9]_u\d+_/.test(s.id)) swIds.add(s.id);
  });

  const keptSkills = skills.filter((s) => !swIds.has(s.id));
  const keptLessons = lessons.filter((l) => !swIds.has(l.id));
  const keptQuestions = questions.filter((q) => !swIds.has(q.skill));

  const lessonById = new Map(lessons.map((l) => [l.id, l]));
  const questionsBySkill = new Map();
  questions.forEach((q) => {
    if (!questionsBySkill.has(q.skill)) questionsBySkill.set(q.skill, []);
    questionsBySkill.get(q.skill).push(q);
  });

  const anchorSkills = collectAnchorSkills(skills);
  const elemCount = anchorSkills.filter((s) => GRADES_ELEM.includes(s.grade)).length;
  const thcsCount = anchorSkills.filter((s) => GRADES_THCS.includes(s.grade)).length;

  const newSkills = [];
  const newLessons = [];
  const newQuestions = [];

  anchorSkills.forEach((anchorSkill) => {
    const key = unitKey(anchorSkill.id);
    const listenLesson = lessonById.get(`${key}_listening`);
    const script = listenScript(listenLesson);
    const grammarQs = grammarQuestionPool(anchorSkill, skills, questionsBySkill);
    const listenQs = questionsBySkill.get(`${key}_listening`) || [];
    const model = modelSentence(anchorSkill, grammarQs);

    if (!script.length) {
      console.log("SKIP (no listen script):", key);
      return;
    }

    newSkills.push(buildSpeakingSkill(anchorSkill), buildWritingSkill(anchorSkill));
    newLessons.push(buildSpeakingLesson(anchorSkill, script, model), buildWritingLesson(anchorSkill, model));
    newQuestions.push(
      ...buildSpeakingQuestions(anchorSkill, script, model, listenQs),
      ...buildWritingQuestions(anchorSkill, model)
    );
  });

  fs.writeFileSync(path.join(dataDir, "skills.json"), JSON.stringify([...keptSkills, ...newSkills], null, 2) + "\n");
  fs.writeFileSync(path.join(dataDir, "lessons.json"), JSON.stringify([...keptLessons, ...newLessons], null, 2) + "\n");
  fs.writeFileSync(path.join(dataDir, "questions.json"), JSON.stringify([...keptQuestions, ...newQuestions], null, 2) + "\n");

  console.log("Anchor units — Tiểu học:", elemCount, "· THCS:", thcsCount);
  console.log("New speaking/writing skills:", newSkills.length);
  console.log("New questions:", newQuestions.length);
  console.log("Total skills:", keptSkills.length + newSkills.length);
  console.log("Total questions:", keptQuestions.length + newQuestions.length);

  const lessonIds = new Set(newLessons.map((l) => l.id));
  const qCount = new Map();
  newQuestions.forEach((q) => qCount.set(q.skill, (qCount.get(q.skill) || 0) + 1));

  let ok = true;
  newSkills.forEach((s) => {
    const hasLesson = lessonIds.has(s.id);
    const count = qCount.get(s.id) || 0;
    if (!hasLesson || count !== 4) {
      ok = false;
      console.log(`INTEGRITY FAIL: ${s.id} lesson=${hasLesson} questions=${count}`);
    }
  });

  const expected = anchorSkills.length * 2;
  if (newSkills.length !== expected) {
    ok = false;
    console.log(`INTEGRITY FAIL: expected ${expected} skills, got ${newSkills.length}`);
  }
  console.log("Integrity check:", ok ? "PASS" : "FAIL");
}

merge();
