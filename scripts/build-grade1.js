#!/usr/bin/env node
/**
 * Generate full Grade 1 Global Success program (16 Units × 4 skill types).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const SOURCE =
  "Bám sát SGK Tiếng Anh 1 – Kết nối tri thức với cuộc sống (Global Success).";

const PRON_TOPICS = [
  { focus: "Âm /b/ và /p/", points: ["/b/ trong ball, book, bike", "/p/ trong pen, pencil"], pairs: [{ a: "ball", b: "pall", note: "b vs p" }], examples: [{ word: "ball", stress: "ball", note: "/bɔːl/" }] },
  { focus: "Âm /k/ và /t/", points: ["/k/ trong cat, cup, cake", "/t/ trong table, cat"], pairs: [{ a: "cat", b: "hat", note: "c vs h" }], examples: [{ word: "cup", stress: "cup", note: "/kʌp/" }] },
  { focus: "Âm /m/ và /n/", points: ["/m/ trong mug, milk", "/n/ trong pen, napkin"], pairs: [], examples: [{ word: "milk", stress: "milk", note: "/mɪlk/" }] },
  { focus: "Âm /s/ và /z/", points: ["/s/ trong spoon, school", "Chú ý phát âm rõ cuối từ"], pairs: [], examples: [{ word: "spoon", stress: "spoon", note: "/spuːn/" }] },
  { focus: "Nguyên âm /æ/ và /ʌ/", points: ["/æ/ trong cat, hat, apple", "/ʌ/ trong cup, mug"], pairs: [{ a: "cat", b: "cut", note: "æ vs ʌ" }], examples: [{ word: "apple", stress: "ap-ple", note: "/ˈæpl/" }] },
  { focus: "Âm /f/ và /v/", points: ["/f/ trong fish, flower", "Thổi hơi nhẹ qua môi"], pairs: [], examples: [{ word: "fish", stress: "fish", note: "/fɪʃ/" }] },
  { focus: "Âm /g/ và /d/", points: ["/g/ trong garden, goat, girl", "/d/ trong dog, duck, desk"], pairs: [{ a: "goat", b: "coat", note: "g vs c" }], examples: [{ word: "garden", stress: "GAR-den", note: "/ˈɡɑːdn/" }] },
  { focus: "Âm /h/ và /r/", points: ["/h/ trong hat, hand, head, horse", "/r/ trong red, ruler"], pairs: [], examples: [{ word: "hand", stress: "hand", note: "/hænd/" }] },
  { focus: "Âm /l/ và /r/", points: ["/l/ trong lake, leaf, lemon", "/r/ trong river, ruler"], pairs: [{ a: "lake", b: "rake", note: "l vs r" }], examples: [{ word: "leaf", stress: "leaf", note: "/liːf/" }] },
  { focus: "Âm /ʃ/ trong shop", points: ["/ʃ/ như shop, chips", "Môi tròn, lưỡi cong"], pairs: [], examples: [{ word: "shop", stress: "shop", note: "/ʃɒp/" }] },
  { focus: "Âm /z/ và /s/ ở zoo", points: ["/z/ trong zoo", "/s/ trong bus, sun"], pairs: [{ a: "bus", b: "buzz", note: "s vs z" }], examples: [{ word: "zoo", stress: "zoo", note: "/zuː/" }] },
  { focus: "Âm /tr/ và /dr/", points: ["/tr/ trong truck, tree", "Kết hợp t + r"], pairs: [], examples: [{ word: "truck", stress: "truck", note: "/trʌk/" }] },
  { focus: "Âm /b/ trong banana", points: ["/b/ ở đầu từ: banana, bed", "Môi khép rồi bật hơi"], pairs: [], examples: [{ word: "banana", stress: "ba-NA-na", note: "/bəˈnænə/" }] },
  { focus: "Âm /t/ trong teddy", points: ["/t/ trong top, tiger, turtle", "Đầu lưỡi chạm vòm miệng"], pairs: [], examples: [{ word: "tiger", stress: "TI-ger", note: "/ˈtaɪɡə/" }] },
  { focus: "Âm /f/ trong football", points: ["/f/ trong foot, face, father", "/ʊ/ ngắn trong foot"], pairs: [], examples: [{ word: "foot", stress: "foot", note: "/fʊt/" }] },
  { focus: "Âm /w/ và /h/", points: ["/w/ trong water, wash, window", "/h/ trong home, hat"], pairs: [{ a: "water", b: "hotter", note: "w vs h" }], examples: [{ word: "water", stress: "WA-ter", note: "/ˈwɔːtə/" }] }
];

/** @type {Array<object>} */
const UNITS = [
  {
    chapterIndex: 1, chapter: "Unit 1: In the school playground", book: "Sách giáo khoa",
    grammar: { id: "greetings", title: "Chào hỏi", formula: "Hello / Hi + I'm...", description: "Chào bạn bè ở sân trường với Hello, Hi và giới thiệu tên I'm..." },
    words: [
      { en: "hello", vi: "xin chào", ipa: "/həˈləʊ/", example: "Hello! I'm Mai." },
      { en: "hi", vi: "chào", ipa: "/haɪ/", example: "Hi, Tom!" },
      { en: "bye", vi: "tạm biệt", ipa: "/baɪ/", example: "Bye! See you!" },
      { en: "ball", vi: "quả bóng", example: "I play with a ball." },
      { en: "book", vi: "sách", example: "This is my book." },
      { en: "bike", vi: "xe đạp", example: "I have a bike." },
      { en: "school", vi: "trường học", example: "This is my school." },
      { en: "play", vi: "chơi", example: "Let's play!" }
    ],
    listen: {
      lines: [
        { speaker: "Ann", text: "Hello! I'm Ann." },
        { speaker: "Ben", text: "Hi, Ann! I'm Ben." },
        { speaker: "Ann", text: "Let's play with the ball!" }
      ],
      qs: [
        { q: "What is the girl's name?", a: "Ann", c: ["Ben", "Ann", "Tom", "Mai"] },
        { q: "What do they play with?", a: "The ball", c: ["The book", "The ball", "The bike", "The school"] },
        { q: "How does Ben say hello?", a: "Hi", c: ["Bye", "Hi", "Good night", "Thanks"] },
        { q: "Where are they?", a: "At school", c: ["At home", "At school", "At the zoo", "In the shop"] }
      ]
    }
  },
  {
    chapterIndex: 2, chapter: "Unit 2: In the dining room", book: "Sách giáo khoa",
    grammar: { id: "have_a", title: "I have a...", formula: "I have a + N", description: "Nói về đồ vật mình có trong phòng ăn với I have a..." },
    words: [
      { en: "table", vi: "cái bàn", example: "I have a table." },
      { en: "chair", vi: "cái ghế", example: "I have a chair." },
      { en: "cup", vi: "cái cốc", example: "I have a cup." },
      { en: "spoon", vi: "cái thìa", example: "I have a spoon." },
      { en: "mug", vi: "cái ca", example: "I have a mug." },
      { en: "cake", vi: "bánh ngọt", example: "I have a cake." },
      { en: "cat", vi: "con mèo", example: "I have a cat." },
      { en: "dining room", vi: "phòng ăn", example: "This is the dining room." }
    ],
    listen: {
      lines: [
        { speaker: "Mum", text: "I have a cup and a spoon." },
        { speaker: "Dad", text: "I have a mug on the table." },
        { speaker: "Mum", text: "The cat is on the chair." }
      ],
      qs: [
        { q: "What does Mum have?", a: "A cup and a spoon", c: ["A bike", "A cup and a spoon", "A book", "A ball"] },
        { q: "Where is the mug?", a: "On the table", c: ["On the chair", "On the table", "In the garden", "At school"] },
        { q: "Where is the cat?", a: "On the chair", c: ["On the table", "On the chair", "In the cup", "On the bike"] },
        { q: "Which room is it?", a: "The dining room", c: ["The bedroom", "The dining room", "The shop", "The park"] }
      ]
    }
  },
  {
    chapterIndex: 3, chapter: "Unit 3: At the street market", book: "Sách giáo khoa",
    grammar: { id: "this_is_my", title: "This is my...", formula: "This is my + N", description: "Giới thiệu đồ vật của mình ở chợ với This is my..." },
    words: [
      { en: "apple", vi: "quả táo", example: "This is my apple." },
      { en: "bag", vi: "túi, cặp", example: "This is my bag." },
      { en: "hat", vi: "cái mũ", example: "This is my hat." },
      { en: "market", vi: "chợ", example: "We are at the market." },
      { en: "my", vi: "của tôi", example: "This is my book." }
    ],
    listen: {
      lines: [
        { speaker: "Seller", text: "This is my apple." },
        { speaker: "Boy", text: "This is my hat." },
        { speaker: "Seller", text: "This is my bag." }
      ],
      qs: [
        { q: "What does the seller show?", a: "An apple", c: ["A hat", "An apple", "A bike", "A spoon"] },
        { q: "What is the boy's item?", a: "A hat", c: ["A bag", "A hat", "A cup", "A cat"] },
        { q: "Where are they?", a: "At the market", c: ["At school", "At the market", "At home", "At the zoo"] },
        { q: "Whose bag is it?", a: "The seller's", c: ["The boy's", "The seller's", "Ann's", "Ben's"] }
      ]
    }
  },
  {
    chapterIndex: 4, chapter: "Unit 4: In the bedroom", book: "Sách giáo khoa",
    grammar: { id: "this_is_a", title: "This is a...", formula: "This is a + N", description: "Nhận diện đồ vật trong phòng ngủ với This is a..." },
    words: [
      { en: "bedroom", vi: "phòng ngủ", example: "This is a bedroom." },
      { en: "desk", vi: "bàn học", example: "This is a desk." },
      { en: "door", vi: "cửa", example: "This is a door." },
      { en: "window", vi: "cửa sổ", example: "This is a window." },
      { en: "mirror", vi: "gương", example: "This is a mirror." },
      { en: "dog", vi: "con chó", example: "This is a dog." },
      { en: "duck", vi: "con vịt", example: "This is a duck." }
    ],
    listen: {
      lines: [
        { speaker: "Sue", text: "This is a desk." },
        { speaker: "Tom", text: "This is a window." },
        { speaker: "Sue", text: "This is a dog in the bedroom." }
      ],
      qs: [
        { q: "What does Sue point to first?", a: "A desk", c: ["A door", "A desk", "A duck", "A mirror"] },
        { q: "What does Tom say?", a: "This is a window", c: ["This is a door", "This is a window", "This is a hat", "This is a ball"] },
        { q: "What animal is in the bedroom?", a: "A dog", c: ["A cat", "A dog", "A duck", "A lion"] },
        { q: "Which room?", a: "The bedroom", c: ["The kitchen", "The bedroom", "The market", "The garden"] }
      ]
    }
  },
  {
    chapterIndex: 5, chapter: "Unit 5: At the fish and chip shop", book: "Sách giáo khoa",
    grammar: { id: "i_like", title: "I like...", formula: "I like + N", description: "Nói về món ăn yêu thích với I like..." },
    words: [
      { en: "fish", vi: "cá", example: "I like fish." },
      { en: "chips", vi: "khoai tây chiên", example: "I like chips." },
      { en: "chicken", vi: "gà", example: "I like chicken." },
      { en: "milk", vi: "sữa", example: "I like milk." },
      { en: "like", vi: "thích", example: "I like cake." }
    ],
    listen: {
      lines: [
        { speaker: "Girl", text: "I like fish." },
        { speaker: "Boy", text: "I like chips." },
        { speaker: "Girl", text: "I like milk too." }
      ],
      qs: [
        { q: "What does the girl like?", a: "Fish", c: ["Chips", "Fish", "Chicken", "Cake"] },
        { q: "What does the boy like?", a: "Chips", c: ["Fish", "Chips", "Milk", "Apple"] },
        { q: "What else does the girl like?", a: "Milk", c: ["Fish", "Milk", "Hat", "Book"] },
        { q: "Where are they?", a: "At the fish and chip shop", c: ["At school", "At the fish and chip shop", "At the zoo", "In the garden"] }
      ]
    }
  },
  {
    chapterIndex: 6, chapter: "Unit 6: In the classroom", book: "Sách giáo khoa",
    grammar: { id: "colors", title: "Màu sắc", formula: "It's + màu", description: "Mô tả màu sắc đồ dùng học tập với It's red/blue..." },
    words: [
      { en: "red", vi: "màu đỏ", example: "It's red." },
      { en: "pen", vi: "bút mực", example: "It's a red pen." },
      { en: "pencil", vi: "bút chì", example: "It's a yellow pencil." },
      { en: "ruler", vi: "thước kẻ", example: "It's a blue ruler." },
      { en: "eraser", vi: "cục tẩy", example: "It's a pink eraser." },
      { en: "notebook", vi: "vở", example: "It's a green notebook." },
      { en: "bell", vi: "chuông", example: "The bell is loud." }
    ],
    listen: {
      lines: [
        { speaker: "Teacher", text: "Look! It's a red pen." },
        { speaker: "Student", text: "It's a blue ruler." },
        { speaker: "Teacher", text: "Good! It's a yellow pencil." }
      ],
      qs: [
        { q: "What colour is the pen?", a: "Red", c: ["Blue", "Red", "Green", "Pink"] },
        { q: "What is blue?", a: "The ruler", c: ["The pen", "The ruler", "The bell", "The bag"] },
        { q: "What colour is the pencil?", a: "Yellow", c: ["Red", "Yellow", "Blue", "Black"] },
        { q: "Where are they?", a: "In the classroom", c: ["In the shop", "In the classroom", "At the lake", "At home"] }
      ]
    }
  },
  {
    chapterIndex: 7, chapter: "Unit 7: In the garden", book: "Sách giáo khoa",
    grammar: { id: "there_is", title: "There's a...", formula: "There's a + N", description: "Nói về sự hiện diện của vật trong vườn với There's a..." },
    words: [
      { en: "garden", vi: "khu vườn", example: "There's a garden." },
      { en: "flower", vi: "bông hoa", example: "There's a flower." },
      { en: "tree", vi: "cây", example: "There's a tree." },
      { en: "goat", vi: "con dê", example: "There's a goat." },
      { en: "gate", vi: "cổng", example: "There's a gate." },
      { en: "grass", vi: "cỏ", example: "There's grass." },
      { en: "girl", vi: "cô bé", example: "There's a girl." }
    ],
    listen: {
      lines: [
        { speaker: "Dad", text: "There's a flower in the garden." },
        { speaker: "Child", text: "There's a goat near the gate." },
        { speaker: "Dad", text: "There's a big tree too." }
      ],
      qs: [
        { q: "What's in the garden?", a: "A flower", c: ["A fish", "A flower", "A bus", "A pen"] },
        { q: "What's near the gate?", a: "A goat", c: ["A goat", "A girl", "A dog", "A lion"] },
        { q: "What is big?", a: "A tree", c: ["A gate", "A tree", "A cup", "A hat"] },
        { q: "Where are they?", a: "In the garden", c: ["In the garden", "In the shop", "At school", "At the zoo"] }
      ]
    }
  },
  {
    chapterIndex: 8, chapter: "Unit 8: In the park", book: "Sách giáo khoa",
    grammar: { id: "body_parts", title: "Bộ phận cơ thể", formula: "My + body part", description: "Nhận biết bộ phận cơ thể: head, hand, hair..." },
    words: [
      { en: "head", vi: "cái đầu", example: "This is my head." },
      { en: "hand", vi: "bàn tay", example: "This is my hand." },
      { en: "hair", vi: "tóc", example: "This is my hair." },
      { en: "horse", vi: "con ngựa", example: "I see a horse." },
      { en: "bird", vi: "con chim", example: "I see a bird." },
      { en: "lake", vi: "hồ nước", example: "There's a lake." },
      { en: "duck", vi: "con vịt", example: "I see a duck." }
    ],
    listen: {
      lines: [
        { speaker: "Mum", text: "Touch your head." },
        { speaker: "Child", text: "This is my hand." },
        { speaker: "Mum", text: "Look at the bird in the park." }
      ],
      qs: [
        { q: "What does Mum say to touch?", a: "Head", c: ["Hand", "Head", "Foot", "Hair"] },
        { q: "What does the child show?", a: "Hand", c: ["Head", "Hand", "Horse", "Lake"] },
        { q: "What animal do they see?", a: "A bird", c: ["A horse", "A bird", "A goat", "A lion"] },
        { q: "Where are they?", a: "In the park", c: ["In the park", "In the shop", "At home", "In class"] }
      ]
    }
  },
  {
    chapterIndex: 9, chapter: "Unit 9: In the shop", book: "Sách giáo khoa",
    grammar: { id: "how_many", title: "How many...?", formula: "How many + N?", description: "Hỏi số lượng đồ vật trong cửa hàng với How many...?" },
    words: [
      { en: "shop", vi: "cửa hàng", example: "We are in the shop." },
      { en: "clock", vi: "đồng hồ", example: "How many clocks?" },
      { en: "pot", vi: "cái bình", example: "One pot." },
      { en: "pan", vi: "cái chảo", example: "Two pans." },
      { en: "mop", vi: "cây lau nhà", example: "A mop." },
      { en: "lock", vi: "ổ khóa", example: "A lock." }
    ],
    listen: {
      lines: [
        { speaker: "Shopkeeper", text: "How many clocks do you see?" },
        { speaker: "Boy", text: "I see two clocks." },
        { speaker: "Shopkeeper", text: "How many pots? One pot." }
      ],
      qs: [
        { q: "How many clocks?", a: "Two", c: ["One", "Two", "Three", "Four"] },
        { q: "How many pots?", a: "One", c: ["One", "Two", "Three", "None"] },
        { q: "Where are they?", a: "In the shop", c: ["In the shop", "At school", "In the park", "At the lake"] },
        { q: "Who asks questions?", a: "The shopkeeper", c: ["The boy", "The shopkeeper", "The teacher", "Mum"] }
      ]
    }
  },
  {
    chapterIndex: 10, chapter: "Unit 10: At the zoo", book: "Sách giáo khoa",
    grammar: { id: "this_is_a_animal", title: "This is a... (animals)", formula: "This is a + animal", description: "Nhận diện con vật ở sở thú với This is a lion/panda..." },
    words: [
      { en: "zoo", vi: "sở thú", example: "We are at the zoo." },
      { en: "lion", vi: "sư tử", example: "This is a lion." },
      { en: "panda", vi: "gấu trúc", example: "This is a panda." },
      { en: "monkey", vi: "khỉ", example: "This is a monkey." },
      { en: "mouse", vi: "chuột", example: "This is a mouse." },
      { en: "mother", vi: "mẹ", example: "This is my mother." },
      { en: "mango", vi: "xoài", example: "This is a mango." }
    ],
    listen: {
      lines: [
        { speaker: "Guide", text: "This is a lion." },
        { speaker: "Girl", text: "This is a panda." },
        { speaker: "Guide", text: "This is a monkey." }
      ],
      qs: [
        { q: "What is the first animal?", a: "A lion", c: ["A panda", "A lion", "A mouse", "A dog"] },
        { q: "What does the girl say?", a: "This is a panda", c: ["This is a lion", "This is a panda", "This is a mango", "This is a shop"] },
        { q: "What is the third animal?", a: "A monkey", c: ["A monkey", "A mother", "A horse", "A duck"] },
        { q: "Where are they?", a: "At the zoo", c: ["At the zoo", "At the shop", "At the lake", "At home"] }
      ]
    }
  },
  {
    chapterIndex: 11, chapter: "Unit 11: At the bus stop", book: "Sách giáo khoa",
    grammar: { id: "present_continuous_g1", title: "Hành động đang diễn ra", formula: "He/She is + V-ing", description: "Mô tả hành động đang diễn ra: He is running, She is looking..." },
    words: [
      { en: "bus", vi: "xe buýt", example: "The bus is here." },
      { en: "run", vi: "chạy", example: "He is running." },
      { en: "look", vi: "nhìn", example: "She is looking." },
      { en: "move", vi: "di chuyển", example: "The truck is moving." },
      { en: "truck", vi: "xe tải", example: "The truck is big." },
      { en: "sun", vi: "mặt trời", example: "The sun is hot." },
      { en: "boy", vi: "cậu bé", example: "The boy is running." }
    ],
    listen: {
      lines: [
        { speaker: "Woman", text: "The boy is running." },
        { speaker: "Man", text: "The bus is coming." },
        { speaker: "Woman", text: "Look! The sun is bright." }
      ],
      qs: [
        { q: "What is the boy doing?", a: "Running", c: ["Sleeping", "Running", "Eating", "Reading"] },
        { q: "What is coming?", a: "The bus", c: ["The truck", "The bus", "The boy", "The sun"] },
        { q: "How is the sun?", a: "Bright", c: ["Dark", "Bright", "Cold", "Small"] },
        { q: "Where are they?", a: "At the bus stop", c: ["At the bus stop", "At the zoo", "In the shop", "At the lake"] }
      ]
    }
  },
  {
    chapterIndex: 12, chapter: "Unit 12: At the lake", book: "Sách giáo khoa",
    grammar: { id: "look_at", title: "Look at...", formula: "Look at + N", description: "Đưa ra chỉ dẫn nhìn vật ở hồ nước với Look at..." },
    words: [
      { en: "lake", vi: "hồ nước", example: "Look at the lake." },
      { en: "river", vi: "sông", example: "Look at the river." },
      { en: "hill", vi: "đồi", example: "Look at the hill." },
      { en: "sky", vi: "bầu trời", example: "Look at the sky." },
      { en: "leaf", vi: "chiếc lá", example: "Look at the leaf." },
      { en: "lemon", vi: "quả chanh", example: "Look at the lemon." },
      { en: "picnic", vi: "dã ngoại", example: "We have a picnic." },
      { en: "ground", vi: "mặt đất", example: "Look at the ground." }
    ],
    listen: {
      lines: [
        { speaker: "Dad", text: "Look at the lake." },
        { speaker: "Child", text: "Look at the sky!" },
        { speaker: "Dad", text: "Look at the hill over there." }
      ],
      qs: [
        { q: "What does Dad say first?", a: "Look at the lake", c: ["Look at the shop", "Look at the lake", "Look at the bus", "Look at the pen"] },
        { q: "What does the child say?", a: "Look at the sky", c: ["Look at the sky", "Look at the fish", "Look at the hat", "Look at the dog"] },
        { q: "What is over there?", a: "A hill", c: ["A hill", "A bus", "A shop", "A desk"] },
        { q: "Where are they?", a: "At the lake", c: ["At the lake", "At the zoo", "In class", "At home"] }
      ]
    }
  },
  {
    chapterIndex: 13, chapter: "Unit 13: In the school canteen", book: "Sách giáo khoa",
    grammar: { id: "i_want", title: "I want...", formula: "I want + N", description: "Nói món muốn ăn ở căng tin với I want..." },
    words: [
      { en: "canteen", vi: "căng tin", example: "We are in the canteen." },
      { en: "banana", vi: "chuối", example: "I want a banana." },
      { en: "noodle", vi: "mì", example: "I want noodles." },
      { en: "juice", vi: "nước ép", example: "I want juice." },
      { en: "cake", vi: "bánh", example: "I want cake." },
      { en: "today", vi: "hôm nay", example: "Today is Monday." }
    ],
    listen: {
      lines: [
        { speaker: "Girl", text: "I want a banana." },
        { speaker: "Boy", text: "I want juice today." },
        { speaker: "Girl", text: "I want noodles in the canteen." }
      ],
      qs: [
        { q: "What does the girl want first?", a: "A banana", c: ["Juice", "A banana", "Fish", "A hat"] },
        { q: "What does the boy want?", a: "Juice", c: ["Noodles", "Juice", "Cake", "Chips"] },
        { q: "Where are they?", a: "In the canteen", c: ["In the shop", "In the canteen", "At the lake", "At the zoo"] },
        { q: "When?", a: "Today", c: ["Yesterday", "Today", "Tomorrow", "Never"] }
      ]
    }
  },
  {
    chapterIndex: 14, chapter: "Unit 14: In the toy shop", book: "Sách giáo khoa",
    grammar: { id: "can_see", title: "I can see...", formula: "I can see + N", description: "Nói khả năng nhìn thấy đồ chơi với I can see..." },
    words: [
      { en: "teddy bear", vi: "gấu bông", example: "I can see a teddy bear." },
      { en: "robot", vi: "robot", example: "I can see a robot." },
      { en: "tiger", vi: "con hổ", example: "I can see a tiger toy." },
      { en: "turtle", vi: "con rùa", example: "I can see a turtle." },
      { en: "top", vi: "con quay", example: "I can see a top." },
      { en: "shelf", vi: "kệ", example: "Toys are on the shelf." },
      { en: "see", vi: "nhìn thấy", example: "I can see it." }
    ],
    listen: {
      lines: [
        { speaker: "Child", text: "I can see a teddy bear." },
        { speaker: "Mum", text: "I can see a robot on the shelf." },
        { speaker: "Child", text: "I can see a top too." }
      ],
      qs: [
        { q: "What can the child see first?", a: "A teddy bear", c: ["A robot", "A teddy bear", "A fish", "A bus"] },
        { q: "Where is the robot?", a: "On the shelf", c: ["On the floor", "On the shelf", "In the lake", "At school"] },
        { q: "What else can they see?", a: "A top", c: ["A lion", "A top", "A mango", "A spoon"] },
        { q: "Where are they?", a: "In the toy shop", c: ["In the toy shop", "At the zoo", "In the canteen", "At home"] }
      ]
    }
  },
  {
    chapterIndex: 15, chapter: "Unit 15: At the football match", book: "Sách giáo khoa",
    grammar: { id: "he_she_is", title: "He/She is...", formula: "He/She is + adj/V-ing", description: "Mô tả người và hành động ở trận bóng: He is happy, She is watching..." },
    words: [
      { en: "football", vi: "bóng đá", example: "We watch football." },
      { en: "match", vi: "trận đấu", example: "It's a football match." },
      { en: "father", vi: "bố", example: "He is my father." },
      { en: "face", vi: "khuôn mặt", example: "She has a lovely face." },
      { en: "foot", vi: "bàn chân", example: "He kicks with his foot." },
      { en: "watch", vi: "xem", example: "She is watching." },
      { en: "lovely", vi: "đáng yêu", example: "It's lovely." }
    ],
    listen: {
      lines: [
        { speaker: "Boy", text: "He is my father." },
        { speaker: "Girl", text: "She is watching the match." },
        { speaker: "Boy", text: "The football match is lovely." }
      ],
      qs: [
        { q: "Who is the man?", a: "The boy's father", c: ["The teacher", "The boy's father", "The shopkeeper", "The guide"] },
        { q: "What is the girl doing?", a: "Watching the match", c: ["Running", "Watching the match", "Sleeping", "Eating"] },
        { q: "What sport is it?", a: "Football", c: ["Football", "Tennis", "Swimming", "Basketball"] },
        { q: "How is the match?", a: "Lovely", c: ["Boring", "Lovely", "Bad", "Small"] }
      ]
    }
  },
  {
    chapterIndex: 16, chapter: "Unit 16: At home", book: "Sách giáo khoa",
    grammar: { id: "how_many_rooms", title: "How many...? (at home)", formula: "How many + N?", description: "Hỏi số lượng phòng/đồ vật ở nhà với How many...?" },
    words: [
      { en: "home", vi: "nhà", example: "We are at home." },
      { en: "bed", vi: "giường", example: "One bed." },
      { en: "kitchen", vi: "bếp", example: "One kitchen." },
      { en: "living room", vi: "phòng khách", example: "One living room." },
      { en: "water", vi: "nước", example: "I wash with water." },
      { en: "wash", vi: "rửa", example: "I wash my hands." },
      { en: "window", vi: "cửa sổ", example: "Two windows." }
    ],
    listen: {
      lines: [
        { speaker: "Mum", text: "How many bedrooms? One bedroom." },
        { speaker: "Child", text: "How many windows? Two windows." },
        { speaker: "Mum", text: "We are at home." }
      ],
      qs: [
        { q: "How many bedrooms?", a: "One", c: ["One", "Two", "Three", "Four"] },
        { q: "How many windows?", a: "Two", c: ["One", "Two", "Three", "None"] },
        { q: "Where are they?", a: "At home", c: ["At school", "At home", "At the zoo", "In the shop"] },
        { q: "Who counts windows?", a: "The child", c: ["Mum", "The child", "Dad", "The teacher"] }
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
  return `g1_u${unit.chapterIndex}_${unit.grammar.id}`;
}

function vocabId(unit) {
  return `g1_u${unit.chapterIndex}_vocab`;
}

function pronId(unit) {
  return `g1_u${unit.chapterIndex}_pronunciation`;
}

function listenId(unit) {
  return `g1_u${unit.chapterIndex}_listening`;
}

function buildGrammarSkill(unit) {
  const id = grammarId(unit);
  return {
    id,
    title: `Unit ${unit.chapterIndex} · ${unit.grammar.title}`,
    grade: 1,
    book: unit.book,
    chapter: unit.chapter,
    chapterIndex: unit.chapterIndex,
    lessonNo: 1,
    domain: "Grammar",
    skillType: "grammar",
    grammar: unit.grammar.id,
    level: 1,
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
    grade: 1,
    book: unit.book,
    chapter: unit.chapter,
    chapterIndex: unit.chapterIndex,
    lessonNo: 10,
    domain: "Vocabulary",
    skillType: "vocabulary",
    grammar: "vocabulary",
    level: 1,
    prerequisite: [],
    description: `Học ${unit.words.length} từ vựng Unit ${unit.chapterIndex} Global Success lớp 1.`,
    formula: `${unit.words.length} từ · EN ↔ VI`,
    visualization: "vocabulary"
  };
}

function buildPronSkill(unit, topic) {
  return {
    id: pronId(unit),
    title: `Unit ${unit.chapterIndex} · Phát âm`,
    grade: 1,
    book: unit.book,
    chapter: unit.chapter,
    chapterIndex: unit.chapterIndex,
    lessonNo: 11,
    domain: "Pronunciation",
    skillType: "pronunciation",
    grammar: "pronunciation",
    level: 1,
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
    grade: 1,
    book: unit.book,
    chapter: unit.chapter,
    chapterIndex: unit.chapterIndex,
    lessonNo: 12,
    domain: "Listening",
    skillType: "listening",
    grammar: "listening",
    level: 1,
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
    greetings: { q: "Chọn lời chào đúng:", c: ["Hello", "Goodbye", "Thank you", "Sorry"], a: "Hello", ex: "Hello! I'm Mai." },
    have_a: { q: "Hoàn thành: I have ___ cup.", c: ["a", "an", "the", "is"], a: "a", ex: "I have a cup." },
    this_is_my: { q: "Hoàn thành: This is ___ bag.", c: ["my", "I", "am", "is"], a: "my", ex: "This is my bag." },
    this_is_a: { q: "Hoàn thành: This is ___ desk.", c: ["a", "an", "the", "my"], a: "a", ex: "This is a desk." },
    i_like: { q: "Hoàn thành: I ___ fish.", c: ["like", "likes", "liking", "is"], a: "like", ex: "I like fish." },
    colors: { q: "The pen is ___.", c: ["red", "run", "pen", "desk"], a: "red", ex: "It's red." },
    there_is: { q: "___ a flower.", c: ["There's", "There are", "They are", "It is"], a: "There's", ex: "There's a flower." },
    body_parts: { q: "This is my ___.", c: ["hand", "have", "happy", "hat"], a: "hand", ex: "This is my hand." },
    how_many: { q: "___ many clocks?", c: ["How", "What", "Where", "Who"], a: "How", ex: "How many clocks?" },
    this_is_a_animal: { q: "This is ___ lion.", c: ["a", "an", "the", "is"], a: "a", ex: "This is a lion." },
    present_continuous_g1: { q: "The boy is ___.", c: ["running", "run", "runs", "ran"], a: "running", ex: "He is running." },
    look_at: { q: "___ at the lake.", c: ["Look", "Looks", "Looking", "Looked"], a: "Look", ex: "Look at the lake." },
    i_want: { q: "I ___ a banana.", c: ["want", "wants", "wanted", "wanting"], a: "want", ex: "I want a banana." },
    can_see: { q: "I can ___ a robot.", c: ["see", "sees", "seeing", "saw"], a: "see", ex: "I can see a robot." },
    he_she_is: { q: "She is ___ the match.", c: ["watching", "watch", "watches", "watched"], a: "watching", ex: "She is watching." },
    how_many_rooms: { q: "How many windows? ___", c: ["Two", "Run", "Red", "Look"], a: "Two", ex: "Two windows." }
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
      choices: pair ? shuffle([pair.a, pair.b, "same", "no"]) : shuffle([ex?.word || "ball", "wrong", "no", "yes"]),
      answer: pair ? pair.a : ex?.word || "ball",
      hint: topic.points[0]
    },
    { id: `q_${id}_2`, skill: id, grammar: "pronunciation", type: "multiple_choice", question: "Chủ đề phát âm?", choices: shuffle([topic.focus, "Past simple", "Articles", "Passive"]), answer: topic.focus, hint: topic.focus },
    { id: `q_${id}_3`, skill: id, grammar: "pronunciation", type: "input", question: pair ? `Viết từ ngắn hơn: ${pair.b} → ___` : `Viết từ: ${ex?.word}`, answer: pair ? pair.a : ex?.word || "ball", hint: pair?.a || ex?.word },
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

const G1_ERRORS = [
  { pattern: "goodbye hello", grammar: "greetings", code: "G1001", errorType: "greeting_error", title: "Nhầm lời chào và tạm biệt", message: "Hello/Hi dùng khi gặp; Bye/Goodbye khi chia tay.", hint: "Hello · Hi · I'm...", recommendation: "g1_u1_greetings" },
  { pattern: "i have is", grammar: "have_a", code: "G1002", errorType: "have_error", title: "Sai cấu trúc I have a...", message: "Sau I have cần mạo từ a/an + danh từ, không dùng is.", hint: "I have a + N.", recommendation: "g1_u2_have_a" },
  { pattern: "this is i", grammar: "this_is_my", code: "G1003", errorType: "possessive_error", title: "Thiếu my sau This is", message: "Giới thiệu đồ của mình: This is my + N.", hint: "This is my bag.", recommendation: "g1_u3_this_is_my" },
  { pattern: "this is the", grammar: "this_is_a", code: "G1004", errorType: "article_error", title: "Dùng sai mạo từ", message: "Nhận diện lần đầu dùng a/an: This is a desk.", hint: "This is a + N.", recommendation: "g1_u4_this_is_a" },
  { pattern: "i likes", grammar: "i_like", code: "G1005", errorType: "verb_form", title: "Sai dạng like", message: "I + like (nguyên thể), không thêm -s.", hint: "I like fish.", recommendation: "g1_u5_i_like" },
  { pattern: "it red", grammar: "colors", code: "G1006", errorType: "missing_be", title: "Thiếu is khi nói màu", message: "Mô tả màu: It's red / It is blue.", hint: "It's + màu.", recommendation: "g1_u6_colors" },
  { pattern: "there are a", grammar: "there_is", code: "G1007", errorType: "there_be_error", title: "Sai There's / There are", message: "Một vật dùng There's a..., không dùng There are a.", hint: "There's a flower.", recommendation: "g1_u7_there_is" },
  { pattern: "how much clocks", grammar: "how_many", code: "G1008", errorType: "question_error", title: "Nhầm How many / How much", message: "Đếm được dùng How many + danh từ số nhiều.", hint: "How many clocks?", recommendation: "g1_u9_how_many" },
  { pattern: "he is run", grammar: "present_continuous_g1", code: "G1009", errorType: "ing_form", title: "Thiếu -ing", message: "Hành động đang diễn ra: He is running.", hint: "He/She is + V-ing.", recommendation: "g1_u11_present_continuous_g1" },
  { pattern: "looks at", grammar: "look_at", code: "G1010", errorType: "imperative_error", title: "Sai mệnh lệnh Look at", message: "Chỉ dẫn nhìn: Look at + N (không thêm -s).", hint: "Look at the lake.", recommendation: "g1_u12_look_at" },
  { pattern: "i wants", grammar: "i_want", code: "G1011", errorType: "verb_form", title: "Sai dạng want", message: "I want + N (nguyên thể want).", hint: "I want a banana.", recommendation: "g1_u13_i_want" },
  { pattern: "i can sees", grammar: "can_see", code: "G1012", errorType: "modal_error", title: "Sai sau can", message: "Sau can dùng động từ nguyên thể: I can see.", hint: "I can see a robot.", recommendation: "g1_u14_can_see" },
  { pattern: "she is watch", grammar: "he_she_is", code: "G1013", errorType: "ing_form", title: "Thiếu -ing sau is", message: "She is watching (không dùng watch sau is).", hint: "She is watching.", recommendation: "g1_u15_he_she_is" }
];

function merge() {
  const g1Ids = new Set();
  const g1Grammars = new Set(UNITS.map((u) => u.grammar.id));
  UNITS.forEach((u) => {
    g1Ids.add(grammarId(u));
    g1Ids.add(vocabId(u));
    g1Ids.add(pronId(u));
    g1Ids.add(listenId(u));
  });

  const skills = JSON.parse(fs.readFileSync(path.join(dataDir, "skills.json"), "utf8")).filter((s) => !g1Ids.has(s.id));
  const lessons = JSON.parse(fs.readFileSync(path.join(dataDir, "lessons.json"), "utf8")).filter((l) => !g1Ids.has(l.id));
  const questions = JSON.parse(fs.readFileSync(path.join(dataDir, "questions.json"), "utf8")).filter((q) => !g1Ids.has(q.skill));
  const errors = JSON.parse(fs.readFileSync(path.join(dataDir, "errors.json"), "utf8")).filter(
    (e) => !g1Grammars.has(e.grammar) && !(e.recommendation || "").startsWith("g1_")
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
  fs.writeFileSync(path.join(dataDir, "errors.json"), JSON.stringify([...G1_ERRORS, ...errors], null, 2) + "\n");

  console.log("Grade 1 units:", UNITS.length);
  console.log("Grade 1 skills:", newSkills.length);
  console.log("Grade 1 questions:", newQuestions.length);
  console.log("Grade 1 error patterns:", G1_ERRORS.length);
  console.log("Total skills:", newSkills.length + skills.length);
  console.log("Total questions:", newQuestions.length + questions.length);
  console.log("Total errors:", G1_ERRORS.length + errors.length);
}

merge();
