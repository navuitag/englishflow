# TÀI LIỆU THIẾT KẾ CHI TIẾT
# DỰ ÁN: ENGLISH ERROR LAB

## 1. MỤC TIÊU

Mô tả:
- kiến trúc frontend,
- module hệ thống,
- luồng xử lý,
- thiết kế dữ liệu,
- animation,
- visualization,
- thuật toán phân tích lỗi.

## 2. KIẾN TRÚC HỆ THỐNG

```text
+---------------------------------------------------+
|                    PRESENTATION                   |
+---------------------------------------------------+
|                    APPLICATION                    |
+---------------------------------------------------+
|                     DOMAIN                        |
+---------------------------------------------------+
|                    INFRASTRUCTURE                 |
+---------------------------------------------------+
```

## 3. KIẾN TRÚC THƯ MỤC

```text
src/
├── styles/
├── core/
├── lessons/
├── exercises/
├── grammar/
├── visualization/
├── storage/
├── gamification/
└── ui/
```

## 4. SPA ROUTER

### Route Map

```text
/home
/lesson/:id
/exercise/:id
/profile
/progress
/settings
```

## 5. STATE MANAGEMENT

```javascript
const AppState = {
  user: {},
  currentLesson: null,
  progress: {},
  xp: 0,
  level: 1
};
```

## 6. GRAMMAR RULE ENGINE

### Rule Schema

```json
{
  "ruleId": "GR001",
  "name": "Present Simple Singular",
  "validation": {
    "verbMustEndWith": ["s", "es"]
  }
}
```

### Validation Flow

```text
Sentence
   ↓
Tokenizer
   ↓
Grammar Parser
   ↓
Rule Matcher
   ↓
Error Detector
```

## 7. ERROR ANALYZER

### Error Object

```javascript
{
  code: "GR001",
  wrongWord: "go",
  correctWord: "goes",
  explanation: "He/She/It + V(s/es)"
}
```

### Error Types

| Code | Type |
|---|---|
| GR001 | Verb Conjugation |
| GR002 | Wrong Tense |
| GR003 | Missing Be Verb |
| GR004 | Word Order |

## 8. VISUALIZATION ENGINE

### Grammar Visualization

```latex
S + V(s/es) + O
```

### Animation Types

| Animation | Usage |
|---|---|
| Shake | Sai |
| Glow | Đúng |
| Bounce | Thành công |

## 9. EXERCISE SYSTEM

### Multiple Choice

```json
{
  "question": "She ___ TV now.",
  "options": [
    "watch",
    "watches",
    "is watching"
  ]
}
```

### Sentence Builder Flow

```text
Render Word Cards
      ↓
User Drag
      ↓
Validate
      ↓
Feedback
```

## 10. UI COMPONENTS

- Button
- Progress Bar
- Toast
- Cards
- Modal

## 11. GAMIFICATION

### XP Formula

```javascript
xpEarned =
  baseXP +
  streakBonus +
  speedBonus;
```

### Achievement Schema

```json
{
  "id": "grammar_master",
  "title": "Grammar Master"
}
```

## 12. STORAGE

### LocalStorage Keys

```text
eel_progress
eel_settings
eel_achievements
```

### IndexedDB Stores

- lessons
- exercises
- cache

## 13. OFFLINE MODE

```text
Install SW
    ↓
Cache Assets
    ↓
Serve Cached Data
```

## 14. RESPONSIVE DESIGN

| Device | Width |
|---|---|
| Mobile | <768px |
| Tablet | 768–1024px |
| Desktop | >1024px |

## 15. PERFORMANCE

| Metric | Target |
|---|---|
| FCP | <1.5s |
| FPS | 60 |
| Bundle Size | <500KB |

## 16. USER FLOW

```text
Home
 ↓
Choose Lesson
 ↓
Practice
 ↓
Error Analysis
 ↓
XP Reward
```

## 17. ROADMAP

### Sprint 1
- Router
- Layout
- Lesson Loader

### Sprint 2
- Grammar Engine
- Error Detection

### Sprint 3
- Exercises
- Gamification

### Sprint 4
- Offline Support
- Optimization
