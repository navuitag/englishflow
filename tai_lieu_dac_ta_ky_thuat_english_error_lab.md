# TÀI LIỆU ĐẶC TẢ KỸ THUẬT
# ỨNG DỤNG WEB HỌC TIẾNG ANH THCS
# “PHÂN TÍCH LỖI SAI + TRỰC QUAN HÓA”

## 1. THÔNG TIN DỰ ÁN

| Thuộc tính | Nội dung |
|---|---|
| Tên dự án | English Error Lab |
| Nền tảng | Web SPA |
| Công nghệ | HTML5 + CSS3 + JavaScript |
| Kiến trúc | Frontend-only |
| Đối tượng | Học sinh lớp 6–9 |
| Mô hình học | Error-based Learning + Visual Learning |
| Hình thức hoạt động | Offline-first |

## 2. MỤC TIÊU SẢN PHẨM

Ứng dụng giúp học sinh:
- học ngữ pháp trực quan,
- luyện tập tương tác,
- phát hiện lỗi sai,
- hiểu nguyên nhân lỗi,
- luyện tập cá nhân hóa theo lỗi.

## 3. PHẠM VI MVP

### Hệ thống bài học
- Present Simple
- Present Continuous
- Past Simple
- Future Simple
- Comparatives
- Passive Voice cơ bản

### Các dạng bài
- Chọn đáp án
- Kéo-thả từ
- Sửa lỗi sai
- Điền từ
- Sắp xếp câu

### Các hệ thống
- Error Detection
- Grammar Visualization
- Progress Tracking
- Gamification cơ bản

## 4. KIẾN TRÚC TỔNG THỂ

```text
+------------------------------------------------+
|                  UI Layer                      |
|------------------------------------------------|
| Lesson UI | Exercise UI | Dashboard | Profile |
+------------------------------------------------+
|             Visualization Engine               |
+------------------------------------------------+
| Exercise Engine | Error Engine | Rule Engine  |
+------------------------------------------------+
|         Local Storage / IndexedDB              |
+------------------------------------------------+
```

## 5. CÔNG NGHỆ SỬ DỤNG

### Core
- HTML5
- CSS3
- Vanilla JavaScript ES6

### Visualization
- GSAP
- Konva.js
- SVG
- HTML5 Drag API

### Storage
- localStorage
- IndexedDB

## 6. MODULE CHÍNH

### Grammar Visualizer
Hiển thị trực quan cấu trúc ngữ pháp.

Ví dụ:
```latex
S + V(s/es) + O
```

### Error Detection Engine
Phân tích lỗi sai theo rule-based system.

Ví dụ:
Input:
```text
He go to school.
```

Output:
```json
{
  "hasError": true,
  "errorType": "GR001",
  "wrongWord": "go",
  "correctWord": "goes"
}
```

### Visual Feedback Engine
- Highlight lỗi sai
- Hiển thị sửa lỗi
- Animation phản hồi

### Sentence Builder
Kéo-thả từ để xây câu đúng.

### Smart Practice System
Sinh bài luyện tập theo lỗi cá nhân.

### Progress Tracking
Lưu:
- XP
- Level
- Weak Skills
- Lesson Progress

## 7. THIẾT KẾ DỮ LIỆU

### Lesson Schema
```json
{
  "id": "lesson_001",
  "title": "Present Simple",
  "formula": "S + V(s/es) + O"
}
```

### Exercise Schema
```json
{
  "id": "ex_001",
  "type": "error_detection",
  "question": "She go to school.",
  "correctAnswer": "She goes to school."
}
```

## 8. UI/UX

### Design Principles
- trực quan,
- ít chữ,
- phản hồi nhanh,
- màu sắc rõ ràng.

### Responsive
- Mobile
- Tablet
- Desktop

## 9. GAMIFICATION

- XP
- Level
- Badge
- Streak
- Boss Challenge

## 10. OFFLINE-FIRST

Sử dụng:
- Service Worker
- Cache assets
- Cache lessons

## 11. PERFORMANCE

| Metric | Target |
|---|---|
| Load Time | <3s |
| FPS | 60 |
| First Paint | <1.5s |

## 12. ROADMAP

### Phase 1
- Error Detection
- Visualization
- Sentence Builder

### Phase 2
- Speech Recognition
- Adaptive Learning

### Phase 3
- AI Tutor
- Multiplayer
- Teacher Dashboard
