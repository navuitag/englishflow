#!/usr/bin/env node
/**
 * Generate full Grade 4 Global Success program (20 Units × 4 skill types).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const SOURCE =
  "Bám sát SGK Tiếng Anh 4 – Kết nối tri thức với cuộc sống (Global Success).";

const PRON_TOPICS = [
  { focus: "Âm /fr/ trong from", points: ["/fr/ trong from, friend, Friday", "Môi tròn, răng trên chạm môi dưới"], pairs: [{ a: "from", b: "fom", note: "fr vs f" }], examples: [{ word: "from", stress: "from", note: "/frɒm/" }] },
  { focus: "Âm /t/ trong time", points: ["/t/ trong time, get, at", "Đầu lưỡi chạm vòm miệng"], pairs: [{ a: "time", b: "dime", note: "t vs d" }], examples: [{ word: "time", stress: "time", note: "/taɪm/" }] },
  { focus: "Âm /w/ trong week", points: ["/w/ trong week, what, when", "Môi tròn như chữ u"], pairs: [], examples: [{ word: "week", stress: "week", note: "/wiːk/" }] },
  { focus: "Âm /θ/ trong birthday", points: ["/θ/ trong birthday, month, fifth", "Lưỡi giữa hai răng"], pairs: [{ a: "birthday", b: "birday", note: "th vs d" }], examples: [{ word: "birthday", stress: "BIRTH-day", note: "/ˈbɜːθdeɪ/" }] },
  { focus: "Âm /k/ và /g/ (can)", points: ["/k/ trong can, can't, cook", "/g/ trong go, get, garden"], pairs: [{ a: "can", b: "gan", note: "k vs g" }], examples: [{ word: "can", stress: "can", note: "/kæn/" }] },
  { focus: "Âm /ð/ trong there", points: ["/ð/ trong there, the, this", "Lưỡi giữa hai răng, có hơi"], pairs: [{ a: "there", b: "dare", note: "th vs d" }], examples: [{ word: "there", stress: "there", note: "/ðeə/" }] },
  { focus: "Âm /st/ trong start", points: ["/st/ trong start, lesson, eight", "Phát âm rõ cụm s + t"], pairs: [], examples: [{ word: "start", stress: "start", note: "/stɑːt/" }] },
  { focus: "Âm /ʃ/ trong English", points: ["/ʃ/ trong English, favourite, shop", "Môi tròn, thổi hơi nhẹ"], pairs: [{ a: "English", b: "Englis", note: "sh ending" }], examples: [{ word: "English", stress: "ENG-lish", note: "/ˈɪŋɡlɪʃ/" }] },
  { focus: "Âm /ŋ/ trong running", points: ["/ŋ/ trong running, swimming, playing", "Mũi rung ở cuối -ing"], pairs: [], examples: [{ word: "running", stress: "RUN-ning", note: "/ˈrʌnɪŋ/" }] },
  { focus: "Âm /g/ trong going", points: ["/g/ trong going, get, garden", "Thanh quản rung"], pairs: [{ a: "going", b: "koing", note: "g vs silent" }], examples: [{ word: "going", stress: "GO-ing", note: "/ˈɡəʊɪŋ/" }] },
  { focus: "Âm /ð/ trong there (home)", points: ["/ð/ trong there are, the, this", "There are — âm th rõ"], pairs: [], examples: [{ word: "there", stress: "there", note: "/ðeə/" }] },
  { focus: "Âm /dʒ/ trong job", points: ["/dʒ/ trong job, judge, jacket", "Giống âm ch trong tiếng Việt"], pairs: [], examples: [{ word: "job", stress: "job", note: "/dʒɒb/" }] },
  { focus: "Âm /h/ trong hair", points: ["/h/ trong hair, he, has", "Thổi hơi nhẹ từ cổ họng"], pairs: [{ a: "hair", b: "air", note: "h vs silent" }], examples: [{ word: "hair", stress: "hair", note: "/heə/" }] },
  { focus: "Âm /br/ trong brush", points: ["/br/ trong brush, breakfast, brother", "Kết hợp b + r"], pairs: [], examples: [{ word: "brush", stress: "brush", note: "/brʌʃ/" }] },
  { focus: "Âm /w/ trong weekend", points: ["/w/ trong weekend, we, what", "Môi tròn như chữ u"], pairs: [], examples: [{ word: "weekend", stress: "WEEK-end", note: "/ˌwiːkˈend/" }] },
  { focus: "Âm /ʌ/ trong sunny", points: ["/ʌ/ trong sunny, sunny, cup", "Miệng mở vừa, lưỡi thấp"], pairs: [{ a: "sun", b: "son", note: "same sound different spelling" }], examples: [{ word: "sunny", stress: "SUN-ny", note: "/ˈsʌni/" }] },
  { focus: "Âm /str/ trong straight", points: ["/str/ trong straight, street, turn", "Phát âm rõ s + tr"], pairs: [], examples: [{ word: "straight", stress: "straight", note: "/streɪt/" }] },
  { focus: "Âm /ʃ/ trong shopping", points: ["/ʃ/ trong shopping, shop, fish", "Môi tròn, thổi hơi"], pairs: [], examples: [{ word: "shopping", stress: "SHOP-ping", note: "/ˈʃɒpɪŋ/" }] },
  { focus: "Âm /l/ trong live", points: ["/l/ trong live, lion, like", "Đầu lưỡi chạm vòm miệng"], pairs: [{ a: "live", b: "rive", note: "l vs r" }], examples: [{ word: "live", stress: "live", note: "/lɪv/" }] },
  { focus: "Âm /ŋ/ trong singing", points: ["/ŋ/ trong singing, doing, camping", "Mũi rung ở cuối -ing"], pairs: [], examples: [{ word: "singing", stress: "SING-ing", note: "/ˈsɪŋɪŋ/" }] }
];

/** @type {Array<object>} */
const UNITS = [
  {
    chapterIndex: 1, chapter: "Unit 1: My friends", book: "Sách giáo khoa",
    grammar: { id: "where_from", title: "Where are you from?", formula: "Where are you from? · I'm from + country", description: "Hỏi và trả lời quê quán với Where are you from? và I'm from..." },
    words: [
      { en: "from", vi: "từ/đến từ", example: "I'm from Vietnam." },
      { en: "Vietnam", vi: "Việt Nam", example: "I'm from Vietnam." },
      { en: "friend", vi: "bạn", example: "This is my friend." },
      { en: "country", vi: "đất nước", example: "What country are you from?" },
      { en: "England", vi: "nước Anh", example: "She is from England." },
      { en: "Japan", vi: "Nhật Bản", example: "He is from Japan." },
      { en: "where", vi: "ở đâu", example: "Where are you from?" }
    ],
    listen: {
      lines: [
        { speaker: "Ann", text: "Where are you from?" },
        { speaker: "Ben", text: "I'm from Vietnam." },
        { speaker: "Ann", text: "I'm from England." }
      ],
      qs: [
        { q: "What does Ann ask?", a: "Where are you from?", c: ["What's your name?", "Where are you from?", "How old are you?", "How are you?"] },
        { q: "Where is Ben from?", a: "Vietnam", c: ["England", "Vietnam", "Japan", "America"] },
        { q: "Where is Ann from?", a: "England", c: ["Vietnam", "England", "Japan", "Korea"] },
        { q: "How does Ben answer?", a: "I'm from Vietnam", c: ["I'm fine", "I'm from Vietnam", "My name is Ben", "I am ten"] }
      ]
    }
  },
  {
    chapterIndex: 2, chapter: "Unit 2: Time and daily routines", book: "Sách giáo khoa",
    grammar: { id: "time_routines", title: "What time do you get up?", formula: "What time do you + V? · I + V + at + time", description: "Hỏi và trả lời giờ sinh hoạt hàng ngày." },
    words: [
      { en: "time", vi: "thời gian/giờ", example: "What time do you get up?" },
      { en: "get up", vi: "thức dậy", example: "I get up at 7 o'clock." },
      { en: "o'clock", vi: "giờ đúng", example: "At 7 o'clock." },
      { en: "breakfast", vi: "bữa sáng", example: "I have breakfast at 7:30." },
      { en: "go to school", vi: "đi học", example: "I go to school at 8 o'clock." },
      { en: "bed", vi: "giường", example: "I go to bed at 9 o'clock." },
      { en: "every day", vi: "mỗi ngày", example: "I do this every day." }
    ],
    listen: {
      lines: [
        { speaker: "Teacher", text: "What time do you get up?" },
        { speaker: "Mai", text: "I get up at 7 o'clock." },
        { speaker: "Teacher", text: "What time do you go to school?" }
      ],
      qs: [
        { q: "What does the teacher ask first?", a: "What time do you get up?", c: ["Where are you from?", "What time do you get up?", "What's your hobby?", "How are you?"] },
        { q: "When does Mai get up?", a: "7 o'clock", c: ["6 o'clock", "7 o'clock", "8 o'clock", "9 o'clock"] },
        { q: "What does the teacher ask next?", a: "What time do you go to school?", c: ["What time do you get up?", "What time do you go to school?", "Where are you?", "What's your name?"] },
        { q: "What structure does Mai use?", a: "I get up at + time", c: ["I am from", "I get up at + time", "There is a", "Can you swim"] }
      ]
    }
  },
  {
    chapterIndex: 3, chapter: "Unit 3: My week", book: "Sách giáo khoa",
    grammar: { id: "my_week", title: "What do you do on Monday?", formula: "What do you do on + day? · I have + subject on + day", description: "Nói về lịch học và hoạt động trong tuần." },
    words: [
      { en: "Monday", vi: "thứ Hai", example: "I have English on Monday." },
      { en: "Tuesday", vi: "thứ Ba", example: "I have Maths on Tuesday." },
      { en: "Wednesday", vi: "thứ Tư", example: "We play sports on Wednesday." },
      { en: "week", vi: "tuần", example: "This is my week." },
      { en: "English", vi: "tiếng Anh", example: "I have English on Monday." },
      { en: "Maths", vi: "toán", example: "I have Maths on Tuesday." },
      { en: "on", vi: "vào (ngày)", example: "On Monday I have English." }
    ],
    listen: {
      lines: [
        { speaker: "Tom", text: "What do you do on Monday?" },
        { speaker: "Ann", text: "I have English on Monday." },
        { speaker: "Tom", text: "I have Maths on Tuesday." }
      ],
      qs: [
        { q: "What does Tom ask?", a: "What do you do on Monday?", c: ["What time do you get up?", "What do you do on Monday?", "Where are you from?", "Can you swim?"] },
        { q: "What does Ann have on Monday?", a: "English", c: ["Maths", "English", "Music", "Art"] },
        { q: "What does Tom have on Tuesday?", a: "Maths", c: ["English", "Maths", "Science", "PE"] },
        { q: "Which day is first?", a: "Monday", c: ["Tuesday", "Monday", "Wednesday", "Friday"] }
      ]
    }
  },
  {
    chapterIndex: 4, chapter: "Unit 4: My birthday party", book: "Sách giáo khoa",
    grammar: { id: "my_birthday", title: "When is your birthday?", formula: "When is your birthday? · It's in + month / on the + date", description: "Hỏi và trả lời ngày sinh nhật." },
    words: [
      { en: "birthday", vi: "sinh nhật", example: "When is your birthday?" },
      { en: "May", vi: "tháng Năm", example: "It's in May." },
      { en: "party", vi: "bữa tiệc", example: "I have a birthday party." },
      { en: "cake", vi: "bánh kem", example: "We eat birthday cake." },
      { en: "present", vi: "quà", example: "I get many presents." },
      { en: "when", vi: "khi nào", example: "When is your birthday?" },
      { en: "fifth", vi: "ngày mùng 5", example: "It's on the 5th of May." }
    ],
    listen: {
      lines: [
        { speaker: "Mai", text: "When is your birthday?" },
        { speaker: "Ben", text: "It's in May." },
        { speaker: "Mai", text: "It's on the 5th of May." }
      ],
      qs: [
        { q: "What does Mai ask?", a: "When is your birthday?", c: ["Where are you from?", "When is your birthday?", "What time do you get up?", "Can you swim?"] },
        { q: "Which month is Ben's birthday?", a: "May", c: ["April", "May", "June", "July"] },
        { q: "What date does Mai say?", a: "The 5th of May", c: ["The 5th of May", "The 10th of June", "In April", "On Monday"] },
        { q: "How do you answer the month?", a: "It's in + month", c: ["I am from", "It's in + month", "I have English", "There are three"] }
      ]
    }
  },
  {
    chapterIndex: 5, chapter: "Unit 5: Things we can do", book: "Sách giáo khoa",
    grammar: { id: "can_do", title: "Can you swim?", formula: "Can you + V? · Yes, I can / No, I can't", description: "Hỏi và trả lời khả năng với can/can't." },
    words: [
      { en: "can", vi: "có thể", example: "Can you swim?" },
      { en: "can't", vi: "không thể", example: "No, I can't." },
      { en: "swim", vi: "bơi", example: "Yes, I can swim." },
      { en: "ride a bike", vi: "đạp xe", example: "I can ride a bike." },
      { en: "play football", vi: "chơi bóng đá", example: "Can you play football?" },
      { en: "sing", vi: "hát", example: "I can sing." },
      { en: "dance", vi: "nhảy", example: "She can dance." }
    ],
    listen: {
      lines: [
        { speaker: "Teacher", text: "Can you swim?" },
        { speaker: "Student", text: "Yes, I can." },
        { speaker: "Teacher", text: "Can you ride a bike?" }
      ],
      qs: [
        { q: "What does the teacher ask first?", a: "Can you swim?", c: ["Do you like swimming?", "Can you swim?", "Are you swimming?", "Where do you swim?"] },
        { q: "Can the student swim?", a: "Yes", c: ["No", "Yes", "Maybe", "Sometimes"] },
        { q: "What does the teacher ask next?", a: "Can you ride a bike?", c: ["Can you swim?", "Can you ride a bike?", "Can you sing?", "Can you dance?"] },
        { q: "How do you say you cannot?", a: "No, I can't", c: ["Yes, I can", "No, I can't", "I don't", "I am not"] }
      ]
    }
  },
  {
    chapterIndex: 6, chapter: "Unit 6: Our school facilities", book: "Sách giáo khoa",
    grammar: { id: "school_facilities", title: "Is there a library?", formula: "Is there a + facility? · Yes, there is / No, there isn't", description: "Hỏi về cơ sở vật chất trong trường với Is there...?" },
    words: [
      { en: "library", vi: "thư viện", example: "Is there a library?" },
      { en: "computer room", vi: "phòng máy tính", example: "There is a computer room." },
      { en: "music room", vi: "phòng nhạc", example: "Is there a music room?" },
      { en: "sports hall", vi: "nhà thi đấu", example: "Yes, there is a sports hall." },
      { en: "canteen", vi: "căng tin", example: "There is a canteen." },
      { en: "facility", vi: "cơ sở", example: "Our school has many facilities." },
      { en: "there", vi: "có (there is)", example: "Yes, there is." }
    ],
    listen: {
      lines: [
        { speaker: "Guide", text: "Is there a library?" },
        { speaker: "Student", text: "Yes, there is." },
        { speaker: "Guide", text: "Is there a computer room?" }
      ],
      qs: [
        { q: "What does the guide ask first?", a: "Is there a library?", c: ["Where is the library?", "Is there a library?", "How many libraries?", "What is a library?"] },
        { q: "Is there a library?", a: "Yes", c: ["No", "Yes", "Maybe", "Two"] },
        { q: "What does the guide ask next?", a: "Is there a computer room?", c: ["Is there a library?", "Is there a computer room?", "Is there a zoo?", "Is there a beach?"] },
        { q: "What is a positive answer?", a: "Yes, there is", c: ["No, there isn't", "Yes, there is", "I can swim", "I'm from Vietnam"] }
      ]
    }
  },
  {
    chapterIndex: 7, chapter: "Unit 7: Our timetables", book: "Sách giáo khoa",
    grammar: { id: "timetables", title: "What time does the lesson start?", formula: "What time does + N + start? · It starts at + time", description: "Hỏi và trả lời giờ bắt đầu tiết học." },
    words: [
      { en: "timetable", vi: "thời khóa biểu", example: "This is our timetable." },
      { en: "lesson", vi: "tiết học", example: "What time does the lesson start?" },
      { en: "start", vi: "bắt đầu", example: "It starts at 8 o'clock." },
      { en: "finish", vi: "kết thúc", example: "The lesson finishes at 9." },
      { en: "eight", vi: "số tám", example: "It starts at eight o'clock." },
      { en: "nine", vi: "số chín", example: "It finishes at nine." },
      { en: "does", vi: "làm (câu hỏi)", example: "What time does it start?" }
    ],
    listen: {
      lines: [
        { speaker: "Mai", text: "What time does the lesson start?" },
        { speaker: "Tom", text: "It starts at 8 o'clock." },
        { speaker: "Mai", text: "What time does it finish?" }
      ],
      qs: [
        { q: "What does Mai ask first?", a: "What time does the lesson start?", c: ["What do you do on Monday?", "What time does the lesson start?", "When is your birthday?", "Where are you going?"] },
        { q: "When does the lesson start?", a: "8 o'clock", c: ["7 o'clock", "8 o'clock", "9 o'clock", "10 o'clock"] },
        { q: "What does Mai ask next?", a: "What time does it finish?", c: ["What time does it start?", "What time does it finish?", "Can you swim?", "Is there a library?"] },
        { q: "Who does the lesson start? (grammar)", a: "It starts at", c: ["I start at", "It starts at", "They starts at", "We start at"] }
      ]
    }
  },
  {
    chapterIndex: 8, chapter: "Unit 8: My favourite subjects", book: "Sách giáo khoa",
    grammar: { id: "favourite_subjects", title: "What's your favourite subject?", formula: "What's your favourite subject? · I like + subject", description: "Hỏi và trả lời môn học yêu thích." },
    words: [
      { en: "favourite", vi: "yêu thích", example: "What's your favourite subject?" },
      { en: "subject", vi: "môn học", example: "I like English." },
      { en: "Science", vi: "khoa học", example: "My favourite subject is Science." },
      { en: "Art", vi: "mỹ thuật", example: "I like Art." },
      { en: "Music", vi: "âm nhạc", example: "She likes Music." },
      { en: "PE", vi: "thể dục", example: "He likes PE." },
      { en: "like", vi: "thích", example: "I like English." }
    ],
    listen: {
      lines: [
        { speaker: "Teacher", text: "What's your favourite subject?" },
        { speaker: "Ann", text: "I like English." },
        { speaker: "Ben", text: "I like Science." }
      ],
      qs: [
        { q: "What does the teacher ask?", a: "What's your favourite subject?", c: ["What time does the lesson start?", "What's your favourite subject?", "Where are you from?", "Can you swim?"] },
        { q: "What does Ann like?", a: "English", c: ["Science", "English", "Art", "PE"] },
        { q: "What does Ben like?", a: "Science", c: ["English", "Science", "Music", "Maths"] },
        { q: "How do you answer?", a: "I like + subject", c: ["I am + subject", "I like + subject", "There is a", "I'm going to"] }
      ]
    }
  },
  {
    chapterIndex: 9, chapter: "Unit 9: Our sports day", book: "Sách giáo khoa",
    grammar: { id: "sports_day", title: "Who is running?", formula: "Who is + V-ing? · Name + is / They are + V-ing", description: "Hỏi ai đang làm gì trong ngày hội thể thao (present continuous)." },
    words: [
      { en: "sports day", vi: "ngày hội thể thao", example: "Today is our sports day." },
      { en: "running", vi: "đang chạy", example: "Who is running?" },
      { en: "jumping", vi: "đang nhảy", example: "She is jumping." },
      { en: "throwing", vi: "đang ném", example: "He is throwing the ball." },
      { en: "race", vi: "cuộc đua", example: "Tom is in the race." },
      { en: "team", vi: "đội", example: "Our team is winning." },
      { en: "who", vi: "ai", example: "Who is running?" }
    ],
    listen: {
      lines: [
        { speaker: "Ann", text: "Who is running?" },
        { speaker: "Ben", text: "Tom is." },
        { speaker: "Ann", text: "They are jumping." }
      ],
      qs: [
        { q: "What does Ann ask?", a: "Who is running?", c: ["What are you doing?", "Who is running?", "Can you run?", "Where is Tom?"] },
        { q: "Who is running?", a: "Tom", c: ["Ann", "Tom", "Ben", "Mai"] },
        { q: "What are they doing?", a: "Jumping", c: ["Running", "Jumping", "Sleeping", "Reading"] },
        { q: "What tense is used?", a: "Present continuous", c: ["Simple present", "Present continuous", "Past simple", "Can"] }
      ]
    }
  },
  {
    chapterIndex: 10, chapter: "Unit 10: Our summer holidays", book: "Sách giáo khoa",
    grammar: { id: "summer_holidays", title: "Where are you going?", formula: "Where are you going? · I'm going to + place", description: "Hỏi và trả lời kế hoạch đi nghỉ hè." },
    words: [
      { en: "holiday", vi: "kỳ nghỉ", example: "Our summer holidays are fun." },
      { en: "beach", vi: "bãi biển", example: "I'm going to the beach." },
      { en: "mountain", vi: "núi", example: "We are going to the mountains." },
      { en: "going", vi: "đang đi/sẽ đi", example: "Where are you going?" },
      { en: "summer", vi: "mùa hè", example: "In summer we travel." },
      { en: "travel", vi: "du lịch", example: "We like to travel." },
      { en: "where", vi: "ở đâu", example: "Where are you going?" }
    ],
    listen: {
      lines: [
        { speaker: "Mum", text: "Where are you going?" },
        { speaker: "Child", text: "I'm going to the beach." },
        { speaker: "Mum", text: "We are going to the mountains." }
      ],
      qs: [
        { q: "What does Mum ask?", a: "Where are you going?", c: ["Where are you from?", "Where are you going?", "What time do you get up?", "Can you swim?"] },
        { q: "Where is the child going?", a: "The beach", c: ["The mountains", "The beach", "School", "The zoo"] },
        { q: "Where are they going together?", a: "The mountains", c: ["The beach", "The mountains", "England", "The library"] },
        { q: "What structure answers?", a: "I'm going to + place", c: ["I'm from", "I'm going to + place", "There is a", "I have English"] }
      ]
    }
  },
  {
    chapterIndex: 11, chapter: "Unit 11: My home", book: "Sách giáo khoa",
    grammar: { id: "my_home", title: "How many bedrooms are there?", formula: "How many + rooms are there? · There are + number", description: "Hỏi và trả lời số lượng phòng trong nhà." },
    words: [
      { en: "bedroom", vi: "phòng ngủ", example: "There are three bedrooms." },
      { en: "bathroom", vi: "phòng tắm", example: "There are two bathrooms." },
      { en: "kitchen", vi: "nhà bếp", example: "There is one kitchen." },
      { en: "living room", vi: "phòng khách", example: "There is a living room." },
      { en: "how many", vi: "bao nhiêu", example: "How many bedrooms are there?" },
      { en: "home", vi: "nhà", example: "This is my home." },
      { en: "three", vi: "số ba", example: "There are three bedrooms." }
    ],
    listen: {
      lines: [
        { speaker: "Visitor", text: "How many bedrooms are there?" },
        { speaker: "Child", text: "There are three." },
        { speaker: "Visitor", text: "How many bathrooms are there?" }
      ],
      qs: [
        { q: "What does the visitor ask first?", a: "How many bedrooms are there?", c: ["Where is the bedroom?", "How many bedrooms are there?", "Is there a library?", "Can you swim?"] },
        { q: "How many bedrooms?", a: "Three", c: ["Two", "Three", "Four", "One"] },
        { q: "What does the visitor ask next?", a: "How many bathrooms are there?", c: ["How many bedrooms?", "How many bathrooms are there?", "Where are you going?", "What's your favourite subject?"] },
        { q: "What structure answers count?", a: "There are + number", c: ["There is a", "There are + number", "I like", "I'm going to"] }
      ]
    }
  },
  {
    chapterIndex: 12, chapter: "Unit 12: Jobs", book: "Sách giáo khoa",
    grammar: { id: "jobs", title: "What does your father do?", formula: "What does + person + do? · He/She is a + job", description: "Hỏi và trả lời nghề nghiệp của người thân." },
    words: [
      { en: "father", vi: "bố", example: "What does your father do?" },
      { en: "mother", vi: "mẹ", example: "What does your mother do?" },
      { en: "doctor", vi: "bác sĩ", example: "He is a doctor." },
      { en: "teacher", vi: "giáo viên", example: "She is a teacher." },
      { en: "nurse", vi: "y tá", example: "She is a nurse." },
      { en: "driver", vi: "tài xế", example: "He is a driver." },
      { en: "do", vi: "làm (nghề)", example: "What does he do?" }
    ],
    listen: {
      lines: [
        { speaker: "Ann", text: "What does your father do?" },
        { speaker: "Ben", text: "He is a doctor." },
        { speaker: "Ann", text: "What does your mother do?" }
      ],
      qs: [
        { q: "What does Ann ask about first?", a: "Ben's father's job", c: ["Ben's mother's job", "Ben's father's job", "Ben's hobby", "Ben's birthday"] },
        { q: "What is Ben's father's job?", a: "Doctor", c: ["Teacher", "Doctor", "Driver", "Nurse"] },
        { q: "What does Ann ask next?", a: "What does your mother do?", c: ["What does your father do?", "What does your mother do?", "Where are you from?", "Can you swim?"] },
        { q: "How do you answer the job?", a: "He/She is a + job", c: ["He/She do a", "He/She is a + job", "I like + job", "There is a"] }
      ]
    }
  },
  {
    chapterIndex: 13, chapter: "Unit 13: Appearance", book: "Sách giáo khoa",
    grammar: { id: "appearance", title: "What does she look like?", formula: "What does + person + look like? · She/He has + feature", description: "Mô tả ngoại hình với What does she look like? và has." },
    words: [
      { en: "look like", vi: "trông như", example: "What does she look like?" },
      { en: "hair", vi: "tóc", example: "She has long hair." },
      { en: "long", vi: "dài", example: "She has long hair." },
      { en: "short", vi: "ngắn", example: "He has short hair." },
      { en: "eyes", vi: "mắt", example: "She has brown eyes." },
      { en: "tall", vi: "cao", example: "He is tall." },
      { en: "has", vi: "có (sở hữu)", example: "She has long hair." }
    ],
    listen: {
      lines: [
        { speaker: "Tom", text: "What does she look like?" },
        { speaker: "Mai", text: "She has long hair." },
        { speaker: "Tom", text: "She has brown eyes." }
      ],
      qs: [
        { q: "What does Tom ask?", a: "What does she look like?", c: ["What does she do?", "What does she look like?", "Where is she?", "Who is she?"] },
        { q: "What hair does she have?", a: "Long hair", c: ["Short hair", "Long hair", "Blue hair", "No hair"] },
        { q: "What eyes does she have?", a: "Brown eyes", c: ["Green eyes", "Brown eyes", "Long eyes", "Tall eyes"] },
        { q: "What verb describes features?", a: "has", c: ["is a", "has", "can", "like"] }
      ]
    }
  },
  {
    chapterIndex: 14, chapter: "Unit 14: Daily activities", book: "Sách giáo khoa",
    grammar: { id: "daily_activities", title: "What do you do every day?", formula: "What do you do every day? · I + V + every day", description: "Nói về hoạt động hàng ngày với thì hiện tại đơn." },
    words: [
      { en: "brush teeth", vi: "đánh răng", example: "I brush my teeth every day." },
      { en: "wash face", vi: "rửa mặt", example: "I wash my face every morning." },
      { en: "have a shower", vi: "tắm", example: "I have a shower every day." },
      { en: "do homework", vi: "làm bài tập", example: "I do homework after school." },
      { en: "every day", vi: "mỗi ngày", example: "What do you do every day?" },
      { en: "morning", vi: "buổi sáng", example: "In the morning I get up." },
      { en: "activity", vi: "hoạt động", example: "These are daily activities." }
    ],
    listen: {
      lines: [
        { speaker: "Teacher", text: "What do you do every day?" },
        { speaker: "Student", text: "I brush my teeth every day." },
        { speaker: "Teacher", text: "I do homework after school." }
      ],
      qs: [
        { q: "What does the teacher ask?", a: "What do you do every day?", c: ["What time do you get up?", "What do you do every day?", "Where are you going?", "Who is running?"] },
        { q: "What does the student do every day?", a: "Brush teeth", c: ["Go shopping", "Brush teeth", "Fly a kite", "Sing songs"] },
        { q: "When does the teacher do homework?", a: "After school", c: ["In the morning", "After school", "At the beach", "On sports day"] },
        { q: "What phrase shows frequency?", a: "Every day", c: ["Every day", "On Monday", "In May", "At the beach"] }
      ]
    }
  },
  {
    chapterIndex: 15, chapter: "Unit 15: My family's weekends", book: "Sách giáo khoa",
    grammar: { id: "family_weekends", title: "What do you do at the weekend?", formula: "What do you do at the weekend? · We + V + at the weekend", description: "Nói về hoạt động cuối tuần của gia đình." },
    words: [
      { en: "weekend", vi: "cuối tuần", example: "What do you do at the weekend?" },
      { en: "go shopping", vi: "đi mua sắm", example: "We go shopping at the weekend." },
      { en: "visit grandparents", vi: "thăm ông bà", example: "We visit our grandparents." },
      { en: "watch a film", vi: "xem phim", example: "We watch a film on Sunday." },
      { en: "picnic", vi: "dã ngoại", example: "We have a picnic in the park." },
      { en: "family", vi: "gia đình", example: "My family loves weekends." },
      { en: "we", vi: "chúng tôi/chúng ta", example: "We go shopping." }
    ],
    listen: {
      lines: [
        { speaker: "Mum", text: "What do you do at the weekend?" },
        { speaker: "Child", text: "We go shopping." },
        { speaker: "Dad", text: "We visit our grandparents." }
      ],
      qs: [
        { q: "What does Mum ask?", a: "What do you do at the weekend?", c: ["What do you do every day?", "What do you do at the weekend?", "When is your birthday?", "Where are you from?"] },
        { q: "What do they do first?", a: "Go shopping", c: ["Visit grandparents", "Go shopping", "Brush teeth", "Go to school"] },
        { q: "What does Dad say they do?", a: "Visit grandparents", c: ["Go shopping", "Visit grandparents", "Swim", "Run a race"] },
        { q: "Who answers with We?", a: "The family", c: ["Only Mum", "The family", "The teacher", "Tom alone"] }
      ]
    }
  },
  {
    chapterIndex: 16, chapter: "Unit 16: Weather", book: "Sách giáo khoa",
    grammar: { id: "weather", title: "What's the weather like?", formula: "What's the weather like? · It's + adjective (+ and + adjective)", description: "Hỏi và mô tả thời tiết." },
    words: [
      { en: "weather", vi: "thời tiết", example: "What's the weather like?" },
      { en: "sunny", vi: "nắng", example: "It's sunny and hot." },
      { en: "hot", vi: "nóng", example: "It's hot today." },
      { en: "rainy", vi: "mưa", example: "It's rainy." },
      { en: "cold", vi: "lạnh", example: "It's cold in winter." },
      { en: "windy", vi: "có gió", example: "It's windy." },
      { en: "like", vi: "như thế nào", example: "What's the weather like?" }
    ],
    listen: {
      lines: [
        { speaker: "Ann", text: "What's the weather like?" },
        { speaker: "Ben", text: "It's sunny and hot." },
        { speaker: "Ann", text: "It's rainy today." }
      ],
      qs: [
        { q: "What does Ann ask?", a: "What's the weather like?", c: ["What time is it?", "What's the weather like?", "Where are you going?", "Can you swim?"] },
        { q: "What is the weather like first?", a: "Sunny and hot", c: ["Rainy and cold", "Sunny and hot", "Windy", "Snowy"] },
        { q: "What is the weather today?", a: "Rainy", c: ["Sunny", "Rainy", "Hot only", "Cold only"] },
        { q: "How do you answer?", a: "It's + adjective", c: ["I like", "It's + adjective", "There are", "I'm going to"] }
      ]
    }
  },
  {
    chapterIndex: 17, chapter: "Unit 17: In the city", book: "Sách giáo khoa",
    grammar: { id: "in_the_city", title: "Go straight / Turn left", formula: "Go straight · Turn left/right · Go past the + place", description: "Chỉ đường trong thành phố." },
    words: [
      { en: "straight", vi: "thẳng", example: "Go straight." },
      { en: "turn left", vi: "rẽ trái", example: "Turn left at the corner." },
      { en: "turn right", vi: "rẽ phải", example: "Turn right here." },
      { en: "street", vi: "đường phố", example: "This street is busy." },
      { en: "corner", vi: "góc đường", example: "Turn left at the corner." },
      { en: "city", vi: "thành phố", example: "We are in the city." },
      { en: "past", vi: "qua", example: "Go past the bank." }
    ],
    listen: {
      lines: [
        { speaker: "Tourist", text: "Excuse me. Where is the post office?" },
        { speaker: "Local", text: "Go straight. Then turn left." },
        { speaker: "Local", text: "Go past the bank." }
      ],
      qs: [
        { q: "What does the tourist need?", a: "The post office", c: ["The bank", "The post office", "The beach", "The library"] },
        { q: "What is the first direction?", a: "Go straight", c: ["Turn right", "Go straight", "Turn left", "Stop"] },
        { q: "What turn do they make?", a: "Turn left", c: ["Turn left", "Turn right", "Go back", "Go up"] },
        { q: "What do they pass?", a: "The bank", c: ["The school", "The bank", "The beach", "The zoo"] }
      ]
    }
  },
  {
    chapterIndex: 18, chapter: "Unit 18: At the shopping centre", book: "Sách giáo khoa",
    grammar: { id: "shopping", title: "How much is this?", formula: "How much is this/that? · It's + price + dong", description: "Hỏi và trả lời giá tiền khi mua sắm." },
    words: [
      { en: "how much", vi: "bao nhiêu tiền", example: "How much is this?" },
      { en: "dong", vi: "đồng", example: "It's 50,000 dong." },
      { en: "shirt", vi: "áo sơ mi", example: "How much is this shirt?" },
      { en: "cheap", vi: "rẻ", example: "This shirt is cheap." },
      { en: "expensive", vi: "đắt", example: "That bag is expensive." },
      { en: "buy", vi: "mua", example: "I want to buy this." },
      { en: "shopping centre", vi: "trung tâm mua sắm", example: "We are at the shopping centre." }
    ],
    listen: {
      lines: [
        { speaker: "Customer", text: "How much is this?" },
        { speaker: "Shopkeeper", text: "It's 50,000 dong." },
        { speaker: "Customer", text: "How much is that shirt?" }
      ],
      qs: [
        { q: "What does the customer ask first?", a: "How much is this?", c: ["Where is this?", "How much is this?", "What colour is this?", "Can you swim?"] },
        { q: "What is the price?", a: "50,000 dong", c: ["5,000 dong", "50,000 dong", "500 dong", "500,000 dong"] },
        { q: "What does the customer ask next?", a: "How much is that shirt?", c: ["How much is this?", "How much is that shirt?", "Where are you going?", "What's the weather like?"] },
        { q: "Where are they?", a: "At the shopping centre", c: ["At school", "At the shopping centre", "At the beach", "At summer camp"] }
      ]
    }
  },
  {
    chapterIndex: 19, chapter: "Unit 19: The animal world", book: "Sách giáo khoa",
    grammar: { id: "animal_world", title: "Tigers live in the forest", formula: "Animals + live in + habitat · What do + animals + eat?", description: "Nói về nơi sống và thức ăn của động vật." },
    words: [
      { en: "tiger", vi: "con hổ", example: "Tigers live in the forest." },
      { en: "lion", vi: "sư tử", example: "What do lions eat?" },
      { en: "forest", vi: "rừng", example: "Tigers live in the forest." },
      { en: "meat", vi: "thịt", example: "Lions eat meat." },
      { en: "grass", vi: "cỏ", example: "Elephants eat grass." },
      { en: "live", vi: "sống", example: "Monkeys live in trees." },
      { en: "eat", vi: "ăn", example: "What do lions eat?" }
    ],
    listen: {
      lines: [
        { speaker: "Guide", text: "Tigers live in the forest." },
        { speaker: "Child", text: "What do lions eat?" },
        { speaker: "Guide", text: "Lions eat meat." }
      ],
      qs: [
        { q: "Where do tigers live?", a: "In the forest", c: ["At the beach", "In the forest", "In the city", "At school"] },
        { q: "What does the child ask?", a: "What do lions eat?", c: ["Where do lions live?", "What do lions eat?", "Can lions swim?", "Who is running?"] },
        { q: "What do lions eat?", a: "Meat", c: ["Grass", "Meat", "Fish only", "Rice"] },
        { q: "What verb describes habitat?", a: "live", c: ["eat", "live", "buy", "turn"] }
      ]
    }
  },
  {
    chapterIndex: 20, chapter: "Unit 20: At summer camp", book: "Sách giáo khoa",
    grammar: { id: "summer_camp", title: "What are they doing?", formula: "What are they doing? · They are + V-ing + object", description: "Mô tả hành động đang diễn ra tại trại hè." },
    words: [
      { en: "summer camp", vi: "trại hè", example: "We are at summer camp." },
      { en: "sing songs", vi: "hát bài", example: "They are singing songs." },
      { en: "campfire", vi: "lửa trại", example: "We sit around the campfire." },
      { en: "tent", vi: "lều", example: "We sleep in a tent." },
      { en: "doing", vi: "đang làm", example: "What are they doing?" },
      { en: "they", vi: "họ", example: "They are singing songs." },
      { en: "songs", vi: "bài hát", example: "They are singing songs." }
    ],
    listen: {
      lines: [
        { speaker: "Leader", text: "What are they doing?" },
        { speaker: "Camper", text: "They are singing songs." },
        { speaker: "Leader", text: "They are dancing around the campfire." }
      ],
      qs: [
        { q: "What does the leader ask?", a: "What are they doing?", c: ["Where are they going?", "What are they doing?", "What do you do every day?", "Can you swim?"] },
        { q: "What are they doing first?", a: "Singing songs", c: ["Going shopping", "Singing songs", "Brushing teeth", "Turning left"] },
        { q: "What are they doing around the campfire?", a: "Dancing", c: ["Sleeping", "Dancing", "Eating meat", "Buying shirts"] },
        { q: "Where are they?", a: "At summer camp", c: ["At the zoo", "At summer camp", "At the shopping centre", "In the forest"] }
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
  return `g4_u${unit.chapterIndex}_${unit.grammar.id}`;
}

function vocabId(unit) {
  return `g4_u${unit.chapterIndex}_vocab`;
}

function pronId(unit) {
  return `g4_u${unit.chapterIndex}_pronunciation`;
}

function listenId(unit) {
  return `g4_u${unit.chapterIndex}_listening`;
}

function buildGrammarSkill(unit) {
  const id = grammarId(unit);
  return {
    id,
    title: `Unit ${unit.chapterIndex} · ${unit.grammar.title}`,
    grade: 4,
    book: unit.book,
    chapter: unit.chapter,
    chapterIndex: unit.chapterIndex,
    lessonNo: 1,
    domain: "Grammar",
    skillType: "grammar",
    grammar: unit.grammar.id,
    level: 4,
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
    grade: 4,
    book: unit.book,
    chapter: unit.chapter,
    chapterIndex: unit.chapterIndex,
    lessonNo: 10,
    domain: "Vocabulary",
    skillType: "vocabulary",
    grammar: "vocabulary",
    level: 4,
    prerequisite: [],
    description: `Học ${unit.words.length} từ vựng Unit ${unit.chapterIndex} Global Success lớp 4.`,
    formula: `${unit.words.length} từ · EN ↔ VI`,
    visualization: "vocabulary"
  };
}

function buildPronSkill(unit, topic) {
  return {
    id: pronId(unit),
    title: `Unit ${unit.chapterIndex} · Phát âm`,
    grade: 4,
    book: unit.book,
    chapter: unit.chapter,
    chapterIndex: unit.chapterIndex,
    lessonNo: 11,
    domain: "Pronunciation",
    skillType: "pronunciation",
    grammar: "pronunciation",
    level: 4,
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
    grade: 4,
    book: unit.book,
    chapter: unit.chapter,
    chapterIndex: unit.chapterIndex,
    lessonNo: 12,
    domain: "Listening",
    skillType: "listening",
    grammar: "listening",
    level: 4,
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
    where_from: { q: "Where ___ you from?", c: ["are", "is", "am", "be"], a: "are", ex: "Where are you from" },
    time_routines: { q: "I get up ___ 7 o'clock.", c: ["at", "in", "on", "to"], a: "at", ex: "I get up at 7 o'clock" },
    my_week: { q: "I have English ___ Monday.", c: ["on", "in", "at", "to"], a: "on", ex: "I have English on Monday" },
    my_birthday: { q: "When is your ___?", c: ["birthday", "birthdays", "birthdaying", "birth"], a: "birthday", ex: "When is your birthday" },
    can_do: { q: "___ you swim?", c: ["Can", "Do", "Are", "Is"], a: "Can", ex: "Can you swim" },
    school_facilities: { q: "___ there a library?", c: ["Is", "Are", "Am", "Be"], a: "Is", ex: "Is there a library" },
    timetables: { q: "It ___ at 8 o'clock.", c: ["starts", "start", "starting", "started"], a: "starts", ex: "It starts at 8 o'clock" },
    favourite_subjects: { q: "I ___ English.", c: ["like", "likes", "liking", "liked"], a: "like", ex: "I like English" },
    sports_day: { q: "Who is ___?", c: ["running", "run", "runs", "ran"], a: "running", ex: "Who is running" },
    summer_holidays: { q: "I'm going ___ the beach.", c: ["to", "at", "in", "on"], a: "to", ex: "I'm going to the beach" },
    my_home: { q: "There ___ three bedrooms.", c: ["are", "is", "am", "be"], a: "are", ex: "There are three bedrooms" },
    jobs: { q: "He is a ___.", c: ["doctor", "doctors", "doctoring", "doctored"], a: "doctor", ex: "He is a doctor" },
    appearance: { q: "She has long ___.", c: ["hair", "hairs", "hairing", "haired"], a: "hair", ex: "She has long hair" },
    daily_activities: { q: "I ___ my teeth every day.", c: ["brush", "brushes", "brushing", "brushed"], a: "brush", ex: "I brush my teeth every day" },
    family_weekends: { q: "We go ___ at the weekend.", c: ["shopping", "shop", "shops", "shopped"], a: "shopping", ex: "We go shopping at the weekend" },
    weather: { q: "It's sunny and ___.", c: ["hot", "hots", "hoting", "hotted"], a: "hot", ex: "It's sunny and hot" },
    in_the_city: { q: "___ straight.", c: ["Go", "Goes", "Going", "Went"], a: "Go", ex: "Go straight" },
    shopping: { q: "How ___ is this?", c: ["much", "many", "old", "long"], a: "much", ex: "How much is this" },
    animal_world: { q: "Tigers live ___ the forest.", c: ["in", "on", "at", "to"], a: "in", ex: "Tigers live in the forest" },
    summer_camp: { q: "They are ___ songs.", c: ["singing", "sing", "sings", "sang"], a: "singing", ex: "They are singing songs" }
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

const G4_ERRORS = [
  { pattern: "where is you from", grammar: "where_from", code: "G4001", errorType: "where_from_question", title: "Sai Where are you from?", message: "Hỏi quê quán: Where are you from? Trả lời: I'm from Vietnam.", hint: "Where are you from?", recommendation: "g4_u1_where_from" },
  { pattern: "i get up in 7", grammar: "time_routines", code: "G4002", errorType: "time_at", title: "Sai giờ với at", message: "Giờ cụ thể dùng at: I get up at 7 o'clock.", hint: "at + time", recommendation: "g4_u2_time_routines" },
  { pattern: "i have english in monday", grammar: "my_week", code: "G4003", errorType: "day_on", title: "Sai on + ngày", message: "Ngày trong tuần: I have English on Monday.", hint: "on Monday", recommendation: "g4_u3_my_week" },
  { pattern: "when is your birthday in 5 may", grammar: "my_birthday", code: "G4004", errorType: "birthday_when", title: "Sai When is your birthday?", message: "Tháng: It's in May. Ngày: It's on the 5th of May.", hint: "in + month / on + date", recommendation: "g4_u4_my_birthday" },
  { pattern: "do you can swim", grammar: "can_do", code: "G4005", errorType: "can_question", title: "Sai Can you...?", message: "Khả năng: Can you swim? Trả lời: Yes, I can / No, I can't.", hint: "Can you + V?", recommendation: "g4_u5_can_do" },
  { pattern: "are there a library", grammar: "school_facilities", code: "G4006", errorType: "is_there", title: "Sai Is there a...?", message: "Một cơ sở: Is there a library? Trả lời: Yes, there is.", hint: "Is there a + N?", recommendation: "g4_u6_school_facilities" },
  { pattern: "what time do the lesson start", grammar: "timetables", code: "G4007", errorType: "does_start", title: "Sai does + chủ ngữ số ít", message: "Tiết học số ít: What time does the lesson start? It starts at 8 o'clock.", hint: "does + V", recommendation: "g4_u7_timetables" },
  { pattern: "what is your favourite subject", grammar: "favourite_subjects", code: "G4008", errorType: "favourite_whats", title: "Sai What's your favourite subject?", message: "Hỏi môn yêu thích: What's your favourite subject? I like English.", hint: "What's your favourite subject?", recommendation: "g4_u8_favourite_subjects" },
  { pattern: "who are running", grammar: "sports_day", code: "G4009", errorType: "who_is_ing", title: "Sai Who is + V-ing", message: "Hỏi ai đang làm: Who is running? Tom is.", hint: "Who is + V-ing?", recommendation: "g4_u9_sports_day" },
  { pattern: "where do you going", grammar: "summer_holidays", code: "G4010", errorType: "going_to", title: "Sai Where are you going?", message: "Kế hoạch: Where are you going? I'm going to the beach.", hint: "I'm going to + place", recommendation: "g4_u10_summer_holidays" },
  { pattern: "how much bedrooms are there", grammar: "my_home", code: "G4011", errorType: "how_many_rooms", title: "Nhầm How many / How much", message: "Đếm phòng: How many bedrooms are there? There are three.", hint: "How many + rooms?", recommendation: "g4_u11_my_home" },
  { pattern: "what does your father does", grammar: "jobs", code: "G4012", errorType: "what_does_do", title: "Sai What does ... do?", message: "Hỏi nghề: What does your father do? He is a doctor.", hint: "What does + person + do?", recommendation: "g4_u12_jobs" },
  { pattern: "what is she look like", grammar: "appearance", code: "G4013", errorType: "look_like", title: "Sai What does she look like?", message: "Ngoại hình: What does she look like? She has long hair.", hint: "What does + person + look like?", recommendation: "g4_u13_appearance" },
  { pattern: "i brushes my teeth", grammar: "daily_activities", code: "G4014", errorType: "daily_i_v", title: "Sai I + V (every day)", message: "Thói quen: I brush my teeth every day (không thêm -es sau I).", hint: "I + V + every day", recommendation: "g4_u14_daily_activities" },
  { pattern: "what do you at weekend", grammar: "family_weekends", code: "G4015", errorType: "at_weekend", title: "Sai at the weekend", message: "Cuối tuần: What do you do at the weekend? We go shopping.", hint: "at the weekend", recommendation: "g4_u15_family_weekends" },
  { pattern: "how is the weather", grammar: "weather", code: "G4016", errorType: "weather_like", title: "Sai What's the weather like?", message: "Thời tiết: What's the weather like? It's sunny and hot.", hint: "What's the weather like?", recommendation: "g4_u16_weather" },
  { pattern: "go to straight", grammar: "in_the_city", code: "G4017", errorType: "go_straight", title: "Sai Go straight", message: "Chỉ đường: Go straight. Turn left. Turn right.", hint: "Go straight", recommendation: "g4_u17_in_the_city" },
  { pattern: "how many is this", grammar: "shopping", code: "G4018", errorType: "how_much_price", title: "Nhầm How much / How many", message: "Giá tiền: How much is this? It's 50,000 dong.", hint: "How much is this?", recommendation: "g4_u18_shopping" },
  { pattern: "tigers lives in forest", grammar: "animal_world", code: "G4019", errorType: "animals_live", title: "Sai Tigers live in...", message: "Nơi sống: Tigers live in the forest. What do lions eat?", hint: "live in + habitat", recommendation: "g4_u19_animal_world" },
  { pattern: "what do they doing", grammar: "summer_camp", code: "G4020", errorType: "they_are_ing", title: "Sai What are they doing?", message: "Hành động đang diễn ra: What are they doing? They are singing songs.", hint: "They are + V-ing", recommendation: "g4_u20_summer_camp" }
];

function merge() {
  const g4Ids = new Set();
  const g4Grammars = new Set(UNITS.map((u) => u.grammar.id));
  UNITS.forEach((u) => {
    g4Ids.add(grammarId(u));
    g4Ids.add(vocabId(u));
    g4Ids.add(pronId(u));
    g4Ids.add(listenId(u));
  });

  const skills = JSON.parse(fs.readFileSync(path.join(dataDir, "skills.json"), "utf8")).filter((s) => !g4Ids.has(s.id) && !s.id.startsWith("g4_"));
  const lessons = JSON.parse(fs.readFileSync(path.join(dataDir, "lessons.json"), "utf8")).filter((l) => !g4Ids.has(l.id) && !l.id.startsWith("g4_"));
  const questions = JSON.parse(fs.readFileSync(path.join(dataDir, "questions.json"), "utf8")).filter((q) => !g4Ids.has(q.skill) && !q.skill.startsWith("g4_"));
  const errors = JSON.parse(fs.readFileSync(path.join(dataDir, "errors.json"), "utf8")).filter(
    (e) => !g4Grammars.has(e.grammar) && !(e.recommendation || "").startsWith("g4_")
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
  fs.writeFileSync(path.join(dataDir, "errors.json"), JSON.stringify([...G4_ERRORS, ...errors], null, 2) + "\n");

  console.log("Grade 4 units:", UNITS.length);
  console.log("Grade 4 skills:", newSkills.length);
  console.log("Grade 4 questions:", newQuestions.length);
  console.log("Grade 4 error patterns:", G4_ERRORS.length);
  console.log("Total skills:", newSkills.length + skills.length);
  console.log("Total questions:", newQuestions.length + questions.length);
  console.log("Total errors:", G4_ERRORS.length + errors.length);

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
  const expectedSkills = UNITS.length * 4;
  const expectedQuestions = expectedSkills * 4;
  if (newSkills.length !== expectedSkills) {
    ok = false;
    console.log(`INTEGRITY FAIL: expected ${expectedSkills} skills, got ${newSkills.length}`);
  }
  if (newQuestions.length !== expectedQuestions) {
    ok = false;
    console.log(`INTEGRITY FAIL: expected ${expectedQuestions} questions, got ${newQuestions.length}`);
  }
  console.log("Integrity check:", ok ? "PASS (80 skills, 320 questions, each skill has lesson + 4 questions)" : "FAIL");
}

merge();
