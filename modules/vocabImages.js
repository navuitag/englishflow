/** Resolve vocabulary illustration path from word metadata or slug. */

export function slugifyVocabKey(en) {
  return String(en)
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function vocabImagePath(word = {}) {
  if (word.image) return word.image;
  const slug = slugifyVocabKey(word.en || "");
  return slug ? `./assets/images/vocab/${slug}.svg` : "";
}

export function vocabEmoji(word = {}) {
  return word.emoji || "📖";
}
