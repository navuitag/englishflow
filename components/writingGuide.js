import { escapeHtml } from "../assets/js/utils.js";

export function renderWritingGuide(step = {}) {
  const checklist = step.checklist || [];

  return `
    <div class="writing-guide">
      ${step.prompt ? `<p class="writing-prompt">${escapeHtml(step.prompt)}</p>` : ""}
      ${step.model ? `
        <div class="writing-model">
          <span class="tag">Câu mẫu</span>
          <p>${escapeHtml(step.model)}</p>
        </div>
      ` : ""}
      ${checklist.length ? `
        <ul class="writing-checklist">
          ${checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      ` : ""}
    </div>
  `;
}
