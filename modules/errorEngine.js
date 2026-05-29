import { normalizeText } from "../assets/js/utils.js";

const THIRD_PERSON = ["he", "she", "it", "this", "that"];
const BE_VERBS = ["am", "is", "are", "was", "were", "be", "been", "being"];

function tokens(value) {
  return normalizeText(value).replace(/[.,!?;:]/g, " ").split(/\s+/).filter(Boolean);
}

export function analyzeError(answer, question, errorPatterns) {
  const normalized = normalizeText(answer);
  const grammar = question.grammar || question.skill;

  const pattern = (errorPatterns || []).find((item) => {
    const matchScope = item.grammar
      ? item.grammar === grammar
      : (!item.skill || item.skill === question.skill);
    return matchScope && item.pattern && normalized.includes(normalizeText(item.pattern));
  });
  if (pattern) {
    return { ...pattern, skill: question.skill, recommendation: question.skill };
  }

  const heuristic = runHeuristics(answer, question);
  if (heuristic) return heuristic;

  return {
    skill: question.skill,
    code: "GR000",
    errorType: "general_error",
    title: "Câu chưa chính xác",
    message: "Đáp án chưa khớp với câu đúng. Hãy đọc lại công thức ngữ pháp và thử lại từng phần.",
    hint: question.hint || "So sánh chủ ngữ và động từ trong câu.",
    recommendation: question.skill
  };
}

function runHeuristics(answer, question) {
  const grammar = question.grammar || question.skill;
  const words = tokens(answer);
  const subjectIndex = words.findIndex((word) => THIRD_PERSON.includes(word));

  if (grammar === "present_simple" && subjectIndex !== -1) {
    const verb = words[subjectIndex + 1];
    if (verb && !BE_VERBS.includes(verb) && !/(s|es|ies)$/.test(verb) && verb !== "doesn't" && verb !== "does") {
      return {
        skill: question.skill,
        code: "GR001",
        errorType: "verb_conjugation",
        title: "Thiếu -s/-es với ngôi thứ ba số ít",
        message: `Chủ ngữ "${words[subjectIndex]}" cần động từ thêm -s/-es: "${verb}" → "${addS(verb)}".`,
        hint: "He / She / It + V(s/es).",
        recommendation: question.skill
      };
    }
  }

  if (grammar === "present_continuous" && !words.some((word) => BE_VERBS.includes(word))) {
    return {
      skill: question.skill,
      code: "GR003",
      errorType: "missing_be",
      title: "Thiếu động từ to be",
      message: "Thì hiện tại tiếp diễn cần đủ am/is/are trước động từ -ing.",
      hint: "S + am/is/are + V-ing.",
      recommendation: question.skill
    };
  }

  if (grammar === "past_continuous" && !words.some((word) => word === "was" || word === "were")) {
    return {
      skill: question.skill,
      code: "GR003",
      errorType: "missing_be",
      title: "Thiếu was/were",
      message: "Thì quá khứ tiếp diễn cần was (số ít) / were (số nhiều) trước động từ -ing.",
      hint: "S + was/were + V-ing.",
      recommendation: question.skill
    };
  }

  if (grammar.includes("passive") && !words.some((word) => BE_VERBS.includes(word))) {
    return {
      skill: question.skill,
      code: "GR003",
      errorType: "missing_be",
      title: "Thiếu to be trong câu bị động",
      message: "Câu bị động cần to be (am/is/are/was/were) đi cùng động từ phân từ hai (V3).",
      hint: "S + to be + V3 (+ by ...).",
      recommendation: question.skill
    };
  }

  if ((grammar === "comparative" || grammar === "comparatives") && !words.includes("than") && !words.some((word) => /er$/.test(word) || word === "more")) {
    return {
      skill: question.skill,
      code: "GR005",
      errorType: "comparative_form",
      title: "Sai cấu trúc so sánh hơn",
      message: 'So sánh hơn cần "adj-er than" hoặc "more + adj + than".',
      hint: "short adj + -er + than / more + long adj + than.",
      recommendation: question.skill
    };
  }

  if (grammar === "conditional2" && words.includes("if") && words.includes("was") && !words.includes("were")) {
    return {
      skill: question.skill,
      code: "GR039",
      errorType: "conditional_error",
      title: "Sai be trong câu điều kiện loại 2",
      message: "Mệnh đề If loại 2 thường dùng were cho mọi chủ ngữ.",
      hint: "If + S + were/V2, S + would + V.",
      recommendation: question.skill
    };
  }

  if (grammar === "wish_past" && words.includes("wish") && words.includes("was") && !words.includes("were")) {
    return {
      skill: question.skill,
      code: "GR036",
      errorType: "wish_error",
      title: "Sai be sau wish",
      message: "Sau wish, động từ be thường dùng were.",
      hint: "wish + S + were/V2.",
      recommendation: question.skill
    };
  }

  if ((grammar === "present_perfect" || grammar === "past_perfect") && words.some((word) => word === "have" || word === "has" || word === "had")) {
    const aux = words.find((word) => word === "have" || word === "has" || word === "had");
    const auxIndex = words.indexOf(aux);
    const next = words[auxIndex + 1];
    if (next && !/(ed|en|own|ought|t|d)$/.test(next) && !["never", "ever", "already", "just", "not"].includes(next)) {
      return {
        skill: question.skill,
        code: "GR011",
        errorType: "wrong_form",
        title: "Cần dạng V3 sau have/has/had",
        message: `Sau ${aux} dùng phân từ hai (V3) của động từ.`,
        hint: `${aux} + V3.`,
        recommendation: question.skill
      };
    }
  }

  return null;
}

function addS(verb) {
  if (/(s|x|z|ch|sh)$/.test(verb)) return `${verb}es`;
  if (/[^aeiou]y$/.test(verb)) return `${verb.slice(0, -1)}ies`;
  if (verb === "go" || verb === "do") return `${verb}es`;
  if (verb === "have") return "has";
  return `${verb}s`;
}
