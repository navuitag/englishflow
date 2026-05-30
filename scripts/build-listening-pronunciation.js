#!/usr/bin/env node
/**
 * Generate listening & pronunciation skills for all 48 SGK units (grades 6–9).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const SOURCE =
  "Bám sát kỹ năng Nghe & Phát âm SGK Global Success (Kết nối tri thức với cuộc sống) theo Unit.";

function loadUnits() {
  const skills = JSON.parse(fs.readFileSync(path.join(dataDir, "skills.json"), "utf8"));
  const map = new Map();
  skills.forEach((s) => {
    const key = `${s.grade}_${s.chapterIndex}`;
    if (!map.has(key)) {
      map.set(key, { grade: s.grade, chapterIndex: s.chapterIndex, chapter: s.chapter, book: s.book });
    }
  });
  return [...map.values()].sort((a, b) => a.grade - b.grade || a.chapterIndex - b.chapterIndex);
}

/** 12 pronunciation topics — lặp theo Unit trong mỗi lớp */
const PRON_TOPICS = [
  {
    focus: "Âm /ɪ/ và /iː/",
    points: ["/ɪ/ ngắn như trong sit, big", "/iː/ dài như trong seat, see", "Không nhầm live /lɪv/ (sống) với leave /liːv/ (rời đi)"],
    pairs: [{ a: "sit", b: "seat", note: "ngồi / ghế" }, { a: "ship", b: "sheep", note: "tàu / cừu" }],
    examples: [{ word: "teacher", stress: "TEA-cher", note: "trọng âm âm tiết 1" }]
  },
  {
    focus: "Âm /e/ và /æ/",
    points: ["/e/ như bed, head", "/æ/ mở hơn như bad, cat", "Miệng mở rộng hơn với /æ/"],
    pairs: [{ a: "bed", b: "bad", note: "giường / xấu" }, { a: "men", b: "man", note: "đàn ông s.n / s.ít" }],
    examples: [{ word: "kitchen", stress: "KIT-chen", note: "trọng âm âm tiết 1" }]
  },
  {
    focus: "Trọng âm từ 2 âm tiết",
    points: ["Danh từ/adj 2 âm thường nhấn âm tiết 1: TA-ble", "Động từ 2 âm thường nhấn âm tiết 2: be-GIN", "Nghe trọng âm để nhận biết từ"],
    pairs: [],
    examples: [{ word: "happy", stress: "HAP-py", note: "adj" }, { word: "begin", stress: "be-GIN", note: "verb" }]
  },
  {
    focus: "Âm /θ/ và /ð/",
    points: ["/θ/ không rung: think, three", "/ð/ có rung: this, that", "Đầu lưỡi giữa răng trên và dưới"],
    pairs: [{ a: "think", b: "sink", note: "nghĩ — hay nhầm với t" }],
    examples: [{ word: "healthy", stress: "HEAL-thy", note: "th ở giữa" }]
  },
  {
    focus: "Âm /ʃ/, /ʒ/, /tʃ/, /dʒ/",
    points: ["/ʃ/ như ship, she", "/tʃ/ như chair, teacher", "/dʒ/ như job, age"],
    pairs: [{ a: "cheap", b: "jeep", note: "ch vs j" }],
    examples: [{ word: "television", stress: "TE-le-vi-sion", note: "sion /ʒən/" }]
  },
  {
    focus: "Đuôi -s/-es: /s/, /z/, /ɪz/",
    points: ["Sau âm vô thanh: /s/ — stops", "Sau âm hữu thanh: /z/ — dogs", "Sau âm đệm: /ɪz/ — watches"],
    pairs: [{ a: "books", b: "dogs", note: "/s/ vs /z/" }],
    examples: [{ word: "watches", stress: "WAT-ches", note: "phát âm /wɒtʃɪz/" }]
  },
  {
    focus: "Nối âm (linking)",
    points: ["Phụ âm cuối nối với nguyên âm đầu âm tiết sau", "an apple → a-napple", "Đọc trơn giúp nghe tự nhiên hơn"],
    pairs: [],
    examples: [{ word: "turn off", stress: "turn_off", note: "turn-off liền âm" }]
  },
  {
    focus: "Chữ câm (silent letters)",
    points: ["kn- đọc /n/: know, knee", "gh- đôi khi câm: night, high", "wr- đọc /r/: write, wrong"],
    pairs: [{ a: "know", b: "now", note: "k câm" }],
    examples: [{ word: "light", stress: "light", note: "gh câm" }]
  },
  {
    focus: "Âm cuối /ŋ/",
    points: ["-ng đọc /ŋ/, không thêm /g/: sing, not singg", "going, morning, interesting", "Mũi rung, lưỡi không chạm vòm miệng"],
    pairs: [{ a: "sing", b: "sin", note: "hát / tội" }],
    examples: [{ word: "morning", stress: "MOR-ning", note: "ng ở cuối" }]
  },
  {
    focus: "Trọng âm câu (sentence stress)",
    points: ["Từ nội dung (động từ, danh từ chính) đọc to hơn", "Từ chức năng (the, is, a) đọc nhẹ/nhỏ", "Giúp người nghe nắm ý chính"],
    pairs: [],
    examples: [{ word: "I LOVE tennis", stress: "LOVE nhấn mạnh", note: "sentence stress" }]
  },
  {
    focus: "Ngữ điệu câu hỏi Yes/No",
    points: ["Giọng lên cuối câu: Do you like…?", "Are you ready?", "Khác với câu trần thuật giọng xuống"],
    pairs: [],
    examples: [{ word: "Do you play sports?", stress: "↗ cuối câu", note: "yes/no question" }]
  },
  {
    focus: "Ngữ điệu câu hỏi Wh-",
    points: ["Wh- thường giọng xuống cuối câu", "Where do you live?", "What is your name?"],
    pairs: [],
    examples: [{ word: "Where is the park?", stress: "↘ cuối câu", note: "wh- question" }]
  }
];

/** 12 mẫu hội thoại nghe — theo chủ đề Unit trong lớp */
function listeningByGrade(grade) {
  const g = grade;
  return [
    {
      lines: [
        { speaker: "Tom", text: "Excuse me, where is the science classroom?" },
        { speaker: "Lan", text: "It is next to the library on the first floor." },
        { speaker: "Tom", text: "What time is break?" },
        { speaker: "Lan", text: "Break starts at nine fifteen." }
      ],
      qs: [
        { q: "Where is the science classroom?", a: "Next to the library", c: ["In the playground", "Next to the library", "On the third floor", "In the canteen"] },
        { q: "What time does break start?", a: "At nine fifteen", c: ["At eight o'clock", "At nine fifteen", "At ten thirty", "At eleven"] },
        { q: "Which floor is the classroom on?", a: "The first floor", c: ["The ground floor", "The first floor", "The second floor", "The third floor"] },
        { q: "Who asks about break time?", a: "Tom", c: ["Lan", "Tom", "The teacher", "A visitor"] }
      ]
    },
    {
      lines: [
        { speaker: "Mum", text: "Can you help me in the kitchen?" },
        { speaker: "Nam", text: "Sure. Where should I put these plates?" },
        { speaker: "Mum", text: "Put them in the cupboard next to the fridge." },
        { speaker: "Nam", text: "OK. Is Dad in the living room?" },
        { speaker: "Mum", text: "Yes. He is watching the news on TV." }
      ],
      qs: [
        { q: "Where should Nam put the plates?", a: "In the cupboard", c: ["On the balcony", "In the cupboard", "Under the bed", "In the attic"] },
        { q: "Where is Dad?", a: "In the living room", c: ["In the kitchen", "In the living room", "In the bathroom", "In the garden"] },
        { q: "What is Dad doing?", a: "Watching the news", c: ["Cooking dinner", "Watching the news", "Reading a book", "Sleeping"] },
        { q: "Who asks for help?", a: "Mum", c: ["Nam", "Dad", "Mum", "Sister"] }
      ]
    },
    {
      lines: [
        { speaker: "Mai", text: "My best friend is very sociable." },
        { speaker: "Hoa", text: "Really? What does she look like?" },
        { speaker: "Mai", text: "She has short hair and she is quite humorous." },
        { speaker: "Hoa", text: "Does she like sports?" },
        { speaker: "Mai", text: "Yes. She is very active." }
      ],
      qs: [
        { q: "What is Mai's friend like?", a: "Sociable and humorous", c: ["Shy and quiet", "Sociable and humorous", "Reserved and serious", "Lazy and slow"] },
        { q: "What does she look like?", a: "She has short hair", c: ["She wears glasses", "She has short hair", "She is very tall", "She has long black hair"] },
        { q: "Does she like sports?", a: "Yes", c: ["Yes", "No", "Not mentioned", "She hates sports"] },
        { q: "Who is active?", a: "Mai's friend", c: ["Hoa", "Mai", "Mai's friend", "Their teacher"] }
      ]
    },
    {
      lines: [
        { speaker: "Ben", text: "Is there a bookstore near here?" },
        { speaker: "Shopkeeper", text: "Yes. Go straight and turn left at the traffic light." },
        { speaker: "Ben", text: "Is the park far from here?" },
        { speaker: "Shopkeeper", text: "No. It is only five minutes on foot." }
      ],
      qs: [
        { q: "What does Ben want to find?", a: "A bookstore", c: ["A bakery", "A bookstore", "A hospital", "A bank"] },
        { q: "Where should Ben turn?", a: "Left at the traffic light", c: ["Right at the corner", "Left at the traffic light", "At the park", "At the bakery"] },
        { q: "How far is the park?", a: "Five minutes on foot", c: ["Ten kilometres", "Five minutes on foot", "Very far", "One hour by bus"] },
        { q: "Who gives directions?", a: "The shopkeeper", c: ["Ben", "A policeman", "The shopkeeper", "A teacher"] }
      ]
    },
    {
      lines: [
        { speaker: "Guide", text: "Welcome to Ha Long Bay." },
        { speaker: "Tourist", text: "The landscape here is breathtaking!" },
        { speaker: "Guide", text: "Yes. We will visit a cave after lunch." },
        { speaker: "Tourist", text: "Can we see the waterfall too?" },
        { speaker: "Guide", text: "Sure. It is spectacular in the rainy season." }
      ],
      qs: [
        { q: "Where are they?", a: "Ha Long Bay", c: ["Da Lat", "Ha Long Bay", "Hoi An", "Sa Pa"] },
        { q: "What will they visit after lunch?", a: "A cave", c: ["A desert", "A cave", "A museum", "A stadium"] },
        { q: "How is the landscape?", a: "Breathtaking", c: ["Boring", "Breathtaking", "Polluted", "Empty"] },
        { q: "When is the waterfall spectacular?", a: "In the rainy season", c: ["In winter", "In the rainy season", "At night", "Never"] }
      ]
    },
    {
      lines: [
        { speaker: "Lan", text: "Do you like Tet holiday?" },
        { speaker: "Minh", text: "Yes. I love apricot blossom in the South." },
        { speaker: "Lan", text: "We watch the lion dance every year." },
        { speaker: "Minh", text: "My family enjoys reunion dinner together." }
      ],
      qs: [
        { q: "What does Minh love in the South?", a: "Apricot blossom", c: ["Peach blossom", "Apricot blossom", "Snow", "Fireworks only"] },
        { q: "What do they watch every year?", a: "The lion dance", c: ["A football match", "The lion dance", "A quiz show", "A documentary"] },
        { q: "What does Minh's family enjoy?", a: "Reunion dinner", c: ["Shopping", "Reunion dinner", "Travelling abroad", "Camping"] },
        { q: "Which holiday are they talking about?", a: "Tet", c: ["Christmas", "Tet", "Mid-Autumn", "Summer holiday"] }
      ]
    },
    {
      lines: [
        { speaker: "Dad", text: "Turn down the TV, please." },
        { speaker: "Son", text: "But I am watching a documentary about animals." },
        { speaker: "Dad", text: "OK. What channel is it on?" },
        { speaker: "Son", text: "Channel seven. It is very interesting." }
      ],
      qs: [
        { q: "What is the son watching?", a: "A documentary", c: ["A cartoon", "A documentary", "A quiz show", "The news only"] },
        { q: "Which channel is it on?", a: "Channel seven", c: ["Channel three", "Channel seven", "Channel nine", "Channel one"] },
        { q: "What does Dad ask at first?", a: "Turn down the TV", c: ["Change the channel", "Turn down the TV", "Turn off the light", "Go to bed"] },
        { q: "How does the son feel about the programme?", a: "It is interesting", c: ["It is boring", "It is interesting", "It is scary", "It is too long"] }
      ]
    },
    {
      lines: [
        { speaker: "Coach", text: "Our team needs more practice before the competition." },
        { speaker: "Player", text: "Should we train every afternoon?" },
        { speaker: "Coach", text: "Yes. The referee will check the rules carefully." },
        { speaker: "Player", text: "Many spectators will come on Sunday." }
      ],
      qs: [
        { q: "What is coming soon?", a: "A competition", c: ["A holiday", "A competition", "A exam", "A concert"] },
        { q: "When will spectators come?", a: "On Sunday", c: ["On Monday", "On Sunday", "Every day", "Never"] },
        { q: "Who checks the rules?", a: "The referee", c: ["The coach", "The referee", "The spectators", "The players"] },
        { q: "What does the team need?", a: "More practice", c: ["More money", "More practice", "New uniforms", "A new coach"] }
      ]
    },
    {
      lines: [
        { speaker: "Anna", text: "London is a busy metropolis." },
        { speaker: "Binh", text: "Is it crowded in the city centre?" },
        { speaker: "Anna", text: "Yes, but the suburbs are quieter." },
        { speaker: "Binh", text: "I want to visit a famous landmark there." }
      ],
      qs: [
        { q: "What kind of city is London?", a: "A busy metropolis", c: ["A small village", "A busy metropolis", "A desert town", "A quiet suburb"] },
        { q: "Where is it quieter?", a: "In the suburbs", c: ["In the city centre", "In the suburbs", "In the skyscraper", "Nowhere"] },
        { q: "What does Binh want to visit?", a: "A famous landmark", c: ["A bakery", "A famous landmark", "A factory", "A farm"] },
        { q: "Is the city centre crowded?", a: "Yes", c: ["Yes", "No", "Not mentioned", "Only at night"] }
      ]
    },
    {
      lines: [
        { speaker: "Designer", text: "Future houses will have solar panels on the roof." },
        { speaker: "Student", text: "Will robots help us at home?" },
        { speaker: "Designer", text: "Yes. Smart homes will be more automatic." },
        { speaker: "Student", text: "That sounds modern and spacious!" }
      ],
      qs: [
        { q: "What will future houses have?", a: "Solar panels", c: ["More stairs", "Solar panels", "Small kitchens", "No windows"] },
        { q: "Who will help at home?", a: "Robots", c: ["Teachers", "Robots", "Referees", "Tourists"] },
        { q: "How will smart homes be?", a: "More automatic", c: ["Smaller", "More automatic", "Darker", "Older"] },
        { q: "Where are the solar panels?", a: "On the roof", c: ["In the kitchen", "On the roof", "In the garden", "Under the bed"] }
      ]
    },
    {
      lines: [
        { speaker: "Leader", text: "We should recycle paper and plastic every week." },
        { speaker: "Member", text: "How can we reduce pollution?" },
        { speaker: "Leader", text: "Use renewable energy and conserve water." },
        { speaker: "Member", text: "That is a sustainable lifestyle." }
      ],
      qs: [
        { q: "What should they recycle?", a: "Paper and plastic", c: ["Food only", "Paper and plastic", "Clothes only", "Nothing"] },
        { q: "What energy should they use?", a: "Renewable energy", c: ["Coal only", "Renewable energy", "More plastic", "Firewood"] },
        { q: "What kind of lifestyle is it?", a: "Sustainable", c: ["Expensive", "Sustainable", "Dangerous", "Boring"] },
        { q: "What does the member ask about?", a: "Reducing pollution", c: ["Cooking", "Reducing pollution", "Sports", "Films"] }
      ]
    },
    {
      lines: [
        { speaker: "Engineer", text: "This humanoid robot can operate simple tasks." },
        { speaker: "Reporter", text: "Does it use sensors to move?" },
        { speaker: "Engineer", text: "Yes. Artificial intelligence helps it learn." },
        { speaker: "Reporter", text: "What an amazing invention!" }
      ],
      qs: [
        { q: "What type of robot is it?", a: "A humanoid robot", c: ["A toy car", "A humanoid robot", "A washing machine", "A bicycle"] },
        { q: "What helps it learn?", a: "Artificial intelligence", c: ["Magic", "Artificial intelligence", "Rain", "Books only"] },
        { q: "What does it use to move?", a: "Sensors", c: ["Wheels only", "Sensors", "Ropes", "Nothing"] },
        { q: "Who is asking questions?", a: "A reporter", c: ["A teacher", "A reporter", "A coach", "A tourist"] }
      ]
    }
  ].map((item, idx) => ({
    ...item,
    title: `Hội thoại Unit ${idx + 1} · Lớp ${g}`
  }));
}

function pronId(unit) {
  return `g${unit.grade}_u${unit.chapterIndex}_pronunciation`;
}

function listenId(unit) {
  return `g${unit.grade}_u${unit.chapterIndex}_listening`;
}

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildPronSkill(unit, topic) {
  const id = pronId(unit);
  const topicName = unit.chapter.split(": ")[1] || unit.chapter;
  return {
    id,
    title: `Unit ${unit.chapterIndex} · Phát âm`,
    grade: unit.grade,
    book: unit.book,
    chapter: unit.chapter,
    chapterIndex: unit.chapterIndex,
    lessonNo: 11,
    domain: "Pronunciation",
    skillType: "pronunciation",
    grammar: "pronunciation",
    level: 1,
    prerequisite: [],
    description: `${topic.focus} — luyện phát âm theo chủ đề ${topicName}.`,
    formula: topic.focus,
    visualization: "pronunciation"
  };
}

function buildListenSkill(unit) {
  const id = listenId(unit);
  const topicName = unit.chapter.split(": ")[1] || unit.chapter;
  return {
    id,
    title: `Unit ${unit.chapterIndex} · Kỹ năng nghe`,
    grade: unit.grade,
    book: unit.book,
    chapter: unit.chapter,
    chapterIndex: unit.chapterIndex,
    lessonNo: 12,
    domain: "Listening",
    skillType: "listening",
    grammar: "listening",
    level: 1,
    prerequisite: [],
    description: `Nghe hội thoại ngắn và trả lời câu hỏi về ${topicName}.`,
    formula: "Nghe → hiểu ý chính & chi tiết",
    visualization: "listening"
  };
}

function buildPronLesson(unit, topic) {
  const id = pronId(unit);
  return {
    id,
    title: `Unit ${unit.chapterIndex} · Phát âm`,
    skill: id,
    chapter: unit.chapter,
    source: SOURCE,
    xp: 55,
    steps: [
      {
        type: "intro",
        title: "Mục tiêu bài học",
        content: `Luyện ${topic.focus.toLowerCase()} qua ví dụ trong chủ đề Unit.`
      },
      {
        type: "pronunciation",
        title: "Điểm phát âm trọng tâm",
        content: "Nghe (nhấn từ) và lặp lại theo hướng dẫn.",
        focus: topic.focus,
        points: topic.points,
        pairs: topic.pairs,
        examples: topic.examples
      },
      {
        type: "example",
        title: "Lỗi thường gặp",
        content: "Học sinh Việt Nam hay nhầm âm gần giống — tập phân biệt.",
        example: {
          correct: topic.pairs[0] ? `Phân biệt: ${topic.pairs[0].a} / ${topic.pairs[0].b}` : topic.examples[0]?.word || topic.focus,
          wrong: topic.pairs[0] ? `Nhầm ${topic.pairs[0].a} với ${topic.pairs[0].b}` : "Bỏ qua trọng âm hoặc nối âm"
        }
      },
      {
        type: "summary",
        title: "Ghi nhớ nhanh",
        content: topic.points[0] || topic.focus
      }
    ]
  };
}

function buildListenLesson(unit, pack) {
  const id = listenId(unit);
  return {
    id,
    title: `Unit ${unit.chapterIndex} · Kỹ năng nghe`,
    skill: id,
    chapter: unit.chapter,
    source: SOURCE,
    xp: 55,
    steps: [
      {
        type: "intro",
        title: "Mục tiêu bài học",
        content: "Nghe đoạn hội thoại ngắn, nắm ý chính và chi tiết quan trọng."
      },
      {
        type: "listening",
        title: "Nghe hội thoại",
        content: "Nghe 2–3 lần trước khi trả lời. Có thể bật transcript nếu cần.",
        script: pack.lines,
        showTranscript: true
      },
      {
        type: "example",
        title: "Chiến lược nghe",
        content: "Đọc câu hỏi trước, nghe và ghi nhớ từ khóa (thời gian, địa điểm, tên).",
        example: {
          correct: "Nghe từ khóa: next to the library, nine fifteen",
          wrong: "Nghe lướt một lần rồi đoán đáp án"
        }
      },
      {
        type: "summary",
        title: "Ghi nhớ nhanh",
        content: "Nghe nhiều lần · chú ý từ khóa · kiểm tra transcript"
      }
    ]
  };
}

function buildPronQuestions(unit, topic) {
  const id = pronId(unit);
  const pair = topic.pairs[0];
  const ex = topic.examples[0];
  const stressWord = ex?.word?.split(" ")[0] || "teacher";
  const stressAnswer = ex?.stress?.split("-")[0]?.replace(/[^A-Za-z]/g, "") || stressWord.toUpperCase().slice(0, 3);

  return [
    {
      id: `q_${id}_1`,
      skill: id,
      grammar: "pronunciation",
      type: "multiple_choice",
      question: pair
        ? `Trong cặp "${pair.a}" / "${pair.b}", từ nào thường có âm ngắn hơn?`
        : `Trọng âm đúng của "${stressWord}"?`,
      choices: pair
        ? shuffle([pair.a, pair.b, "Cả hai giống nhau", "Không có khác biệt"])
        : shuffle([ex?.stress || "TEA-cher", "tea-CHER", "teach-ER", "TEACH-er"]),
      answer: pair ? pair.a : ex?.stress || "TEA-cher",
      hint: topic.points[0]
    },
    {
      id: `q_${id}_2`,
      skill: id,
      grammar: "pronunciation",
      type: "multiple_choice",
      question: `Chủ đề phát âm của bài này?`,
      choices: shuffle([topic.focus, "Thì quá khứ đơn", "Mạo từ a/an/the", "So sánh hơn"]),
      answer: topic.focus,
      hint: topic.focus
    },
    {
      id: `q_${id}_3`,
      skill: id,
      grammar: "pronunciation",
      type: "input",
      question: pair ? `Viết từ tiếng Anh (ngắn hơn /ɪ/): ${pair.b} là dài, còn ___ ?` : `Viết từ ví dụ: ${ex?.word || "teacher"}`,
      answer: pair ? pair.a : stressWord,
      hint: pair ? `Ngắn: ${pair.a}` : ex?.word
    },
    {
      id: `q_${id}_4`,
      skill: id,
      grammar: "pronunciation",
      type: "multiple_choice",
      question: `Mẹo luyện phát âm phù hợp nhất?`,
      choices: shuffle([
        "Nghe và lặp lại từng âm, ghi âm so sánh",
        "Chỉ đọc im lặng không nghe",
        "Đọc nhanh bỏ qua trọng âm",
        "Dùng tiếng Việt thay âm khó"
      ]),
      answer: "Nghe và lặp lại từng âm, ghi âm so sánh",
      hint: "Lặp lại và so sánh với bản mẫu."
    }
  ];
}

function buildListenQuestions(unit, pack) {
  const id = listenId(unit);
  const [q1, q2, q3, q4] = pack.qs;

  return [
    {
      id: `q_${id}_1`,
      skill: id,
      grammar: "listening",
      type: "listening",
      question: q1.q,
      listenScript: pack.lines,
      choices: shuffle(q1.c),
      answer: q1.a,
      hint: "Nghe lại và chú ý từ khóa trong câu hỏi."
    },
    {
      id: `q_${id}_2`,
      skill: id,
      grammar: "listening",
      type: "listening",
      question: q2.q,
      listenScript: pack.lines,
      choices: shuffle(q2.c),
      answer: q2.a,
      hint: "Có thể nghe lại nhiều lần."
    },
    {
      id: `q_${id}_3`,
      skill: id,
      grammar: "listening",
      type: "input",
      question: q3.q,
      answer: q3.a,
      hint: "Trả lời ngắn gọn theo hội thoại."
    },
    {
      id: `q_${id}_4`,
      skill: id,
      grammar: "listening",
      type: "multiple_choice",
      question: q4.q,
      choices: shuffle(q4.c),
      answer: q4.a,
      hint: "Ai nói / ai làm gì trong đoạn hội thoại?"
    }
  ];
}

function merge() {
  const units = loadUnits();
  const pronIds = new Set(units.map(pronId));
  const listenIds = new Set(units.map(listenId));

  const skills = JSON.parse(fs.readFileSync(path.join(dataDir, "skills.json"), "utf8"))
    .filter((s) => !pronIds.has(s.id) && !listenIds.has(s.id));
  const lessons = JSON.parse(fs.readFileSync(path.join(dataDir, "lessons.json"), "utf8"))
    .filter((l) => !pronIds.has(l.id) && !listenIds.has(l.id));
  const questions = JSON.parse(fs.readFileSync(path.join(dataDir, "questions.json"), "utf8"))
    .filter((q) => !pronIds.has(q.skill) && !listenIds.has(q.skill));

  const listenCache = new Map();
  const pronSkills = [];
  const listenSkills = [];
  const pronLessons = [];
  const listenLessons = [];
  const pronQuestions = [];
  const listenQuestions = [];

  units.forEach((unit) => {
    if (!listenCache.has(unit.grade)) {
      listenCache.set(unit.grade, listeningByGrade(unit.grade));
    }
    const listenPacks = listenCache.get(unit.grade);
    const topic = PRON_TOPICS[(unit.chapterIndex - 1) % PRON_TOPICS.length];
    const listenPack = listenPacks[(unit.chapterIndex - 1) % listenPacks.length];

    pronSkills.push(buildPronSkill(unit, topic));
    listenSkills.push(buildListenSkill(unit));
    pronLessons.push(buildPronLesson(unit, topic));
    listenLessons.push(buildListenLesson(unit, listenPack));
    pronQuestions.push(...buildPronQuestions(unit, topic));
    listenQuestions.push(...buildListenQuestions(unit, listenPack));
  });

  fs.writeFileSync(
    path.join(dataDir, "skills.json"),
    JSON.stringify([...skills, ...pronSkills, ...listenSkills], null, 2) + "\n"
  );
  fs.writeFileSync(
    path.join(dataDir, "lessons.json"),
    JSON.stringify([...lessons, ...pronLessons, ...listenLessons], null, 2) + "\n"
  );
  fs.writeFileSync(
    path.join(dataDir, "questions.json"),
    JSON.stringify([...questions, ...pronQuestions, ...listenQuestions], null, 2) + "\n"
  );

  console.log("Units:", units.length);
  console.log("Pronunciation skills:", pronSkills.length);
  console.log("Listening skills:", listenSkills.length);
  console.log("New questions:", pronQuestions.length + listenQuestions.length);
  console.log("Total skills:", skills.length + pronSkills.length + listenSkills.length);
  console.log("Total questions:", questions.length + pronQuestions.length + listenQuestions.length);
}

merge();
