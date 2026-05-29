import { escapeHtml } from "../assets/js/utils.js";

const TYPE_LABEL = {
  multiple_choice: "Chọn đáp án",
  input: "Điền từ",
  error_detection: "Sửa lỗi sai",
  word_order: "Sắp xếp câu"
};

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function renderQuizCard(question) {
  let answerArea = "";

  if (question.type === "multiple_choice") {
    answerArea = `<div class="choice-grid">${question.choices
      .map((choice) => `<button class="choice-btn" data-answer="${escapeHtml(choice)}">${escapeHtml(choice)}</button>`)
      .join("")}</div>`;
  } else if (question.type === "word_order") {
    const tokens = shuffle(question.tokens || []);
    answerArea = `
      <div class="builder">
        <div class="builder-target" data-placeholder="Chạm vào các từ bên dưới để xếp câu"></div>
        <div class="builder-bank">
          ${tokens.map((token, index) => `<button class="word-chip" data-token="${escapeHtml(token)}" data-index="${index}">${escapeHtml(token)}</button>`).join("")}
        </div>
        <div class="builder-actions">
          <button class="btn quiet" type="button" data-action="reset">Xếp lại</button>
          <button class="btn primary" type="button" data-action="check">Kiểm tra</button>
        </div>
      </div>
    `;
  } else if (question.type === "error_detection") {
    answerArea = `
      <div class="error-prompt">
        <span class="tag">Câu có lỗi</span>
        <p class="wrong-sentence">${escapeHtml(question.prompt || question.question)}</p>
      </div>
      <form class="answer-form">
        <input class="answer-input" name="answer" autocomplete="off" placeholder="Viết lại câu đúng">
        <button class="btn primary" type="submit">Kiểm tra</button>
      </form>
    `;
  } else {
    answerArea = `
      <form class="answer-form">
        <input class="answer-input" name="answer" autocomplete="off" placeholder="Nhập đáp án của em">
        <button class="btn primary" type="submit">Kiểm tra</button>
      </form>
    `;
  }

  const heading = question.type === "error_detection"
    ? "Tìm và sửa lỗi sai trong câu sau:"
    : escapeHtml(question.question);

  return `
    <article class="quiz-card" data-question-id="${question.id}" data-type="${question.type}">
      <div class="quiz-meta">
        <span>${TYPE_LABEL[question.type] || "Bài tập"}</span>
        <button class="hint-btn" type="button" data-hint="${escapeHtml(question.hint || "")}">Gợi ý</button>
      </div>
      <h2>${heading}</h2>
      ${answerArea}
      <div class="feedback-panel" aria-live="polite"></div>
    </article>
  `;
}
