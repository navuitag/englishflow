#!/usr/bin/env node
/**
 * Add emoji + SVG illustrations to all vocabulary words in lessons.json.
 * Run: node scripts/build-vocab-images.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { lookupVocabEmoji, slugifyVocabKey } from "./vocab-emoji-map.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const lessonsPath = path.join(root, "data", "lessons.json");
const imagesDir = path.join(root, "assets", "images", "vocab");

function buildSvg(emoji) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96" role="img" aria-hidden="true">
  <rect width="96" height="96" rx="14" fill="#edf8f4"/>
  <rect x="1" y="1" width="94" height="94" rx="13" fill="none" stroke="#cfe9dd" stroke-width="2"/>
  <text x="48" y="54" font-size="44" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
</svg>`;
}

function enrichWord(word) {
  const emoji = lookupVocabEmoji(word.en);
  const slug = slugifyVocabKey(word.en);
  const image = `./assets/images/vocab/${slug}.svg`;
  return { ...word, emoji, image };
}

function main() {
  const lessons = JSON.parse(fs.readFileSync(lessonsPath, "utf8"));
  fs.mkdirSync(imagesDir, { recursive: true });

  const written = new Set();
  let wordCount = 0;
  let lessonCount = 0;

  for (const lesson of lessons) {
    for (const step of lesson.steps || []) {
      if (step.type !== "vocabulary" || !Array.isArray(step.words)) continue;
      lessonCount += 1;
      step.words = step.words.map((word) => {
        const enriched = enrichWord(word);
        const slug = slugifyVocabKey(word.en);
        if (slug && !written.has(slug)) {
          fs.writeFileSync(path.join(imagesDir, `${slug}.svg`), buildSvg(enriched.emoji), "utf8");
          written.add(slug);
        }
        wordCount += 1;
        return enriched;
      });
    }
  }

  fs.writeFileSync(lessonsPath, `${JSON.stringify(lessons, null, 2)}\n`, "utf8");

  console.log(`Vocabulary images built:`);
  console.log(`  ${wordCount} word entries in ${lessonCount} lessons`);
  console.log(`  ${written.size} unique SVG files → assets/images/vocab/`);
  console.log(`  Updated data/lessons.json with emoji + image fields`);
}

main();
