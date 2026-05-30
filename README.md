# EnglishFlow — Học Tiếng Anh THCS qua phân tích lỗi sai

Ứng dụng web học Tiếng Anh THCS (lớp 6–9) theo hướng **Error-based Learning + Visual Learning**: học điểm ngữ pháp ngắn, luyện tập tương tác, **phát hiện và giải thích lỗi sai tức thì**, kèm trực quan hóa cấu trúc câu và game hóa để duy trì động lực.

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

| | Tổng | Lớp 6 | Lớp 7 | Lớp 8 | Lớp 9 |
|---|---|---|---|---|---|
| Bài học | **227** | 61 | 57 | 53 | 56 |
| — Ngữ pháp | 83 | 25 | 21 | 17 | 20 |
| — Từ vựng | 48 | 12 | 12 | 12 | 12 |
| — Phát âm | 48 | 12 | 12 | 12 | 12 |
| — Kỹ năng nghe | 48 | 12 | 12 | 12 | 12 |
| Câu hỏi | **825** | 219 | 207 | 195 | 204 |
| Mẫu lỗi sai | 86 | — | — | — | — |

Mỗi Unit có bài **Phát âm** (âm/trọng âm/ngữ điệu) và **Kỹ năng nghe** (hội thoại + nút Nghe TTS + 4 câu hỏi). Bài từ vựng: ~8 từ EN↔VI và 4 câu luyện.

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

Mỗi bài có một lesson (mục tiêu + trực quan hóa + ví dụ đúng/sai) và 3 câu hỏi đủ các dạng (chọn đáp án, điền từ, sửa lỗi, sắp xếp câu).

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
