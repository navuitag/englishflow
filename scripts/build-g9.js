#!/usr/bin/env node
/**
 * Generate Grade 9 Global Success content and merge into data JSON files.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const SOURCE = "Bám sát SGK Tiếng Anh 9 – Kết nối tri thức với cuộc sống (Global Success).";

const UNITS = [
  {
    index: 1,
    chapter: "Unit 1: Local community",
    book: "Tập 1",
    skills: [
      {
        id: "g9_u1_wh_toinf",
        title: "Unit 1 · Wh-word + to-V",
        lessonNo: 1,
        domain: "Infinitives",
        grammar: "wh_toinf",
        prerequisite: [],
        description: "Dùng what/where/how/when + to-V sau know, wonder, ask, tell, show, decide…",
        formula: "S + V + Wh-word + to V",
        visualization: "formula"
      },
      {
        id: "g9_u1_phrasal_verbs",
        title: "Unit 1 · Cụm động từ",
        lessonNo: 2,
        domain: "Phrasal verbs",
        grammar: "phrasal_verbs",
        prerequisite: [],
        description: "Cụm động từ = động từ + tiểu từ/trạng từ (pass down, set up, look up, turn on…).",
        formula: "V + particle",
        visualization: "formula"
      }
    ]
  },
  {
    index: 2,
    chapter: "Unit 2: City life",
    book: "Tập 1",
    skills: [
      {
        id: "g9_u2_comparisons",
        title: "Unit 2 · So sánh hơn & nhất",
        lessonNo: 1,
        domain: "Comparisons",
        grammar: "comparative",
        prerequisite: [],
        description: "So sánh hơn/nhất với tính từ và trạng từ ngắn (-er/-est) và dài (more/most).",
        formula: "adj-er / the adj-est; more + adj + than",
        visualization: "comparative"
      }
    ]
  },
  {
    index: 3,
    chapter: "Unit 3: Healthy living for teens",
    book: "Tập 1",
    skills: [
      {
        id: "g9_u3_reported_statements",
        title: "Unit 3 · Câu tường thuật (trần thuật)",
        lessonNo: 1,
        domain: "Reported speech",
        grammar: "reported_statement",
        prerequisite: [],
        description: "Tường thuật câu trần thuật: lùi thì, đổi đại từ và trạng từ thời gian/nơi chốn.",
        formula: "S + said (that) + S + V (lùi thì)",
        visualization: "reportedSpeech"
      },
      {
        id: "g9_u3_should",
        title: "Unit 3 · should / shouldn't",
        lessonNo: 2,
        domain: "Modals",
        grammar: "modal_should",
        prerequisite: [],
        description: "should/shouldn't + V nguyên thể để đưa ra lời khuyên về sức khỏe.",
        formula: "S + should/shouldn't + V",
        visualization: "formula"
      }
    ]
  },
  {
    index: 4,
    chapter: "Unit 4: Remembering the past",
    book: "Tập 1",
    skills: [
      {
        id: "g9_u4_past_continuous",
        title: "Unit 4 · Thì quá khứ tiếp diễn",
        lessonNo: 1,
        domain: "Tenses",
        grammar: "past_continuous",
        prerequisite: [],
        description: "Quá khứ tiếp diễn mô tả hành động đang diễn ra tại thời điểm trong quá khứ hoặc bị xen vào.",
        formula: "S + was/were + V-ing (+ when + S + V2)",
        visualization: "pastContinuous"
      },
      {
        id: "g9_u4_wish",
        title: "Unit 4 · Wish + quá khứ đơn",
        lessonNo: 2,
        domain: "Wishes",
        grammar: "wish_past",
        prerequisite: [],
        description: "wish + S + V2/ed diễn tả ước muốn trái với sự thật hiện tại (be → were).",
        formula: "S + wish(es) + S + V2/ed",
        visualization: "formula"
      }
    ]
  },
  {
    index: 5,
    chapter: "Unit 5: Our experiences",
    book: "Tập 1",
    skills: [
      {
        id: "g9_u5_present_perfect",
        title: "Unit 5 · Thì hiện tại hoàn thành",
        lessonNo: 1,
        domain: "Tenses",
        grammar: "present_perfect",
        prerequisite: [],
        description: "Hiện tại hoàn thành diễn tả trải nghiệm đã/chưa từng xảy ra (ever/never).",
        formula: "S + have/has + V3",
        visualization: "presentPerfect"
      }
    ]
  },
  {
    index: 6,
    chapter: "Unit 6: Vietnamese lifestyles: Then and now",
    book: "Tập 1",
    skills: [
      {
        id: "g9_u6_gerund",
        title: "Unit 6 · Động từ + V-ing",
        lessonNo: 1,
        domain: "Verb patterns",
        grammar: "verb_liking",
        prerequisite: [],
        description: "Sau enjoy, mind, avoid, hate… dùng danh động từ V-ing làm tân ngữ.",
        formula: "S + enjoy/mind/avoid + V-ing",
        visualization: "formula"
      },
      {
        id: "g9_u6_toinf",
        title: "Unit 6 · Động từ + to-V",
        lessonNo: 2,
        domain: "Verb patterns",
        grammar: "to_infinitive",
        prerequisite: [],
        description: "Sau want, decide, hope, expect, try… dùng to + V nguyên thể làm tân ngữ.",
        formula: "S + want/decide/hope + to V",
        visualization: "formula"
      }
    ]
  },
  {
    index: 7,
    chapter: "Unit 7: Natural wonders of the world",
    book: "Tập 2",
    skills: [
      {
        id: "g9_u7_reported_yesno",
        title: "Unit 7 · Tường thuật câu hỏi Yes/No",
        lessonNo: 1,
        domain: "Reported speech",
        grammar: "reported_question",
        prerequisite: ["g9_u3_reported_statements"],
        description: "Tường thuật câu hỏi Yes/No: asked + if/whether + S + V (lùi thì, không đảo ngữ).",
        formula: "S + asked + if/whether + S + V",
        visualization: "reportedSpeech"
      },
      {
        id: "g9_u7_impersonal_passive",
        title: "Unit 7 · Bị động khách quan",
        lessonNo: 2,
        domain: "Voice",
        grammar: "impersonal_passive",
        prerequisite: [],
        description: "It is/was + V3 + (that) + S + V… để tường thuật ý kiến/thông tin khách quan.",
        formula: "It + is/was + V3 + (that) + clause",
        visualization: "passive"
      }
    ]
  },
  {
    index: 8,
    chapter: "Unit 8: Tourism",
    book: "Tập 2",
    skills: [
      {
        id: "g9_u8_relative_clauses",
        title: "Unit 8 · Mệnh đề quan hệ",
        lessonNo: 1,
        domain: "Relative clauses",
        grammar: "relative_clause",
        prerequisite: [],
        description: "who (người) / which (vật) bổ nghĩa cho danh từ đứng ngay trước.",
        formula: "N + who/which + V",
        visualization: "formula"
      }
    ]
  },
  {
    index: 9,
    chapter: "Unit 9: World Englishes",
    book: "Tập 2",
    skills: [
      {
        id: "g9_u9_conditional1",
        title: "Unit 9 · Câu điều kiện loại 1",
        lessonNo: 1,
        domain: "Conditionals",
        grammar: "conditional1",
        prerequisite: [],
        description: "Câu điều kiện loại 1: điều kiện có thể xảy ra ở hiện tại/tương lai.",
        formula: "If + S + V(s), S + will/can + V",
        visualization: "formula"
      }
    ]
  },
  {
    index: 10,
    chapter: "Unit 10: Planet Earth",
    book: "Tập 2",
    skills: [
      {
        id: "g9_u10_conditional2",
        title: "Unit 10 · Câu điều kiện loại 2",
        lessonNo: 1,
        domain: "Conditionals",
        grammar: "conditional2",
        prerequisite: ["g9_u9_conditional1"],
        description: "Câu điều kiện loại 2: giả định trái với sự thật hiện tại.",
        formula: "If + S + V2/were, S + would/could + V",
        visualization: "formula"
      }
    ]
  },
  {
    index: 11,
    chapter: "Unit 11: Electronic devices",
    book: "Tập 2",
    skills: [
      {
        id: "g9_u11_past_perfect",
        title: "Unit 11 · Thì quá khứ hoàn thành",
        lessonNo: 1,
        domain: "Tenses",
        grammar: "past_perfect",
        prerequisite: [],
        description: "Quá khứ hoàn thành diễn tả hành động xảy ra trước một hành động/mốc trong quá khứ.",
        formula: "S + had + V3",
        visualization: "presentPerfect"
      },
      {
        id: "g9_u11_passive_present",
        title: "Unit 11 · Câu bị động (hiện tại)",
        lessonNo: 2,
        domain: "Voice",
        grammar: "passive_present",
        prerequisite: [],
        description: "Bị động hiện tại đơn: am/is/are + V3 (+ by O).",
        formula: "S + am/is/are + V3 (+ by O)",
        visualization: "passive"
      },
      {
        id: "g9_u11_passive_past",
        title: "Unit 11 · Câu bị động (quá khứ)",
        lessonNo: 3,
        domain: "Voice",
        grammar: "passive_past",
        prerequisite: ["g9_u11_passive_present"],
        description: "Bị động quá khứ đơn: was/were + V3 (+ by O).",
        formula: "S + was/were + V3 (+ by O)",
        visualization: "passive"
      }
    ]
  },
  {
    index: 12,
    chapter: "Unit 12: Career choices",
    book: "Tập 2",
    skills: [
      {
        id: "g9_u12_reported_wh",
        title: "Unit 12 · Tường thuật câu hỏi Wh-",
        lessonNo: 1,
        domain: "Reported speech",
        grammar: "reported_wh",
        prerequisite: ["g9_u7_reported_yesno"],
        description: "Tường thuật câu hỏi Wh-: asked + Wh-word + S + V (lùi thì, trật tự khẳng định).",
        formula: "S + asked + Wh-word + S + V",
        visualization: "reportedSpeech"
      },
      {
        id: "g9_u12_relative_defining",
        title: "Unit 12 · MĐQH xác định",
        lessonNo: 2,
        domain: "Relative clauses",
        grammar: "relative_defining",
        prerequisite: ["g9_u8_relative_clauses"],
        description: "Mệnh đề quan hệ xác định dùng who/which/that để làm rõ danh từ đứng trước.",
        formula: "N + who/which/that + V",
        visualization: "formula"
      }
    ]
  }
];

const QUESTIONS = {
  g9_u1_wh_toinf: [
    {
      type: "multiple_choice",
      question: "We don't know ___ as a souvenir.",
      choices: ["what buy", "what to buy", "to buy what", "buy what"],
      answer: "what to buy",
      hint: "Wh-word + to-V sau know."
    },
    {
      type: "error_detection",
      question: "Can you show me how to operate this loom?",
      prompt: "Can you show me how operate this loom?",
      answer: "Can you show me how to operate this loom?",
      hint: "how + to + V nguyên thể."
    },
    {
      type: "word_order",
      question: "Sắp xếp thành câu đúng:",
      tokens: ["She", "decided", "where", "to", "go"],
      answer: "She decided where to go",
      hint: "decided + where + to + V."
    }
  ],
  g9_u1_phrasal_verbs: [
    {
      type: "multiple_choice",
      question: "This technique has been ___ through many generations.",
      choices: ["passed down", "passed on down", "pass down", "passing down"],
      answer: "passed down",
      hint: "pass down = truyền lại."
    },
    {
      type: "error_detection",
      question: "They decided to set up a new workshop in the village.",
      prompt: "They decided to set a new workshop up it in the village.",
      answer: "They decided to set up a new workshop in the village.",
      hint: "set up = thành lập; không thêm it thừa."
    },
    {
      type: "input",
      question: "Điền cụm động từ: Please ___ (turn) ___ the lights when you leave.",
      answer: "turn off",
      hint: "turn off = tắt đèn."
    }
  ],
  g9_u2_comparisons: [
    {
      type: "multiple_choice",
      question: "The air in the countryside is ___ than in the city.",
      choices: ["good", "better", "best", "more good"],
      answer: "better",
      hint: "good → better (so sánh hơn)."
    },
    {
      type: "error_detection",
      question: "This is the tallest building I have ever seen.",
      prompt: "This is the most tall building I have ever seen.",
      answer: "This is the tallest building I have ever seen.",
      hint: "tall → tallest (tính từ ngắn)."
    },
    {
      type: "word_order",
      question: "Sắp xếp thành câu đúng:",
      tokens: ["City", "life", "is", "more", "exciting", "than", "village", "life"],
      answer: "City life is more exciting than village life",
      hint: "more + adj dài + than."
    }
  ],
  g9_u3_reported_statements: [
    {
      type: "multiple_choice",
      question: "He said (that) he ___ stressed.",
      choices: ["is", "was", "will be", "has been"],
      answer: "was",
      hint: "am/is → was khi tường thuật."
    },
    {
      type: "error_detection",
      question: "She said she will go jogging tomorrow.",
      prompt: "She said she will go jogging tomorrow.",
      answer: "She said she would go jogging the next day.",
      hint: "will → would; tomorrow → the next day."
    },
    {
      type: "word_order",
      question: "Sắp xếp thành câu tường thuật đúng:",
      tokens: ["He", "said", "that", "he", "was", "tired"],
      answer: "He said that he was tired",
      hint: "said + (that) + S + V (lùi thì)."
    }
  ],
  g9_u3_should: [
    {
      type: "multiple_choice",
      question: "Teens ___ skip breakfast if they want to stay focused.",
      choices: ["should", "shouldn't", "must", "might"],
      answer: "shouldn't",
      hint: "Lời khuyên phủ định: shouldn't."
    },
    {
      type: "error_detection",
      question: "You should get at least 8 hours of sleep.",
      prompt: "You should getting at least 8 hours of sleep.",
      answer: "You should get at least 8 hours of sleep.",
      hint: "should + V nguyên thể."
    },
    {
      type: "input",
      question: "Điền should/shouldn't: You ___ (drink) more water every day.",
      answer: "should drink",
      hint: "Lời khuyên tích cực → should + V."
    }
  ],
  g9_u4_past_continuous: [
    {
      type: "multiple_choice",
      question: "At 9 p.m. last night, my family ___ TV.",
      choices: ["watched", "was watching", "were watching", "is watching"],
      answer: "was watching",
      hint: "my family số ít → was + V-ing."
    },
    {
      type: "error_detection",
      question: "My father was reading when the phone rang.",
      prompt: "My father was read when the phone rang.",
      answer: "My father was reading when the phone rang.",
      hint: "was + V-ing."
    },
    {
      type: "word_order",
      question: "Sắp xếp thành câu đúng:",
      tokens: ["They", "were", "playing", "when", "it", "started", "to", "rain"],
      answer: "They were playing when it started to rain",
      hint: "were + V-ing + when + quá khứ đơn."
    }
  ],
  g9_u4_wish: [
    {
      type: "multiple_choice",
      question: "I wish I ___ a new bicycle.",
      choices: ["have", "had", "will have", "has"],
      answer: "had",
      hint: "wish + quá khứ đơn (trái hiện tại)."
    },
    {
      type: "error_detection",
      question: "He wishes he were taller.",
      prompt: "He wishes he was taller.",
      answer: "He wishes he were taller.",
      hint: "Sau wish, be → were cho mọi chủ ngữ."
    },
    {
      type: "input",
      question: "Viết lại: I don't live near the sea. → I wish I ___ near the sea.",
      answer: "lived",
      hint: "live → lived sau wish."
    }
  ],
  g9_u5_present_perfect: [
    {
      type: "multiple_choice",
      question: "Have you ever ___ Thai food?",
      choices: ["eat", "ate", "eaten", "eating"],
      answer: "eaten",
      hint: "have + V3 (eat → eaten)."
    },
    {
      type: "error_detection",
      question: "I have never tried scuba diving before.",
      prompt: "I have never try scuba diving before.",
      answer: "I have never tried scuba diving before.",
      hint: "have + V3 (try → tried)."
    },
    {
      type: "word_order",
      question: "Sắp xếp thành câu đúng:",
      tokens: ["She", "has", "never", "visited", "Ha", "Long", "Bay"],
      answer: "She has never visited Ha Long Bay",
      hint: "S + has + never + V3."
    }
  ],
  g9_u6_gerund: [
    {
      type: "multiple_choice",
      question: "My grandfather enjoys ___ to folk music.",
      choices: ["listen", "listening", "to listen", "listens"],
      answer: "listening",
      hint: "enjoy + V-ing."
    },
    {
      type: "error_detection",
      question: "People now prefer texting rather than calling.",
      prompt: "People now prefer text rather than calling.",
      answer: "People now prefer texting rather than calling.",
      hint: "prefer + V-ing."
    },
    {
      type: "input",
      question: "Điền dạng đúng: She avoids ___ (eat) fast food.",
      answer: "eating",
      hint: "avoid + V-ing."
    }
  ],
  g9_u6_toinf: [
    {
      type: "multiple_choice",
      question: "We decided ___ to a quieter neighborhood.",
      choices: ["move", "moving", "to move", "moved"],
      answer: "to move",
      hint: "decide + to-V."
    },
    {
      type: "error_detection",
      question: "She is trying to learn how to code.",
      prompt: "She is trying learning how to code.",
      answer: "She is trying to learn how to code.",
      hint: "try + to-V (cố gắng làm)."
    },
    {
      type: "word_order",
      question: "Sắp xếp thành câu đúng:",
      tokens: ["They", "hope", "to", "visit", "Hoi", "An", "soon"],
      answer: "They hope to visit Hoi An soon",
      hint: "hope + to + V."
    }
  ],
  g9_u7_reported_yesno: [
    {
      type: "multiple_choice",
      question: 'He asked, "Is this the way to the cave?" → He asked if that ___ the way to the cave.',
      choices: ["is", "was", "were", "has been"],
      answer: "was",
      hint: "is → was khi tường thuật."
    },
    {
      type: "error_detection",
      question: "She asked me whether I had visited that wonder.",
      prompt: "She asked me whether had I visited that wonder.",
      answer: "She asked me whether I had visited that wonder.",
      hint: "Trật tự khẳng định: whether + S + V."
    },
    {
      type: "word_order",
      question: "Sắp xếp thành câu tường thuật đúng:",
      tokens: ["He", "asked", "if", "I", "was", "ready"],
      answer: "He asked if I was ready",
      hint: "asked + if + S + V."
    }
  ],
  g9_u7_impersonal_passive: [
    {
      type: "multiple_choice",
      question: "It is ___ that this place is haunted.",
      choices: ["say", "said", "saying", "says"],
      answer: "said",
      hint: "It is + V3 trong bị động khách quan."
    },
    {
      type: "error_detection",
      question: "It is believed that the rock formation is sacred.",
      prompt: "It believes that the rock formation is sacred.",
      answer: "It is believed that the rock formation is sacred.",
      hint: "It is + V3 + that + clause."
    },
    {
      type: "input",
      question: "Viết bị động khách quan: People say the lake is beautiful. → It ___ that the lake is beautiful.",
      answer: "is said",
      hint: "It is said that…"
    }
  ],
  g9_u8_relative_clauses: [
    {
      type: "multiple_choice",
      question: "The tour guide ___ showed us around was very knowledgeable.",
      choices: ["who", "which", "where", "whose"],
      answer: "who",
      hint: "Người → who."
    },
    {
      type: "error_detection",
      question: "We visited the site which is famous for its architecture.",
      prompt: "We visited the site who is famous for its architecture.",
      answer: "We visited the site which is famous for its architecture.",
      hint: "Vật → which, không dùng who."
    },
    {
      type: "word_order",
      question: "Sắp xếp thành câu đúng:",
      tokens: ["The", "hotel", "which", "we", "stayed", "in", "was", "comfortable"],
      answer: "The hotel which we stayed in was comfortable",
      hint: "N + which + mệnh đề quan hệ."
    }
  ],
  g9_u9_conditional1: [
    {
      type: "multiple_choice",
      question: "If you practice English every day, your skills ___ improve.",
      choices: ["will", "would", "improve", "improved"],
      answer: "will",
      hint: "Mệnh đề chính loại 1: will + V."
    },
    {
      type: "error_detection",
      question: "If it rains, we will stay at home.",
      prompt: "If it will rain, we will stay at home.",
      answer: "If it rains, we will stay at home.",
      hint: "Mệnh đề If dùng hiện tại đơn, không dùng will."
    },
    {
      type: "word_order",
      question: "Sắp xếp thành câu đúng:",
      tokens: ["If", "you", "study", "hard", "you", "will", "pass"],
      answer: "If you study hard you will pass",
      hint: "If + hiện tại đơn, will + V."
    }
  ],
  g9_u10_conditional2: [
    {
      type: "multiple_choice",
      question: "If everyone recycled, we ___ reduce a lot of waste.",
      choices: ["will", "would", "can", "reduce"],
      answer: "would",
      hint: "Câu điều kiện loại 2: would + V."
    },
    {
      type: "error_detection",
      question: "What would you do if you were the leader?",
      prompt: "What would you do if you was the leader?",
      answer: "What would you do if you were the leader?",
      hint: "Sau if (loại 2), be → were."
    },
    {
      type: "input",
      question: "Điền dạng đúng: If I ___ (be) rich, I would help the poor.",
      answer: "were",
      hint: "If + were (loại 2)."
    }
  ],
  g9_u11_past_perfect: [
    {
      type: "multiple_choice",
      question: "By the time I got home, my brother ___ already finished using the laptop.",
      choices: ["has", "had", "have", "was"],
      answer: "had",
      hint: "Hành động trước → had + V3."
    },
    {
      type: "error_detection",
      question: "He realized he had forgotten to charge his phone.",
      prompt: "He realized he has forgotten to charge his phone.",
      answer: "He realized he had forgotten to charge his phone.",
      hint: "Quá khứ → had + V3."
    },
    {
      type: "word_order",
      question: "Sắp xếp thành câu đúng:",
      tokens: ["She", "had", "left", "before", "I", "arrived"],
      answer: "She had left before I arrived",
      hint: "had + V3 + before + quá khứ đơn."
    }
  ],
  g9_u11_passive_present: [
    {
      type: "multiple_choice",
      question: "English ___ in many countries.",
      choices: ["speaks", "is spoken", "speak", "is speak"],
      answer: "is spoken",
      hint: "is + V3 (phân từ hai)."
    },
    {
      type: "error_detection",
      question: "The room is cleaned every day.",
      prompt: "The room is clean every day.",
      answer: "The room is cleaned every day.",
      hint: "Cần phân từ hai cleaned."
    },
    {
      type: "input",
      question: "Chuyển bị động: People grow rice here. → Rice ___ here.",
      answer: "is grown",
      hint: "Rice số ít: is + V3."
    }
  ],
  g9_u11_passive_past: [
    {
      type: "multiple_choice",
      question: "The first telephone ___ by Alexander Graham Bell.",
      choices: ["invented", "was invented", "is invented", "was invent"],
      answer: "was invented",
      hint: "Quá khứ bị động: was + V3."
    },
    {
      type: "error_detection",
      question: "The houses were built in 1990.",
      prompt: "The houses was built in 1990.",
      answer: "The houses were built in 1990.",
      hint: "Số nhiều → were + V3."
    },
    {
      type: "word_order",
      question: "Sắp xếp thành câu bị động đúng:",
      tokens: ["This", "app", "is", "downloaded", "by", "millions", "of", "users"],
      answer: "This app is downloaded by millions of users",
      hint: "S + is + V3 + by + O."
    }
  ],
  g9_u12_reported_wh: [
    {
      type: "multiple_choice",
      question: 'He asked, "What job do you want?" → He asked me what job I ___.',
      choices: ["want", "wanted", "wants", "am wanting"],
      answer: "wanted",
      hint: "want → wanted (lùi thì)."
    },
    {
      type: "error_detection",
      question: "She asked her father where he worked.",
      prompt: "She asked her father where did he work.",
      answer: "She asked her father where he worked.",
      hint: "Wh- tường thuật: bỏ did, lùi thì."
    },
    {
      type: "word_order",
      question: "Sắp xếp thành câu tường thuật đúng:",
      tokens: ["He", "asked", "what", "time", "the", "meeting", "started"],
      answer: "He asked what time the meeting started",
      hint: "asked + Wh- + S + V."
    }
  ],
  g9_u12_relative_defining: [
    {
      type: "multiple_choice",
      question: "A surgeon is a doctor ___ performs operations.",
      choices: ["who", "which", "where", "whose"],
      answer: "who",
      hint: "doctor (người) → who/that."
    },
    {
      type: "error_detection",
      question: "The job that I applied for requires good IT skills.",
      prompt: "The job which I applied for requires good IT skills.",
      answer: "The job that I applied for requires good IT skills.",
      hint: "job (vật trừu tượng) → that/which đều được; sửa who nếu sai — ở đây which OK for job actually. Let me fix - job can use that. The wrong uses 'who' for job.",
      // Fix below in generation - use who for job as wrong
    },
    {
      type: "word_order",
      question: "Sắp xếp thành câu đúng:",
      tokens: ["The", "teacher", "who", "taught", "us", "is", "kind"],
      answer: "The teacher who taught us is kind",
      hint: "N + who + V + …"
    }
  ]
};

// Fix g9_u12_relative_defining error_detection
QUESTIONS.g9_u12_relative_defining[1] = {
  type: "error_detection",
  question: "The job that I applied for requires good IT skills.",
  prompt: "The job who I applied for requires good IT skills.",
  answer: "The job that I applied for requires good IT skills.",
  hint: "job (vật) → that/which, không dùng who."
};

const LESSON_EXAMPLES = {
  g9_u1_wh_toinf: { correct: "We don't know what to buy.", wrong: "We don't know what buy." },
  g9_u1_phrasal_verbs: { correct: "They set up a new workshop.", wrong: "They set a workshop up in wrong order only when object is long — use: They set up a workshop." },
  g9_u2_comparisons: { correct: "City life is more exciting than village life.", wrong: "City life is more exciting than village life is more exciting." },
  g9_u3_reported_statements: { correct: "He said he was feeling stressed.", wrong: "He said he is feeling stressed." },
  g9_u3_should: { correct: "You should get enough sleep.", wrong: "You should getting enough sleep." },
  g9_u4_past_continuous: { correct: "My father was reading when the phone rang.", wrong: "My father was read when the phone rang." },
  g9_u4_wish: { correct: "I wish I had a new bike.", wrong: "I wish I have a new bike." },
  g9_u5_present_perfect: { correct: "I have never tried scuba diving.", wrong: "I have never try scuba diving." },
  g9_u6_gerund: { correct: "She enjoys listening to music.", wrong: "She enjoys listen to music." },
  g9_u6_toinf: { correct: "We decided to move.", wrong: "We decided moving." },
  g9_u7_reported_yesno: { correct: "He asked if that was the way.", wrong: "He asked if that is the way." },
  g9_u7_impersonal_passive: { correct: "It is said that the lake is beautiful.", wrong: "It says that the lake is beautiful." },
  g9_u8_relative_clauses: { correct: "The guide who showed us around was kind.", wrong: "The guide which showed us around was kind." },
  g9_u9_conditional1: { correct: "If you study hard, you will pass.", wrong: "If you will study hard, you will pass." },
  g9_u10_conditional2: { correct: "If I were rich, I would travel.", wrong: "If I was rich, I would travel." },
  g9_u11_past_perfect: { correct: "She had left before I arrived.", wrong: "She has left before I arrived." },
  g9_u11_passive_present: { correct: "English is spoken in many countries.", wrong: "English is speak in many countries." },
  g9_u11_passive_past: { correct: "The phone was invented by Bell.", wrong: "The phone was invent by Bell." },
  g9_u12_reported_wh: { correct: "He asked what job I wanted.", wrong: "He asked what job did I want." },
  g9_u12_relative_defining: { correct: "A surgeon is a doctor who performs operations.", wrong: "A surgeon is a doctor which performs operations." }
};

function buildSkills() {
  const skills = [];
  for (const unit of UNITS) {
    for (const s of unit.skills) {
      skills.push({
        id: s.id,
        title: s.title,
        grade: 9,
        book: unit.book,
        chapter: unit.chapter,
        chapterIndex: unit.index,
        lessonNo: s.lessonNo,
        domain: s.domain,
        grammar: s.grammar,
        level: 1,
        prerequisite: s.prerequisite,
        description: s.description,
        formula: s.formula,
        visualization: s.visualization
      });
    }
  }
  return skills;
}

function buildLessons(skills) {
  return skills.map((skill) => {
    const ex = LESSON_EXAMPLES[skill.id] || {
      correct: "Example correct sentence.",
      wrong: "Example wrong sentence."
    };
    return {
      id: skill.id,
      title: skill.title,
      skill: skill.id,
      chapter: skill.chapter,
      source: SOURCE,
      xp: 70,
      steps: [
        {
          type: "intro",
          title: "Mục tiêu bài học",
          content: skill.description
        },
        {
          type: "visualization",
          title: "Cấu trúc trực quan",
          content: skill.description,
          visualization: skill.visualization,
          formula: skill.formula
        },
        {
          type: "example",
          title: "Ví dụ và lỗi thường gặp",
          content: "Chú ý cấu trúc và dạng động từ đúng theo SGK.",
          example: { correct: ex.correct, wrong: ex.wrong }
        },
        {
          type: "summary",
          title: "Ghi nhớ nhanh",
          content: skill.formula
        }
      ]
    };
  });
}

function buildQuestions(skills) {
  const questions = [];
  for (const skill of skills) {
    const items = QUESTIONS[skill.id];
    if (!items) throw new Error(`Missing questions for ${skill.id}`);
    items.forEach((q, i) => {
      questions.push({
        id: `q_${skill.id}_${i + 1}`,
        skill: skill.id,
        grammar: skill.grammar,
        ...q
      });
    });
  }
  return questions;
}

const G9_ERRORS = [
  { pattern: "what buy", grammar: "wh_toinf", code: "GR035", errorType: "infinitive_error", title: "Thiếu to sau Wh-word", message: "Wh-word + to + V: \"what buy\" → \"what to buy\".", hint: "what/how/where/when + to + V.", recommendation: "g9_u1_wh_toinf" },
  { pattern: "how operate", grammar: "wh_toinf", code: "GR035", errorType: "infinitive_error", title: "Thiếu to-infinitive", message: "how + to + V nguyên thể.", hint: "how to + V.", recommendation: "g9_u1_wh_toinf" },
  { pattern: "most tall", grammar: "comparative", code: "GR005", errorType: "comparative_form", title: "Sai so sánh nhất", message: "Tính từ ngắn dùng -est: \"most tall\" → \"tallest\".", hint: "short adj → -est.", recommendation: "g9_u2_comparisons" },
  { pattern: "will go jogging tomorrow", grammar: "reported_statement", code: "GR034", errorType: "reported_tense", title: "Chưa lùi thì khi tường thuật", message: "will → would; tomorrow → the next day.", hint: "Lùi thì và đổi trạng từ thời gian.", recommendation: "g9_u3_reported_statements" },
  { pattern: "should getting", grammar: "modal_should", code: "GR002", errorType: "wrong_form", title: "Sai dạng sau should", message: "should + V nguyên thể.", hint: "should/shouldn't + V.", recommendation: "g9_u3_should" },
  { pattern: "was read when", grammar: "past_continuous", code: "GR010", errorType: "missing_ing", title: "Thiếu -ing", message: "was/were + V-ing.", hint: "S + was/were + V-ing.", recommendation: "g9_u4_past_continuous" },
  { pattern: "wishes he was", grammar: "wish_past", code: "GR036", errorType: "wish_error", title: "Sai be sau wish", message: "Sau wish, be → were: \"was\" → \"were\".", hint: "wish + S + were/V2.", recommendation: "g9_u4_wish" },
  { pattern: "have never try", grammar: "present_perfect", code: "GR011", errorType: "wrong_form", title: "Sai V3 sau have", message: "have + V3: try → tried.", hint: "have/has + V3.", recommendation: "g9_u5_present_perfect" },
  { pattern: "enjoys play", grammar: "verb_liking", code: "GR020", errorType: "gerund_error", title: "Thiếu V-ing", message: "enjoy + V-ing.", hint: "enjoy/mind/avoid + V-ing.", recommendation: "g9_u6_gerund" },
  { pattern: "decided moving", grammar: "to_infinitive", code: "GR028", errorType: "verb_pattern", title: "Sai dạng sau decide", message: "decide + to-V.", hint: "want/decide/hope + to + V.", recommendation: "g9_u6_toinf" },
  { pattern: "whether had i", grammar: "reported_question", code: "GR034", errorType: "reported_question_error", title: "Sai trật tự tường thuật", message: "whether + S + V (không đảo ngữ).", hint: "asked + if/whether + S + V.", recommendation: "g9_u7_reported_yesno" },
  { pattern: "it believes that", grammar: "impersonal_passive", code: "GR037", errorType: "passive_form", title: "Sai bị động khách quan", message: "It is + V3 + that…", hint: "It is believed/said that…", recommendation: "g9_u7_impersonal_passive" },
  { pattern: "site who is", grammar: "relative_clause", code: "GR038", errorType: "relative_pronoun", title: "Sai đại từ quan hệ", message: "Vật → which/that, không dùng who.", hint: "person → who; thing → which.", recommendation: "g9_u8_relative_clauses" },
  { pattern: "if it will rain", grammar: "conditional1", code: "GR039", errorType: "conditional_error", title: "Sai mệnh đề If loại 1", message: "Mệnh đề If dùng hiện tại đơn, không will.", hint: "If + V(s), S + will + V.", recommendation: "g9_u9_conditional1" },
  { pattern: "if you was", grammar: "conditional2", code: "GR039", errorType: "conditional_error", title: "Sai be trong loại 2", message: "If + were (loại 2).", hint: "If + S + were/V2, S + would + V.", recommendation: "g9_u10_conditional2" },
  { pattern: "has forgotten to charge", grammar: "past_perfect", code: "GR040", errorType: "wrong_tense", title: "Cần quá khứ hoàn thành", message: "Hành động trước trong quá khứ → had + V3.", hint: "S + had + V3.", recommendation: "g9_u11_past_perfect" },
  { pattern: "is speak", grammar: "passive_present", code: "GR007", errorType: "passive_form", title: "Sai dạng bị động", message: "is + V3 (speak → spoken).", hint: "to be + V3.", recommendation: "g9_u11_passive_present" },
  { pattern: "houses was built", grammar: "passive_past", code: "GR008", errorType: "subject_verb_agreement", title: "Sai was/were", message: "Số nhiều → were + V3.", hint: "was/were + V3.", recommendation: "g9_u11_passive_past" },
  { pattern: "what job did i", grammar: "reported_wh", code: "GR034", errorType: "reported_question_error", title: "Sai câu hỏi Wh- tường thuật", message: "Bỏ did, lùi thì: \"did I want\" → \"I wanted\".", hint: "asked + Wh- + S + V.", recommendation: "g9_u12_reported_wh" },
  { pattern: "job who i", grammar: "relative_defining", code: "GR038", errorType: "relative_pronoun", title: "Sai who/that", message: "job (vật) → that/which.", hint: "N + who/which/that + V.", recommendation: "g9_u12_relative_defining" }
];

function merge() {
  const skills = JSON.parse(fs.readFileSync(path.join(dataDir, "skills.json"), "utf8"));
  const lessons = JSON.parse(fs.readFileSync(path.join(dataDir, "lessons.json"), "utf8"));
  const questions = JSON.parse(fs.readFileSync(path.join(dataDir, "questions.json"), "utf8"));
  let errors = JSON.parse(fs.readFileSync(path.join(dataDir, "errors.json"), "utf8"));

  const withoutG9 = skills.filter((s) => s.grade !== 9);
  const g9Skills = buildSkills();
  const newSkills = [...withoutG9, ...g9Skills];

  const g9Ids = new Set(g9Skills.map((s) => s.id));
  const withoutG9Lessons = lessons.filter((l) => !g9Ids.has(l.id) && l.id !== "passive_present" && l.id !== "passive_past");
  const g9Lessons = buildLessons(g9Skills);
  const newLessons = [...withoutG9Lessons, ...g9Lessons];

  const withoutG9Questions = questions.filter(
    (q) => !g9Ids.has(q.skill) && q.skill !== "passive_present" && q.skill !== "passive_past"
  );
  const g9Questions = buildQuestions(g9Skills);
  const newQuestions = [...withoutG9Questions, ...g9Questions];

  errors = errors.filter(
    (e) =>
      e.recommendation !== "passive_present" &&
      e.recommendation !== "passive_past" &&
      !e.skill?.startsWith?.("passive_") &&
      e.skill !== "passive_present" &&
      e.skill !== "passive_past" &&
      !(e.recommendation && e.recommendation.startsWith("g9_u"))
  );
  errors = [...errors, ...G9_ERRORS];

  fs.writeFileSync(path.join(dataDir, "skills.json"), JSON.stringify(newSkills, null, 2) + "\n");
  fs.writeFileSync(path.join(dataDir, "lessons.json"), JSON.stringify(newLessons, null, 2) + "\n");
  fs.writeFileSync(path.join(dataDir, "questions.json"), JSON.stringify(newQuestions, null, 2) + "\n");
  fs.writeFileSync(path.join(dataDir, "errors.json"), JSON.stringify(errors, null, 2) + "\n");

  console.log("Grade 9 skills:", g9Skills.length);
  console.log("Grade 9 questions:", g9Questions.length);
  console.log("Total skills:", newSkills.length);
  console.log("Total questions:", newQuestions.length);
  console.log("Total errors:", errors.length);
}

merge();
