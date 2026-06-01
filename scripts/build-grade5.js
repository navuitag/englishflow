#!/usr/bin/env node
/**
 * Generate full Grade 5 Global Success program (20 Units × 4 skill types).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const SOURCE =
  "Bám sát SGK Tiếng Anh 5 – Kết nối tri thức với cuộc sống (Global Success).";

const PRON_TOPICS = [
  { focus: "Âm /f/ trong favourite", points: ["/f/ trong favourite, food, fun", "Môi dưới chạm răng trên"], pairs: [{ a: "favourite", b: "vavourite", note: "f vs v" }], examples: [{ word: "favourite", stress: "FAV-our-ite", note: "/ˈfeɪvərɪt/" }] },
  { focus: "Âm /l/ trong live", points: ["/l/ trong live, house, village", "Đầu lưỡi chạm vòm miệng"], pairs: [{ a: "live", b: "rive", note: "l vs r" }], examples: [{ word: "live", stress: "live", note: "/lɪv/" }] },
  { focus: "Âm /ʃ/ trong nationality", points: ["/ʃ/ trong nationality, she, English", "Môi tròn, thổi hơi nhẹ"], pairs: [], examples: [{ word: "nationality", stress: "na-tion-AL-i-ty", note: "/ˌnæʃəˈnæləti/" }] },
  { focus: "Âm /ŋ/ trong doing", points: ["/ŋ/ trong doing, swimming, jogging", "Mũi rung ở cuối -ing"], pairs: [], examples: [{ word: "doing", stress: "DO-ing", note: "/ˈduːɪŋ/" }] },
  { focus: "Âm /w/ trong would", points: ["/w/ trong would, want, weekend", "Môi tròn như chữ u"], pairs: [{ a: "would", b: "ood", note: "w vs silent" }], examples: [{ word: "would", stress: "would", note: "/wʊd/" }] },
  { focus: "Âm /θ/ trong third", points: ["/θ/ trong third, floor, birthday", "Lưỡi giữa hai răng"], pairs: [{ a: "third", b: "tird", note: "th vs t" }], examples: [{ word: "third", stress: "third", note: "/θɜːd/" }] },
  { focus: "Âm /sk/ trong school", points: ["/sk/ trong school, activity, desk", "Phát âm rõ s + k"], pairs: [], examples: [{ word: "school", stress: "school", note: "/skuːl/" }] },
  { focus: "Âm /z/ trong whose", points: ["/z/ trong whose, is, these", "Thanh quản rung"], pairs: [{ a: "whose", b: "who", note: "z ending" }], examples: [{ word: "whose", stress: "whose", note: "/huːz/" }] },
  { focus: "Âm /d/ trong did", points: ["/d/ trong did, yesterday, weekend", "Đầu lưỡi chạm vòm miệng"], pairs: [{ a: "did", b: "dit", note: "d vs t" }], examples: [{ word: "did", stress: "did", note: "/dɪd/" }] },
  { focus: "Âm /m/ trong museum", points: ["/m/ trong museum, them, family", "Môi khép, hơi qua mũi"], pairs: [], examples: [{ word: "museum", stress: "mu-SE-um", note: "/mjuːˈziːəm/" }] },
  { focus: "Âm /v/ trong visit", points: ["/v/ trong visit, village, love", "Môi dưới chạm răng trên"], pairs: [{ a: "visit", b: "fisit", note: "v vs f" }], examples: [{ word: "visit", stress: "VIS-it", note: "/ˈvɪzɪt/" }] },
  { focus: "Âm /t/ trong Tet", points: ["/t/ trong Tet, visit, get", "Đầu lưỡi chạm vòm miệng"], pairs: [], examples: [{ word: "Tet", stress: "Tet", note: "/tet/" }] },
  { focus: "Âm /p/ trong party", points: ["/p/ trong party, birthday, special", "Môi khép rồi bật hơi"], pairs: [], examples: [{ word: "party", stress: "PAR-ty", note: "/ˈpɑːti/" }] },
  { focus: "Âm /dʒ/ trong jogging", points: ["/dʒ/ trong jogging, judge, jacket", "Giống âm ch trong tiếng Việt"], pairs: [], examples: [{ word: "jogging", stress: "JOG-ging", note: "/ˈdʒɒɡɪŋ/" }] },
  { focus: "Âm /ʃ/ trong should", points: ["/ʃ/ trong should, doctor, fish", "Môi tròn, thổi hơi"], pairs: [{ a: "should", b: "sould", note: "sh vs s" }], examples: [{ word: "should", stress: "should", note: "/ʃʊd/" }] },
  { focus: "Âm /w/ trong winter", points: ["/w/ trong winter, wear, weather", "Môi tròn như chữ u"], pairs: [], examples: [{ word: "winter", stress: "WIN-ter", note: "/ˈwɪntə/" }] },
  { focus: "Âm /dr/ trong dragon", points: ["/dr/ trong dragon, dress, drink", "Kết hợp d + r"], pairs: [], examples: [{ word: "dragon", stress: "DRAG-on", note: "/ˈdræɡən/" }] },
  { focus: "Âm /tr/ trong transport", points: ["/tr/ trong transport, travel, trip", "Phát âm rõ t + r"], pairs: [], examples: [{ word: "transport", stress: "TRANS-port", note: "/ˈtrænspɔːt/" }] },
  { focus: "Âm /f/ trong far", points: ["/f/ trong far, from, floor", "Môi dưới chạm răng trên"], pairs: [{ a: "far", b: "var", note: "f vs v" }], examples: [{ word: "far", stress: "far", note: "/fɑː/" }] },
  { focus: "Âm /g/ trong going", points: ["/g/ trong going, visit, jogging", "Thanh quản rung"], pairs: [{ a: "going", b: "koing", note: "g vs silent" }], examples: [{ word: "going", stress: "GO-ing", note: "/ˈɡəʊɪŋ/" }] }
];

/** @type {Array<object>} */
const UNITS = [
  {
    chapterIndex: 1, chapter: "Unit 1: All about me!", book: "Sách giáo khoa",
    grammar: { id: "all_about_me", title: "What's your favourite + N?", formula: "What's your favourite + N? · I'm in Grade 5", description: "Hỏi sở thích và giới thiệu lớp học với favourite và I'm in Grade 5." },
    words: [
      { en: "favourite", vi: "yêu thích", example: "What's your favourite colour?" },
      { en: "colour", vi: "màu sắc", example: "My favourite colour is blue." },
      { en: "subject", vi: "môn học", example: "What's your favourite subject?" },
      { en: "Grade 5", vi: "lớp 5", example: "I'm in Grade 5." },
      { en: "hobby", vi: "sở thích", example: "What's your favourite hobby?" },
      { en: "sport", vi: "thể thao", example: "My favourite sport is football." },
      { en: "food", vi: "thức ăn", example: "What's your favourite food?" }
    ],
    listen: {
      lines: [
        { speaker: "Teacher", text: "What's your favourite colour?" },
        { speaker: "Mai", text: "My favourite colour is blue." },
        { speaker: "Teacher", text: "I'm in Grade 5." }
      ],
      qs: [
        { q: "What does the teacher ask first?", a: "What's your favourite colour?", c: ["Where do you live?", "What's your favourite colour?", "What nationality is she?", "Were you at the cinema?"] },
        { q: "What is Mai's favourite colour?", a: "Blue", c: ["Red", "Blue", "Green", "Yellow"] },
        { q: "What grade is the teacher in?", a: "Grade 5", c: ["Grade 4", "Grade 5", "Grade 6", "Grade 3"] },
        { q: "How do you ask about a favourite?", a: "What's your favourite + N?", c: ["I'm from", "What's your favourite + N?", "There are", "Did they go"] }
      ]
    }
  },
  {
    chapterIndex: 2, chapter: "Unit 2: Our homes", book: "Sách giáo khoa",
    grammar: { id: "our_homes", title: "Where do you live?", formula: "Where do you live? · Do you live in this house? · I live in + place", description: "Hỏi và trả lời nơi ở với Where do you live? và Do you live in this house?" },
    words: [
      { en: "live", vi: "sống", example: "Where do you live?" },
      { en: "house", vi: "nhà", example: "Do you live in this house?" },
      { en: "village", vi: "làng", example: "I live in a village." },
      { en: "city", vi: "thành phố", example: "I live in the city." },
      { en: "flat", vi: "căn hộ", example: "We live in a flat." },
      { en: "countryside", vi: "nông thôn", example: "I live in the countryside." },
      { en: "this", vi: "này", example: "Do you live in this house?" }
    ],
    listen: {
      lines: [
        { speaker: "Ann", text: "Where do you live?" },
        { speaker: "Ben", text: "I live in a village." },
        { speaker: "Ann", text: "Do you live in this house?" }
      ],
      qs: [
        { q: "What does Ann ask first?", a: "Where do you live?", c: ["What's your favourite colour?", "Where do you live?", "What would you like to be?", "How's the weather?"] },
        { q: "Where does Ben live?", a: "A village", c: ["A city", "A village", "A flat", "The museum"] },
        { q: "What does Ann ask next?", a: "Do you live in this house?", c: ["Where do you live?", "Do you live in this house?", "Whose pen is this?", "Will you visit for Tet?"] },
        { q: "How does Ben answer where?", a: "I live in + place", c: ["I'm in Grade 5", "I live in + place", "Yes, I can", "They went to"] }
      ]
    }
  },
  {
    chapterIndex: 3, chapter: "Unit 3: My foreign friends", book: "Sách giáo khoa",
    grammar: { id: "foreign_friends", title: "What nationality is she?", formula: "What nationality is she? · What's he like? · She is + nationality / He is + adjective", description: "Hỏi quốc tịch và mô tả tính cách bạn bè nước ngoài." },
    words: [
      { en: "nationality", vi: "quốc tịch", example: "What nationality is she?" },
      { en: "American", vi: "người Mỹ", example: "She is American." },
      { en: "Japanese", vi: "người Nhật", example: "He is Japanese." },
      { en: "friendly", vi: "thân thiện", example: "He's friendly." },
      { en: "funny", vi: "vui tính", example: "She's funny." },
      { en: "kind", vi: "tốt bụng", example: "He's kind." },
      { en: "like", vi: "như thế nào", example: "What's he like?" }
    ],
    listen: {
      lines: [
        { speaker: "Tom", text: "What nationality is she?" },
        { speaker: "Mai", text: "She is American." },
        { speaker: "Tom", text: "What's he like?" }
      ],
      qs: [
        { q: "What does Tom ask about the girl?", a: "What nationality is she?", c: ["Where do you live?", "What nationality is she?", "What do you like doing?", "Where's the library?"] },
        { q: "What nationality is she?", a: "American", c: ["Japanese", "American", "Vietnamese", "English"] },
        { q: "What does Tom ask about the boy?", a: "What's he like?", c: ["What's your favourite?", "What's he like?", "What did they do?", "How far is it?"] },
        { q: "How do you answer nationality?", a: "She is + nationality", c: ["She has long hair", "She is + nationality", "I live in", "We'll have a party"] }
      ]
    }
  },
  {
    chapterIndex: 4, chapter: "Unit 4: Our free-time activities", book: "Sách giáo khoa",
    grammar: { id: "free_time", title: "What do you like doing?", formula: "What do you like doing? · What do you do at the weekend? · I like + V-ing", description: "Nói về sở thích và hoạt động cuối tuần với like + V-ing." },
    words: [
      { en: "like doing", vi: "thích làm", example: "What do you like doing?" },
      { en: "reading", vi: "đọc sách", example: "I like reading books." },
      { en: "swimming", vi: "bơi", example: "I like swimming." },
      { en: "playing football", vi: "chơi bóng đá", example: "I like playing football." },
      { en: "weekend", vi: "cuối tuần", example: "What do you do at the weekend?" },
      { en: "watch TV", vi: "xem TV", example: "I watch TV at the weekend." },
      { en: "free time", vi: "thời gian rảnh", example: "In my free time I read." }
    ],
    listen: {
      lines: [
        { speaker: "Ann", text: "What do you like doing?" },
        { speaker: "Ben", text: "I like reading books." },
        { speaker: "Ann", text: "What do you do at the weekend?" }
      ],
      qs: [
        { q: "What does Ann ask first?", a: "What do you like doing?", c: ["What nationality is she?", "What do you like doing?", "Where's the library?", "What's the matter?"] },
        { q: "What does Ben like doing?", a: "Reading books", c: ["Swimming only", "Reading books", "Going to school", "Seeing a doctor"] },
        { q: "What does Ann ask next?", a: "What do you do at the weekend?", c: ["What do you like doing?", "What do you do at the weekend?", "Will you visit for Tet?", "Who are the main characters?"] },
        { q: "What structure after like?", a: "I like + V-ing", c: ["I like + V", "I like + V-ing", "I am + V-ing", "I would + V"] }
      ]
    }
  },
  {
    chapterIndex: 5, chapter: "Unit 5: My future job", book: "Sách giáo khoa",
    grammar: { id: "future_job", title: "What would you like to be?", formula: "What would you like to be? · Because I'd like to help people", description: "Nói về nghề nghiệp tương lai và lý do với would like to." },
    words: [
      { en: "would like", vi: "muốn", example: "What would you like to be?" },
      { en: "doctor", vi: "bác sĩ", example: "I'd like to be a doctor." },
      { en: "teacher", vi: "giáo viên", example: "I'd like to be a teacher." },
      { en: "nurse", vi: "y tá", example: "I'd like to be a nurse." },
      { en: "because", vi: "bởi vì", example: "Because I'd like to help people." },
      { en: "help people", vi: "giúp mọi người", example: "I'd like to help people." },
      { en: "future job", vi: "nghề tương lai", example: "This is my future job." }
    ],
    listen: {
      lines: [
        { speaker: "Teacher", text: "What would you like to be?" },
        { speaker: "Student", text: "I'd like to be a doctor." },
        { speaker: "Teacher", text: "Because I'd like to help people." }
      ],
      qs: [
        { q: "What does the teacher ask?", a: "What would you like to be?", c: ["What do you like doing?", "What would you like to be?", "Where do you live?", "Were you at the cinema?"] },
        { q: "What would the student like to be?", a: "A doctor", c: ["A teacher", "A doctor", "A driver", "A student"] },
        { q: "Why does the teacher give a reason?", a: "Because I'd like to help people", c: ["Because I live here", "Because I'd like to help people", "Because it's rainy", "Because they went"] },
        { q: "How do you give a reason?", a: "Because I'd like to + V", c: ["I like + V-ing", "Because I'd like to + V", "There are pencils", "You should see"] }
      ]
    }
  },
  {
    chapterIndex: 6, chapter: "Unit 6: Our school rooms", book: "Sách giáo khoa",
    grammar: { id: "school_rooms", title: "Where's the library?", formula: "Where's the + room? · It's on the + ordinal + floor", description: "Hỏi vị trí phòng trong trường và trả lời tầng với on the second floor." },
    words: [
      { en: "library", vi: "thư viện", example: "Where's the library?" },
      { en: "computer room", vi: "phòng máy tính", example: "The computer room is upstairs." },
      { en: "music room", vi: "phòng nhạc", example: "Where's the music room?" },
      { en: "second floor", vi: "tầng hai", example: "It's on the second floor." },
      { en: "first floor", vi: "tầng một", example: "It's on the first floor." },
      { en: "floor", vi: "tầng", example: "Which floor is it on?" },
      { en: "where's", vi: "ở đâu", example: "Where's the library?" }
    ],
    listen: {
      lines: [
        { speaker: "Visitor", text: "Where's the library?" },
        { speaker: "Student", text: "It's on the second floor." },
        { speaker: "Visitor", text: "Where's the music room?" }
      ],
      qs: [
        { q: "What does the visitor ask first?", a: "Where's the library?", c: ["Is there a library?", "Where's the library?", "How many floors?", "What school activity?"] },
        { q: "Where is the library?", a: "On the second floor", c: ["On the first floor", "On the second floor", "In the village", "At the cinema"] },
        { q: "What does the visitor ask next?", a: "Where's the music room?", c: ["Where's the library?", "Where's the music room?", "Whose pen is this?", "What did they do?"] },
        { q: "How do you answer location?", a: "It's on the + floor", c: ["I live in", "It's on the + floor", "I like reading", "They are going to"] }
      ]
    }
  },
  {
    chapterIndex: 7, chapter: "Unit 7: Our favourite school activities", book: "Sách giáo khoa",
    grammar: { id: "school_activities", title: "What school activity does he like?", formula: "What school activity does + person + like? · He likes + activity", description: "Hỏi và trả lời hoạt động ngoại khóa yêu thích ở trường." },
    words: [
      { en: "school activity", vi: "hoạt động trường", example: "What school activity does he like?" },
      { en: "drawing", vi: "vẽ", example: "He likes drawing." },
      { en: "singing", vi: "hát", example: "She likes singing." },
      { en: "dancing", vi: "nhảy", example: "He likes dancing." },
      { en: "chess club", vi: "câu lạc bộ cờ", example: "She likes the chess club." },
      { en: "English club", vi: "câu lạc bộ tiếng Anh", example: "He likes the English club." },
      { en: "does", vi: "làm (câu hỏi)", example: "What activity does he like?" }
    ],
    listen: {
      lines: [
        { speaker: "Mai", text: "What school activity does he like?" },
        { speaker: "Tom", text: "He likes drawing." },
        { speaker: "Mai", text: "She likes the English club." }
      ],
      qs: [
        { q: "What does Mai ask?", a: "What school activity does he like?", c: ["What's your favourite colour?", "What school activity does he like?", "Where are the pencils?", "How far is it?"] },
        { q: "What does he like?", a: "Drawing", c: ["Swimming", "Drawing", "Jogging", "Visiting grandparents"] },
        { q: "What does she like?", a: "The English club", c: ["The chess club only", "The English club", "The museum", "The dragon"] },
        { q: "How do you answer he likes?", a: "He likes + activity", c: ["He is a doctor", "He likes + activity", "He was at", "He will visit"] }
      ]
    }
  },
  {
    chapterIndex: 8, chapter: "Unit 8: In our classroom", book: "Sách giáo khoa",
    grammar: { id: "in_classroom", title: "Where are the pencils?", formula: "Where are the + plural? · Whose + N + is this?", description: "Hỏi vị trí đồ vật và hỏi sở hữu với Where are...? và Whose...?" },
    words: [
      { en: "pencils", vi: "bút chì", example: "Where are the pencils?" },
      { en: "ruler", vi: "thước kẻ", example: "The ruler is on the desk." },
      { en: "pen", vi: "bút mực", example: "Whose pen is this?" },
      { en: "desk", vi: "bàn học", example: "The books are on the desk." },
      { en: "whose", vi: "của ai", example: "Whose pen is this?" },
      { en: "mine", vi: "của tôi", example: "It's mine." },
      { en: "yours", vi: "của bạn", example: "It's yours." }
    ],
    listen: {
      lines: [
        { speaker: "Teacher", text: "Where are the pencils?" },
        { speaker: "Student", text: "They are on the desk." },
        { speaker: "Teacher", text: "Whose pen is this?" }
      ],
      qs: [
        { q: "What does the teacher ask first?", a: "Where are the pencils?", c: ["Where's the library?", "Where are the pencils?", "Where do you live?", "Where will you go?"] },
        { q: "Where are the pencils?", a: "On the desk", c: ["On the second floor", "On the desk", "In the village", "By bus"] },
        { q: "What does the teacher ask next?", a: "Whose pen is this?", c: ["Where are the pencils?", "Whose pen is this?", "What nationality is she?", "How often does he jog?"] },
        { q: "What question asks ownership?", a: "Whose + N + is this?", c: ["Where are", "Whose + N + is this?", "What would you", "Did they go"] }
      ]
    }
  },
  {
    chapterIndex: 9, chapter: "Unit 9: Our outdoor activities", book: "Sách giáo khoa",
    grammar: { id: "outdoor_past", title: "Were you at the cinema?", formula: "Were you at + place? · What did you do yesterday? · I + V-ed + ...", description: "Hỏi hoạt động ngoài trời quá khứ với Were you at...? và What did you do yesterday?" },
    words: [
      { en: "cinema", vi: "rạp chiếu phim", example: "Were you at the cinema?" },
      { en: "park", vi: "công viên", example: "We were at the park." },
      { en: "yesterday", vi: "hôm qua", example: "What did you do yesterday?" },
      { en: "played", vi: "đã chơi", example: "I played football yesterday." },
      { en: "went", vi: "đã đi", example: "We went to the park." },
      { en: "outdoor", vi: "ngoài trời", example: "Outdoor activities are fun." },
      { en: "were", vi: "đã ở (quá khứ)", example: "Were you at the cinema?" }
    ],
    listen: {
      lines: [
        { speaker: "Ann", text: "Were you at the cinema?" },
        { speaker: "Ben", text: "Yes, I was." },
        { speaker: "Ann", text: "What did you do yesterday?" }
      ],
      qs: [
        { q: "What does Ann ask first?", a: "Were you at the cinema?", c: ["Will you visit?", "Were you at the cinema?", "Where's the library?", "What's your favourite?"] },
        { q: "Was Ben at the cinema?", a: "Yes", c: ["No", "Yes", "Maybe", "Tomorrow"] },
        { q: "What does Ann ask next?", a: "What did you do yesterday?", c: ["What do you like doing?", "What did you do yesterday?", "What will you do?", "What are you going to do?"] },
        { q: "What tense is used?", a: "Past simple", c: ["Present simple", "Past simple", "Future will", "Going to"] }
      ]
    }
  },
  {
    chapterIndex: 10, chapter: "Unit 10: Our school trip", book: "Sách giáo khoa",
    grammar: { id: "school_trip", title: "Did they go to the museum?", formula: "Did they go to + place? · What did they do there? · They + V-ed + ...", description: "Hỏi chuyến đi học quá khứ với Did they go...? và What did they do there?" },
    words: [
      { en: "museum", vi: "bảo tàng", example: "Did they go to the museum?" },
      { en: "school trip", vi: "chuyến đi học", example: "Our school trip was fun." },
      { en: "saw", vi: "đã xem", example: "They saw old pictures." },
      { en: "took photos", vi: "chụp ảnh", example: "They took photos there." },
      { en: "there", vi: "ở đó", example: "What did they do there?" },
      { en: "did", vi: "đã (câu hỏi)", example: "Did they go to the museum?" },
      { en: "exhibits", vi: "hiện vật", example: "They looked at the exhibits." }
    ],
    listen: {
      lines: [
        { speaker: "Teacher", text: "Did they go to the museum?" },
        { speaker: "Student", text: "Yes, they did." },
        { speaker: "Teacher", text: "What did they do there?" }
      ],
      qs: [
        { q: "What does the teacher ask first?", a: "Did they go to the museum?", c: ["Will they go?", "Did they go to the museum?", "Where's the museum?", "How far is the museum?"] },
        { q: "Did they go to the museum?", a: "Yes", c: ["No", "Yes", "Not yet", "Tomorrow"] },
        { q: "What does the teacher ask next?", a: "What did they do there?", c: ["What do they like?", "What did they do there?", "What will they do?", "What are they doing?"] },
        { q: "How do you ask about a past trip?", a: "Did they go to + place?", c: ["Do they go", "Did they go to + place?", "Are they going", "They go to"] }
      ]
    }
  },
  {
    chapterIndex: 11, chapter: "Unit 11: Family time", book: "Sách giáo khoa",
    grammar: { id: "family_time", title: "Did you visit your grandparents?", formula: "Did you visit + person? · What did your family do? · We + V-ed + ...", description: "Hỏi hoạt động gia đình quá khứ với Did you visit...? và What did your family do?" },
    words: [
      { en: "grandparents", vi: "ông bà", example: "Did you visit your grandparents?" },
      { en: "family", vi: "gia đình", example: "What did your family do?" },
      { en: "visited", vi: "đã thăm", example: "We visited our grandparents." },
      { en: "cooked", vi: "đã nấu", example: "My mum cooked dinner." },
      { en: "watched TV", vi: "đã xem TV", example: "We watched TV together." },
      { en: "picnic", vi: "dã ngoại", example: "We had a picnic." },
      { en: "together", vi: "cùng nhau", example: "We ate together." }
    ],
    listen: {
      lines: [
        { speaker: "Mum", text: "Did you visit your grandparents?" },
        { speaker: "Child", text: "Yes, we did." },
        { speaker: "Mum", text: "What did your family do?" }
      ],
      qs: [
        { q: "What does Mum ask first?", a: "Did you visit your grandparents?", c: ["Will you visit?", "Did you visit your grandparents?", "Where do you live?", "What's the matter?"] },
        { q: "Did they visit grandparents?", a: "Yes", c: ["No", "Yes", "Next week", "At the museum"] },
        { q: "What does Mum ask next?", a: "What did your family do?", c: ["What do you like doing?", "What did your family do?", "What will your family do?", "What nationality is she?"] },
        { q: "Who is asked about visiting?", a: "Grandparents", c: ["Teachers", "Grandparents", "The library", "The dragon"] }
      ]
    }
  },
  {
    chapterIndex: 12, chapter: "Unit 12: Our Tet holiday", book: "Sách giáo khoa",
    grammar: { id: "tet_holiday", title: "Will you visit for Tet?", formula: "Will you visit for Tet? · Where will you go at Tet? · I will visit + place", description: "Nói kế hoạch Tết với will và Where will you go at Tet?" },
    words: [
      { en: "Tet", vi: "Tết", example: "Will you visit for Tet?" },
      { en: "visit", vi: "thăm", example: "I will visit my grandparents." },
      { en: "will", vi: "sẽ", example: "Where will you go at Tet?" },
      { en: "hometown", vi: "quê hương", example: "I will go to my hometown." },
      { en: "flowers", vi: "hoa", example: "We buy flowers for Tet." },
      { en: "holiday", vi: "kỳ nghỉ", example: "Tet is a long holiday." },
      { en: "at Tet", vi: "dịp Tết", example: "Where will you go at Tet?" }
    ],
    listen: {
      lines: [
        { speaker: "Ann", text: "Will you visit for Tet?" },
        { speaker: "Ben", text: "Yes, I will visit my grandparents." },
        { speaker: "Ann", text: "Where will you go at Tet?" }
      ],
      qs: [
        { q: "What does Ann ask first?", a: "Will you visit for Tet?", c: ["Did you visit?", "Will you visit for Tet?", "Were you at the cinema?", "What did they do there?"] },
        { q: "Will Ben visit for Tet?", a: "Yes", c: ["No", "Yes", "Yesterday", "At school"] },
        { q: "What does Ann ask next?", a: "Where will you go at Tet?", c: ["Where do you live?", "Where will you go at Tet?", "Where's the library?", "Where are the pencils?"] },
        { q: "What modal shows future?", a: "will", c: ["did", "was", "will", "would like"] }
      ]
    }
  },
  {
    chapterIndex: 13, chapter: "Unit 13: Our special days", book: "Sách giáo khoa",
    grammar: { id: "special_days", title: "What will you do on your birthday?", formula: "What will you do on your birthday? · We'll have a party", description: "Nói kế hoạch ngày đặc biệt với will và We'll have..." },
    words: [
      { en: "birthday", vi: "sinh nhật", example: "What will you do on your birthday?" },
      { en: "party", vi: "bữa tiệc", example: "We'll have a party." },
      { en: "cake", vi: "bánh kem", example: "We'll eat birthday cake." },
      { en: "special day", vi: "ngày đặc biệt", example: "Birthday is a special day." },
      { en: "invite", vi: "mời", example: "I'll invite my friends." },
      { en: "presents", vi: "quà", example: "I will get many presents." },
      { en: "we'll", vi: "chúng ta sẽ", example: "We'll have a party." }
    ],
    listen: {
      lines: [
        { speaker: "Tom", text: "What will you do on your birthday?" },
        { speaker: "Mai", text: "We'll have a party." },
        { speaker: "Tom", text: "I'll invite my friends." }
      ],
      qs: [
        { q: "What does Tom ask?", a: "What will you do on your birthday?", c: ["When is your birthday?", "What will you do on your birthday?", "What did you do yesterday?", "What do you like doing?"] },
        { q: "What will Mai's family do?", a: "Have a party", c: ["Go to the museum", "Have a party", "See a doctor", "Get there by bus"] },
        { q: "What will Tom do?", a: "Invite friends", c: ["Visit grandparents", "Invite friends", "Go jogging", "Defeat the dragon"] },
        { q: "How do you say we will?", a: "We'll have + N", c: ["We have had", "We'll have + N", "We were at", "We like + V-ing"] }
      ]
    }
  },
  {
    chapterIndex: 14, chapter: "Unit 14: Staying healthy", book: "Sách giáo khoa",
    grammar: { id: "staying_healthy", title: "How does she stay healthy?", formula: "How does + person + stay healthy? · How often does he go jogging? · She eats vegetables / He goes jogging + frequency", description: "Hỏi cách giữ sức khỏe và tần suất với How does...? và How often does...?" },
    words: [
      { en: "stay healthy", vi: "giữ sức khỏe", example: "How does she stay healthy?" },
      { en: "jogging", vi: "chạy bộ", example: "How often does he go jogging?" },
      { en: "vegetables", vi: "rau", example: "She eats vegetables." },
      { en: "often", vi: "thường xuyên", example: "How often does he exercise?" },
      { en: "three times a week", vi: "ba lần một tuần", example: "He goes jogging three times a week." },
      { en: "exercise", vi: "tập thể dục", example: "Exercise helps you stay healthy." },
      { en: "every day", vi: "mỗi ngày", example: "She drinks water every day." }
    ],
    listen: {
      lines: [
        { speaker: "Doctor", text: "How does she stay healthy?" },
        { speaker: "Nurse", text: "She eats vegetables." },
        { speaker: "Doctor", text: "How often does he go jogging?" }
      ],
      qs: [
        { q: "What does the doctor ask first?", a: "How does she stay healthy?", c: ["What's the matter?", "How does she stay healthy?", "Where's the library?", "What will you do?"] },
        { q: "How does she stay healthy?", a: "Eats vegetables", c: ["Goes to cinema", "Eats vegetables", "Lives in a flat", "Likes drawing"] },
        { q: "What does the doctor ask next?", a: "How often does he go jogging?", c: ["How does she stay healthy?", "How often does he go jogging?", "How far is it?", "How did he defeat?"] },
        { q: "What asks about frequency?", a: "How often does he + V?", c: ["How does she", "How often does he + V?", "How's the weather", "How are you"] }
      ]
    }
  },
  {
    chapterIndex: 15, chapter: "Unit 15: Our health", book: "Sách giáo khoa",
    grammar: { id: "our_health", title: "What's the matter?", formula: "What's the matter? · You should see a doctor · I have a + illness", description: "Hỏi vấn đề sức khỏe và đưa lời khuyên với should." },
    words: [
      { en: "matter", vi: "vấn đề", example: "What's the matter?" },
      { en: "headache", vi: "đau đầu", example: "I have a headache." },
      { en: "fever", vi: "sốt", example: "She has a fever." },
      { en: "should", vi: "nên", example: "You should see a doctor." },
      { en: "doctor", vi: "bác sĩ", example: "See a doctor." },
      { en: "rest", vi: "nghỉ ngơi", example: "You should rest." },
      { en: "sore throat", vi: "đau họng", example: "He has a sore throat." }
    ],
    listen: {
      lines: [
        { speaker: "Mum", text: "What's the matter?" },
        { speaker: "Child", text: "I have a headache." },
        { speaker: "Mum", text: "You should see a doctor." }
      ],
      qs: [
        { q: "What does Mum ask?", a: "What's the matter?", c: ["How does she stay healthy?", "What's the matter?", "What's your favourite?", "What nationality is she?"] },
        { q: "What is wrong with the child?", a: "Headache", c: ["Happy", "Headache", "Hungry", "Hot weather"] },
        { q: "What should the child do?", a: "See a doctor", c: ["Go jogging", "See a doctor", "Visit the museum", "Play football"] },
        { q: "How do you give advice?", a: "You should + V", c: ["You will + V", "You should + V", "You did + V", "You like + V-ing"] }
      ]
    }
  },
  {
    chapterIndex: 16, chapter: "Unit 16: Seasons and the weather", book: "Sách giáo khoa",
    grammar: { id: "seasons_weather", title: "How's the weather in winter?", formula: "How's the weather in + season? · What do you wear in + season? · It's + adjective / I wear + clothes", description: "Hỏi thời tiết theo mùa và trang phục với How's the weather...? và What do you wear...?" },
    words: [
      { en: "winter", vi: "mùa đông", example: "How's the weather in winter?" },
      { en: "summer", vi: "mùa hè", example: "What do you wear in summer?" },
      { en: "spring", vi: "mùa xuân", example: "It's warm in spring." },
      { en: "autumn", vi: "mùa thu", example: "It's cool in autumn." },
      { en: "coat", vi: "áo khoác", example: "I wear a coat in winter." },
      { en: "T-shirt", vi: "áo phông", example: "I wear a T-shirt in summer." },
      { en: "weather", vi: "thời tiết", example: "How's the weather today?" }
    ],
    listen: {
      lines: [
        { speaker: "Ann", text: "How's the weather in winter?" },
        { speaker: "Ben", text: "It's cold and windy." },
        { speaker: "Ann", text: "What do you wear in summer?" }
      ],
      qs: [
        { q: "What does Ann ask first?", a: "How's the weather in winter?", c: ["What's the matter?", "How's the weather in winter?", "Where will you go?", "Who are the main characters?"] },
        { q: "What is winter weather like?", a: "Cold and windy", c: ["Hot and sunny", "Cold and windy", "Rainy only", "Warm"] },
        { q: "What does Ann ask next?", a: "What do you wear in summer?", c: ["How's the weather in winter?", "What do you wear in summer?", "What do you like doing?", "What did they do there?"] },
        { q: "How do you answer clothes?", a: "I wear + clothes in + season", c: ["I live in", "I wear + clothes in + season", "I will visit", "They went to"] }
      ]
    }
  },
  {
    chapterIndex: 17, chapter: "Unit 17: Stories for children", book: "Sách giáo khoa",
    grammar: { id: "stories", title: "Who are the main characters?", formula: "Who are the main characters? · How did he defeat the dragon? · He + V-ed + object", description: "Hỏi về nhân vật và diễn biến truyện với Who are...? và How did he...?" },
    words: [
      { en: "story", vi: "câu chuyện", example: "This is a story for children." },
      { en: "main characters", vi: "nhân vật chính", example: "Who are the main characters?" },
      { en: "dragon", vi: "rồng", example: "How did he defeat the dragon?" },
      { en: "prince", vi: "hoàng tử", example: "The prince is brave." },
      { en: "princess", vi: "công chúa", example: "The princess helps him." },
      { en: "defeat", vi: "đánh bại", example: "He defeated the dragon." },
      { en: "brave", vi: "dũng cảm", example: "The hero is brave." }
    ],
    listen: {
      lines: [
        { speaker: "Teacher", text: "Who are the main characters?" },
        { speaker: "Student", text: "The prince and the princess." },
        { speaker: "Teacher", text: "How did he defeat the dragon?" }
      ],
      qs: [
        { q: "What does the teacher ask first?", a: "Who are the main characters?", c: ["What will you do?", "Who are the main characters?", "Where do you want to visit?", "How often does he jog?"] },
        { q: "Who are the main characters?", a: "The prince and the princess", c: ["The doctor and nurse", "The prince and the princess", "Ann and Ben", "The teacher only"] },
        { q: "What does the teacher ask next?", a: "How did he defeat the dragon?", c: ["Who are the main characters?", "How did he defeat the dragon?", "Did they go to the museum?", "Will you visit for Tet?"] },
        { q: "What tense tells the story action?", a: "Past simple (did/defeated)", c: ["Future will", "Past simple (did/defeated)", "Present continuous", "Going to only"] }
      ]
    }
  },
  {
    chapterIndex: 18, chapter: "Unit 18: Means of transport", book: "Sách giáo khoa",
    grammar: { id: "transport", title: "Where do you want to visit?", formula: "Where do you want to visit? · You can get there by + transport", description: "Nói nơi muốn đến và phương tiện với want to visit và by + transport." },
    words: [
      { en: "visit", vi: "thăm/đến thăm", example: "Where do you want to visit?" },
      { en: "bus", vi: "xe buýt", example: "You can get there by bus." },
      { en: "train", vi: "tàu hỏa", example: "We go by train." },
      { en: "plane", vi: "máy bay", example: "They travel by plane." },
      { en: "bike", vi: "xe đạp", example: "I go by bike." },
      { en: "get there", vi: "đến đó", example: "How can we get there?" },
      { en: "transport", vi: "phương tiện", example: "Means of transport are useful." }
    ],
    listen: {
      lines: [
        { speaker: "Tourist", text: "Where do you want to visit?" },
        { speaker: "Guide", text: "I want to visit Ha Long Bay." },
        { speaker: "Tourist", text: "You can get there by bus." }
      ],
      qs: [
        { q: "What does the tourist ask?", a: "Where do you want to visit?", c: ["Where do you live?", "Where do you want to visit?", "Where are you going to visit?", "Where's the library?"] },
        { q: "Where does the guide want to go?", a: "Ha Long Bay", c: ["The museum", "Ha Long Bay", "The classroom", "Grandparents' house"] },
        { q: "How can they get there?", a: "By bus", c: ["By dragon", "By bus", "On foot only", "By pencil"] },
        { q: "How do you say transport?", a: "You can get there by + transport", c: ["I live in", "You can get there by + transport", "We'll have a party", "She eats vegetables"] }
      ]
    }
  },
  {
    chapterIndex: 19, chapter: "Unit 19: Places of interest", book: "Sách giáo khoa",
    grammar: { id: "places_interest", title: "What do you think of the park?", formula: "What do you think of + place? · How far is it from + place?", description: "Nêu ý kiến và hỏi khoảng cách với think of và How far is it from...?" },
    words: [
      { en: "park", vi: "công viên", example: "What do you think of the park?" },
      { en: "think of", vi: "nghĩ về/đánh giá", example: "I think it's beautiful." },
      { en: "beautiful", vi: "đẹp", example: "The park is beautiful." },
      { en: "far", vi: "xa", example: "How far is it from here?" },
      { en: "kilometres", vi: "kilômét", example: "It's five kilometres from the school." },
      { en: "from", vi: "từ", example: "How far is it from your house?" },
      { en: "interesting", vi: "thú vị", example: "The museum is interesting." }
    ],
    listen: {
      lines: [
        { speaker: "Ann", text: "What do you think of the park?" },
        { speaker: "Ben", text: "I think it's beautiful." },
        { speaker: "Ann", text: "How far is it from the school?" }
      ],
      qs: [
        { q: "What does Ann ask first?", a: "What do you think of the park?", c: ["Where do you live?", "What do you think of the park?", "What's the matter?", "Were you at the cinema?"] },
        { q: "What does Ben think of the park?", a: "It's beautiful", c: ["It's far only", "It's beautiful", "It's boring", "It's a doctor"] },
        { q: "What does Ann ask next?", a: "How far is it from the school?", c: ["What do you think of the park?", "How far is it from the school?", "How often does he jog?", "How did he defeat the dragon?"] },
        { q: "How do you ask distance?", a: "How far is it from + place?", c: ["How many is it", "How far is it from + place?", "How much is this", "How does she stay"] }
      ]
    }
  },
  {
    chapterIndex: 20, chapter: "Unit 20: Our summer holidays", book: "Sách giáo khoa",
    grammar: { id: "summer_holidays", title: "Where are you going to visit?", formula: "Where are you going to visit? · What are you going to do? · I'm going to + V / place", description: "Nói kế hoạch hè với going to visit và going to do." },
    words: [
      { en: "summer holidays", vi: "kỳ nghỉ hè", example: "Our summer holidays are soon." },
      { en: "going to visit", vi: "sẽ đến thăm", example: "Where are you going to visit?" },
      { en: "going to do", vi: "sẽ làm", example: "What are you going to do?" },
      { en: "beach", vi: "bãi biển", example: "I'm going to visit the beach." },
      { en: "swim", vi: "bơi", example: "I'm going to swim in the sea." },
      { en: "travel", vi: "du lịch", example: "We are going to travel." },
      { en: "plan", vi: "kế hoạch", example: "What is your summer plan?" }
    ],
    listen: {
      lines: [
        { speaker: "Mum", text: "Where are you going to visit?" },
        { speaker: "Child", text: "I'm going to visit the beach." },
        { speaker: "Mum", text: "What are you going to do?" }
      ],
      qs: [
        { q: "What does Mum ask first?", a: "Where are you going to visit?", c: ["Where do you live?", "Where are you going to visit?", "Where's the library?", "Where are the pencils?"] },
        { q: "Where is the child going to visit?", a: "The beach", c: ["The museum", "The beach", "The school", "The doctor"] },
        { q: "What does Mum ask next?", a: "What are you going to do?", c: ["What did you do yesterday?", "What are you going to do?", "What do you like doing?", "What would you like to be?"] },
        { q: "What structure shows summer plans?", a: "going to + V / visit", c: ["will visit only", "going to + V / visit", "did go", "were at"] }
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
  return `g5_u${unit.chapterIndex}_${unit.grammar.id}`;
}

function vocabId(unit) {
  return `g5_u${unit.chapterIndex}_vocab`;
}

function pronId(unit) {
  return `g5_u${unit.chapterIndex}_pronunciation`;
}

function listenId(unit) {
  return `g5_u${unit.chapterIndex}_listening`;
}

function buildGrammarSkill(unit) {
  const id = grammarId(unit);
  return {
    id,
    title: `Unit ${unit.chapterIndex} · ${unit.grammar.title}`,
    grade: 5,
    book: unit.book,
    chapter: unit.chapter,
    chapterIndex: unit.chapterIndex,
    lessonNo: 1,
    domain: "Grammar",
    skillType: "grammar",
    grammar: unit.grammar.id,
    level: 5,
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
    grade: 5,
    book: unit.book,
    chapter: unit.chapter,
    chapterIndex: unit.chapterIndex,
    lessonNo: 10,
    domain: "Vocabulary",
    skillType: "vocabulary",
    grammar: "vocabulary",
    level: 5,
    prerequisite: [],
    description: `Học ${unit.words.length} từ vựng Unit ${unit.chapterIndex} Global Success lớp 5.`,
    formula: `${unit.words.length} từ · EN ↔ VI`,
    visualization: "vocabulary"
  };
}

function buildPronSkill(unit, topic) {
  return {
    id: pronId(unit),
    title: `Unit ${unit.chapterIndex} · Phát âm`,
    grade: 5,
    book: unit.book,
    chapter: unit.chapter,
    chapterIndex: unit.chapterIndex,
    lessonNo: 11,
    domain: "Pronunciation",
    skillType: "pronunciation",
    grammar: "pronunciation",
    level: 5,
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
    grade: 5,
    book: unit.book,
    chapter: unit.chapter,
    chapterIndex: unit.chapterIndex,
    lessonNo: 12,
    domain: "Listening",
    skillType: "listening",
    grammar: "listening",
    level: 5,
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
    all_about_me: { q: "What's your favourite ___?", c: ["colour", "colours", "colouring", "coloured"], a: "colour", ex: "What's your favourite colour" },
    our_homes: { q: "Where ___ you live?", c: ["do", "does", "did", "are"], a: "do", ex: "Where do you live" },
    foreign_friends: { q: "What nationality ___ she?", c: ["is", "are", "am", "be"], a: "is", ex: "What nationality is she" },
    free_time: { q: "I like ___ books.", c: ["reading", "read", "reads", "readed"], a: "reading", ex: "I like reading books" },
    future_job: { q: "What would you like ___ be?", c: ["to", "at", "in", "on"], a: "to", ex: "What would you like to be" },
    school_rooms: { q: "It's on the ___ floor.", c: ["second", "two", "twice", "seconds"], a: "second", ex: "It's on the second floor" },
    school_activities: { q: "He ___ drawing.", c: ["likes", "like", "liking", "liked"], a: "likes", ex: "He likes drawing" },
    in_classroom: { q: "___ pen is this?", c: ["Whose", "Who", "Where", "Which"], a: "Whose", ex: "Whose pen is this" },
    outdoor_past: { q: "___ you at the cinema?", c: ["Were", "Are", "Was", "Is"], a: "Were", ex: "Were you at the cinema" },
    school_trip: { q: "___ they go to the museum?", c: ["Did", "Do", "Does", "Are"], a: "Did", ex: "Did they go to the museum" },
    family_time: { q: "Did you ___ your grandparents?", c: ["visit", "visits", "visiting", "visited"], a: "visit", ex: "Did you visit your grandparents" },
    tet_holiday: { q: "___ will you go at Tet?", c: ["Where", "What", "When", "Who"], a: "Where", ex: "Where will you go at Tet" },
    special_days: { q: "We'll ___ a party.", c: ["have", "has", "having", "had"], a: "have", ex: "We'll have a party" },
    staying_healthy: { q: "How ___ does he go jogging?", c: ["often", "many", "much", "long"], a: "often", ex: "How often does he go jogging" },
    our_health: { q: "You ___ see a doctor.", c: ["should", "will", "did", "are"], a: "should", ex: "You should see a doctor" },
    seasons_weather: { q: "What do you wear ___ summer?", c: ["in", "on", "at", "to"], a: "in", ex: "What do you wear in summer" },
    stories: { q: "How ___ he defeat the dragon?", c: ["did", "do", "does", "is"], a: "did", ex: "How did he defeat the dragon" },
    transport: { q: "You can get there ___ bus.", c: ["by", "on", "in", "at"], a: "by", ex: "You can get there by bus" },
    places_interest: { q: "How ___ is it from the school?", c: ["far", "many", "much", "long"], a: "far", ex: "How far is it from the school" },
    summer_holidays: { q: "Where are you going ___ visit?", c: ["to", "at", "in", "on"], a: "to", ex: "Where are you going to visit" }
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

const G5_ERRORS = [
  { pattern: "what is your favourite colour", grammar: "all_about_me", code: "G5001", errorType: "favourite_whats", title: "Sai What's your favourite + N?", message: "Sở thích: What's your favourite colour? I'm in Grade 5.", hint: "What's your favourite + N?", recommendation: "g5_u1_all_about_me" },
  { pattern: "where you live", grammar: "our_homes", code: "G5002", errorType: "where_do_live", title: "Sai Where do you live?", message: "Nơi ở: Where do you live? I live in a village. Do you live in this house?", hint: "Where do you live?", recommendation: "g5_u2_our_homes" },
  { pattern: "what is she nationality", grammar: "foreign_friends", code: "G5003", errorType: "nationality_is", title: "Sai What nationality is she?", message: "Quốc tịch: What nationality is she? Tính cách: What's he like?", hint: "What nationality is she?", recommendation: "g5_u3_foreign_friends" },
  { pattern: "what do you like do", grammar: "free_time", code: "G5004", errorType: "like_doing", title: "Sai like + V-ing", message: "Sở thích: What do you like doing? I like reading books.", hint: "like + V-ing", recommendation: "g5_u4_free_time" },
  { pattern: "what do you like to be", grammar: "future_job", code: "G5005", errorType: "would_like_be", title: "Sai would like to be", message: "Nghề tương lai: What would you like to be? Because I'd like to help people.", hint: "would you like to be", recommendation: "g5_u5_future_job" },
  { pattern: "where is the library on second floor", grammar: "school_rooms", code: "G5006", errorType: "on_the_floor", title: "Sai on the second floor", message: "Vị trí: Where's the library? It's on the second floor.", hint: "on the + ordinal + floor", recommendation: "g5_u6_school_rooms" },
  { pattern: "what school activity he like", grammar: "school_activities", code: "G5007", errorType: "does_he_like", title: "Sai does he like", message: "Hoạt động trường: What school activity does he like? He likes drawing.", hint: "does + person + like", recommendation: "g5_u7_school_activities" },
  { pattern: "who pen is this", grammar: "in_classroom", code: "G5008", errorType: "whose_pen", title: "Sai Whose pen is this?", message: "Sở hữu: Whose pen is this? Vị trí: Where are the pencils?", hint: "Whose + N + is this?", recommendation: "g5_u8_in_classroom" },
  { pattern: "was you at the cinema", grammar: "outdoor_past", code: "G5009", errorType: "were_you_at", title: "Sai Were you at...?", message: "Quá khứ: Were you at the cinema? What did you do yesterday?", hint: "Were you at + place?", recommendation: "g5_u9_outdoor_past" },
  { pattern: "do they went to the museum", grammar: "school_trip", code: "G5010", errorType: "did_they_go", title: "Sai Did they go...?", message: "Chuyến đi: Did they go to the museum? What did they do there?", hint: "Did they go to + place?", recommendation: "g5_u10_school_trip" },
  { pattern: "did you visited grandparents", grammar: "family_time", code: "G5011", errorType: "did_visit", title: "Sai Did you visit...?", message: "Gia đình: Did you visit your grandparents? What did your family do?", hint: "Did you + V (base form)", recommendation: "g5_u11_family_time" },
  { pattern: "where you will go at tet", grammar: "tet_holiday", code: "G5012", errorType: "where_will_go", title: "Sai Where will you go?", message: "Tết: Will you visit for Tet? Where will you go at Tet?", hint: "Where will you + V?", recommendation: "g5_u12_tet_holiday" },
  { pattern: "what you will do on birthday", grammar: "special_days", code: "G5013", errorType: "what_will_do", title: "Sai What will you do on your birthday?", message: "Ngày đặc biệt: What will you do on your birthday? We'll have a party.", hint: "What will you do on + day?", recommendation: "g5_u13_special_days" },
  { pattern: "how she stay healthy", grammar: "staying_healthy", code: "G5014", errorType: "how_does_stay", title: "Sai How does she stay healthy?", message: "Sức khỏe: How does she stay healthy? How often does he go jogging?", hint: "How does + person + stay healthy?", recommendation: "g5_u14_staying_healthy" },
  { pattern: "what is the matter with you", grammar: "our_health", code: "G5015", errorType: "whats_matter", title: "Sai What's the matter?", message: "Sức khỏe: What's the matter? You should see a doctor.", hint: "What's the matter?", recommendation: "g5_u15_our_health" },
  { pattern: "how is the weather in winter", grammar: "seasons_weather", code: "G5016", errorType: "hows_weather", title: "Sai How's the weather in winter?", message: "Mùa: How's the weather in winter? What do you wear in summer?", hint: "How's the weather in + season?", recommendation: "g5_u16_seasons_weather" },
  { pattern: "who is the main characters", grammar: "stories", code: "G5017", errorType: "who_are_characters", title: "Sai Who are the main characters?", message: "Truyện: Who are the main characters? How did he defeat the dragon?", hint: "Who are the main characters?", recommendation: "g5_u17_stories" },
  { pattern: "you can get there on bus", grammar: "transport", code: "G5018", errorType: "by_transport", title: "Sai by + transport", message: "Đi lại: Where do you want to visit? You can get there by bus.", hint: "by + bus/train/plane", recommendation: "g5_u18_transport" },
  { pattern: "how many far is it from school", grammar: "places_interest", code: "G5019", errorType: "how_far_from", title: "Sai How far is it from...?", message: "Địa điểm: What do you think of the park? How far is it from the school?", hint: "How far is it from + place?", recommendation: "g5_u19_places_interest" },
  { pattern: "where you are going visit", grammar: "summer_holidays", code: "G5020", errorType: "going_to_visit", title: "Sai going to visit", message: "Hè: Where are you going to visit? What are you going to do?", hint: "going to + visit / do", recommendation: "g5_u20_summer_holidays" }
];

function merge() {
  const g5Ids = new Set();
  const g5Grammars = new Set(UNITS.map((u) => u.grammar.id));
  UNITS.forEach((u) => {
    g5Ids.add(grammarId(u));
    g5Ids.add(vocabId(u));
    g5Ids.add(pronId(u));
    g5Ids.add(listenId(u));
  });

  const skills = JSON.parse(fs.readFileSync(path.join(dataDir, "skills.json"), "utf8")).filter((s) => !g5Ids.has(s.id) && !s.id.startsWith("g5_"));
  const lessons = JSON.parse(fs.readFileSync(path.join(dataDir, "lessons.json"), "utf8")).filter((l) => !g5Ids.has(l.id) && !l.id.startsWith("g5_"));
  const questions = JSON.parse(fs.readFileSync(path.join(dataDir, "questions.json"), "utf8")).filter((q) => !g5Ids.has(q.skill) && !q.skill.startsWith("g5_"));
  const errors = JSON.parse(fs.readFileSync(path.join(dataDir, "errors.json"), "utf8")).filter(
    (e) => !g5Grammars.has(e.grammar) && !(e.recommendation || "").startsWith("g5_")
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
  fs.writeFileSync(path.join(dataDir, "errors.json"), JSON.stringify([...G5_ERRORS, ...errors], null, 2) + "\n");

  console.log("Grade 5 units:", UNITS.length);
  console.log("Grade 5 skills:", newSkills.length);
  console.log("Grade 5 questions:", newQuestions.length);
  console.log("Grade 5 error patterns:", G5_ERRORS.length);
  console.log("Total skills:", newSkills.length + skills.length);
  console.log("Total questions:", newQuestions.length + questions.length);
  console.log("Total errors:", G5_ERRORS.length + errors.length);

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
