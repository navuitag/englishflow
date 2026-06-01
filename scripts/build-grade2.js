#!/usr/bin/env node
/**
 * Generate full Grade 2 Global Success program (16 Units × 4 skill types).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const SOURCE =
  "Bám sát SGK Tiếng Anh 2 – Kết nối tri thức với cuộc sống (Global Success).";

const PRON_TOPICS = [
  { focus: "Âm /b/ và /p/", points: ["/b/ trong birthday, balloon, cake", "/p/ trong party, present"], pairs: [{ a: "balloon", b: "palloon", note: "b vs p" }], examples: [{ word: "birthday", stress: "BIRTH-day", note: "/ˈbɜːθdeɪ/" }] },
  { focus: "Âm /w/ trong where", points: ["/w/ trong where, what, we", "Môi tròn như u"], pairs: [{ a: "where", b: "here", note: "w vs h" }], examples: [{ word: "where", stress: "where", note: "/weə/" }] },
  { focus: "Âm /l/ trong let's", points: ["/l/ trong let's, look, lake", "Đầu lưỡi chạm vòm miệng"], pairs: [], examples: [{ word: "let's", stress: "let's", note: "/lets/" }] },
  { focus: "Âm /ð/ trong there", points: ["/ð/ trong there, the, this", "Lưỡi giữa hai răng"], pairs: [{ a: "there", b: "dare", note: "th vs d" }], examples: [{ word: "there", stress: "there", note: "/ðeə/" }] },
  { focus: "Nguyên âm /ʌ/ và /æ/", points: ["/ʌ/ trong colour, cup", "/æ/ trong cat, hat, black"], pairs: [{ a: "cat", b: "cut", note: "æ vs ʌ" }], examples: [{ word: "colour", stress: "CO-lour", note: "/ˈkʌlə/" }] },
  { focus: "Âm /k/ và /g/", points: ["/k/ trong can, cow, duck", "/g/ trong goat, garden"], pairs: [{ a: "goat", b: "coat", note: "g vs c" }], examples: [{ word: "cow", stress: "cow", note: "/kaʊ/" }] },
  { focus: "Âm /p/ và /f/", points: ["/p/ trong pass, please, plate", "/f/ trong fork, food"], pairs: [], examples: [{ word: "please", stress: "please", note: "/pliːz/" }] },
  { focus: "Âm /ɪ/ và /iː/", points: ["/ɪ/ trong in, is, village", "/iː/ trong see, please, tree"], pairs: [{ a: "sit", b: "seat", note: "ɪ vs iː" }], examples: [{ word: "village", stress: "VIL-lage", note: "/ˈvɪlɪdʒ/" }] },
  { focus: "Âm /m/ và /n/", points: ["/m/ trong much, mango, milk", "/n/ trong many, banana"], pairs: [], examples: [{ word: "much", stress: "much", note: "/mʌtʃ/" }] },
  { focus: "Âm /z/ trong these", points: ["/z/ trong these, zoo, is", "Rung thanh quản"], pairs: [{ a: "these", b: "this", note: "z vs s" }], examples: [{ word: "these", stress: "these", note: "/ðiːz/" }] },
  { focus: "Âm /ŋ/ trong running", points: ["/ŋ/ trong running, playing, swing", "Mũi rung khi kết thúc -ing"], pairs: [], examples: [{ word: "running", stress: "RUN-ning", note: "/ˈrʌnɪŋ/" }] },
  { focus: "Âm /d/ và /t/", points: ["/d/ trong would, like, food", "/t/ trong what, tea, water"], pairs: [{ a: "would", b: "wood", note: "d vs silent" }], examples: [{ word: "would", stress: "would", note: "/wʊd/" }] },
  { focus: "Âm /θ/ trong maths", points: ["/θ/ trong maths, three, think", "Lưỡi giữa hai răng, thổi hơi"], pairs: [], examples: [{ word: "maths", stress: "maths", note: "/mæθs/" }] },
  { focus: "Âm /ɑː/ trong are", points: ["/ɑː/ trong are, car, park", "Miệng mở rộng"], pairs: [{ a: "are", b: "or", note: "are vs or" }], examples: [{ word: "are", stress: "are", note: "/ɑː/" }] },
  { focus: "Âm /ʃ/ trong shop", points: ["/ʃ/ trong shop, shirt, shoes", "Môi tròn như u"], pairs: [], examples: [{ word: "shirt", stress: "shirt", note: "/ʃɜːt/" }] },
  { focus: "Âm /v/ và /w/", points: ["/v/ trong have, village", "/w/ trong we, water, tent"], pairs: [{ a: "we", b: "vee", note: "w vs v" }], examples: [{ word: "tent", stress: "tent", note: "/tent/" }] }
];

/** @type {Array<object>} */
const UNITS = [
  {
    chapterIndex: 1, chapter: "Unit 1: At my birthday party", book: "Sách giáo khoa",
    grammar: { id: "i_like_yummy", title: "I like + N; The + N + is yummy", formula: "I like + N / The + N + is yummy", description: "Nói món ăn yêu thích và mô tả đồ ăn ngon ở tiệc sinh nhật." },
    words: [
      { en: "birthday", vi: "sinh nhật", example: "Happy birthday!" },
      { en: "party", vi: "bữa tiệc", example: "This is my birthday party." },
      { en: "cake", vi: "bánh kem", example: "I like cake." },
      { en: "balloon", vi: "bóng bay", example: "The balloon is red." },
      { en: "candle", vi: "nến", example: "The candle is on the cake." },
      { en: "yummy", vi: "ngon", example: "The cake is yummy." },
      { en: "present", vi: "quà", example: "I like my present." },
      { en: "friend", vi: "bạn", example: "My friend is at the party." }
    ],
    listen: {
      lines: [
        { speaker: "Mai", text: "I like cake." },
        { speaker: "Tom", text: "The cake is yummy!" },
        { speaker: "Mai", text: "Happy birthday to you!" }
      ],
      qs: [
        { q: "What does Mai like?", a: "Cake", c: ["Balloon", "Cake", "Present", "Party"] },
        { q: "How is the cake?", a: "Yummy", c: ["Sad", "Yummy", "Big", "Old"] },
        { q: "What do they say?", a: "Happy birthday", c: ["Goodbye", "Happy birthday", "Thank you", "See you"] },
        { q: "Where are they?", a: "At a birthday party", c: ["At school", "At a birthday party", "At the zoo", "In the shop"] }
      ]
    }
  },
  {
    chapterIndex: 2, chapter: "Unit 2: In the backyard", book: "Sách giáo khoa",
    grammar: { id: "where_is", title: "Where is the...?", formula: "Where is the + N? It's in/on...", description: "Hỏi và trả lời vị trí đồ vật trong sân sau." },
    words: [
      { en: "backyard", vi: "sân sau", example: "We play in the backyard." },
      { en: "tree", vi: "cây", example: "Where is the tree?" },
      { en: "flower", vi: "hoa", example: "The flower is in the garden." },
      { en: "ball", vi: "quả bóng", example: "The ball is on the grass." },
      { en: "swing", vi: "cái xích đu", example: "The swing is under the tree." },
      { en: "grass", vi: "cỏ", example: "It's on the grass." },
      { en: "garden", vi: "vườn", example: "It's in the garden." }
    ],
    listen: {
      lines: [
        { speaker: "Dad", text: "Where is the ball?" },
        { speaker: "Child", text: "It's on the grass." },
        { speaker: "Dad", text: "Where is the swing?" }
      ],
      qs: [
        { q: "What does Dad ask about first?", a: "The ball", c: ["The tree", "The ball", "The flower", "The swing"] },
        { q: "Where is the ball?", a: "On the grass", c: ["In the tree", "On the grass", "Under the swing", "In the house"] },
        { q: "What does Dad ask about next?", a: "The swing", c: ["The ball", "The swing", "The cake", "The book"] },
        { q: "Where are they?", a: "In the backyard", c: ["In the classroom", "In the backyard", "At the zoo", "At the café"] }
      ]
    }
  },
  {
    chapterIndex: 3, chapter: "Unit 3: At the seaside", book: "Sách giáo khoa",
    grammar: { id: "lets", title: "Let's + V", formula: "Let's + V / Let's look at...", description: "Đề nghị cùng làm gì đó ở biển với Let's..." },
    words: [
      { en: "seaside", vi: "bờ biển", example: "We are at the seaside." },
      { en: "sea", vi: "biển", example: "Let's look at the sea." },
      { en: "sand", vi: "cát", example: "Let's play in the sand." },
      { en: "shell", vi: "vỏ sò", example: "Let's look at the shell." },
      { en: "boat", vi: "thuyền", example: "Let's look at the boat." },
      { en: "fish", vi: "cá", example: "Let's look at the fish." },
      { en: "sun", vi: "mặt trời", example: "The sun is hot." }
    ],
    listen: {
      lines: [
        { speaker: "Ann", text: "Let's look at the sea." },
        { speaker: "Ben", text: "Let's play in the sand." },
        { speaker: "Ann", text: "Let's look at the shell." }
      ],
      qs: [
        { q: "What does Ann suggest first?", a: "Look at the sea", c: ["Play in the sand", "Look at the sea", "Go home", "Eat cake"] },
        { q: "What does Ben suggest?", a: "Play in the sand", c: ["Look at the boat", "Play in the sand", "Look at the fish", "Sleep"] },
        { q: "What do they look at last?", a: "A shell", c: ["A boat", "A shell", "A tree", "A ball"] },
        { q: "Where are they?", a: "At the seaside", c: ["At the farm", "At the seaside", "In the village", "At school"] }
      ]
    }
  },
  {
    chapterIndex: 4, chapter: "Unit 4: In the countryside", book: "Sách giáo khoa",
    grammar: { id: "there_are", title: "There are + N", formula: "There are + N (plural)", description: "Nói về sự hiện diện của nhiều vật ở nông thôn với There are..." },
    words: [
      { en: "countryside", vi: "nông thôn", example: "We live in the countryside." },
      { en: "field", vi: "cánh đồng", example: "There are fields." },
      { en: "cow", vi: "con bò", example: "There are cows in the field." },
      { en: "sheep", vi: "con cừu", example: "There are sheep on the hill." },
      { en: "duck", vi: "con vịt", example: "There are ducks in the pond." },
      { en: "pond", vi: "cái ao", example: "There are ducks in the pond." },
      { en: "hill", vi: "đồi", example: "There are trees on the hill." }
    ],
    listen: {
      lines: [
        { speaker: "Guide", text: "There are cows in the field." },
        { speaker: "Girl", text: "There are sheep on the hill." },
        { speaker: "Guide", text: "There are ducks in the pond." }
      ],
      qs: [
        { q: "What animals are in the field?", a: "Cows", c: ["Sheep", "Cows", "Ducks", "Fish"] },
        { q: "Where are the sheep?", a: "On the hill", c: ["In the pond", "On the hill", "In the field", "At the seaside"] },
        { q: "Where are the ducks?", a: "In the pond", c: ["On the hill", "In the pond", "In the field", "In the shop"] },
        { q: "Where are they?", a: "In the countryside", c: ["At the zoo", "In the countryside", "At the café", "In the classroom"] }
      ]
    }
  },
  {
    chapterIndex: 5, chapter: "Unit 5: In the classroom", book: "Sách giáo khoa",
    grammar: { id: "what_colour", title: "What colour is the...?", formula: "What colour is the + N? It's + colour", description: "Hỏi và trả lời màu sắc đồ dùng học tập." },
    words: [
      { en: "classroom", vi: "lớp học", example: "We are in the classroom." },
      { en: "desk", vi: "bàn học", example: "What colour is the desk?" },
      { en: "chair", vi: "ghế", example: "The chair is blue." },
      { en: "board", vi: "bảng", example: "The board is green." },
      { en: "book", vi: "sách", example: "The book is red." },
      { en: "bag", vi: "cặp sách", example: "The bag is yellow." },
      { en: "blue", vi: "màu xanh dương", example: "It's blue." },
      { en: "red", vi: "màu đỏ", example: "It's red." }
    ],
    listen: {
      lines: [
        { speaker: "Teacher", text: "What colour is the desk?" },
        { speaker: "Student", text: "It's brown." },
        { speaker: "Teacher", text: "What colour is the bag?" }
      ],
      qs: [
        { q: "What does the teacher ask about first?", a: "The desk", c: ["The bag", "The desk", "The board", "The chair"] },
        { q: "What colour is the desk?", a: "Brown", c: ["Blue", "Brown", "Red", "Green"] },
        { q: "What does the teacher ask about next?", a: "The bag", c: ["The desk", "The bag", "The book", "The chair"] },
        { q: "Where are they?", a: "In the classroom", c: ["In the shop", "In the classroom", "On the farm", "At home"] }
      ]
    }
  },
  {
    chapterIndex: 6, chapter: "Unit 6: On the farm", book: "Sách giáo khoa",
    grammar: { id: "can_see", title: "What can you see?", formula: "What can you see? I can see a...", description: "Hỏi và trả lời những gì nhìn thấy trên trang trại." },
    words: [
      { en: "farm", vi: "trang trại", example: "We are on the farm." },
      { en: "horse", vi: "con ngựa", example: "I can see a horse." },
      { en: "goat", vi: "con dê", example: "I can see a goat." },
      { en: "chicken", vi: "con gà", example: "I can see a chicken." },
      { en: "pig", vi: "con lợn", example: "I can see a pig." },
      { en: "barn", vi: "chuồng", example: "The barn is big." },
      { en: "see", vi: "nhìn thấy", example: "What can you see?" }
    ],
    listen: {
      lines: [
        { speaker: "Farmer", text: "What can you see?" },
        { speaker: "Child", text: "I can see a horse." },
        { speaker: "Farmer", text: "I can see a goat too." }
      ],
      qs: [
        { q: "What does the farmer ask?", a: "What can you see?", c: ["Where is the horse?", "What can you see?", "How many goats?", "What colour is it?"] },
        { q: "What can the child see?", a: "A horse", c: ["A pig", "A horse", "A chicken", "A cow"] },
        { q: "What can the farmer see?", a: "A goat", c: ["A horse", "A goat", "A barn", "A tree"] },
        { q: "Where are they?", a: "On the farm", c: ["At the zoo", "On the farm", "In the village", "At the seaside"] }
      ]
    }
  },
  {
    chapterIndex: 7, chapter: "Unit 7: In the kitchen", book: "Sách giáo khoa",
    grammar: { id: "pass_me", title: "Pass me the...", formula: "Pass me the + N, please / Here you are", description: "Nhờ ai đó đưa đồ vật trong bếp và đáp lại Here you are." },
    words: [
      { en: "kitchen", vi: "nhà bếp", example: "We are in the kitchen." },
      { en: "plate", vi: "đĩa", example: "Pass me the plate, please." },
      { en: "cup", vi: "cốc", example: "Pass me the cup, please." },
      { en: "spoon", vi: "thìa", example: "Pass me the spoon, please." },
      { en: "fork", vi: "nĩa", example: "Pass me the fork, please." },
      { en: "bowl", vi: "bát", example: "Here you are." },
      { en: "please", vi: "làm ơn", example: "Pass me the bowl, please." }
    ],
    listen: {
      lines: [
        { speaker: "Mum", text: "Pass me the plate, please." },
        { speaker: "Child", text: "Here you are." },
        { speaker: "Mum", text: "Pass me the cup, please." }
      ],
      qs: [
        { q: "What does Mum ask for first?", a: "The plate", c: ["The cup", "The plate", "The fork", "The bowl"] },
        { q: "What does the child say?", a: "Here you are", c: ["Thank you", "Here you are", "Please", "Goodbye"] },
        { q: "What does Mum ask for next?", a: "The cup", c: ["The plate", "The cup", "The spoon", "The bowl"] },
        { q: "Where are they?", a: "In the kitchen", c: ["In the shop", "In the kitchen", "On the farm", "At the campsite"] }
      ]
    }
  },
  {
    chapterIndex: 8, chapter: "Unit 8: In the village", book: "Sách giáo khoa",
    grammar: { id: "prepositions", title: "Giới từ in/on/under", formula: "in/on/under + place", description: "Mô tả vị trí đồ vật trong làng với in, on, under." },
    words: [
      { en: "village", vi: "làng", example: "We live in the village." },
      { en: "house", vi: "ngôi nhà", example: "The cat is in the house." },
      { en: "bridge", vi: "cây cầu", example: "The dog is on the bridge." },
      { en: "bench", vi: "ghế dài", example: "The bag is on the bench." },
      { en: "under", vi: "dưới", example: "The ball is under the bench." },
      { en: "on", vi: "trên", example: "The cat is on the roof." },
      { en: "in", vi: "trong", example: "The bird is in the tree." }
    ],
    listen: {
      lines: [
        { speaker: "Guide", text: "The cat is in the house." },
        { speaker: "Boy", text: "The dog is on the bridge." },
        { speaker: "Guide", text: "The ball is under the bench." }
      ],
      qs: [
        { q: "Where is the cat?", a: "In the house", c: ["On the bridge", "In the house", "Under the bench", "In the tree"] },
        { q: "Where is the dog?", a: "On the bridge", c: ["In the house", "On the bridge", "Under the bench", "On the roof"] },
        { q: "Where is the ball?", a: "Under the bench", c: ["On the bench", "Under the bench", "In the house", "On the bridge"] },
        { q: "Where are they?", a: "In the village", c: ["In the city", "In the village", "At the zoo", "At the café"] }
      ]
    }
  },
  {
    chapterIndex: 9, chapter: "Unit 9: In the grocery store", book: "Sách giáo khoa",
    grammar: { id: "how_much", title: "How much is the...?", formula: "How much is the + N?", description: "Hỏi giá đồ vật trong cửa hàng tạp hóa." },
    words: [
      { en: "grocery store", vi: "cửa hàng tạp hóa", example: "We are in the grocery store." },
      { en: "apple", vi: "quả táo", example: "How much is the apple?" },
      { en: "banana", vi: "quả chuối", example: "How much is the banana?" },
      { en: "milk", vi: "sữa", example: "How much is the milk?" },
      { en: "bread", vi: "bánh mì", example: "How much is the bread?" },
      { en: "rice", vi: "gạo", example: "How much is the rice?" },
      { en: "much", vi: "nhiều/bao nhiêu (không đếm được)", example: "How much is it?" }
    ],
    listen: {
      lines: [
        { speaker: "Customer", text: "How much is the apple?" },
        { speaker: "Shopkeeper", text: "It's five thousand dong." },
        { speaker: "Customer", text: "How much is the milk?" }
      ],
      qs: [
        { q: "What does the customer ask about first?", a: "The apple", c: ["The milk", "The apple", "The bread", "The rice"] },
        { q: "How much is the apple?", a: "Five thousand dong", c: ["Two thousand dong", "Five thousand dong", "Ten thousand dong", "One dong"] },
        { q: "What does the customer ask about next?", a: "The milk", c: ["The apple", "The milk", "The banana", "The bread"] },
        { q: "Where are they?", a: "In the grocery store", c: ["In the clothes shop", "In the grocery store", "At the campsite", "On the farm"] }
      ]
    }
  },
  {
    chapterIndex: 10, chapter: "Unit 10: At the zoo", book: "Sách giáo khoa",
    grammar: { id: "these_are", title: "These are + N", formula: "These are + N (animals)", description: "Giới thiệu nhiều con vật ở sở thú với These are..." },
    words: [
      { en: "zoo", vi: "sở thú", example: "We are at the zoo." },
      { en: "lion", vi: "sư tử", example: "These are lions." },
      { en: "tiger", vi: "con hổ", example: "These are tigers." },
      { en: "elephant", vi: "con voi", example: "These are elephants." },
      { en: "monkey", vi: "con khỉ", example: "These are monkeys." },
      { en: "panda", vi: "gấu trúc", example: "These are pandas." },
      { en: "these", vi: "những cái này", example: "These are monkeys." }
    ],
    listen: {
      lines: [
        { speaker: "Guide", text: "These are lions." },
        { speaker: "Girl", text: "These are monkeys." },
        { speaker: "Guide", text: "These are elephants." }
      ],
      qs: [
        { q: "What animals does the guide show first?", a: "Lions", c: ["Monkeys", "Lions", "Elephants", "Pandas"] },
        { q: "What does the girl say?", a: "These are monkeys", c: ["These are lions", "These are monkeys", "These are tigers", "These are pandas"] },
        { q: "What animals are last?", a: "Elephants", c: ["Lions", "Monkeys", "Elephants", "Tigers"] },
        { q: "Where are they?", a: "At the zoo", c: ["On the farm", "At the zoo", "In the village", "At the seaside"] }
      ]
    }
  },
  {
    chapterIndex: 11, chapter: "Unit 11: In the playground", book: "Sách giáo khoa",
    grammar: { id: "present_continuous_g2", title: "They are + V-ing", formula: "They are + V-ing", description: "Mô tả hành động đang diễn ra của nhiều người ở sân chơi." },
    words: [
      { en: "playground", vi: "sân chơi", example: "They are in the playground." },
      { en: "running", vi: "đang chạy", example: "They are running." },
      { en: "playing", vi: "đang chơi", example: "They are playing." },
      { en: "jumping", vi: "đang nhảy", example: "They are jumping." },
      { en: "skipping", vi: "đang nhảy dây", example: "They are skipping." },
      { en: "slide", vi: "cầu trượt", example: "They are on the slide." },
      { en: "children", vi: "trẻ em", example: "The children are playing." }
    ],
    listen: {
      lines: [
        { speaker: "Teacher", text: "They are running." },
        { speaker: "Student", text: "They are playing on the slide." },
        { speaker: "Teacher", text: "They are jumping." }
      ],
      qs: [
        { q: "What are they doing first?", a: "Running", c: ["Jumping", "Running", "Sleeping", "Eating"] },
        { q: "Where are they playing?", a: "On the slide", c: ["In the classroom", "On the slide", "At the zoo", "In the shop"] },
        { q: "What are they doing last?", a: "Jumping", c: ["Running", "Jumping", "Skipping", "Reading"] },
        { q: "Where are they?", a: "In the playground", c: ["In the playground", "In the kitchen", "On the farm", "At the campsite"] }
      ]
    }
  },
  {
    chapterIndex: 12, chapter: "Unit 12: At the café", book: "Sách giáo khoa",
    grammar: { id: "would_like", title: "I'd like + N", formula: "I'd like + N / What would you like?", description: "Gọi món ở quán cà phê với I'd like và What would you like?" },
    words: [
      { en: "café", vi: "quán cà phê", example: "We are at the café." },
      { en: "juice", vi: "nước ép", example: "I'd like juice." },
      { en: "water", vi: "nước", example: "I'd like water, please." },
      { en: "tea", vi: "trà", example: "I'd like tea." },
      { en: "coffee", vi: "cà phê", example: "I'd like coffee." },
      { en: "sandwich", vi: "bánh mì kẹp", example: "I'd like a sandwich." },
      { en: "like", vi: "muốn/thích", example: "What would you like?" }
    ],
    listen: {
      lines: [
        { speaker: "Waiter", text: "What would you like?" },
        { speaker: "Girl", text: "I'd like juice, please." },
        { speaker: "Boy", text: "I'd like a sandwich." }
      ],
      qs: [
        { q: "What does the waiter ask?", a: "What would you like?", c: ["How much is it?", "What would you like?", "Where is the café?", "What colour is it?"] },
        { q: "What would the girl like?", a: "Juice", c: ["Tea", "Juice", "Coffee", "Water"] },
        { q: "What would the boy like?", a: "A sandwich", c: ["Juice", "A sandwich", "Tea", "Water"] },
        { q: "Where are they?", a: "At the café", c: ["At the grocery store", "At the café", "In the classroom", "At the campsite"] }
      ]
    }
  },
  {
    chapterIndex: 13, chapter: "Unit 13: In the maths class", book: "Sách giáo khoa",
    grammar: { id: "how_many_plural", title: "How many + N?", formula: "How many + N? + number answer", description: "Hỏi và trả lời số lượng đồ vật đếm được trong lớp toán." },
    words: [
      { en: "maths", vi: "toán học", example: "We are in the maths class." },
      { en: "pencil", vi: "bút chì", example: "How many pencils?" },
      { en: "ruler", vi: "thước kẻ", example: "Three rulers." },
      { en: "eraser", vi: "cục tẩy", example: "Two erasers." },
      { en: "notebook", vi: "vở", example: "Five notebooks." },
      { en: "number", vi: "số", example: "The number is four." },
      { en: "many", vi: "nhiều/bao nhiêu (đếm được)", example: "How many books?" }
    ],
    listen: {
      lines: [
        { speaker: "Teacher", text: "How many pencils?" },
        { speaker: "Student", text: "Four pencils." },
        { speaker: "Teacher", text: "How many rulers?" }
      ],
      qs: [
        { q: "What does the teacher ask about first?", a: "Pencils", c: ["Rulers", "Pencils", "Erasers", "Notebooks"] },
        { q: "How many pencils?", a: "Four", c: ["Two", "Three", "Four", "Five"] },
        { q: "What does the teacher ask about next?", a: "Rulers", c: ["Pencils", "Rulers", "Notebooks", "Books"] },
        { q: "Where are they?", a: "In the maths class", c: ["In the playground", "In the maths class", "At the café", "On the farm"] }
      ]
    }
  },
  {
    chapterIndex: 14, chapter: "Unit 14: At home", book: "Sách giáo khoa",
    grammar: { id: "where_are", title: "Where are the...?", formula: "Where are the + N? They are on/in...", description: "Hỏi và trả lời vị trí nhiều đồ vật ở nhà." },
    words: [
      { en: "home", vi: "nhà", example: "We are at home." },
      { en: "toys", vi: "đồ chơi", example: "Where are the toys?" },
      { en: "shoes", vi: "giày", example: "They are on the floor." },
      { en: "books", vi: "sách", example: "They are on the shelf." },
      { en: "keys", vi: "chìa khóa", example: "They are on the table." },
      { en: "floor", vi: "sàn nhà", example: "They are on the floor." },
      { en: "shelf", vi: "kệ", example: "They are on the shelf." }
    ],
    listen: {
      lines: [
        { speaker: "Mum", text: "Where are the toys?" },
        { speaker: "Child", text: "They are on the floor." },
        { speaker: "Mum", text: "Where are the books?" }
      ],
      qs: [
        { q: "What does Mum ask about first?", a: "The toys", c: ["The books", "The toys", "The shoes", "The keys"] },
        { q: "Where are the toys?", a: "On the floor", c: ["On the shelf", "On the floor", "On the table", "In the kitchen"] },
        { q: "What does Mum ask about next?", a: "The books", c: ["The toys", "The books", "The shoes", "The keys"] },
        { q: "Where are they?", a: "At home", c: ["At school", "At home", "At the zoo", "In the shop"] }
      ]
    }
  },
  {
    chapterIndex: 15, chapter: "Unit 15: In the clothes shop", book: "Sách giáo khoa",
    grammar: { id: "what_colour_clothes", title: "What colour is the...? (clothes)", formula: "What colour is the + clothes?", description: "Hỏi và trả lời màu sắc quần áo trong cửa hàng." },
    words: [
      { en: "clothes shop", vi: "cửa hàng quần áo", example: "We are in the clothes shop." },
      { en: "shirt", vi: "áo sơ mi", example: "What colour is the shirt?" },
      { en: "dress", vi: "váy", example: "The dress is pink." },
      { en: "trousers", vi: "quần dài", example: "The trousers are black." },
      { en: "hat", vi: "mũ", example: "The hat is yellow." },
      { en: "shoes", vi: "giày", example: "The shoes are white." },
      { en: "pink", vi: "màu hồng", example: "It's pink." }
    ],
    listen: {
      lines: [
        { speaker: "Shop assistant", text: "What colour is the shirt?" },
        { speaker: "Customer", text: "It's blue." },
        { speaker: "Shop assistant", text: "What colour is the dress?" }
      ],
      qs: [
        { q: "What does the assistant ask about first?", a: "The shirt", c: ["The dress", "The shirt", "The hat", "The shoes"] },
        { q: "What colour is the shirt?", a: "Blue", c: ["Pink", "Blue", "Black", "Yellow"] },
        { q: "What does the assistant ask about next?", a: "The dress", c: ["The shirt", "The dress", "The trousers", "The hat"] },
        { q: "Where are they?", a: "In the clothes shop", c: ["In the grocery store", "In the clothes shop", "At the café", "At home"] }
      ]
    }
  },
  {
    chapterIndex: 16, chapter: "Unit 16: At the campsite", book: "Sách giáo khoa",
    grammar: { id: "we_have", title: "We have a...", formula: "We have a + N at the campsite", description: "Nói về đồ vật có ở khu cắm trại với We have a..." },
    words: [
      { en: "campsite", vi: "khu cắm trại", example: "We are at the campsite." },
      { en: "tent", vi: "lều", example: "We have a tent at the campsite." },
      { en: "fire", vi: "lửa", example: "We have a fire." },
      { en: "sleeping bag", vi: "túi ngủ", example: "We have a sleeping bag." },
      { en: "torch", vi: "đèn pin", example: "We have a torch." },
      { en: "map", vi: "bản đồ", example: "We have a map." },
      { en: "camp", vi: "cắm trại", example: "We camp at the campsite." }
    ],
    listen: {
      lines: [
        { speaker: "Dad", text: "We have a tent at the campsite." },
        { speaker: "Child", text: "We have a torch too." },
        { speaker: "Dad", text: "We have a map." }
      ],
      qs: [
        { q: "What do they have first?", a: "A tent", c: ["A torch", "A tent", "A map", "A fire"] },
        { q: "What else do they have?", a: "A torch", c: ["A tent", "A torch", "A sleeping bag", "A fire"] },
        { q: "What do they have last?", a: "A map", c: ["A tent", "A map", "A torch", "A fire"] },
        { q: "Where are they?", a: "At the campsite", c: ["At home", "At the campsite", "In the village", "At the seaside"] }
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
  return `g2_u${unit.chapterIndex}_${unit.grammar.id}`;
}

function vocabId(unit) {
  return `g2_u${unit.chapterIndex}_vocab`;
}

function pronId(unit) {
  return `g2_u${unit.chapterIndex}_pronunciation`;
}

function listenId(unit) {
  return `g2_u${unit.chapterIndex}_listening`;
}

function buildGrammarSkill(unit) {
  const id = grammarId(unit);
  return {
    id,
    title: `Unit ${unit.chapterIndex} · ${unit.grammar.title}`,
    grade: 2,
    book: unit.book,
    chapter: unit.chapter,
    chapterIndex: unit.chapterIndex,
    lessonNo: 1,
    domain: "Grammar",
    skillType: "grammar",
    grammar: unit.grammar.id,
    level: 2,
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
    grade: 2,
    book: unit.book,
    chapter: unit.chapter,
    chapterIndex: unit.chapterIndex,
    lessonNo: 10,
    domain: "Vocabulary",
    skillType: "vocabulary",
    grammar: "vocabulary",
    level: 2,
    prerequisite: [],
    description: `Học ${unit.words.length} từ vựng Unit ${unit.chapterIndex} Global Success lớp 2.`,
    formula: `${unit.words.length} từ · EN ↔ VI`,
    visualization: "vocabulary"
  };
}

function buildPronSkill(unit, topic) {
  return {
    id: pronId(unit),
    title: `Unit ${unit.chapterIndex} · Phát âm`,
    grade: 2,
    book: unit.book,
    chapter: unit.chapter,
    chapterIndex: unit.chapterIndex,
    lessonNo: 11,
    domain: "Pronunciation",
    skillType: "pronunciation",
    grammar: "pronunciation",
    level: 2,
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
    grade: 2,
    book: unit.book,
    chapter: unit.chapter,
    chapterIndex: unit.chapterIndex,
    lessonNo: 12,
    domain: "Listening",
    skillType: "listening",
    grammar: "listening",
    level: 2,
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
    i_like_yummy: { q: "Hoàn thành: I ___ cake.", c: ["like", "likes", "liking", "is"], a: "like", ex: "I like cake." },
    where_is: { q: "___ is the ball?", c: ["Where", "What", "How", "Who"], a: "Where", ex: "Where is the ball?" },
    lets: { q: "___ look at the sea.", c: ["Let's", "Let", "Lets", "Looking"], a: "Let's", ex: "Let's look at the sea." },
    there_are: { q: "___ are cows in the field.", c: ["There", "They", "These", "This"], a: "There", ex: "There are cows in the field." },
    what_colour: { q: "What ___ is the desk?", c: ["colour", "color", "many", "much"], a: "colour", ex: "What colour is the desk?" },
    can_see: { q: "I can ___ a horse.", c: ["see", "sees", "seeing", "saw"], a: "see", ex: "I can see a horse." },
    pass_me: { q: "Pass me the plate, ___.", c: ["please", "thanks", "sorry", "hello"], a: "please", ex: "Pass me the plate, please." },
    prepositions: { q: "The ball is ___ the bench.", c: ["under", "over", "between", "through"], a: "under", ex: "The ball is under the bench." },
    how_much: { q: "How ___ is the apple?", c: ["much", "many", "old", "long"], a: "much", ex: "How much is the apple?" },
    these_are: { q: "___ are lions.", c: ["These", "This", "That", "It"], a: "These", ex: "These are lions." },
    present_continuous_g2: { q: "They are ___.", c: ["running", "run", "runs", "ran"], a: "running", ex: "They are running." },
    would_like: { q: "I'd ___ juice, please.", c: ["like", "likes", "liking", "liked"], a: "like", ex: "I'd like juice, please." },
    how_many_plural: { q: "How ___ pencils?", c: ["many", "much", "old", "long"], a: "many", ex: "How many pencils?" },
    where_are: { q: "Where ___ the toys?", c: ["are", "is", "am", "be"], a: "are", ex: "Where are the toys?" },
    what_colour_clothes: { q: "What colour is the ___?", c: ["shirt", "run", "play", "jump"], a: "shirt", ex: "What colour is the shirt?" },
    we_have: { q: "We ___ a tent at the campsite.", c: ["have", "has", "having", "had"], a: "have", ex: "We have a tent at the campsite." }
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
      choices: pair ? shuffle([pair.a, pair.b, "same", "no"]) : shuffle([ex?.word || "birthday", "wrong", "no", "yes"]),
      answer: pair ? pair.a : ex?.word || "birthday",
      hint: topic.points[0]
    },
    { id: `q_${id}_2`, skill: id, grammar: "pronunciation", type: "multiple_choice", question: "Chủ đề phát âm?", choices: shuffle([topic.focus, "Past simple", "Articles", "Passive"]), answer: topic.focus, hint: topic.focus },
    { id: `q_${id}_3`, skill: id, grammar: "pronunciation", type: "input", question: pair ? `Viết từ ngắn hơn: ${pair.b} → ___` : `Viết từ: ${ex?.word}`, answer: pair ? pair.a : ex?.word || "birthday", hint: pair?.a || ex?.word },
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

const G2_ERRORS = [
  { pattern: "the cake is like", grammar: "i_like_yummy", code: "G2001", errorType: "like_yummy_error", title: "Nhầm I like và The ... is yummy", message: "Thích món ăn: I like cake. Mô tả ngon: The cake is yummy.", hint: "I like + N · The + N + is yummy.", recommendation: "g2_u1_i_like_yummy" },
  { pattern: "where are the ball", grammar: "where_is", code: "G2002", errorType: "where_is_error", title: "Sai Where is / Where are", message: "Một vật dùng Where is the + N?, không dùng Where are.", hint: "Where is the ball?", recommendation: "g2_u2_where_is" },
  { pattern: "lets looks at", grammar: "lets", code: "G2003", errorType: "lets_error", title: "Sai sau Let's", message: "Sau Let's dùng động từ nguyên thể: Let's look at...", hint: "Let's + V.", recommendation: "g2_u3_lets" },
  { pattern: "there is cows", grammar: "there_are", code: "G2004", errorType: "there_be_plural", title: "Sai There is / There are", message: "Nhiều vật dùng There are + N số nhiều.", hint: "There are cows.", recommendation: "g2_u4_there_are" },
  { pattern: "what color is", grammar: "what_colour", code: "G2005", errorType: "colour_spelling", title: "Thiếu cấu trúc What colour", message: "Hỏi màu: What colour is the + N? Trả lời: It's + màu.", hint: "What colour is the desk?", recommendation: "g2_u5_what_colour" },
  { pattern: "i can sees", grammar: "can_see", code: "G2006", errorType: "modal_error", title: "Sai sau can", message: "Sau can dùng động từ nguyên thể: I can see.", hint: "I can see a horse.", recommendation: "g2_u6_can_see" },
  { pattern: "give me the", grammar: "pass_me", code: "G2007", errorType: "pass_me_error", title: "Nhầm Pass me và Give me", message: "Nhờ đưa đồ trong bếp: Pass me the + N, please.", hint: "Pass me the plate, please.", recommendation: "g2_u7_pass_me" },
  { pattern: "in the bench", grammar: "prepositions", code: "G2008", errorType: "preposition_error", title: "Sai giới từ in/on/under", message: "Trên bề mặt dùng on; bên dưới dùng under; bên trong dùng in.", hint: "The ball is under the bench.", recommendation: "g2_u8_prepositions" },
  { pattern: "how many is the", grammar: "how_much", code: "G2009", errorType: "how_much_error", title: "Nhầm How much / How many", message: "Hỏi giá dùng How much is the + N?", hint: "How much is the apple?", recommendation: "g2_u9_how_much" },
  { pattern: "this are lions", grammar: "these_are", code: "G2010", errorType: "these_are_error", title: "Sai These are", message: "Giới thiệu nhiều vật gần: These are + N.", hint: "These are lions.", recommendation: "g2_u10_these_are" },
  { pattern: "they is running", grammar: "present_continuous_g2", code: "G2011", errorType: "ing_form", title: "Sai They are + V-ing", message: "Hành động đang diễn ra: They are running.", hint: "They are + V-ing.", recommendation: "g2_u11_present_continuous_g2" },
  { pattern: "i would likes", grammar: "would_like", code: "G2012", errorType: "would_like_error", title: "Sai I'd like", message: "Gọi món: I'd like + N (like không thêm -s).", hint: "I'd like juice, please.", recommendation: "g2_u12_would_like" },
  { pattern: "how much pencils", grammar: "how_many_plural", code: "G2013", errorType: "how_many_error", title: "Nhầm How many / How much", message: "Đếm được dùng How many + danh từ số nhiều.", hint: "How many pencils?", recommendation: "g2_u13_how_many_plural" },
  { pattern: "where is the toys", grammar: "where_are", code: "G2014", errorType: "where_are_error", title: "Sai Where is / Where are", message: "Nhiều vật dùng Where are the + N?", hint: "Where are the toys?", recommendation: "g2_u14_where_are" },
  { pattern: "what colour are the shirt", grammar: "what_colour_clothes", code: "G2016", errorType: "colour_question_error", title: "Sai What colour is/are", message: "Một món quần áo: What colour is the shirt?", hint: "What colour is the + clothes?", recommendation: "g2_u15_what_colour_clothes" },
  { pattern: "we has a tent", grammar: "we_have", code: "G2015", errorType: "we_have_error", title: "Sai We have", message: "We + have (không dùng has sau We).", hint: "We have a tent.", recommendation: "g2_u16_we_have" }
];

function merge() {
  const g2Ids = new Set();
  const g2Grammars = new Set(UNITS.map((u) => u.grammar.id));
  UNITS.forEach((u) => {
    g2Ids.add(grammarId(u));
    g2Ids.add(vocabId(u));
    g2Ids.add(pronId(u));
    g2Ids.add(listenId(u));
  });

  const skills = JSON.parse(fs.readFileSync(path.join(dataDir, "skills.json"), "utf8")).filter((s) => !g2Ids.has(s.id));
  const lessons = JSON.parse(fs.readFileSync(path.join(dataDir, "lessons.json"), "utf8")).filter((l) => !g2Ids.has(l.id));
  const questions = JSON.parse(fs.readFileSync(path.join(dataDir, "questions.json"), "utf8")).filter((q) => !g2Ids.has(q.skill));
  const errors = JSON.parse(fs.readFileSync(path.join(dataDir, "errors.json"), "utf8")).filter(
    (e) => !g2Grammars.has(e.grammar) && !(e.recommendation || "").startsWith("g2_")
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
  fs.writeFileSync(path.join(dataDir, "errors.json"), JSON.stringify([...G2_ERRORS, ...errors], null, 2) + "\n");

  console.log("Grade 2 units:", UNITS.length);
  console.log("Grade 2 skills:", newSkills.length);
  console.log("Grade 2 questions:", newQuestions.length);
  console.log("Grade 2 error patterns:", G2_ERRORS.length);
  console.log("Total skills:", newSkills.length + skills.length);
  console.log("Total questions:", newQuestions.length + questions.length);
  console.log("Total errors:", G2_ERRORS.length + errors.length);

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
  console.log("Integrity check:", ok ? "PASS (each g2 skill has lesson + 4 questions)" : "FAIL");
}

merge();
