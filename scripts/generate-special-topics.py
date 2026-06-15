#!/usr/bin/env python3
"""Generate special-topics.json from special-topic PDF files."""

import json
import re
import subprocess
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOPIC_DIR = ROOT / "special-topic"
OUT = ROOT / "data" / "special-topics.json"

CATEGORY_RULES = [
    ("pronunciation", re.compile(r"pronunciation|phonetic", re.I)),
    ("vocabulary", re.compile(r"vocab|idiom|phrasal", re.I)),
    ("reading", re.compile(r"reading", re.I)),
    ("writing", re.compile(r"writing", re.I)),
    ("listening", re.compile(r"listen", re.I)),
    ("speaking", re.compile(r"speaking|debate|presentation|picture|story", re.I)),
    ("exam", re.compile(r"exam", re.I)),
    ("grammar", re.compile(r"^(0[1-9]|1[0-9]|20)\.|tense|passive|clause|conditional|speech|voice|verb|compar|although|because|too|so|either|both|not-only|wish|subjunct|parts-of-speech|sentence", re.I)),
]

CATEGORY_LABELS = {
    "grammar": "Ngữ pháp",
    "vocabulary": "Từ vựng",
    "reading": "Đọc hiểu",
    "writing": "Viết",
    "listening": "Nghe",
    "speaking": "Nói",
    "exam": "Thi cử",
    "pronunciation": "Phát âm",
    "skills": "Kỹ năng",
}


def pdf_text(path: Path) -> str:
    result = subprocess.run(
        ["pdftotext", str(path), "-"],
        capture_output=True,
        text=True,
        check=False,
    )
    return result.stdout or ""


def slugify(name: str) -> str:
    base = Path(name).stem
    base = re.sub(r"^\d+\.", "", base)
    base = unicodedata.normalize("NFKD", base)
    base = base.encode("ascii", "ignore").decode("ascii")
    base = re.sub(r"[^a-zA-Z0-9]+", "-", base).strip("-").lower()
    return base or "topic"


def detect_category(filename: str) -> str:
    for cat, pattern in CATEGORY_RULES:
        if pattern.search(filename):
            return cat
    return "skills"


def parse_title(text: str, filename: str) -> tuple[str, str]:
    m = re.search(
        r"CHUYÊN ĐỀ\s+(\d+)\.\s*(.+?)(?:\n|\(|$)",
        text,
        re.S,
    )
    if m:
        vi = re.sub(r"\s+", " ", m.group(2).strip())
        en = ""
        en_m = re.search(r"\(([A-Z][A-Z\s&\-]+)\)", text[:400])
        if en_m:
            en = en_m.group(1).strip()
        return vi, en
    stem = Path(filename).stem
    stem = re.sub(r"^\d+\.", "", stem).replace("-", " ")
    return stem, ""


def parse_objective(text: str) -> str:
    m = re.search(r"Mục tiêu:\s*(.+?)(?:\n\n|\nI\.|\n1\.)", text, re.S)
    if not m:
        return ""
    return re.sub(r"\s+", " ", m.group(1).strip())


def has_vietnamese(text: str) -> bool:
    return bool(re.search(r"[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]", text, re.I))


def is_noise_pair(en: str, vi: str) -> bool:
    noise_back = {"âm", "ví dụ", "mẹo:", "mẹo", "nghĩa", "tiếng việt", "english", "từ"}
    if vi.lower().strip() in noise_back:
        return True
    if len(vi.strip()) < 3:
        return True
    if re.search(r"^[/0-9.]+", vi):
        return True
    if re.search(r"^[IVX]+\.", vi):
        return True
    if not has_vietnamese(vi) and not re.search(r"[→\-–]", vi):
        return True
    if re.search(r"[/ɪəæʌɒʊθðʃʒŋ]", en) and len(en) < 8:
        return True
    return False


def extract_vocab_pairs(text: str) -> list[tuple[str, str]]:
    pairs = []
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    skip = {
        "english", "tiếng việt", "nghĩa", "từ", "word", "meaning",
        "english tiếng việt", "english nghĩa",
    }
    i = 0
    while i < len(lines) - 1:
        a, b = lines[i], lines[i + 1]
        al, bl = a.lower(), b.lower()
        if al in skip or bl in skip or re.fullmatch(r"\d+", a):
            i += 1
            continue
        if re.match(r"^[A-Za-z/][A-Za-z0-9\s/\-'().,]+$", a) and has_vietnamese(b):
            if len(a) <= 60 and len(b) <= 80 and not is_noise_pair(a, b):
                pairs.append((a, b))
                i += 2
                continue
        i += 1
    # dedupe
    seen = set()
    out = []
    for en, vi in pairs:
        key = en.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append((en, vi))
    return out[:40]


def extract_formulas(text: str) -> list[tuple[str, str]]:
    items = []
    for m in re.finditer(
        r"(?:Công thức|Formula)\s*\n(.+?)(?:\n\n|Dùng khi|Ví dụ|Dấu hiệu|Mẹo|$)",
        text,
        re.S | re.I,
    ):
        block = m.group(0)
        title_m = re.search(r"(Present|Past|Future|Passive|Conditional|Reported)[^\n]{0,40}", block, re.I)
        title = title_m.group(0).strip() if title_m else "Công thức"
        formula = re.search(r"(?:Công thức|Formula)\s*\n(.+)", block, re.I)
        if formula:
            f = re.sub(r"\s+", " ", formula.group(1).strip())
            if 3 < len(f) < 120:
                items.append((title, f))
    return items[:12]


def extract_tips(text: str) -> list[tuple[str, str]]:
    tips = []
    for m in re.finditer(r"(Nguyên tắc vàng|Mẹo nhớ|Mẹo|Dấu hiệu):\s*(.+?)(?:\n\n|\n[A-Z]|\n\d+\.|$)", text, re.S):
        label = m.group(1).strip()
        body = re.sub(r"\s+", " ", m.group(2).strip())
        if len(body) > 8:
            tips.append((label, body[:220]))
    return tips[:8]


def extract_sections(text: str) -> list[tuple[str, str]]:
    sections = []
    for m in re.finditer(r"\n((?:I{1,3}|IV|V|VI|VII|VIII|IX|X+)\.\s+[^\n]+)\n(.+?)(?=\n(?:I{1,3}|IV|V|VI|VII|VIII|IX|X+)\.\s+|\Z)", text, re.S):
        title = re.sub(r"\s+", " ", m.group(1).strip())
        body = re.sub(r"\s+", " ", m.group(2).strip())[:300]
        if len(body) > 30:
            sections.append((title, body))
    return sections[:6]


def build_flashcards(vocab, formulas, tips, sections) -> list[dict]:
    cards = []
    for en, vi in vocab:
        cards.append({
            "id": f"v_{slugify(en)[:30]}",
            "front": en,
            "back": vi,
            "tag": "Từ vựng",
        })
    for title, formula in formulas:
        cards.append({
            "id": f"f_{slugify(title)[:30]}",
            "front": title,
            "back": formula,
            "tag": "Công thức",
        })
    for label, body in tips:
        cards.append({
            "id": f"t_{slugify(label)[:20]}",
            "front": label,
            "back": body,
            "tag": "Mẹo",
        })
    for title, body in sections:
        cards.append({
            "id": f"s_{slugify(title)[:30]}",
            "front": title,
            "back": body,
            "tag": "Kiến thức",
        })
    if not cards:
        cards.append({
            "id": "overview",
            "front": "Mở tài liệu PDF/ảnh",
            "back": "Đọc sơ đồ minh họa và ghi chú các điểm chính.",
            "tag": "Tổng quan",
        })
    return cards[:48]


def build_quiz(topic_id: str, vocab, formulas, tips, title: str) -> list[dict]:
    questions = []
    qn = 0

    def add_q(prompt, answer, options, qtype="mcq", hint=""):
        nonlocal qn
        qn += 1
        opts = list(dict.fromkeys([answer] + [o for o in options if o != answer]))[:4]
        while len(opts) < 4:
            opts.append("Không có trong bài")
        questions.append({
            "id": f"{topic_id}_q{qn}",
            "type": qtype,
            "prompt": prompt,
            "answer": answer,
            "options": opts[:4],
            "hint": hint,
        })

    for en, vi in vocab[:8]:
        wrong = [v for _, v in vocab if v != vi][:3]
        while len(wrong) < 3:
            wrong.append("Không liên quan")
        add_q(f'"{en}" nghĩa là gì?', vi, wrong)

    for title_f, formula in formulas[:4]:
        add_q(f"Công thức của {title_f}?", formula, [
            "S + V2",
            "S + have/has + V3",
            "S + am/is/are + V-ing",
            "S + will + V",
        ], hint="Xem lại phần công thức trong tài liệu.")

    for label, body in tips[:3]:
        snippet = body[:80] + ("..." if len(body) > 80 else "")
        add_q(f"{label}: {snippet} — đúng hay sai?", "Đúng", ["Sai", "Chỉ đúng một phần", "Không nhắc trong bài"], hint=body[:120])

    if len(questions) < 5:
        add_q(f"Chủ đề \"{title}\" thuộc nhóm nào?", "Ôn tập chuyên đề", ["Toán học", "Vật lý", "Hóa học"], hint="Đây là chuyên đề tiếng Anh THCS.")

    return questions[:10]


PRONUNCIATION_SHADOWING_01 = [
    {"id": "sh_ship", "text": "ship", "hint": "Âm /ɪ/ — ngắn, bật nhanh", "group": "Cặp /ɪ/ và /iː/"},
    {"id": "sh_sheep", "text": "sheep", "hint": "Âm /iː/ — kéo dài miệng cười", "group": "Cặp /ɪ/ và /iː/"},
    {"id": "sh_sit", "text": "sit", "hint": "Âm /ɪ/", "group": "Cặp /ɪ/ và /iː/"},
    {"id": "sh_seat", "text": "seat", "hint": "Âm /iː/", "group": "Cặp /ɪ/ và /iː/"},
    {"id": "sh_think", "text": "think", "hint": "Âm /θ/ — lưỡi giữa răng", "group": "Cặp /θ/ và /t/"},
    {"id": "sh_tree", "text": "tree", "hint": "Âm /t/", "group": "Cặp /θ/ và /t/"},
    {"id": "sh_books", "text": "books", "hint": "Đuôi -s đọc /s/", "group": "Quy tắc -s / -es"},
    {"id": "sh_dogs", "text": "dogs", "hint": "Đuôi -s đọc /z/", "group": "Quy tắc -s / -es"},
    {"id": "sh_watches", "text": "watches", "hint": "Đuôi -es đọc /ɪz/", "group": "Quy tắc -s / -es"},
    {"id": "sh_worked", "text": "worked", "hint": "Đuôi -ed đọc /t/", "group": "Quy tắc -ed"},
    {"id": "sh_played", "text": "played", "hint": "Đuôi -ed đọc /d/", "group": "Quy tắc -ed"},
    {"id": "sh_wanted", "text": "wanted", "hint": "Đuôi -ed đọc /ɪd/", "group": "Quy tắc -ed"},
    {"id": "sh_mother", "text": "mother", "hint": "Trọng âm âm 1: MOther", "group": "Trọng âm từ"},
    {"id": "sh_decide", "text": "decide", "hint": "Trọng âm âm 2: deCIDE", "group": "Trọng âm từ"},
    {"id": "sh_sentence", "text": "I want to buy a new car.", "hint": "Nhấn WANT · BUY · NEW · CAR", "group": "Trọng âm câu"},
]


def is_english_shadow_line(text: str) -> bool:
    cleaned = text.strip()
    if not cleaned or len(cleaned) > 80:
        return False
    if re.search(r"^[IVX]+\.", cleaned):
        return False
    return bool(re.match(r"^[A-Za-z0-9][A-Za-z0-9\s.,'!?-]*$", cleaned))


def build_shadowing(order: int, category: str, vocab: list[tuple[str, str]]) -> list[dict]:
    if order == 1 and category == "pronunciation":
        return [dict(item) for item in PRONUNCIATION_SHADOWING_01]

    if category not in ("pronunciation", "speaking"):
        return []

    lines = []
    for index, (en, vi) in enumerate(vocab):
        if not is_english_shadow_line(en):
            continue
        lines.append({
            "id": f"sh_{slugify(en)[:28]}_{index}",
            "text": re.sub(r"\s+", " ", en).strip(),
            "hint": vi[:100] if vi else "",
            "group": "Từ vựng" if category == "pronunciation" else "Mẫu câu",
        })
        if len(lines) >= 12:
            break
    return lines


PLATFORM_STYLES = {
    "pronunciation": ("elsa", "ELSA Speak · Phát âm"),
    "speaking": ("mshoa", "MS Hoa · Giao tiếp"),
    "listening": ("langmaster", "Langmaster · Nghe"),
    "reading": ("langmaster", "Langmaster · Đọc"),
    "writing": ("ila", "ILA · Viết"),
    "grammar": ("ila", "ILA · Ngữ pháp"),
    "vocabulary": ("langmaster", "Langmaster · Từ vựng"),
    "exam": ("ila", "ILA · Luyện thi"),
    "skills": ("langmaster", "Langmaster · Kỹ năng"),
}


def choice_pool(answer: str, vocab, formulas, tips, extra=None) -> list[str]:
    pool = [answer]
    for _, vi in vocab:
        pool.append(vi)
    for _, formula in formulas:
        pool.append(formula)
    for _, body in tips:
        pool.append(body[:60])
    if extra:
        pool.extend(extra)
    return list(dict.fromkeys([p for p in pool if p and p != answer]))


def make_choices(answer: str, pool: list[str]) -> list[str]:
    opts = list(dict.fromkeys([answer] + [o for o in pool if o and o != answer]))[:4]
    while len(opts) < 4:
        opts.append("Không có trong bài")
    return opts


def english_vocab(vocab) -> list[tuple[str, str]]:
    return [(en, vi) for en, vi in vocab if is_english_shadow_line(en)]


def build_exercises(
    topic_id: str,
    category: str,
    title: str,
    vocab,
    formulas,
    tips,
    sections,
    shadowing,
) -> list[dict]:
    style_id, style_label = PLATFORM_STYLES.get(category, ("langmaster", "Langmaster · Luyện tập"))
    exercises = []
    en_vocab = english_vocab(vocab)
    pool = choice_pool("", vocab, formulas, tips)

    def push(ex: dict):
        ex.setdefault("style", style_id)
        ex.setdefault("styleLabel", style_label)
        exercises.append(ex)

    ex_n = 0

    def next_id() -> str:
        nonlocal ex_n
        ex_n += 1
        return f"{topic_id}_ex{ex_n}"

    # --- ELSA-style pronunciation ---
    if category == "pronunciation":
        for en, vi in en_vocab[:3]:
            push({
                "id": next_id(),
                "type": "input",
                "grammar": "speaking",
                "question": f"Nói rõ từ/cụm: {en}",
                "answer": en,
                "hint": vi,
                "section": "Phát âm · Shadow",
                "style": "elsa",
                "styleLabel": "ELSA Speak · Nói thử",
            })
        for en, vi in en_vocab[3:5]:
            push({
                "id": next_id(),
                "type": "listening",
                "question": "Nghe và chọn nghĩa đúng:",
                "answer": vi,
                "choices": make_choices(vi, pool),
                "listenScript": [{"speaker": "Teacher", "text": en}],
                "hint": f"Phát âm: {en}",
                "section": "Nghe · Chọn nghĩa",
                "style": "elsa",
                "styleLabel": "ELSA Speak · Nghe–chọn",
            })
        for label, body in tips[:2]:
            push({
                "id": next_id(),
                "type": "true_false",
                "question": f"{label}: {body[:90]}…",
                "answer": "Đúng",
                "choices": ["Đúng", "Sai"],
                "hint": body[:140],
                "section": "Mẹo phát âm",
            })

    # --- MS Hoa-style speaking ---
    elif category == "speaking":
        lines = [s["text"] for s in shadowing] if shadowing else [en for en, _ in en_vocab[:6]]
        for line in lines[:3]:
            push({
                "id": next_id(),
                "type": "input",
                "grammar": "speaking",
                "question": f"Nói to câu mẫu giao tiếp: {line}",
                "answer": line.rstrip("."),
                "hint": "Nghe mẫu trong Shadowing rồi nói theo.",
                "section": "Hội thoại",
                "style": "mshoa",
                "styleLabel": "MS Hoa · Nói theo mẫu",
            })
        for en, vi in en_vocab[:2]:
            tokens = re.sub(r"[.!?]", "", en).split()
            if len(tokens) >= 3:
                push({
                    "id": next_id(),
                    "type": "word_order",
                    "question": "Sắp xếp thành câu trả lời đúng:",
                    "answer": " ".join(tokens),
                    "tokens": tokens,
                    "hint": vi,
                    "section": "Sắp xếp câu",
                    "style": "mshoa",
                    "styleLabel": "MS Hoa · Sắp xếp",
                })
        for en, vi in en_vocab[2:4]:
            push({
                "id": next_id(),
                "type": "multiple_choice",
                "question": f"Chọn cách diễn đạt phù hợp với: {vi}",
                "answer": en,
                "choices": make_choices(en, [e for e, _ in en_vocab if e != en]),
                "hint": vi,
                "section": "Chọn câu",
            })

    # --- Langmaster listening ---
    elif category == "listening":
        for en, vi in en_vocab[:4]:
            push({
                "id": next_id(),
                "type": "listening",
                "question": "Nghe hội thoại và chọn ý đúng:",
                "answer": vi,
                "choices": make_choices(vi, pool),
                "listenScript": [
                    {"speaker": "A", "text": en},
                    {"speaker": "B", "text": "That's right."},
                ],
                "hint": en,
                "section": "Bài nghe",
            })
        for label, body in tips[:2]:
            push({
                "id": next_id(),
                "type": "true_false",
                "question": f"Kỹ năng nghe: {body[:85]}…",
                "answer": "Đúng",
                "choices": ["Đúng", "Sai"],
                "hint": body[:120],
            })

    # --- Langmaster reading ---
    elif category == "reading":
        for title_sec, body in sections[:4]:
            snippet = body[:120] + ("…" if len(body) > 120 else "")
            push({
                "id": next_id(),
                "type": "multiple_choice",
                "question": f"Đọc đoạn ({title_sec}): ý chính là gì?",
                "answer": body[:80],
                "choices": make_choices(body[:80], [b[:80] for _, b in sections if b != body]),
                "hint": snippet,
                "section": "Đọc hiểu",
            })
        for en, vi in en_vocab[:2]:
            push({
                "id": next_id(),
                "type": "true_false",
                "question": f'Từ "{en}" có nghĩa: {vi}',
                "answer": "Đúng",
                "choices": ["Đúng", "Sai"],
                "hint": en,
            })

    # --- ILA writing ---
    elif category == "writing":
        for title_f, formula in formulas[:3]:
            push({
                "id": next_id(),
                "type": "input",
                "question": f"Viết lại công thức/cấu trúc: {title_f}",
                "answer": formula,
                "hint": "Kiểm tra thứ tự từ và dấu câu.",
                "section": "Viết cấu trúc",
                "style": "ila",
                "styleLabel": "ILA · Viết",
            })
        for label, body in tips[:2]:
            push({
                "id": next_id(),
                "type": "error_detection",
                "question": "Sửa lỗi trong câu sau",
                "prompt": body[:100] + " (có thể thiếu/sai dấu câu)",
                "answer": body[:100],
                "hint": label,
                "section": "Sửa lỗi viết",
            })
        for en, vi in en_vocab[:2]:
            push({
                "id": next_id(),
                "type": "input",
                "question": f"Dịch/viết câu tiếng Anh: {vi}",
                "answer": en,
                "hint": en,
            })

    # --- ILA grammar (default heavy) ---
    elif category == "grammar":
        for title_f, formula in formulas[:3]:
            push({
                "id": next_id(),
                "type": "multiple_choice",
                "question": f"Chọn công thức đúng cho {title_f}:",
                "answer": formula,
                "choices": make_choices(formula, [
                    "S + V2",
                    "S + have/has + V3",
                    "S + am/is/are + V-ing",
                    "S + will + V",
                ]),
                "hint": title_f,
                "section": "Công thức",
                "style": "ila",
                "styleLabel": "ILA · Ngữ pháp",
            })
        for title_f, formula in formulas[3:4]:
            words = formula.split()
            if len(words) >= 3:
                push({
                    "id": next_id(),
                    "type": "word_order",
                    "question": f"Sắp xếp công thức {title_f}:",
                    "answer": formula,
                    "tokens": words,
                    "hint": title_f,
                })
        for label, body in tips[:2]:
            push({
                "id": next_id(),
                "type": "true_false",
                "question": f"{label}: {body[:90]}…",
                "answer": "Đúng",
                "choices": ["Đúng", "Sai"],
                "hint": body[:120],
            })
        for en, vi in en_vocab[:2]:
            push({
                "id": next_id(),
                "type": "input",
                "question": f"Điền từ tiếng Anh: {vi}",
                "answer": en,
                "hint": en,
                "style": "langmaster",
                "styleLabel": "Langmaster · Từ vựng",
            })

    # --- Langmaster vocabulary ---
    elif category == "vocabulary":
        for en, vi in en_vocab[:5]:
            push({
                "id": next_id(),
                "type": "multiple_choice",
                "question": f'"{en}" nghĩa là gì?',
                "answer": vi,
                "choices": make_choices(vi, pool),
                "hint": en,
                "section": "Từ vựng",
            })
        for en, vi in en_vocab[5:7]:
            push({
                "id": next_id(),
                "type": "input",
                "question": f"Viết từ tiếng Anh: {vi}",
                "answer": en,
                "hint": en,
            })
        for label, body in tips[:1]:
            push({
                "id": next_id(),
                "type": "true_false",
                "question": f"Mẹo từ vựng: {body[:90]}…",
                "answer": "Đúng",
                "choices": ["Đúng", "Sai"],
                "hint": body[:120],
            })

    # --- ILA exam ---
    elif category == "exam":
        for en, vi in en_vocab[:4]:
            push({
                "id": next_id(),
                "type": "multiple_choice",
                "question": f"Câu hỏi thi: \"{en}\" = ?",
                "answer": vi,
                "choices": make_choices(vi, pool),
                "hint": "Loại trừ đáp án sai rõ.",
                "section": "Trắc nghiệm",
            })
        for title_f, formula in formulas[:2]:
            push({
                "id": next_id(),
                "type": "input",
                "question": f"Điền công thức: {title_f}",
                "answer": formula,
                "hint": formula,
            })
        for label, body in tips[:2]:
            push({
                "id": next_id(),
                "type": "true_false",
                "question": f"Ôn thi — {label}: {body[:80]}…",
                "answer": "Đúng",
                "choices": ["Đúng", "Sai"],
            })

    # --- skills / fallback ---
    else:
        for en, vi in en_vocab[:4]:
            push({
                "id": next_id(),
                "type": "multiple_choice",
                "question": f'"{en}" — {vi}?',
                "answer": "Đúng",
                "choices": ["Đúng", "Sai", "Không chắc", "Bỏ qua"],
                "hint": en,
            })
        for title_sec, body in sections[:2]:
            push({
                "id": next_id(),
                "type": "true_false",
                "question": f"{title_sec}: {body[:85]}…",
                "answer": "Đúng",
                "choices": ["Đúng", "Sai"],
                "hint": body[:100],
            })
        for label, body in tips[:2]:
            push({
                "id": next_id(),
                "type": "input",
                "question": f"Ghi nhớ ({label}): điền ý chính",
                "answer": body[:60],
                "hint": body[:120],
            })

    # Top-up to at least 6 exercises
    while len(exercises) < 6 and en_vocab:
        en, vi = en_vocab[len(exercises) % len(en_vocab)]
        push({
            "id": next_id(),
            "type": "multiple_choice",
            "question": f"Ôn nhanh: \"{en}\"?",
            "answer": vi,
            "choices": make_choices(vi, pool),
            "hint": title,
        })

    return exercises[:12]


def pick_poster(pdf_path: Path) -> str | None:
    exact = pdf_path.with_suffix(".png")
    if exact.exists():
        return f"special-topic/{exact.name}"
    stem = pdf_path.stem
    matches = sorted(TOPIC_DIR.glob(f"{stem}*.png"), key=lambda p: (p.name != f"{stem}.png", p.name))
    if not matches:
        prefix = re.match(r"(\d+)", pdf_path.name)
        if prefix:
            matches = sorted(TOPIC_DIR.glob(f"{prefix.group(1)}.*.png"))
    if matches:
        return f"special-topic/{matches[0].name}"
    return None


def process_pdf(pdf_path: Path) -> dict:
    text = pdf_text(pdf_path)
    filename = pdf_path.name
    order_m = re.match(r"(\d+)", filename)
    order = int(order_m.group(1)) if order_m else 0
    topic_id = f"st_{order:02d}_{slugify(filename)}"
    title_vi, title_en = parse_title(text, filename)
    category = detect_category(filename)
    poster = pick_poster(pdf_path)
    vocab = extract_vocab_pairs(text)
    formulas = extract_formulas(text)
    tips = extract_tips(text)
    sections = extract_sections(text)
    flashcards = build_flashcards(vocab, formulas, tips, sections)
    quiz = build_quiz(topic_id, vocab, formulas, tips, title_vi)
    shadowing = build_shadowing(order, category, vocab)
    exercises = build_exercises(topic_id, category, title_vi, vocab, formulas, tips, sections, shadowing)

    topic = {
        "id": topic_id,
        "order": order,
        "title": title_vi,
        "titleEn": title_en,
        "category": category,
        "categoryLabel": CATEGORY_LABELS.get(category, "Kỹ năng"),
        "objective": parse_objective(text),
        "pdf": f"special-topic/{filename}",
        "poster": poster,
        "flashcards": flashcards,
        "quiz": quiz,
        "exercises": exercises,
        "stats": {
            "flashCount": len(flashcards),
            "quizCount": len(quiz),
            "exerciseCount": len(exercises),
            "vocabCount": len(vocab),
            "shadowingCount": len(shadowing),
        },
    }
    if shadowing:
        topic["shadowing"] = shadowing
    return topic


def main():
    pdfs = sorted(TOPIC_DIR.glob("*.pdf"), key=lambda p: p.name)
    topics = [process_pdf(p) for p in pdfs]
    shadow_total = sum(len(t.get("shadowing", [])) for t in topics)
    exercise_total = sum(len(t.get("exercises", [])) for t in topics)
    payload = {
        "version": 3,
        "generatedFrom": "special-topic/*.pdf",
        "exerciseStyles": [
            {"id": "langmaster", "label": "Langmaster", "url": "https://langmaster.edu.vn/"},
            {"id": "ila", "label": "ILA", "url": "https://ila.edu.vn/"},
            {"id": "mshoa", "label": "MS Hoa Giao Tiếp", "url": "https://mshoagiaotiep.com/"},
            {"id": "elsa", "label": "ELSA Speak", "url": "https://vn.elsaspeak.com/"},
        ],
        "topicCount": len(topics),
        "categories": [
            {"id": k, "label": v}
            for k, v in CATEGORY_LABELS.items()
        ],
        "topics": topics,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(
        f"Wrote {OUT} ({len(topics)} topics, "
        f"{sum(len(t['flashcards']) for t in topics)} flashcards, "
        f"{shadow_total} shadowing lines, "
        f"{exercise_total} drills)"
    )


if __name__ == "__main__":
    main()
