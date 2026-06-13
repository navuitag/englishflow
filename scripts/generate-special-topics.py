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


def process_pdf(pdf_path: Path) -> dict:
    text = pdf_text(pdf_path)
    filename = pdf_path.name
    order_m = re.match(r"(\d+)", filename)
    order = int(order_m.group(1)) if order_m else 0
    topic_id = f"st_{order:02d}_{slugify(filename)}"
    title_vi, title_en = parse_title(text, filename)
    category = detect_category(filename)
    png = pdf_path.with_suffix(".png")
    vocab = extract_vocab_pairs(text)
    formulas = extract_formulas(text)
    tips = extract_tips(text)
    sections = extract_sections(text)
    flashcards = build_flashcards(vocab, formulas, tips, sections)
    quiz = build_quiz(topic_id, vocab, formulas, tips, title_vi)

    return {
        "id": topic_id,
        "order": order,
        "title": title_vi,
        "titleEn": title_en,
        "category": category,
        "categoryLabel": CATEGORY_LABELS.get(category, "Kỹ năng"),
        "objective": parse_objective(text),
        "pdf": f"special-topic/{filename}",
        "poster": f"special-topic/{png.name}" if png.exists() else None,
        "flashcards": flashcards,
        "quiz": quiz,
        "stats": {
            "flashCount": len(flashcards),
            "quizCount": len(quiz),
            "vocabCount": len(vocab),
        },
    }


def main():
    pdfs = sorted(TOPIC_DIR.glob("*.pdf"), key=lambda p: p.name)
    topics = [process_pdf(p) for p in pdfs]
    payload = {
        "version": 1,
        "generatedFrom": "special-topic/*.pdf",
        "topicCount": len(topics),
        "categories": [
            {"id": k, "label": v}
            for k, v in CATEGORY_LABELS.items()
        ],
        "topics": topics,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {OUT} ({len(topics)} topics, {sum(len(t['flashcards']) for t in topics)} flashcards)")


if __name__ == "__main__":
    main()
