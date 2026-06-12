# EnglishFlow — Học Tiếng Anh qua phân tích lỗi sai

Ứng dụng web học Tiếng Anh **tiểu học (lớp 1–5)** và **THCS (lớp 6–9)** theo SGK **"Kết nối tri thức với cuộc sống" (Global Success)**, hướng **Error-based Learning + Visual Learning**: học điểm ngữ pháp ngắn, luyện tập tương tác, **phát hiện và giải thích lỗi sai tức thì**, kèm trực quan hóa cấu trúc câu và game hóa để duy trì động lực.

Ứng dụng là **SPA thuần** bằng HTML5 + CSS3 + JavaScript ES6 (ES Modules), **không cần backend**, chạy được offline (PWA + Service Worker + localStorage).

---

## Tính năng chính

- **Chọn trình độ để học**: màn hình chọn lớp khi mở app lần đầu, dropdown đổi trình độ trên thanh điều hướng, và nút "Đổi trình độ" trong Hồ sơ (giữ nguyên tiến độ).
- **Lộ trình học**: nội dung chia theo lớp và **nhóm theo chủ đề (Unit)** — mỗi Unit có **ngữ pháp**, **từ vựng**, **phát âm** và **kỹ năng nghe**; mở khóa dần theo `prerequisite`.
- **Bài học ngắn**: mục tiêu + trực quan hóa ngữ pháp / thẻ từ vựng / hướng dẫn phát âm / hội thoại nghe (TTS trình duyệt).
- **Luyện tập đa dạng & chấm tức thì**: trắc nghiệm, điền từ, sửa lỗi sai, sắp xếp câu, **nghe hội thoại (TTS)**, **phát âm & trọng âm**.
- **Error Detection Engine (module lõi)**: chuẩn hóa câu → so khớp mẫu lỗi → chẩn đoán bằng quy tắc (mã lỗi GR0xx) + giải thích nguyên nhân + gợi ý + đề xuất bài ôn.
- **Grammar Visualizer**: timeline thì (quá khứ/hiện tại/tương lai), công thức câu tô màu theo thành phần, biểu đồ so sánh, sơ đồ chuyển câu chủ động → bị động.
- **Tiến độ & Game hóa**: XP, level, streak, mastery theo điểm ngữ pháp, huy hiệu, daily quest, sổ tay lỗi sai.
- **Lưu cục bộ**: toàn bộ trạng thái lưu trong `localStorage`, không cần đăng nhập.

---

## Nội dung

| | Tổng | Lớp 1 | Lớp 2 | Lớp 3 | Lớp 4 | Lớp 5 | Lớp 6 | Lớp 7 | Lớp 8 | Lớp 9 |
|---|---|---|---|---|---|---|---|---|---|---|
| Bài học | **875** | 96 | 96 | 120 | 120 | 120 | 85 | 81 | 77 | 80 |
| — Ngữ pháp | 175 | 16 | 16 | 20 | 20 | 20 | 25 | 21 | 17 | 20 |
| — Từ vựng | 140 | 16 | 16 | 20 | 20 | 20 | 12 | 12 | 12 | 12 |
| — Phát âm | 140 | 16 | 16 | 20 | 20 | 20 | 12 | 12 | 12 | 12 |
| — Kỹ năng nghe | 140 | 16 | 16 | 20 | 20 | 20 | 12 | 12 | 12 | 12 |
| — Nói / Viết | 280 | — | — | — | — | — | 24 | 24 | 24 | 24 |
| Câu hỏi (mini quiz) | **4059** | 384 | 384 | 480 | 480 | 480 | 484 | 465 | 441 | 461 |
| Bài tập rèn luyện (SGK/SBT) | **10500** | — | — | — | — | — | 1020 | 972 | 924 | 960 |
| Mẫu lỗi sai | 172 | 13 | 16 | 20 | 20 | 20 | — | — | — | — |

Mỗi Unit có bài **Phát âm** (âm/trọng âm/ngữ điệu) và **Kỹ năng nghe** (hội thoại + nút Nghe TTS + 4 câu hỏi). Bài từ vựng: ~5–8 từ EN↔VI và 4 câu luyện.

### Chương trình Lớp 1 — "Kết nối tri thức với cuộc sống" (Global Success)

Bám sát đủ **16 Unit** của SGK Tiếng Anh 1:

| Unit | Chủ đề | Trọng tâm ngữ pháp |
|---|---|---|
| 1 | In the school playground | Hello/Hi; I'm... |
| 2 | In the dining room | I have a... |
| 3 | At the street market | This is my... |
| 4 | In the bedroom | This is a... |
| 5 | At the fish and chip shop | I like... |
| 6 | In the classroom | Màu sắc (It's red...) |
| 7 | In the garden | There's a... |
| 8 | In the park | Bộ phận cơ thể |
| 9 | In the shop | How many...? |
| 10 | At the zoo | This is a... (animals) |
| 11 | At the bus stop | He/She is + V-ing |
| 12 | At the lake | Look at... |
| 13 | In the school canteen | I want... |
| 14 | In the toy shop | I can see... |
| 15 | At the football match | He/She is... |
| 16 | At home | How many...? (at home) |

Sinh lại nội dung lớp 1: `node scripts/build-grade1.js`

### Chương trình Lớp 2 — "Kết nối tri thức với cuộc sống" (Global Success)

Bám sát đủ **16 Unit** của SGK Tiếng Anh 2:

| Unit | Chủ đề | Trọng tâm ngữ pháp |
|---|---|---|
| 1 | At my birthday party | I like + N; The + N + is yummy |
| 2 | In the backyard | Where is the...? |
| 3 | At the seaside | Let's + V |
| 4 | In the countryside | There are + N |
| 5 | In the classroom | What colour is the...? |
| 6 | On the farm | What can you see? / I can see... |
| 7 | In the kitchen | Pass me the..., please / Here you are |
| 8 | In the village | Giới từ in/on/under |
| 9 | In the grocery store | How much is the...? |
| 10 | At the zoo | These are + N |
| 11 | In the playground | They are + V-ing |
| 12 | At the café | I'd like + N |
| 13 | In the maths class | How many + N? |
| 14 | At home | Where are the...? |
| 15 | In the clothes shop | What colour is the...? (clothes) |
| 16 | At the campsite | We have a + N |

Sinh lại nội dung lớp 2: `node scripts/build-grade2.js`

### Chương trình Lớp 3 — "Kết nối tri thức với cuộc sống" (Global Success)

Bám sát đủ **20 Unit** của SGK Tiếng Anh 3:

| Unit | Chủ đề | Trọng tâm ngữ pháp |
|---|---|---|
| 1 | Hello | Chào hỏi; How are you? |
| 2 | Our names | What's your name? How old are you? |
| 3 | Our friends | This is my friend; Who is he/she? |
| 4 | Our bodies | I have two eyes; Touch your... |
| 5 | My hobbies | What's your hobby? I like + V-ing |
| 6 | Our school | Is this our...? Let's go to... |
| 7 | Classroom instructions | Sit down / Stand up / Open your book |
| 8 | My school things | This is my pen (my/your) |
| 9 | Colours | What colour is/are...? |
| 10 | Break time activities | What are you doing? I am + V-ing |
| 11 | My family | This is my father; Who is he? |
| 12 | Jobs | What's his/her job? He/She is a... |
| 13 | My house | There is/are; in/on |
| 14 | My bedroom | Where is my bed? |
| 15 | At the dining table | Pass me the..., please |
| 16 | My pets | Do you have any...? How many...? |
| 17 | Our toys | These are my toys |
| 18 | Playing and doing | She is reading; What is he doing? |
| 19 | Outdoor activities | I like cycling; They are flying a kite |
| 20 | At the zoo | What is this? It's an elephant |

Sinh lại nội dung lớp 3: `node scripts/build-grade3.js`

### Chương trình Lớp 4 — "Kết nối tri thức với cuộc sống" (Global Success)

Bám sát đủ **20 Unit** của SGK Tiếng Anh 4 (2 tập × 10 Unit):

| Unit | Chủ đề | Trọng tâm ngữ pháp |
|---|---|---|
| 1 | My friends | Where are you from? I'm from... |
| 2 | Time and daily routines | What time do you...? I ... at ... |
| 3 | My week | What do you do on Monday? |
| 4 | My birthday party | When is your birthday? |
| 5 | Things we can do | Can you...? Yes, I can / No, I can't |
| 6 | Our school facilities | Is there a...? Yes, there is |
| 7 | Our timetables | What time does... start? |
| 8 | My favourite subjects | What's your favourite subject? |
| 9 | Our sports day | Who is running? (present continuous) |
| 10 | Our summer holidays | Where are you going? |
| 11 | My home | How many bedrooms are there? |
| 12 | Jobs | What does your father do? |
| 13 | Appearance | What does she look like? |
| 14 | Daily activities | What do you do every day? |
| 15 | My family's weekends | What do you do at the weekend? |
| 16 | Weather | What's the weather like? |
| 17 | In the city | Go straight / Turn left |
| 18 | At the shopping centre | How much is this? |
| 19 | The animal world | Tigers live in... / What do lions eat? |
| 20 | At summer camp | What are they doing? They are... |

Sinh lại nội dung lớp 4: `node scripts/build-grade4.js`

### Chương trình Lớp 5 — "Kết nối tri thức với cuộc sống" (Global Success)

Bám sát đủ **20 Unit** của SGK Tiếng Anh 5 (2 tập × 10 Unit):

| Unit | Chủ đề | Trọng tâm ngữ pháp |
|---|---|---|
| 1 | All about me! | What's your favourite...? / I'm in Grade 5 |
| 2 | Our homes | Where do you live? / Do you live in this house? |
| 3 | My foreign friends | What nationality is she? / What's he like? |
| 4 | Our free-time activities | What do you like doing? / What do you do at the weekend? |
| 5 | My future job | What would you like to be? / Why would you like to be a...? |
| 6 | Our school rooms | Where's the library? / Could you tell me the way to...? |
| 7 | Our favourite school activities | What school activity do you like? / Why do you like...? |
| 8 | In our classroom | Where are the pencils? / Whose book is this? |
| 9 | Our outdoor activities | Were you at the...? / What did you do yesterday? |
| 10 | Our school trip | Did they go to...? / What did they do there? |
| 11 | Family time | Did you...? / What did your family do in...? |
| 12 | Our Tet holiday | Will you... for Tet? / Where will you go at Tet? |
| 13 | Our special days | What will you do on your birthday? / We'll have... |
| 14 | Staying healthy | How does he/she stay healthy? / How often does he/she...? |
| 15 | Our health | What's the matter? / You should... |
| 16 | Seasons and the weather | How's the weather in...? / What do you usually wear in...? |
| 17 | Stories for children | Who are the main characters? / How did he/she...? |
| 18 | Means of transport | Where do you want to visit? / How can I get to... by...? |
| 19 | Places of interest | What do you think of...? / How far is it from... to...? |
| 20 | Our summer holidays | Where are you going to visit? / What are you going to do? |

Sinh lại nội dung lớp 5: `node scripts/build-grade5.js`

### Chương trình Lớp 6 — "Kết nối tri thức với cuộc sống" (Global Success)

Bám sát đủ 12 Unit của SGK, mỗi Unit là một chủ đề trong lộ trình:

| Unit | Chủ đề | Trọng tâm ngữ pháp |
|---|---|---|
| 1 | My new school | Present simple; câu hỏi do/does |
| 2 | My house | There is/There are; giới từ nơi chốn |
| 3 | My friends | Present continuous; tính từ miêu tả |
| 4 | My neighbourhood | So sánh hơn; hỏi & chỉ đường |
| 5 | Natural wonders of Viet Nam | Danh từ đếm được/không đếm được; so sánh nhất; must/mustn't |
| 6 | Our Tet holiday | should/shouldn't; some/any |
| 7 | Television | Câu hỏi Wh-; liên từ and/but/so/because |
| 8 | Sports and games | Past simple; câu mệnh lệnh |
| 9 | Cities of the world | Present perfect; đại từ sở hữu |
| 10 | Our houses in the future | Future simple (will); might |
| 11 | Our greener world | Câu điều kiện loại 1; mạo từ a/an/the |
| 12 | Robots | could/couldn't; will be able to |

Mỗi Unit gồm ngữ pháp + từ vựng + phát âm + nghe + nói + viết. Mỗi kỹ năng có **4–6 câu mini quiz** đủ dạng cơ bản (trắc nghiệm, đúng/sai, điền) và nâng cao (sửa lỗi, sắp xếp câu, nghe). Tab **Rèn luyện**: **12 bài/kỹ năng** (SGK + SBT).

Sinh lại luyện tập lớp 6:

```bash
node scripts/build-g6-practice.mjs
node scripts/generate-workbook-exercises.mjs englishflow
```

### Chương trình Lớp 7 — "Kết nối tri thức với cuộc sống" (Global Success)

Bám sát đủ 12 Unit của SGK Tiếng Anh 7:

| Unit | Chủ đề | Trọng tâm ngữ pháp |
|---|---|---|
| 1 | Hobbies | Present simple; động từ chỉ sở thích + V-ing |
| 2 | Healthy living | Câu đơn |
| 3 | Community service | Past simple; câu hỏi với did |
| 4 | Music and arts | (not) as...as; like / different from |
| 5 | Food and drink | some/a lot of/lots of; How many/How much |
| 6 | A visit to a school | Giới từ thời gian; giới từ nơi chốn |
| 7 | Traffic | "It" chỉ khoảng cách; should/shouldn't |
| 8 | Films | although/though; however |
| 9 | Festivals around the world | Câu hỏi Yes/No; câu hỏi Wh- |
| 10 | Energy sources | Present continuous |
| 11 | Travelling in the future | Future simple; đại từ sở hữu |
| 12 | English-speaking countries | Mạo từ a/an/the |

Mỗi Unit gồm ngữ pháp + từ vựng + phát âm + nghe + nói + viết. Mỗi kỹ năng có **4–6 câu mini quiz** đủ dạng cơ bản (trắc nghiệm, đúng/sai, điền) và nâng cao (sửa lỗi, sắp xếp câu, nghe). Tab **Rèn luyện**: **12 bài/kỹ năng** (SGK + SBT).

Sinh lại luyện tập lớp 7:

```bash
node scripts/build-g7-practice.mjs
node scripts/generate-workbook-exercises.mjs englishflow
```

### Chương trình Lớp 8 — "Kết nối tri thức với cuộc sống" (Global Success)

Bám sát đủ 12 Unit của SGK Tiếng Anh 8:

| Unit | Chủ đề | Trọng tâm ngữ pháp |
|---|---|---|
| 1 | Leisure time | Động từ chỉ sở thích + V-ing; V-ing / to-V |
| 2 | Life in the countryside | So sánh hơn của trạng từ |
| 3 | Teenagers | Câu đơn & câu ghép |
| 4 | Ethnic groups of Viet Nam | Câu hỏi Yes/No & Wh-; danh từ đếm được/không đếm được |
| 5 | Our customs and traditions | Mạo từ rỗng (zero article) |
| 6 | Lifestyles | Thì tương lai đơn; câu điều kiện loại 1 |
| 7 | Environmental protection | Mệnh đề trạng ngữ chỉ thời gian |
| 8 | Shopping | Trạng từ tần suất; hiện tại đơn chỉ lịch trình tương lai |
| 9 | Natural disasters | Thì quá khứ tiếp diễn |
| 10 | Communication in the future | Giới từ thời gian & nơi chốn; đại từ sở hữu |
| 11 | Science and technology | Câu tường thuật (trần thuật) |
| 12 | Life on other planets | Câu tường thuật (câu hỏi) |

Mỗi Unit gồm ngữ pháp + từ vựng + phát âm + nghe + nói + viết. Mỗi kỹ năng có **4–6 câu mini quiz** đủ dạng cơ bản (trắc nghiệm, đúng/sai, điền) và nâng cao (sửa lỗi, sắp xếp câu, nghe). Tab **Rèn luyện**: **12 bài/kỹ năng** (SGK + SBT).

Sinh lại luyện tập lớp 8:

```bash
node scripts/build-g8-practice.mjs
node scripts/generate-workbook-exercises.mjs englishflow
```

### Chương trình Lớp 9 — "Kết nối tri thức với cuộc sống" (Global Success)

Bám sát đủ 12 Unit của SGK Tiếng Anh 9:

| Unit | Chủ đề | Trọng tâm ngữ pháp |
|---|---|---|
| 1 | Local community | Wh-word + to-V; cụm động từ |
| 2 | City life | So sánh hơn & nhất |
| 3 | Healthy living for teens | Câu tường thuật (trần thuật); should/shouldn't |
| 4 | Remembering the past | Quá khứ tiếp diễn; wish + quá khứ đơn |
| 5 | Our experiences | Thì hiện tại hoàn thành |
| 6 | Vietnamese lifestyles: Then and now | Động từ + V-ing; động từ + to-V |
| 7 | Natural wonders of the world | Tường thuật câu hỏi Yes/No; bị động khách quan |
| 8 | Tourism | Mệnh đề quan hệ (who/which) |
| 9 | World Englishes | Câu điều kiện loại 1 |
| 10 | Planet Earth | Câu điều kiện loại 2 |
| 11 | Electronic devices | Quá khứ hoàn thành; câu bị động (HTĐ & QKĐ) |
| 12 | Career choices | Tường thuật câu hỏi Wh-; MĐQH xác định |

Mỗi Unit gồm ngữ pháp + từ vựng + phát âm + nghe + nói + viết. Mỗi kỹ năng có **4–6 câu mini quiz** đủ dạng cơ bản (trắc nghiệm, đúng/sai, điền) và nâng cao (sửa lỗi, sắp xếp câu, nghe). Tab **Rèn luyện**: **12 bài/kỹ năng** (SGK + SBT).

Sinh lại luyện tập lớp 9:

```bash
node scripts/build-g9-practice.mjs
node scripts/generate-workbook-exercises.mjs englishflow
```

---

## Cách chạy

Ứng dụng dùng ES Modules và `fetch` nên **cần chạy qua HTTP server** (không mở trực tiếp `file://`).

### Cách 1 — Python (có sẵn trên macOS/Linux)

```bash
cd englishflow
python3 -m http.server 8000
```

Mở trình duyệt: http://localhost:8000

### Cách 2 — Node.js

```bash
cd englishflow
npx serve -l 8000
# hoặc
npx http-server -p 8000
```

> Lần đầu vào app sẽ hiện màn hình **chọn trình độ**. Sau đó có thể đổi qua dropdown trên navbar hoặc nút "Đổi trình độ" trong trang Hồ sơ.

---

## Cấu trúc thư mục

```text
englishflow/
├── index.html              # Điểm vào SPA (#app)
├── manifest.json           # Cấu hình PWA
├── service-worker.js       # Cache offline
│
├── assets/
│   ├── css/                # main, layout, animation, responsive
│   └── js/
│       ├── app.js          # Khởi động: tải JSON, cấu hình router
│       ├── router.js       # Hash router + render các màn hình
│       ├── state.js        # State toàn cục + localStorage
│       └── utils.js        # Tiện ích (normalizeText, escapeHtml, ...)
│
├── modules/
│   ├── lessonEngine.js     # Hoàn thành bài học
│   ├── quizEngine.js       # Chấm bài, cập nhật XP/mastery
│   ├── errorEngine.js      # Phân tích lỗi sai theo quy tắc (module lõi)
│   ├── progress.js         # Tiến độ, độ chính xác, điểm yếu
│   ├── gamification.js     # XP, level, huy hiệu
│   └── visualization.js    # Trực quan hóa ngữ pháp (timeline, công thức, bị động)
│
├── components/             # navbar, lessonCard, quizCard, modal
│
├── data/
│   ├── skills.json         # 50 điểm ngữ pháp (grade, unit/chủ đề, grammar, formula)
│   ├── lessons.json        # 50 bài học (steps + ví dụ đúng/sai)
│   ├── questions.json      # 154 câu hỏi (4 dạng bài)
│   └── errors.json         # 56 mẫu lỗi sai (mã GR0xx, khớp theo grammar)
│
└── *.md                    # Tài liệu đặc tả & thiết kế chi tiết
```

---

## Định tuyến (hash routing)

| Route | Màn hình |
|---|---|
| `#/home` | Trang chủ (theo trình độ đang chọn) |
| `#/skills` | Lộ trình bài học (tab chọn lớp + nhóm theo chủ đề) |
| `#/lesson/:id` | Bài học |
| `#/practice/:id` | Luyện tập một điểm ngữ pháp |
| `#/review/errors` | Sổ tay lỗi sai |
| `#/profile` | Hồ sơ (đổi trình độ, xóa tiến độ) |

---

## Các dạng bài tập

| Dạng (`type`) | Mô tả | Trường dữ liệu |
|---|---|---|
| `multiple_choice` | Chọn đáp án đúng | `choices`, `answer` |
| `input` | Điền từ/cụm từ | `answer`, `alternatives` |
| `error_detection` | Viết lại câu sai cho đúng | `prompt`, `answer` |
| `word_order` | Chạm để sắp xếp các từ thành câu | `tokens`, `answer` |

---

## Error Detection Engine

Luồng xử lý: `Câu trả lời → Tokenizer/Normalizer → So khớp mẫu lỗi (errors.json) → Heuristic theo quy tắc → Đối tượng lỗi`.

Đối tượng lỗi trả về (lưu vào sổ tay lỗi):

```json
{
  "code": "GR001",
  "errorType": "verb_conjugation",
  "title": "Thiếu -s/-es với ngôi thứ ba số ít",
  "message": "Chủ ngữ He/She/It cần động từ thêm -s/-es: \"go\" → \"goes\".",
  "hint": "He / She / It + V(s/es).",
  "recommendation": "present_simple"
}
```

| Mã | Loại lỗi |
|---|---|
| GR001 | Chia động từ (verb conjugation) |
| GR002 | Sai thì (wrong tense) |
| GR003 | Thiếu to be (missing be) |
| GR004 | Sai trật tự từ (word order) |
| GR005 | Sai dạng so sánh |
| GR006 | Thiếu mạo từ |
| GR007 | Sai dạng bị động |
| GR008 | Sai hòa hợp chủ ngữ – động từ |

---

## Mô hình dữ liệu (ví dụ)

Điểm ngữ pháp (`skills.json`):

```json
{
  "id": "present_simple",
  "title": "Present Simple",
  "grade": 6,
  "book": "Unit 1",
  "chapter": "Thì hiện tại",
  "chapterIndex": 1,
  "lessonNo": 1,
  "prerequisite": [],
  "formula": "S + V(s/es) + O",
  "visualization": "presentSimple"
}
```

Trạng thái người dùng (`localStorage` key: `englishflow_state`):

```json
{
  "selectedLevel": 6,
  "onboarded": true,
  "xp": 0,
  "streak": 1,
  "completedLessons": [],
  "skillMastery": {},
  "answers": [],
  "errors": []
}
```

---

## Công nghệ

- HTML5, CSS3, JavaScript ES6+ (ES Modules), SVG/CSS visualization.
- Không phụ thuộc framework; không cần build step.
- PWA: `manifest.json` + `service-worker.js` (offline-first).

## Tài liệu liên quan

- `tai_lieu_dac_ta_ky_thuat_english_error_lab.md` — Đặc tả kỹ thuật.
- `tai_lieu_thiet_ke_chi_tiet_english_error_lab.md` — Thiết kế chi tiết.

---

## Tác giả

- **Nguyễn Anh Vũ**
- Email: [navuitag@gmail.com](mailto:navuitag@gmail.com)
- Điện thoại: [0986201079](tel:+84986201079)
