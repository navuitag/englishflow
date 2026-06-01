#!/usr/bin/env node
/**
 * Generate full Grade 3 Global Success program (20 Units × 4 skill types).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const SOURCE =
  "Bám sát SGK Tiếng Anh 3 – Kết nối tri thức với cuộc sống (Global Success).";

const PRON_TOPICS = [
  { focus: "Âm /h/ trong hello", points: ["/h/ trong hello, hi, how", "Thổi hơi nhẹ từ cổ họng"], pairs: [{ a: "hello", b: "ello", note: "h vs silent" }], examples: [{ word: "hello", stress: "hel-LO", note: "/həˈləʊ/" }] },
  { focus: "Âm /n/ trong name", points: ["/n/ trong name, nine, nice", "Đầu lưỡi chạm vòm miệng"], pairs: [{ a: "name", b: "mame", note: "n vs m" }], examples: [{ word: "name", stress: "name", note: "/neɪm/" }] },
  { focus: "Âm /f/ trong friend", points: ["/f/ trong friend, fine, father", "Môi dưới chạm răng trên"], pairs: [], examples: [{ word: "friend", stress: "friend", note: "/frend/" }] },
  { focus: "Âm /b/ và /p/ (body)", points: ["/b/ trong body, big, bed", "/p/ trong pen, pencil, please"], pairs: [{ a: "body", b: "pody", note: "b vs p" }], examples: [{ word: "body", stress: "BO-dy", note: "/ˈbɒdi/" }] },
  { focus: "Âm /ŋ/ trong reading", points: ["/ŋ/ trong reading, swimming, running", "Mũi rung khi kết thúc -ing"], pairs: [], examples: [{ word: "reading", stress: "READ-ing", note: "/ˈriːdɪŋ/" }] },
  { focus: "Âm /l/ trong library", points: ["/l/ trong library, classroom, school", "Đầu lưỡi chạm vòm miệng"], pairs: [{ a: "library", b: "ribrary", note: "l vs r" }], examples: [{ word: "library", stress: "LI-brary", note: "/ˈlaɪbrəri/" }] },
  { focus: "Âm /ʃ/ trong instruction", points: ["/ʃ/ trong sit, stand, open (s clusters)", "Phát âm rõ đầu câu mệnh lệnh"], pairs: [], examples: [{ word: "stand", stress: "stand", note: "/stænd/" }] },
  { focus: "Âm /p/ và /b/ (pen/book)", points: ["/p/ trong pen, pencil, please", "/b/ trong book, bag, board"], pairs: [{ a: "pen", b: "ben", note: "p vs b" }], examples: [{ word: "pen", stress: "pen", note: "/pen/" }] },
  { focus: "Nguyên âm /ʌ/ và /æ/ (colours)", points: ["/ʌ/ trong colour, cup, sun", "/æ/ trong black, hat, cat"], pairs: [{ a: "cat", b: "cut", note: "æ vs ʌ" }], examples: [{ word: "colour", stress: "CO-lour", note: "/ˈkʌlə/" }] },
  { focus: "Âm /ŋ/ trong doing", points: ["/ŋ/ trong doing, playing, running", "Nghe rõ -ing cuối từ"], pairs: [], examples: [{ word: "doing", stress: "DO-ing", note: "/ˈduːɪŋ/" }] },
  { focus: "Âm /ð/ trong father", points: ["/ð/ trong father, mother, the", "Lưỡi giữa hai răng"], pairs: [{ a: "father", b: "fader", note: "th vs d" }], examples: [{ word: "father", stress: "FA-ther", note: "/ˈfɑːðə/" }] },
  { focus: "Âm /dʒ/ trong job", points: ["/dʒ/ trong job, doctor, teacher", "Giống âm ch trong tiếng Việt"], pairs: [], examples: [{ word: "doctor", stress: "DOC-tor", note: "/ˈdɒktə/" }] },
  { focus: "Âm /ð/ trong there", points: ["/ð/ trong there, the, this", "Lưỡi giữa hai răng, thổi hơi"], pairs: [{ a: "there", b: "dare", note: "th vs d" }], examples: [{ word: "there", stress: "there", note: "/ðeə/" }] },
  { focus: "Âm /e/ trong bed", points: ["/e/ trong bed, bedroom, desk", "Miệng mở vừa phải"], pairs: [], examples: [{ word: "bed", stress: "bed", note: "/bed/" }] },
  { focus: "Âm /p/ và /f/ (please/pass)", points: ["/p/ trong pass, please, plate", "/f/ trong fork, food, fish"], pairs: [], examples: [{ word: "please", stress: "please", note: "/pliːz/" }] },
  { focus: "Âm /z/ trong cats", points: ["/z/ trong cats, dogs, rabbits", "Rung thanh quản ở cuối từ số nhiều"], pairs: [{ a: "cats", b: "cat", note: "z vs silent" }], examples: [{ word: "cats", stress: "cats", note: "/kæts/" }] },
  { focus: "Âm /z/ trong these", points: ["/z/ trong these, toys, whose", "Rung thanh quản"], pairs: [{ a: "these", b: "this", note: "z vs s" }], examples: [{ word: "these", stress: "these", note: "/ðiːz/" }] },
  { focus: "Âm /ɪ/ và /iː/ (reading)", points: ["/ɪ/ trong is, reading, swimming", "/iː/ trong see, read, he"], pairs: [{ a: "sit", b: "seat", note: "ɪ vs iː" }], examples: [{ word: "reading", stress: "READ-ing", note: "/ˈriːdɪŋ/" }] },
  { focus: "Âm /aɪ/ trong kite", points: ["/aɪ/ trong kite, cycling, flying", "Kết hợp âm a + i"], pairs: [], examples: [{ word: "kite", stress: "kite", note: "/kaɪt/" }] },
  { focus: "Âm /e/ trong elephant", points: ["/e/ trong elephant, pen, red", "Miệng mở vừa phải"], pairs: [{ a: "elephant", b: "alaphant", note: "e vs a" }], examples: [{ word: "elephant", stress: "E-le-phant", note: "/ˈelɪfənt/" }] }
];

/** @type {Array<object>} */
const UNITS = [
  {
    chapterIndex: 1, chapter: "Unit 1: Hello", book: "Sách giáo khoa",
    grammar: { id: "hello", title: "Hello/Hi; How are you?", formula: "Hello/Hi · How are you? · I'm fine, thank you", description: "Chào hỏi và hỏi thăm sức khỏe với Hello, Hi và How are you?" },
    words: [
      { en: "hello", vi: "xin chào", example: "Hello! How are you?" },
      { en: "hi", vi: "chào", example: "Hi! I'm fine." },
      { en: "fine", vi: "khỏe/tốt", example: "I'm fine, thank you." },
      { en: "thank you", vi: "cảm ơn", example: "Thank you!" },
      { en: "goodbye", vi: "tạm biệt", example: "Goodbye!" },
      { en: "morning", vi: "buổi sáng", example: "Good morning!" },
      { en: "how", vi: "như thế nào", example: "How are you?" }
    ],
    listen: {
      lines: [
        { speaker: "Ann", text: "Hello! How are you?" },
        { speaker: "Ben", text: "Hi! I'm fine, thank you." },
        { speaker: "Ann", text: "Goodbye!" }
      ],
      qs: [
        { q: "What does Ann say first?", a: "Hello", c: ["Goodbye", "Hello", "Thank you", "Fine"] },
        { q: "How is Ben?", a: "Fine", c: ["Sad", "Fine", "Old", "Big"] },
        { q: "What does Ben say?", a: "I'm fine, thank you", c: ["I'm sad", "I'm fine, thank you", "Good morning", "See you"] },
        { q: "What do they say at the end?", a: "Goodbye", c: ["Hello", "Goodbye", "How are you?", "Thank you"] }
      ]
    }
  },
  {
    chapterIndex: 2, chapter: "Unit 2: Our names", book: "Sách giáo khoa",
    grammar: { id: "our_names", title: "What's your name? How old are you?", formula: "What's your name? · My name is... · How old are you? · I'm + number", description: "Hỏi và trả lời tên và tuổi." },
    words: [
      { en: "name", vi: "tên", example: "What's your name?" },
      { en: "old", vi: "tuổi", example: "How old are you?" },
      { en: "year", vi: "năm", example: "I'm eight years old." },
      { en: "eight", vi: "số tám", example: "I'm eight." },
      { en: "nine", vi: "số chín", example: "I'm nine years old." },
      { en: "ten", vi: "số mười", example: "I'm ten." },
      { en: "what", vi: "gì", example: "What's your name?" }
    ],
    listen: {
      lines: [
        { speaker: "Teacher", text: "What's your name?" },
        { speaker: "Mai", text: "My name is Mai." },
        { speaker: "Teacher", text: "How old are you?" }
      ],
      qs: [
        { q: "What does the teacher ask first?", a: "What's your name?", c: ["How old are you?", "What's your name?", "How are you?", "Where are you?"] },
        { q: "What is the girl's name?", a: "Mai", c: ["Ann", "Mai", "Ben", "Tom"] },
        { q: "What does the teacher ask next?", a: "How old are you?", c: ["What's your name?", "How old are you?", "How are you?", "What colour?"] },
        { q: "What does Mai say?", a: "My name is Mai", c: ["I'm fine", "My name is Mai", "I'm eight", "Hello"] }
      ]
    }
  },
  {
    chapterIndex: 3, chapter: "Unit 3: Our friends", book: "Sách giáo khoa",
    grammar: { id: "our_friends", title: "This is my friend / Who is he/she?", formula: "This is my friend · Who is he/she? · He/She is...", description: "Giới thiệu bạn và hỏi ai là ai." },
    words: [
      { en: "friend", vi: "bạn", example: "This is my friend." },
      { en: "he", vi: "anh/cậu ấy", example: "Who is he?" },
      { en: "she", vi: "cô/cậu ấy (nữ)", example: "Who is she?" },
      { en: "boy", vi: "con trai", example: "He is a boy." },
      { en: "girl", vi: "con gái", example: "She is a girl." },
      { en: "who", vi: "ai", example: "Who is he?" },
      { en: "this", vi: "đây/này", example: "This is my friend." }
    ],
    listen: {
      lines: [
        { speaker: "Tom", text: "This is my friend, Ann." },
        { speaker: "Ben", text: "Who is she?" },
        { speaker: "Tom", text: "She is my classmate." }
      ],
      qs: [
        { q: "Who does Tom introduce?", a: "Ann", c: ["Ben", "Ann", "Tom", "Mai"] },
        { q: "What does Ben ask?", a: "Who is she?", c: ["How are you?", "Who is she?", "What's your name?", "How old are you?"] },
        { q: "Who is Ann?", a: "Tom's classmate", c: ["Tom's teacher", "Tom's classmate", "Tom's brother", "Tom's sister"] },
        { q: "What does Tom say first?", a: "This is my friend", c: ["Goodbye", "This is my friend", "Hello", "Thank you"] }
      ]
    }
  },
  {
    chapterIndex: 4, chapter: "Unit 4: Our bodies", book: "Sách giáo khoa",
    grammar: { id: "our_bodies", title: "I have two eyes / Touch your nose", formula: "I have + number + body part · Touch your + body part", description: "Nói về bộ phận cơ thể và mệnh lệnh chạm vào bộ phận." },
    words: [
      { en: "eye", vi: "mắt", example: "I have two eyes." },
      { en: "nose", vi: "mũi", example: "Touch your nose." },
      { en: "ear", vi: "tai", example: "I have two ears." },
      { en: "mouth", vi: "miệng", example: "Touch your mouth." },
      { en: "hand", vi: "tay", example: "I have two hands." },
      { en: "foot", vi: "bàn chân", example: "Touch your foot." },
      { en: "body", vi: "cơ thể", example: "This is my body." }
    ],
    listen: {
      lines: [
        { speaker: "Teacher", text: "I have two eyes." },
        { speaker: "Teacher", text: "Touch your nose." },
        { speaker: "Children", text: "Touch your mouth." }
      ],
      qs: [
        { q: "How many eyes?", a: "Two", c: ["One", "Two", "Three", "Four"] },
        { q: "What does the teacher say to do?", a: "Touch your nose", c: ["Open your book", "Touch your nose", "Stand up", "Sit down"] },
        { q: "What do the children touch?", a: "Mouth", c: ["Nose", "Mouth", "Ear", "Foot"] },
        { q: "What body part is first?", a: "Eyes", c: ["Nose", "Eyes", "Hands", "Feet"] }
      ]
    }
  },
  {
    chapterIndex: 5, chapter: "Unit 5: My hobbies", book: "Sách giáo khoa",
    grammar: { id: "my_hobbies", title: "What's your hobby? I like + V-ing", formula: "What's your hobby? · I like + V-ing", description: "Hỏi và trả lời sở thích với I like + V-ing." },
    words: [
      { en: "hobby", vi: "sở thích", example: "What's your hobby?" },
      { en: "reading", vi: "đọc sách", example: "I like reading." },
      { en: "swimming", vi: "bơi lội", example: "I like swimming." },
      { en: "drawing", vi: "vẽ", example: "I like drawing." },
      { en: "singing", vi: "hát", example: "I like singing." },
      { en: "dancing", vi: "nhảy múa", example: "I like dancing." },
      { en: "like", vi: "thích", example: "I like reading." }
    ],
    listen: {
      lines: [
        { speaker: "Ann", text: "What's your hobby?" },
        { speaker: "Ben", text: "I like reading." },
        { speaker: "Ann", text: "I like swimming." }
      ],
      qs: [
        { q: "What does Ann ask?", a: "What's your hobby?", c: ["How are you?", "What's your hobby?", "What's your name?", "How old are you?"] },
        { q: "What does Ben like?", a: "Reading", c: ["Swimming", "Reading", "Drawing", "Singing"] },
        { q: "What does Ann like?", a: "Swimming", c: ["Reading", "Swimming", "Dancing", "Drawing"] },
        { q: "What structure do they use?", a: "I like + V-ing", c: ["I am + V-ing", "I like + V-ing", "I have + N", "This is my"] }
      ]
    }
  },
  {
    chapterIndex: 6, chapter: "Unit 6: Our school", book: "Sách giáo khoa",
    grammar: { id: "our_school", title: "Is this our classroom? Let's go to the library", formula: "Is this our + room? · Let's go to the + place", description: "Hỏi về phòng học và đề nghị đi đến nơi trong trường." },
    words: [
      { en: "school", vi: "trường học", example: "This is our school." },
      { en: "classroom", vi: "lớp học", example: "Is this our classroom?" },
      { en: "library", vi: "thư viện", example: "Let's go to the library." },
      { en: "playground", vi: "sân chơi", example: "Let's go to the playground." },
      { en: "canteen", vi: "căng tin", example: "The canteen is big." },
      { en: "our", vi: "của chúng ta", example: "This is our classroom." },
      { en: "go", vi: "đi", example: "Let's go to the library." }
    ],
    listen: {
      lines: [
        { speaker: "Teacher", text: "Is this our classroom?" },
        { speaker: "Students", text: "Yes, it is." },
        { speaker: "Teacher", text: "Let's go to the library." }
      ],
      qs: [
        { q: "What does the teacher ask?", a: "Is this our classroom?", c: ["Where is the library?", "Is this our classroom?", "How are you?", "What's your name?"] },
        { q: "What do the students say?", a: "Yes, it is", c: ["No, it isn't", "Yes, it is", "Thank you", "Goodbye"] },
        { q: "Where do they go?", a: "The library", c: ["The canteen", "The library", "The playground", "Home"] },
        { q: "What phrase does the teacher use?", a: "Let's go to", c: ["I like", "Let's go to", "This is my", "How many"] }
      ]
    }
  },
  {
    chapterIndex: 7, chapter: "Unit 7: Classroom instructions", book: "Sách giáo khoa",
    grammar: { id: "classroom_instructions", title: "Sit down / Stand up / Open your book", formula: "Sit down · Stand up · Open your book · Close your book", description: "Hiểu và thực hiện mệnh lệnh trong lớp học." },
    words: [
      { en: "sit down", vi: "ngồi xuống", example: "Sit down, please." },
      { en: "stand up", vi: "đứng lên", example: "Stand up, please." },
      { en: "open", vi: "mở", example: "Open your book." },
      { en: "close", vi: "đóng", example: "Close your book." },
      { en: "listen", vi: "nghe", example: "Listen, please." },
      { en: "look", vi: "nhìn", example: "Look at the board." },
      { en: "please", vi: "làm ơn", example: "Sit down, please." }
    ],
    listen: {
      lines: [
        { speaker: "Teacher", text: "Sit down, please." },
        { speaker: "Teacher", text: "Open your book." },
        { speaker: "Teacher", text: "Stand up, please." }
      ],
      qs: [
        { q: "What does the teacher say first?", a: "Sit down", c: ["Stand up", "Sit down", "Close your book", "Goodbye"] },
        { q: "What should students do next?", a: "Open your book", c: ["Close your book", "Open your book", "Sit down", "Go home"] },
        { q: "What does the teacher say last?", a: "Stand up", c: ["Sit down", "Stand up", "Open your book", "Listen"] },
        { q: "Where are they?", a: "In the classroom", c: ["At home", "In the classroom", "At the zoo", "In the library"] }
      ]
    }
  },
  {
    chapterIndex: 8, chapter: "Unit 8: My school things", book: "Sách giáo khoa",
    grammar: { id: "school_things", title: "This is my pen / my/your", formula: "This is my + N · This is your + N", description: "Giới thiệu đồ dùng học tập với my và your." },
    words: [
      { en: "pen", vi: "bút mực", example: "This is my pen." },
      { en: "pencil", vi: "bút chì", example: "This is your pencil." },
      { en: "book", vi: "sách", example: "This is my book." },
      { en: "bag", vi: "cặp sách", example: "This is your bag." },
      { en: "ruler", vi: "thước kẻ", example: "This is my ruler." },
      { en: "my", vi: "của tôi", example: "This is my pen." },
      { en: "your", vi: "của bạn", example: "This is your book." }
    ],
    listen: {
      lines: [
        { speaker: "Mai", text: "This is my pen." },
        { speaker: "Tom", text: "This is your book." },
        { speaker: "Mai", text: "This is my bag." }
      ],
      qs: [
        { q: "What does Mai show first?", a: "Her pen", c: ["Her bag", "Her pen", "Tom's book", "Her ruler"] },
        { q: "Whose book is it?", a: "Mai's", c: ["Tom's", "Mai's", "Teacher's", "Nobody's"] },
        { q: "What does Mai show last?", a: "Her bag", c: ["Her pen", "Her bag", "Tom's pencil", "Her book"] },
        { q: "What words show ownership?", a: "My and your", c: ["He and she", "My and your", "This and that", "Is and are"] }
      ]
    }
  },
  {
    chapterIndex: 9, chapter: "Unit 9: Colours", book: "Sách giáo khoa",
    grammar: { id: "colours", title: "What colour is/are...? It's/They're + colour", formula: "What colour is the + N? · It's + colour · What colour are the + N? · They're + colour", description: "Hỏi và trả lời màu sắc của đồ vật." },
    words: [
      { en: "red", vi: "màu đỏ", example: "It's red." },
      { en: "blue", vi: "màu xanh dương", example: "The pen is blue." },
      { en: "green", vi: "màu xanh lá", example: "It's green." },
      { en: "yellow", vi: "màu vàng", example: "The bag is yellow." },
      { en: "black", vi: "màu đen", example: "They're black." },
      { en: "white", vi: "màu trắng", example: "It's white." },
      { en: "colour", vi: "màu sắc", example: "What colour is it?" }
    ],
    listen: {
      lines: [
        { speaker: "Teacher", text: "What colour is the pen?" },
        { speaker: "Student", text: "It's blue." },
        { speaker: "Teacher", text: "What colour are the books?" }
      ],
      qs: [
        { q: "What does the teacher ask about first?", a: "The pen", c: ["The bag", "The pen", "The books", "The ruler"] },
        { q: "What colour is the pen?", a: "Blue", c: ["Red", "Blue", "Green", "Yellow"] },
        { q: "What does the teacher ask about next?", a: "The books", c: ["The pen", "The books", "The bag", "The pencil"] },
        { q: "How do you answer for one thing?", a: "It's + colour", c: ["They're + colour", "It's + colour", "I like", "This is my"] }
      ]
    }
  },
  {
    chapterIndex: 10, chapter: "Unit 10: Break time activities", book: "Sách giáo khoa",
    grammar: { id: "breaktime", title: "What are you doing? I am + V-ing", formula: "What are you doing? · I am + V-ing · play football", description: "Hỏi và trả lời hành động đang diễn ra ở giờ ra chơi." },
    words: [
      { en: "play football", vi: "chơi bóng đá", example: "I am playing football." },
      { en: "skip", vi: "nhảy dây", example: "I am skipping." },
      { en: "run", vi: "chạy", example: "They are running." },
      { en: "jump", vi: "nhảy", example: "I am jumping." },
      { en: "break time", vi: "giờ ra chơi", example: "It's break time." },
      { en: "doing", vi: "đang làm", example: "What are you doing?" },
      { en: "playing", vi: "đang chơi", example: "I am playing." }
    ],
    listen: {
      lines: [
        { speaker: "Ann", text: "What are you doing?" },
        { speaker: "Ben", text: "I am playing football." },
        { speaker: "Ann", text: "I am skipping." }
      ],
      qs: [
        { q: "What does Ann ask?", a: "What are you doing?", c: ["What's your hobby?", "What are you doing?", "How are you?", "What's your name?"] },
        { q: "What is Ben doing?", a: "Playing football", c: ["Skipping", "Playing football", "Running", "Reading"] },
        { q: "What is Ann doing?", a: "Skipping", c: ["Playing football", "Skipping", "Jumping", "Drawing"] },
        { q: "When is it?", a: "Break time", c: ["Morning", "Break time", "Bedtime", "Class time"] }
      ]
    }
  },
  {
    chapterIndex: 11, chapter: "Unit 11: My family", book: "Sách giáo khoa",
    grammar: { id: "my_family", title: "This is my father / Who is he?", formula: "This is my + family member · Who is he/she?", description: "Giới thiệu thành viên gia đình và hỏi ai là ai." },
    words: [
      { en: "father", vi: "bố", example: "This is my father." },
      { en: "mother", vi: "mẹ", example: "This is my mother." },
      { en: "brother", vi: "anh/em trai", example: "This is my brother." },
      { en: "sister", vi: "chị/em gái", example: "This is my sister." },
      { en: "family", vi: "gia đình", example: "This is my family." },
      { en: "grandfather", vi: "ông", example: "This is my grandfather." },
      { en: "grandmother", vi: "bà", example: "This is my grandmother." }
    ],
    listen: {
      lines: [
        { speaker: "Mai", text: "This is my father." },
        { speaker: "Tom", text: "Who is he?" },
        { speaker: "Mai", text: "He is my father." }
      ],
      qs: [
        { q: "Who does Mai introduce?", a: "Her father", c: ["Her mother", "Her father", "Her brother", "Her sister"] },
        { q: "What does Tom ask?", a: "Who is he?", c: ["How are you?", "Who is he?", "What's your name?", "How old are you?"] },
        { q: "Who is he?", a: "Mai's father", c: ["Tom's father", "Mai's father", "Mai's brother", "Tom's friend"] },
        { q: "What phrase does Mai use?", a: "This is my", c: ["I like", "This is my", "Let's go", "Pass me"] }
      ]
    }
  },
  {
    chapterIndex: 12, chapter: "Unit 12: Jobs", book: "Sách giáo khoa",
    grammar: { id: "jobs", title: "What's his/her job? He/She is a doctor", formula: "What's his/her job? · He/She is a + job", description: "Hỏi và trả lời nghề nghiệp của người khác." },
    words: [
      { en: "doctor", vi: "bác sĩ", example: "He is a doctor." },
      { en: "teacher", vi: "giáo viên", example: "She is a teacher." },
      { en: "nurse", vi: "y tá", example: "She is a nurse." },
      { en: "driver", vi: "tài xế", example: "He is a driver." },
      { en: "farmer", vi: "nông dân", example: "He is a farmer." },
      { en: "job", vi: "nghề nghiệp", example: "What's his job?" },
      { en: "worker", vi: "công nhân", example: "He is a worker." }
    ],
    listen: {
      lines: [
        { speaker: "Ann", text: "What's his job?" },
        { speaker: "Ben", text: "He is a doctor." },
        { speaker: "Ann", text: "What's her job?" }
      ],
      qs: [
        { q: "What does Ann ask about first?", a: "His job", c: ["Her job", "His job", "His name", "Her name"] },
        { q: "What is his job?", a: "Doctor", c: ["Teacher", "Doctor", "Driver", "Farmer"] },
        { q: "What does Ann ask about next?", a: "Her job", c: ["His job", "Her job", "His name", "How old"] },
        { q: "What structure answers the job?", a: "He/She is a + job", c: ["I like + V-ing", "He/She is a + job", "This is my", "There is a"] }
      ]
    }
  },
  {
    chapterIndex: 13, chapter: "Unit 13: My house", book: "Sách giáo khoa",
    grammar: { id: "my_house", title: "There is/are + room; in/on prepositions", formula: "There is a + room · There are + rooms · in/on + place", description: "Mô tả phòng trong nhà và vị trí với in, on." },
    words: [
      { en: "house", vi: "ngôi nhà", example: "This is my house." },
      { en: "living room", vi: "phòng khách", example: "There is a living room." },
      { en: "kitchen", vi: "nhà bếp", example: "There is a kitchen." },
      { en: "bathroom", vi: "phòng tắm", example: "There is a bathroom." },
      { en: "garden", vi: "vườn", example: "There is a garden." },
      { en: "in", vi: "trong", example: "The cat is in the house." },
      { en: "on", vi: "trên", example: "The book is on the table." }
    ],
    listen: {
      lines: [
        { speaker: "Mum", text: "There is a living room." },
        { speaker: "Child", text: "There is a kitchen too." },
        { speaker: "Mum", text: "The cat is in the house." }
      ],
      qs: [
        { q: "What room is first?", a: "Living room", c: ["Kitchen", "Living room", "Bathroom", "Bedroom"] },
        { q: "What room is next?", a: "Kitchen", c: ["Living room", "Kitchen", "Garden", "Bathroom"] },
        { q: "Where is the cat?", a: "In the house", c: ["On the table", "In the house", "In the garden", "On the roof"] },
        { q: "What structure describes rooms?", a: "There is/are", c: ["I like", "There is/are", "This is my", "Let's go"] }
      ]
    }
  },
  {
    chapterIndex: 14, chapter: "Unit 14: My bedroom", book: "Sách giáo khoa",
    grammar: { id: "my_bedroom", title: "Where is my bed? It's in the bedroom", formula: "Where is my + N? · It's in the bedroom/on the...", description: "Hỏi và trả lời vị trí đồ vật trong phòng ngủ." },
    words: [
      { en: "bedroom", vi: "phòng ngủ", example: "It's in the bedroom." },
      { en: "bed", vi: "giường", example: "Where is my bed?" },
      { en: "desk", vi: "bàn học", example: "The desk is in the bedroom." },
      { en: "lamp", vi: "đèn", example: "The lamp is on the desk." },
      { en: "wardrobe", vi: "tủ quần áo", example: "The wardrobe is in the bedroom." },
      { en: "where", vi: "ở đâu", example: "Where is my bed?" },
      { en: "pillow", vi: "gối", example: "The pillow is on the bed." }
    ],
    listen: {
      lines: [
        { speaker: "Child", text: "Where is my bed?" },
        { speaker: "Mum", text: "It's in the bedroom." },
        { speaker: "Child", text: "Where is my lamp?" }
      ],
      qs: [
        { q: "What does the child ask about first?", a: "The bed", c: ["The lamp", "The bed", "The desk", "The wardrobe"] },
        { q: "Where is the bed?", a: "In the bedroom", c: ["On the desk", "In the bedroom", "In the kitchen", "On the table"] },
        { q: "What does the child ask about next?", a: "The lamp", c: ["The bed", "The lamp", "The desk", "The pillow"] },
        { q: "What question word is used?", a: "Where", c: ["What", "Where", "Who", "How"] }
      ]
    }
  },
  {
    chapterIndex: 15, chapter: "Unit 15: At the dining table", book: "Sách giáo khoa",
    grammar: { id: "dining_table", title: "Pass me the..., please / I like rice", formula: "Pass me the + N, please · I like + food", description: "Nhờ đưa đồ ăn trên bàn ăn và nói món ăn yêu thích." },
    words: [
      { en: "rice", vi: "cơm", example: "I like rice." },
      { en: "noodles", vi: "mì", example: "I like noodles." },
      { en: "fish", vi: "cá", example: "Pass me the fish, please." },
      { en: "meat", vi: "thịt", example: "I like meat." },
      { en: "vegetables", vi: "rau", example: "I like vegetables." },
      { en: "pass", vi: "đưa/trao", example: "Pass me the rice, please." },
      { en: "plate", vi: "đĩa", example: "Pass me the plate, please." }
    ],
    listen: {
      lines: [
        { speaker: "Mum", text: "Pass me the rice, please." },
        { speaker: "Child", text: "Here you are." },
        { speaker: "Child", text: "I like noodles." }
      ],
      qs: [
        { q: "What does Mum ask for?", a: "The rice", c: ["The fish", "The rice", "The meat", "The plate"] },
        { q: "What does the child say?", a: "Here you are", c: ["Thank you", "Here you are", "Please", "Goodbye"] },
        { q: "What does the child like?", a: "Noodles", c: ["Rice", "Noodles", "Fish", "Meat"] },
        { q: "Where are they?", a: "At the dining table", c: ["In the classroom", "At the dining table", "At the zoo", "In the bedroom"] }
      ]
    }
  },
  {
    chapterIndex: 16, chapter: "Unit 16: My pets", book: "Sách giáo khoa",
    grammar: { id: "my_pets", title: "Do you have any cats? How many rabbits do you have?", formula: "Do you have any + pets? · How many + pets do you have?", description: "Hỏi về vật nuôi và số lượng vật nuôi." },
    words: [
      { en: "cat", vi: "con mèo", example: "Do you have any cats?" },
      { en: "dog", vi: "con chó", example: "I have a dog." },
      { en: "rabbit", vi: "con thỏ", example: "How many rabbits do you have?" },
      { en: "bird", vi: "con chim", example: "I have two birds." },
      { en: "fish", vi: "con cá", example: "I have three fish." },
      { en: "pet", vi: "vật nuôi", example: "I love my pet." },
      { en: "any", vi: "có (câu hỏi)", example: "Do you have any cats?" }
    ],
    listen: {
      lines: [
        { speaker: "Ann", text: "Do you have any cats?" },
        { speaker: "Ben", text: "Yes, I have two cats." },
        { speaker: "Ann", text: "How many rabbits do you have?" }
      ],
      qs: [
        { q: "What does Ann ask about first?", a: "Cats", c: ["Dogs", "Cats", "Rabbits", "Birds"] },
        { q: "How many cats does Ben have?", a: "Two", c: ["One", "Two", "Three", "Four"] },
        { q: "What does Ann ask about next?", a: "Rabbits", c: ["Cats", "Rabbits", "Dogs", "Birds"] },
        { q: "What question asks about number?", a: "How many", c: ["How old", "How many", "How are", "What colour"] }
      ]
    }
  },
  {
    chapterIndex: 17, chapter: "Unit 17: Our toys", book: "Sách giáo khoa",
    grammar: { id: "our_toys", title: "These are my toys / Whose toy is this?", formula: "These are my toys · Whose + N + is this?", description: "Giới thiệu đồ chơi và hỏi đồ chơi của ai." },
    words: [
      { en: "toy", vi: "đồ chơi", example: "These are my toys." },
      { en: "doll", vi: "búp bê", example: "Whose doll is this?" },
      { en: "ball", vi: "quả bóng", example: "This is my ball." },
      { en: "car", vi: "xe hơi (đồ chơi)", example: "Whose car is this?" },
      { en: "robot", vi: "robot", example: "These are my robots." },
      { en: "whose", vi: "của ai", example: "Whose toy is this?" },
      { en: "these", vi: "những cái này", example: "These are my toys." }
    ],
    listen: {
      lines: [
        { speaker: "Mai", text: "These are my toys." },
        { speaker: "Tom", text: "Whose doll is this?" },
        { speaker: "Mai", text: "It's my doll." }
      ],
      qs: [
        { q: "What does Mai show?", a: "Her toys", c: ["Her books", "Her toys", "Her pets", "Her food"] },
        { q: "What does Tom ask?", a: "Whose doll is this?", c: ["How many dolls?", "Whose doll is this?", "What colour?", "Where is it?"] },
        { q: "Whose doll is it?", a: "Mai's", c: ["Tom's", "Mai's", "Teacher's", "Nobody's"] },
        { q: "What word introduces many things?", a: "These", c: ["This", "These", "Who", "Where"] }
      ]
    }
  },
  {
    chapterIndex: 18, chapter: "Unit 18: Playing and doing", book: "Sách giáo khoa",
    grammar: { id: "playing_doing", title: "She is reading / What is he doing?", formula: "She/He is + V-ing · What is he/she doing?", description: "Mô tả hành động đang diễn ra của người khác." },
    words: [
      { en: "reading", vi: "đang đọc", example: "She is reading." },
      { en: "writing", vi: "đang viết", example: "He is writing." },
      { en: "sleeping", vi: "đang ngủ", example: "She is sleeping." },
      { en: "eating", vi: "đang ăn", example: "He is eating." },
      { en: "watching TV", vi: "đang xem TV", example: "She is watching TV." },
      { en: "doing", vi: "đang làm", example: "What is he doing?" },
      { en: "playing", vi: "đang chơi", example: "He is playing." }
    ],
    listen: {
      lines: [
        { speaker: "Mum", text: "What is he doing?" },
        { speaker: "Child", text: "He is reading." },
        { speaker: "Mum", text: "She is writing." }
      ],
      qs: [
        { q: "What does Mum ask?", a: "What is he doing?", c: ["What's your hobby?", "What is he doing?", "How are you?", "Who is he?"] },
        { q: "What is he doing?", a: "Reading", c: ["Writing", "Reading", "Sleeping", "Eating"] },
        { q: "What is she doing?", a: "Writing", c: ["Reading", "Writing", "Playing", "Sleeping"] },
        { q: "What tense is used?", a: "Present continuous", c: ["Simple present", "Present continuous", "Past simple", "Future"] }
      ]
    }
  },
  {
    chapterIndex: 19, chapter: "Unit 19: Outdoor activities", book: "Sách giáo khoa",
    grammar: { id: "outdoor", title: "I like cycling / They are flying a kite", formula: "I like + activity · They are + V-ing + N", description: "Nói về hoạt động ngoài trời yêu thích và hành động đang diễn ra." },
    words: [
      { en: "cycling", vi: "đạp xe", example: "I like cycling." },
      { en: "kite", vi: "cánh diều", example: "They are flying a kite." },
      { en: "picnic", vi: "dã ngoại", example: "We have a picnic." },
      { en: "park", vi: "công viên", example: "We are in the park." },
      { en: "flying", vi: "đang thả", example: "They are flying a kite." },
      { en: "outdoor", vi: "ngoài trời", example: "I like outdoor activities." },
      { en: "running", vi: "đang chạy", example: "They are running in the park." }
    ],
    listen: {
      lines: [
        { speaker: "Ann", text: "I like cycling." },
        { speaker: "Ben", text: "They are flying a kite." },
        { speaker: "Ann", text: "We are in the park." }
      ],
      qs: [
        { q: "What does Ann like?", a: "Cycling", c: ["Running", "Cycling", "Swimming", "Reading"] },
        { q: "What are they doing?", a: "Flying a kite", c: ["Cycling", "Flying a kite", "Reading", "Sleeping"] },
        { q: "Where are they?", a: "In the park", c: ["At school", "In the park", "At home", "At the zoo"] },
        { q: "What structure does Ben use?", a: "They are + V-ing", c: ["I like + V-ing", "They are + V-ing", "This is my", "There is a"] }
      ]
    }
  },
  {
    chapterIndex: 20, chapter: "Unit 20: At the zoo", book: "Sách giáo khoa",
    grammar: { id: "at_the_zoo", title: "What is this? It's an elephant", formula: "What is this? · It's a/an + animal", description: "Hỏi và trả lời tên con vật ở sở thú." },
    words: [
      { en: "elephant", vi: "con voi", example: "It's an elephant." },
      { en: "tiger", vi: "con hổ", example: "It's a tiger." },
      { en: "monkey", vi: "con khỉ", example: "It's a monkey." },
      { en: "lion", vi: "sư tử", example: "It's a lion." },
      { en: "giraffe", vi: "hươu cao cổ", example: "It's a giraffe." },
      { en: "zoo", vi: "sở thú", example: "We are at the zoo." },
      { en: "animal", vi: "con vật", example: "What is this animal?" }
    ],
    listen: {
      lines: [
        { speaker: "Guide", text: "What is this?" },
        { speaker: "Child", text: "It's an elephant." },
        { speaker: "Guide", text: "What is this?" }
      ],
      qs: [
        { q: "What does the guide ask?", a: "What is this?", c: ["Where is it?", "What is this?", "How many?", "Who is he?"] },
        { q: "What animal is it?", a: "An elephant", c: ["A tiger", "An elephant", "A monkey", "A lion"] },
        { q: "Where are they?", a: "At the zoo", c: ["At school", "At the zoo", "In the park", "At home"] },
        { q: "How do you answer?", a: "It's a/an + animal", c: ["I like + N", "It's a/an + animal", "There is a", "This is my"] }
      ]
    }
  }
];

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function grammarId(unit) {
  return `g3_u${unit.chapterIndex}_${unit.grammar.id}`;
}

function vocabId(unit) {
  return `g3_u${unit.chapterIndex}_vocab`;
}

function pronId(unit) {
  return `g3_u${unit.chapterIndex}_pronunciation`;
}

function listenId(unit) {
  return `g3_u${unit.chapterIndex}_listening`;
}

function buildGrammarSkill(unit) {
  const id = grammarId(unit);
  return {
    id,
    title: `Unit ${unit.chapterIndex} · ${unit.grammar.title}`,
    grade: 3,
    book: unit.book,
    chapter: unit.chapter,
    chapterIndex: unit.chapterIndex,
    lessonNo: 1,
    domain: "Grammar",
    skillType: "grammar",
    grammar: unit.grammar.id,
    level: 3,
    prerequisite: [],
    description: unit.grammar.description,
    formula: unit.grammar.formula,
    visualization: "formula"
  };
}

function buildVocabSkill(unit) {
  return {
    id: vocabId(unit),
    title: `Unit ${unit.chapterIndex} · Từ vựng`,
    grade: 3,
    book: unit.book,
    chapter: unit.chapter,
    chapterIndex: unit.chapterIndex,
    lessonNo: 10,
    domain: "Vocabulary",
    skillType: "vocabulary",
    grammar: "vocabulary",
    level: 3,
    prerequisite: [],
    description: `Học ${unit.words.length} từ vựng Unit ${unit.chapterIndex} Global Success lớp 3.`,
    formula: `${unit.words.length} từ · EN ↔ VI`,
    visualization: "vocabulary"
  };
}

function buildPronSkill(unit, topic) {
  return {
    id: pronId(unit),
    title: `Unit ${unit.chapterIndex} · Phát âm`,
    grade: 3,
    book: unit.book,
    chapter: unit.chapter,
    chapterIndex: unit.chapterIndex,
    lessonNo: 11,
    domain: "Pronunciation",
    skillType: "pronunciation",
    grammar: "pronunciation",
    level: 3,
    prerequisite: [],
    description: `${topic.focus} — luyện phát âm Unit ${unit.chapterIndex}.`,
    formula: topic.focus,
    visualization: "pronunciation"
  };
}

function buildListenSkill(unit) {
  return {
    id: listenId(unit),
    title: `Unit ${unit.chapterIndex} · Kỹ năng nghe`,
    grade: 3,
    book: unit.book,
    chapter: unit.chapter,
    chapterIndex: unit.chapterIndex,
    lessonNo: 12,
    domain: "Listening",
    skillType: "listening",
    grammar: "listening",
    level: 3,
    prerequisite: [],
    description: `Nghe hội thoại ngắn Unit ${unit.chapterIndex} và trả lời câu hỏi.`,
    formula: "Nghe → chọn đáp án đúng",
    visualization: "listening"
  };
}

function buildGrammarLesson(unit) {
  const id = grammarId(unit);
  const ex = unit.words[0];
  return {
    id,
    title: `Unit ${unit.chapterIndex} · ${unit.grammar.title}`,
    skill: id,
    chapter: unit.chapter,
    source: SOURCE,
    xp: 40,
    steps: [
      { type: "intro", title: "Mục tiêu bài học", content: unit.grammar.description },
      { type: "visualization", title: "Cấu trúc câu", content: unit.grammar.formula, visualization: "formula", formula: unit.grammar.formula },
      { type: "example", title: "Ví dụ", content: "Nói to, rõ ràng.", example: { correct: ex?.example || unit.grammar.formula, wrong: "Nói sai cấu trúc hoặc thiếu từ." } },
      { type: "summary", title: "Ghi nhớ", content: unit.grammar.formula }
    ]
  };
}

function buildVocabLesson(unit) {
  const id = vocabId(unit);
  return {
    id,
    title: `Unit ${unit.chapterIndex} · Từ vựng`,
    skill: id,
    chapter: unit.chapter,
    source: SOURCE,
    xp: 40,
    steps: [
      { type: "intro", title: "Mục tiêu", content: `Học ${unit.words.length} từ vựng theo SGK.` },
      { type: "vocabulary", title: "Danh sách từ", content: "Nhấn và đọc theo.", words: unit.words },
      { type: "example", title: "Ví dụ", content: unit.words[0]?.example || "", example: { correct: unit.words[0]?.example || "", wrong: "Đọc sai nghĩa từ." } },
      { type: "summary", title: "Ôn nhanh", content: unit.words.map((w) => w.en).join(" · ") }
    ]
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
    xp: 40,
    steps: [
      { type: "intro", title: "Mục tiêu", content: `Luyện ${topic.focus}.` },
      { type: "pronunciation", title: "Điểm phát âm", content: "Nhấn từ để nghe.", focus: topic.focus, points: topic.points, pairs: topic.pairs, examples: topic.examples },
      { type: "example", title: "Mẹo", content: "Lặp lại theo mẫu.", example: { correct: topic.examples[0]?.word || topic.focus, wrong: "Đọc nhanh, nuốt âm." } },
      { type: "summary", title: "Ghi nhớ", content: topic.points[0] || topic.focus }
    ]
  };
}

function buildListenLesson(unit) {
  const id = listenId(unit);
  return {
    id,
    title: `Unit ${unit.chapterIndex} · Kỹ năng nghe`,
    skill: id,
    chapter: unit.chapter,
    source: SOURCE,
    xp: 40,
    steps: [
      { type: "intro", title: "Mục tiêu", content: "Nghe hội thoại ngắn và hiểu ý chính." },
      { type: "listening", title: "Nghe hội thoại", content: "Nghe 2–3 lần.", script: unit.listen.lines, showTranscript: true },
      { type: "example", title: "Mẹo nghe", content: "Nghe từ khóa: tên, số, màu, nơi chốn.", example: { correct: "Nghe nhiều lần", wrong: "Đoán không nghe" } },
      { type: "summary", title: "Ghi nhớ", content: "Nghe → hiểu → trả lời" }
    ]
  };
}

function buildGrammarQuestions(unit) {
  const id = grammarId(unit);
  const w0 = unit.words[0];
  const w1 = unit.words[1] || unit.words[0];
  const formula = unit.grammar.formula;
  const samples = {
    hello: { q: "___ are you?", c: ["How", "What", "Who", "Where"], a: "How", ex: "How are you?" },
    our_names: { q: "What's your ___?", c: ["name", "old", "job", "colour"], a: "name", ex: "What's your name?" },
    our_friends: { q: "This is my ___.", c: ["friend", "pen", "rice", "bed"], a: "friend", ex: "This is my friend." },
    our_bodies: { q: "I have two ___.", c: ["eyes", "nose", "mouth", "hand"], a: "eyes", ex: "I have two eyes." },
    my_hobbies: { q: "I like ___.", c: ["reading", "read", "reads", "readed"], a: "reading", ex: "I like reading." },
    our_school: { q: "___ go to the library.", c: ["Let's", "Let", "Lets", "Going"], a: "Let's", ex: "Let's go to the library." },
    classroom_instructions: { q: "___ down, please.", c: ["Sit", "Sits", "Sitting", "Sat"], a: "Sit", ex: "Sit down, please." },
    school_things: { q: "This is ___ pen.", c: ["my", "I", "me", "mine is"], a: "my", ex: "This is my pen." },
    colours: { q: "What colour ___ the pen?", c: ["is", "are", "am", "be"], a: "is", ex: "What colour is the pen?" },
    breaktime: { q: "I am ___ football.", c: ["playing", "play", "plays", "played"], a: "playing", ex: "I am playing football." },
    my_family: { q: "This is my ___.", c: ["father", "job", "pen", "rice"], a: "father", ex: "This is my father." },
    jobs: { q: "He is a ___.", c: ["doctor", "doctors", "doctoring", "doctored"], a: "doctor", ex: "He is a doctor." },
    my_house: { q: "There ___ a kitchen.", c: ["is", "are", "am", "be"], a: "is", ex: "There is a kitchen." },
    my_bedroom: { q: "___ is my bed?", c: ["Where", "What", "Who", "How"], a: "Where", ex: "Where is my bed?" },
    dining_table: { q: "Pass me the rice, ___.", c: ["please", "thanks", "sorry", "hello"], a: "please", ex: "Pass me the rice, please." },
    my_pets: { q: "How ___ rabbits do you have?", c: ["many", "much", "old", "long"], a: "many", ex: "How many rabbits do you have?" },
    our_toys: { q: "___ are my toys.", c: ["These", "This", "That", "It"], a: "These", ex: "These are my toys." },
    playing_doing: { q: "She is ___.", c: ["reading", "read", "reads", "readed"], a: "reading", ex: "She is reading." },
    outdoor: { q: "They are flying a ___.", c: ["kite", "kites", "kiting", "kited"], a: "kite", ex: "They are flying a kite." },
    at_the_zoo: { q: "It's ___ elephant.", c: ["an", "a", "the", "is"], a: "an", ex: "It's an elephant." }
  };
  const s = samples[unit.grammar.id] || { q: `Chọn đáp án đúng (${formula}):`, c: [w0.en, w1.en, "wrong", "no"], a: w0.en, ex: w0.example };

  return [
    { id: `q_${id}_1`, skill: id, grammar: unit.grammar.id, type: "multiple_choice", question: s.q, choices: shuffle(s.c), answer: s.a, hint: s.ex },
    { id: `q_${id}_2`, skill: id, grammar: unit.grammar.id, type: "multiple_choice", question: `"${w0.en}" nghĩa là gì?`, choices: shuffle([w0.vi, w1.vi, "sai", "không biết"]), answer: w0.vi, hint: w0.vi },
    { id: `q_${id}_3`, skill: id, grammar: unit.grammar.id, type: "input", question: `Viết tiếng Anh: ${w1.vi}`, answer: w1.en, alternatives: w1.en.includes(" ") ? [] : [], hint: w1.en },
    { id: `q_${id}_4`, skill: id, grammar: unit.grammar.id, type: "word_order", question: "Sắp xếp thành câu đúng:", tokens: s.ex.replace(/[.!?]/g, "").split(/\s+/), answer: s.ex.replace(/[.!?]/g, ""), hint: formula }
  ];
}

function buildVocabQuestions(unit) {
  const id = vocabId(unit);
  const w0 = unit.words[0];
  const w1 = unit.words[1];
  const w2 = unit.words[2];
  const d1 = unit.words.filter((w) => w.en !== w0.en).slice(0, 3).map((w) => w.vi);
  const d2 = unit.words.filter((w) => w.en !== w1.en).slice(0, 3).map((w) => w.en);
  return [
    { id: `q_${id}_1`, skill: id, grammar: "vocabulary", type: "multiple_choice", question: `"${w0.en}" nghĩa là gì?`, choices: shuffle([w0.vi, ...d1]), answer: w0.vi, hint: w0.example },
    { id: `q_${id}_2`, skill: id, grammar: "vocabulary", type: "multiple_choice", question: `"${w1.vi}" tiếng Anh là gì?`, choices: shuffle([w1.en, ...d2]), answer: w1.en, hint: w1.en },
    { id: `q_${id}_3`, skill: id, grammar: "vocabulary", type: "input", question: `Viết từ tiếng Anh: ${w2.vi}`, answer: w2.en, hint: w2.example },
    { id: `q_${id}_4`, skill: id, grammar: "vocabulary", type: "multiple_choice", question: `Chọn từ đúng: ${w2.example?.replace(w2.en, "___") || w2.en}`, choices: shuffle([w2.en, w0.en, w1.en, unit.words[3]?.en || "wrong"]), answer: w2.en, hint: w2.vi }
  ];
}

function buildPronQuestions(unit, topic) {
  const id = pronId(unit);
  const pair = topic.pairs[0];
  const ex = topic.examples[0];
  return [
    {
      id: `q_${id}_1`, skill: id, grammar: "pronunciation", type: "multiple_choice",
      question: pair ? `Từ nào có âm ${topic.focus.includes("/") ? topic.focus.split(" ")[1] : "đúng"}?` : `Đọc mẫu: ${ex?.word}`,
      choices: pair ? shuffle([pair.a, pair.b, "same", "no"]) : shuffle([ex?.word || "hello", "wrong", "no", "yes"]),
      answer: pair ? pair.a : ex?.word || "hello",
      hint: topic.points[0]
    },
    { id: `q_${id}_2`, skill: id, grammar: "pronunciation", type: "multiple_choice", question: "Chủ đề phát âm?", choices: shuffle([topic.focus, "Past simple", "Articles", "Passive"]), answer: topic.focus, hint: topic.focus },
    { id: `q_${id}_3`, skill: id, grammar: "pronunciation", type: "input", question: pair ? `Viết từ ngắn hơn: ${pair.b} → ___` : `Viết từ: ${ex?.word}`, answer: pair ? pair.a : ex?.word || "hello", hint: pair?.a || ex?.word },
    { id: `q_${id}_4`, skill: id, grammar: "pronunciation", type: "multiple_choice", question: "Cách luyện phát âm tốt?", choices: shuffle(["Nghe và lặp lại", "Đọc im", "Nói nhanh", "Bỏ qua âm"]), answer: "Nghe và lặp lại", hint: "Lặp theo mẫu." }
  ];
}

function buildListenQuestions(unit) {
  const id = listenId(unit);
  const [q1, q2, q3, q4] = unit.listen.qs;
  return [
    { id: `q_${id}_1`, skill: id, grammar: "listening", type: "listening", question: q1.q, listenScript: unit.listen.lines, choices: shuffle(q1.c), answer: q1.a, hint: "Nghe lại." },
    { id: `q_${id}_2`, skill: id, grammar: "listening", type: "listening", question: q2.q, listenScript: unit.listen.lines, choices: shuffle(q2.c), answer: q2.a, hint: "Nghe lại." },
    { id: `q_${id}_3`, skill: id, grammar: "listening", type: "input", question: q3.q, answer: q3.a, hint: "Trả lời ngắn." },
    { id: `q_${id}_4`, skill: id, grammar: "listening", type: "multiple_choice", question: q4.q, choices: shuffle(q4.c), answer: q4.a, hint: "Nghe từ khóa." }
  ];
}

const G3_ERRORS = [
  { pattern: "how is you", grammar: "hello", code: "G3001", errorType: "hello_greeting", title: "Sai How are you?", message: "Hỏi thăm sức khỏe: How are you? Trả lời: I'm fine, thank you.", hint: "How are you?", recommendation: "g3_u1_hello" },
  { pattern: "what is your name", grammar: "our_names", code: "G3002", errorType: "name_question", title: "Sai What's your name?", message: "Hỏi tên: What's your name? (không dùng What is your name trong hội thoại ngắn).", hint: "What's your name?", recommendation: "g3_u2_our_names" },
  { pattern: "who is she is", grammar: "our_friends", code: "G3003", errorType: "friend_intro", title: "Sai giới thiệu bạn", message: "Giới thiệu: This is my friend. Hỏi: Who is he/she?", hint: "This is my friend.", recommendation: "g3_u3_our_friends" },
  { pattern: "i has two eyes", grammar: "our_bodies", code: "G3004", errorType: "have_body", title: "Sai I have", message: "Nói bộ phận cơ thể: I have two eyes (không dùng has sau I).", hint: "I have two eyes.", recommendation: "g3_u4_our_bodies" },
  { pattern: "i like read", grammar: "my_hobbies", code: "G3005", errorType: "like_ing", title: "Sai I like + V-ing", message: "Sở thích: I like reading (dùng V-ing sau like).", hint: "I like + V-ing.", recommendation: "g3_u5_my_hobbies" },
  { pattern: "lets goes to", grammar: "our_school", code: "G3006", errorType: "lets_go", title: "Sai Let's go to", message: "Sau Let's dùng động từ nguyên thể: Let's go to the library.", hint: "Let's + V.", recommendation: "g3_u6_our_school" },
  { pattern: "sits down please", grammar: "classroom_instructions", code: "G3007", errorType: "imperative", title: "Sai mệnh lệnh lớp học", message: "Mệnh lệnh: Sit down / Stand up / Open your book (động từ nguyên thể).", hint: "Sit down, please.", recommendation: "g3_u7_classroom_instructions" },
  { pattern: "this is me pen", grammar: "school_things", code: "G3008", errorType: "my_your", title: "Sai my/your", message: "Sở hữu: This is my pen / This is your book (dùng my/your, không dùng me).", hint: "This is my pen.", recommendation: "g3_u8_school_things" },
  { pattern: "what color is", grammar: "colours", code: "G3009", errorType: "colour_question", title: "Sai What colour is/are", message: "Hỏi màu: What colour is the pen? / What colour are the books?", hint: "What colour is/are...?", recommendation: "g3_u9_colours" },
  { pattern: "i am play football", grammar: "breaktime", code: "G3010", errorType: "am_ing", title: "Sai I am + V-ing", message: "Hành động đang diễn ra: I am playing football.", hint: "I am + V-ing.", recommendation: "g3_u10_breaktime" },
  { pattern: "this is my father he", grammar: "my_family", code: "G3011", errorType: "family_intro", title: "Sai giới thiệu gia đình", message: "Giới thiệu: This is my father. Hỏi: Who is he?", hint: "This is my father.", recommendation: "g3_u11_my_family" },
  { pattern: "he is doctor", grammar: "jobs", code: "G3012", errorType: "job_article", title: "Thiếu a trước nghề nghiệp", message: "Nghề nghiệp: He is a doctor / She is a teacher.", hint: "He/She is a + job.", recommendation: "g3_u12_jobs" },
  { pattern: "there are a kitchen", grammar: "my_house", code: "G3013", errorType: "there_be", title: "Sai There is / There are", message: "Một phòng: There is a kitchen. Nhiều phòng: There are two bedrooms.", hint: "There is/are + N.", recommendation: "g3_u13_my_house" },
  { pattern: "where are my bed", grammar: "my_bedroom", code: "G3014", errorType: "where_is", title: "Sai Where is / Where are", message: "Một vật: Where is my bed? Trả lời: It's in the bedroom.", hint: "Where is my bed?", recommendation: "g3_u14_my_bedroom" },
  { pattern: "give me the rice", grammar: "dining_table", code: "G3015", errorType: "pass_me", title: "Nhầm Pass me và Give me", message: "Nhờ đưa đồ ăn: Pass me the rice, please.", hint: "Pass me the + N, please.", recommendation: "g3_u15_dining_table" },
  { pattern: "how much rabbits", grammar: "my_pets", code: "G3016", errorType: "how_many_pets", title: "Nhầm How many / How much", message: "Đếm vật nuôi: How many rabbits do you have?", hint: "How many + pets?", recommendation: "g3_u16_my_pets" },
  { pattern: "this are my toys", grammar: "our_toys", code: "G3017", errorType: "these_toys", title: "Sai These are", message: "Nhiều đồ chơi: These are my toys. Hỏi: Whose toy is this?", hint: "These are my toys.", recommendation: "g3_u17_our_toys" },
  { pattern: "she is read", grammar: "playing_doing", code: "G3018", errorType: "she_ing", title: "Sai She is + V-ing", message: "Hành động đang diễn ra: She is reading / He is writing.", hint: "She/He is + V-ing.", recommendation: "g3_u18_playing_doing" },
  { pattern: "they is flying", grammar: "outdoor", code: "G3019", errorType: "they_ing", title: "Sai They are + V-ing", message: "Nhiều người: They are flying a kite.", hint: "They are + V-ing.", recommendation: "g3_u19_outdoor" },
  { pattern: "it is a elephant", grammar: "at_the_zoo", code: "G3020", errorType: "a_an_animal", title: "Sai a/an trước con vật", message: "Elephant bắt đầu bằng nguyên âm: It's an elephant.", hint: "It's a/an + animal.", recommendation: "g3_u20_at_the_zoo" }
];

function merge() {
  const g3Ids = new Set();
  const g3Grammars = new Set(UNITS.map((u) => u.grammar.id));
  UNITS.forEach((u) => {
    g3Ids.add(grammarId(u));
    g3Ids.add(vocabId(u));
    g3Ids.add(pronId(u));
    g3Ids.add(listenId(u));
  });

  const skills = JSON.parse(fs.readFileSync(path.join(dataDir, "skills.json"), "utf8")).filter((s) => !g3Ids.has(s.id));
  const lessons = JSON.parse(fs.readFileSync(path.join(dataDir, "lessons.json"), "utf8")).filter((l) => !g3Ids.has(l.id));
  const questions = JSON.parse(fs.readFileSync(path.join(dataDir, "questions.json"), "utf8")).filter((q) => !g3Ids.has(q.skill));
  const errors = JSON.parse(fs.readFileSync(path.join(dataDir, "errors.json"), "utf8")).filter(
    (e) => !g3Grammars.has(e.grammar) && !(e.recommendation || "").startsWith("g3_")
  );

  const newSkills = [];
  const newLessons = [];
  const newQuestions = [];

  UNITS.forEach((unit, index) => {
    const topic = PRON_TOPICS[index % PRON_TOPICS.length];
    newSkills.push(buildGrammarSkill(unit), buildVocabSkill(unit), buildPronSkill(unit, topic), buildListenSkill(unit));
    newLessons.push(buildGrammarLesson(unit), buildVocabLesson(unit), buildPronLesson(unit, topic), buildListenLesson(unit));
    newQuestions.push(...buildGrammarQuestions(unit), ...buildVocabQuestions(unit), ...buildPronQuestions(unit, topic), ...buildListenQuestions(unit));
  });

  fs.writeFileSync(path.join(dataDir, "skills.json"), JSON.stringify([...newSkills, ...skills], null, 2) + "\n");
  fs.writeFileSync(path.join(dataDir, "lessons.json"), JSON.stringify([...newLessons, ...lessons], null, 2) + "\n");
  fs.writeFileSync(path.join(dataDir, "questions.json"), JSON.stringify([...newQuestions, ...questions], null, 2) + "\n");
  fs.writeFileSync(path.join(dataDir, "errors.json"), JSON.stringify([...G3_ERRORS, ...errors], null, 2) + "\n");

  console.log("Grade 3 units:", UNITS.length);
  console.log("Grade 3 skills:", newSkills.length);
  console.log("Grade 3 questions:", newQuestions.length);
  console.log("Grade 3 error patterns:", G3_ERRORS.length);
  console.log("Total skills:", newSkills.length + skills.length);
  console.log("Total questions:", newQuestions.length + questions.length);
  console.log("Total errors:", G3_ERRORS.length + errors.length);

  // Integrity check
  const lessonIds = new Set(newLessons.map((l) => l.id));
  const qBySkill = new Map();
  newQuestions.forEach((q) => {
    qBySkill.set(q.skill, (qBySkill.get(q.skill) || 0) + 1);
  });
  let ok = true;
  newSkills.forEach((s) => {
    const hasLesson = lessonIds.has(s.id);
    const qCount = qBySkill.get(s.id) || 0;
    if (!hasLesson || qCount !== 4) {
      ok = false;
      console.log(`INTEGRITY FAIL: ${s.id} lesson=${hasLesson} questions=${qCount}`);
    }
  });
  console.log("Integrity check:", ok ? "PASS (each g3 skill has lesson + 4 questions)" : "FAIL");
}

merge();
