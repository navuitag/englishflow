import { normalizeText } from "../assets/js/utils.js";

const THIRD_PERSON = ["he", "she", "it", "this", "that"];
const BE_VERBS = ["am", "is", "are", "was", "were", "be", "been", "being"];
const PAST_SIMPLE_GRAMMARS = new Set(["past_simple", "outdoor_past", "school_trip", "family_time", "stories"]);
const WOULD_LIKE_GRAMMARS = new Set(["would_like", "future_job"]);
const WILL_GRAMMARS = new Set(["future_will", "tet_holiday", "special_days"]);
const WH_WORDS = ["what", "where", "when", "who", "why", "how"];
const SUBJECTS = ["i", "you", "we", "they", "he", "she", "it"];
const PAST_MARKERS = ["yesterday", "last", "ago"];
const IRREGULAR_PAST = {
  went: "go", was: "be", were: "be", had: "have", did: "do", saw: "see",
  ate: "eat", came: "come", took: "take", made: "make", got: "get",
  bought: "buy", thought: "think", told: "tell", left: "leave", felt: "feel",
  kept: "keep", brought: "bring", gave: "give", ran: "run", sang: "sing",
  swam: "swim", flew: "fly", drew: "draw", grew: "grow", knew: "know",
  wore: "wear", met: "meet", found: "find", built: "build", sent: "send",
  spent: "spend", wrote: "write", spoke: "speak", heard: "hear", taught: "teach",
  won: "win", lost: "lose", held: "hold", stood: "stand", sat: "sit",
  slept: "sleep", read: "read", cut: "cut", hit: "hit", put: "put",
  played: "play", visited: "visit", watched: "watch", stayed: "stay"
};

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

  if (grammar === "vocabulary") {
    return {
      skill: question.skill,
      code: "VC001",
      errorType: "vocabulary_error",
      title: "Chưa đúng từ vựng",
      message: "Kiểm tra lại chính tả tiếng Anh hoặc nghĩa tiếng Việt. Xem lại thẻ từ trong bài học.",
      hint: question.hint || "Đọc lại danh sách từ vựng của Unit.",
      recommendation: question.skill
    };
  }

  if (grammar === "listening") {
    return {
      skill: question.skill,
      code: "LS001",
      errorType: "listening_error",
      title: "Chưa đúng ý hội thoại",
      message: "Nghe lại đoạn hội thoại và chú ý từ khóa trong câu hỏi (ai, ở đâu, khi nào).",
      hint: question.hint || "Bật transcript nếu cần xem lại.",
      recommendation: question.skill
    };
  }

  if (grammar === "pronunciation") {
    return {
      skill: question.skill,
      code: "PR001",
      errorType: "pronunciation_error",
      title: "Chưa đúng phát âm / trọng âm",
      message: "Xem lại điểm phát âm trong bài học và lặp lại theo mẫu.",
      hint: question.hint || "Nhấn từ mẫu để nghe lại.",
      recommendation: question.skill
    };
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

  if (grammar === "vocabulary") {
    return null;
  }

  if (grammar === "listening" || grammar === "pronunciation") {
    return null;
  }

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

  if (grammar === "present_continuous_g1" && words.some((word) => word === "is" || word === "are")) {
    const beIndex = words.findIndex((word) => word === "is" || word === "are");
    const next = words[beIndex + 1];
    if (next && !next.endsWith("ing")) {
      return {
        skill: question.skill,
        code: "G1009",
        errorType: "ing_form",
        title: "Thiếu -ing",
        message: `Sau is/are cần động từ -ing: "${next}" → "${next}ing" (hoặc dạng đúng).`,
        hint: "He/She is + V-ing.",
        recommendation: question.skill
      };
    }
  }

  if (grammar === "present_continuous_g2" && words.some((word) => word === "are" || word === "is")) {
    const beIndex = words.findIndex((word) => word === "are" || word === "is");
    const next = words[beIndex + 1];
    if (next && !next.endsWith("ing")) {
      return {
        skill: question.skill,
        code: "G2011",
        errorType: "ing_form",
        title: "Thiếu -ing",
        message: `Sau are/is cần động từ -ing: "${next}" → "${next}ing" (hoặc dạng đúng).`,
        hint: "They are + V-ing.",
        recommendation: question.skill
      };
    }
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

  const pastSimpleError = checkPastSimpleHeuristics(words, grammar, question);
  if (pastSimpleError) return pastSimpleError;

  const wouldLikeError = checkWouldLikeHeuristics(words, grammar, question);
  if (wouldLikeError) return wouldLikeError;

  const willError = checkWillHeuristics(words, grammar, question);
  if (willError) return willError;

  return null;
}

function checkPastSimpleHeuristics(words, grammar, question) {
  const inScope = PAST_SIMPLE_GRAMMARS.has(grammar)
    || words.includes("did")
    || words.includes("didn't")
    || words.includes("didnt")
    || words.includes("was")
    || words.includes("were")
    || words.some((word) => PAST_MARKERS.some((marker) => word.startsWith(marker)));

  if (!inScope) return null;

  const didIndex = words.findIndex((word) => word === "did" || word === "didn't" || word === "didnt");
  if (didIndex !== -1) {
    let verbIndex = didIndex + 1;
    while (verbIndex < words.length && SUBJECTS.includes(words[verbIndex])) {
      verbIndex += 1;
    }
    const verb = words[verbIndex];
    if (verb && looksLikePastTenseVerb(verb)) {
      const base = toBaseFormAfterDid(verb);
      return {
        skill: question.skill,
        code: "G5011",
        errorType: "did_base_form",
        title: "Sai dạng động từ sau did",
        message: `Sau did/didn't dùng động từ nguyên thể: "${verb}" → "${base}".`,
        hint: "Did you + V (nguyên thể)?",
        recommendation: question.skill
      };
    }
  }

  if ((words.includes("do") || words.includes("does")) && words.some((word) => looksLikePastTenseVerb(word))) {
    return {
      skill: question.skill,
      code: "G5010",
      errorType: "did_they_go",
      title: "Cần Did + V (nguyên thể)",
      message: "Câu hỏi quá khứ dùng Did + chủ ngữ + V nguyên thể, không dùng do/does + V-ed.",
      hint: "Did they go to + place?",
      recommendation: question.skill
    };
  }

  const wasIndex = words.indexOf("was");
  if (wasIndex !== -1) {
    const after = words[wasIndex + 1];
    if (after === "you" || after === "we" || after === "they") {
      return {
        skill: question.skill,
        code: "G5009",
        errorType: "were_you_at",
        title: "Sai was/were",
        message: `Với ${after} dùng were: "was ${after}" → "were ${after}".`,
        hint: "Were you at + place?",
        recommendation: question.skill
      };
    }
  }

  const wereIndex = words.indexOf("were");
  if (wereIndex !== -1) {
    const after = words[wereIndex + 1];
    if (after === "he" || after === "she" || after === "it") {
      return {
        skill: question.skill,
        code: "G5009",
        errorType: "was_singular",
        title: "Sai was/were",
        message: `Với ${after} dùng was: "were ${after}" → "was ${after}".`,
        hint: "Was he/she at + place?",
        recommendation: question.skill
      };
    }
  }

  const hasPastMarker = words.some((word) => PAST_MARKERS.some((marker) => word.startsWith(marker)));
  if (hasPastMarker && !words.includes("did") && !words.includes("was") && !words.includes("were")) {
    const subjectIndex = words.findIndex((word) => SUBJECTS.includes(word));
    if (subjectIndex !== -1) {
      const verb = words[subjectIndex + 1];
      if (verb && !looksLikePastTenseVerb(verb) && !BE_VERBS.includes(verb) && !["do", "does", "will", "can", "could", "should"].includes(verb)) {
        return {
          skill: question.skill,
          code: "GR015",
          errorType: "past_simple_ed",
          title: "Cần thì quá khứ đơn",
          message: `Với ${words.find((word) => PAST_MARKERS.some((marker) => word.startsWith(marker)))} dùng V-ed/V2: "${verb}" → "${toPastForm(verb)}".`,
          hint: "S + V-ed + yesterday / last week.",
          recommendation: question.skill
        };
      }
    }
  }

  return null;
}

function checkWouldLikeHeuristics(words, grammar, question) {
  const inScope = WOULD_LIKE_GRAMMARS.has(grammar)
    || words.includes("would")
    || words.some((word) => word === "i'd" || word === "id" || word.endsWith("'d"));

  if (!inScope) return null;

  const wouldIndex = words.indexOf("would");
  if (wouldIndex !== -1) {
    const next = words[wouldIndex + 1];
    if (next === "likes" || next === "liked") {
      return {
        skill: question.skill,
        code: "G5005",
        errorType: "would_like_be",
        title: "Sai would like",
        message: 'Sau would dùng like (không thêm -s): "would likes" → "would like".',
        hint: "would like to + V / would like + N",
        recommendation: question.skill
      };
    }
  }

  if (words.includes("likes") && (words.includes("would") || words.some((word) => word === "i'd" || word === "id" || word.endsWith("'d")))) {
    return {
      skill: question.skill,
      code: "G2012",
      errorType: "would_like_error",
      title: "Sai I'd like",
      message: 'Like sau would/I\'d không thêm -s: "I\'d likes" → "I\'d like".',
      hint: "I'd like to be a doctor.",
      recommendation: question.skill
    };
  }

  if (grammar === "future_job" && words.includes("like") && words.includes("be") && !words.includes("would")) {
    return {
      skill: question.skill,
      code: "G5005",
      errorType: "would_like_be",
      title: "Sai would like to be",
      message: 'Hỏi nghề tương lai: "What would you like to be?" không dùng do + like to be.',
      hint: "What would you like to be?",
      recommendation: question.skill
    };
  }

  return null;
}

function checkWillHeuristics(words, grammar, question) {
  const inScope = WILL_GRAMMARS.has(grammar)
    || words.includes("will")
    || words.includes("won't")
    || words.includes("wont")
    || words.some((word) => word.endsWith("'ll"));

  if (!inScope) return null;

  const willIndex = words.findIndex((word) => word === "will" || word === "won't" || word === "wont");
  if (willIndex !== -1) {
    const verb = words[willIndex + 1];
    if (verb && verb !== "not" && verb !== "be" && looksLikeThirdPersonVerb(verb)) {
      const base = stripThirdPersonS(verb);
      return {
        skill: question.skill,
        code: "GR002",
        errorType: "will_base_form",
        title: "Sai dạng động từ sau will",
        message: `Sau will dùng động từ nguyên thể: "will ${verb}" → "will ${base}".`,
        hint: "S + will + V (nguyên thể).",
        recommendation: question.skill
      };
    }
  }

  for (let index = 0; index < words.length - 2; index += 1) {
    if (WH_WORDS.includes(words[index]) && SUBJECTS.includes(words[index + 1]) && words[index + 2] === "will") {
      const wh = words[index];
      const subject = words[index + 1];
      return {
        skill: question.skill,
        code: "G5012",
        errorType: "will_inversion",
        title: "Sai thứ tự câu hỏi với will",
        message: `Đảo will lên trước chủ ngữ: "${wh} ${subject} will ..." → "${wh} will ${subject} ...".`,
        hint: `${capitalize(wh)} will you + V?`,
        recommendation: question.skill
      };
    }
  }

  if (words.includes("yes") && words.includes("am") && !words.includes("will") && !words.includes("wont") && !words.includes("won't")) {
    return {
      skill: question.skill,
      code: "G5012",
      errorType: "yes_i_will",
      title: "Trả lời câu hỏi Will...?",
      message: 'Trả lời câu hỏi Will...? bằng "Yes, I will" / "No, I won\'t", không dùng am.',
      hint: "Yes, I will. / No, I won't.",
      recommendation: question.skill
    };
  }

  return null;
}

function looksLikePastTenseVerb(verb) {
  if (!verb) return false;
  if (IRREGULAR_PAST[verb]) return true;
  return /ed$/.test(verb) && verb.length > 3;
}

function looksLikeThirdPersonVerb(verb) {
  if (!verb || BE_VERBS.includes(verb)) return false;
  if (verb === "has" || verb === "does") return true;
  if (verb.endsWith("ss") || verb.endsWith("us")) return false;
  return /ies$|([^s])es$|[^s]s$/.test(verb);
}

function toBaseFormAfterDid(verb) {
  return IRREGULAR_PAST[verb] || stripPastEd(verb);
}

function toPastForm(verb) {
  if (/(s|x|z|ch|sh)$/.test(verb)) return `${verb}ed`;
  if (/[^aeiou]y$/.test(verb)) return `${verb.slice(0, -1)}ied`;
  if (/(e)$/.test(verb)) return `${verb}d`;
  if (verb.length <= 3) return `${verb}ed`;
  return `${verb}ed`;
}

function stripPastEd(verb) {
  if (verb.endsWith("ied")) return `${verb.slice(0, -3)}y`;
  if (verb.endsWith("ed")) {
    const stem = verb.slice(0, -2);
    if (stem.length > 2 && stem.endsWith(stem.at(-1))) return stem.slice(0, -1);
    return stem;
  }
  return verb;
}

function stripThirdPersonS(verb) {
  if (verb.endsWith("ies")) return `${verb.slice(0, -3)}y`;
  if (verb.endsWith("es") && /(s|x|z|ch|sh|o)es$/.test(verb)) return verb.slice(0, -2);
  if (verb.endsWith("s")) return verb.slice(0, -1);
  return verb;
}

function capitalize(value) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
}

function addS(verb) {
  if (/(s|x|z|ch|sh)$/.test(verb)) return `${verb}es`;
  if (/[^aeiou]y$/.test(verb)) return `${verb.slice(0, -1)}ies`;
  if (verb === "go" || verb === "do") return `${verb}es`;
  if (verb === "have") return "has";
  return `${verb}s`;
}
