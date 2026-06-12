import { AUTHOR } from "./contact.js";
import { CURRENT_APP_ID, EDTECH_APPS } from "./edtechApps.js";
import { escapeHtml } from "./utils.js";

export const FEEDBACK_CATEGORIES = [
  "Góp ý chung",
  "Báo lỗi",
  "Đề xuất tính năng",
  "Nội dung / bài học"
];

export function getAppName() {
  const app = EDTECH_APPS.find(
    (item) => item.id === CURRENT_APP_ID || item.folder.toLowerCase() === String(CURRENT_APP_ID).toLowerCase()
  );
  return app?.name || (typeof document !== "undefined" ? document.title.split("—")[0].trim() : "EdTech App");
}

export function buildFeedbackMailto({ message = "", category = FEEDBACK_CATEGORIES[0], appName = getAppName() } = {}) {
  const subject = encodeURIComponent(`[${appName}] ${category}`);
  const body = encodeURIComponent(
    `Ứng dụng: ${appName}\n` +
    `Loại góp ý: ${category}\n` +
    `Trang: ${typeof location !== "undefined" ? location.href : ""}\n` +
    `Thiết bị: ${typeof navigator !== "undefined" ? navigator.userAgent : ""}\n\n` +
    `---\nNội dung góp ý:\n${message.trim() || "(Chưa nhập nội dung)"}\n`
  );
  return `mailto:${AUTHOR.email}?subject=${subject}&body=${body}`;
}

export function renderFeedbackFooterAction() {
  return `<button type="button" class="feedback-link-btn" data-feedback-open>Góp ý ứng dụng</button>`;
}

export function renderFeedbackCard() {
  const options = FEEDBACK_CATEGORIES.map(
    (category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`
  ).join("");

  return `
    <article class="feedback-card" id="feedbackCard">
      <h2>Góp ý ứng dụng</h2>
      <p class="feedback-card-lead">Ý kiến của bạn giúp cải thiện ${escapeHtml(getAppName())}. Góp ý sẽ mở ứng dụng email với nội dung đã điền sẵn.</p>
      <form class="feedback-form" id="feedbackForm">
        <label>
          <span>Loại góp ý</span>
          <select name="category">${options}</select>
        </label>
        <label>
          <span>Nội dung</span>
          <textarea name="message" rows="5" maxlength="2000" placeholder="Mô tả góp ý, lỗi gặp phải hoặc đề xuất của bạn..." required></textarea>
        </label>
        <button class="btn primary" type="submit">Gửi</button>
      </form>
    </article>`;
}

function renderFeedbackModal() {
  const options = FEEDBACK_CATEGORIES.map(
    (category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`
  ).join("");

  return `
    <div class="feedback-backdrop" id="feedbackBackdrop" hidden>
      <section class="feedback-modal" role="dialog" aria-modal="true" aria-labelledby="feedbackModalTitle">
        <div class="feedback-modal-head">
          <h2 id="feedbackModalTitle">Góp ý · ${escapeHtml(getAppName())}</h2>
          <button type="button" class="feedback-close" data-feedback-close aria-label="Đóng">×</button>
        </div>
        <form class="feedback-form" id="feedbackModalForm">
          <label>
            <span>Loại góp ý</span>
            <select name="category">${options}</select>
          </label>
          <label>
            <span>Nội dung</span>
            <textarea name="message" rows="6" maxlength="2000" placeholder="Mô tả góp ý, lỗi hoặc đề xuất..." required></textarea>
          </label>
          <div class="feedback-modal-actions">
            <button class="btn quiet" type="button" data-feedback-close>Hủy</button>
            <button class="btn primary" type="submit">Gửi</button>
          </div>
        </form>
      </section>
    </div>`;
}

function ensureFeedbackModal() {
  let backdrop = document.getElementById("feedbackBackdrop");
  if (!backdrop) {
    document.body.insertAdjacentHTML("beforeend", renderFeedbackModal());
    backdrop = document.getElementById("feedbackBackdrop");
  }
  return backdrop;
}

function openFeedbackModal() {
  const backdrop = ensureFeedbackModal();
  backdrop.hidden = false;
  const textarea = backdrop.querySelector("textarea");
  textarea?.focus();
}

function closeFeedbackModal() {
  const backdrop = document.getElementById("feedbackBackdrop");
  if (backdrop) backdrop.hidden = true;
}

function submitFeedbackForm(form) {
  const data = new FormData(form);
  const message = String(data.get("message") || "").trim();
  const category = String(data.get("category") || FEEDBACK_CATEGORIES[0]);
  if (!message) {
    form.querySelector("textarea")?.focus();
    return;
  }
  window.location.href = buildFeedbackMailto({ message, category });
  closeFeedbackModal();
  form.reset();
}

let feedbackBound = false;

export function bindFeedback() {
  document.querySelectorAll("[data-feedback-open]").forEach((button) => {
    if (button.dataset.feedbackBound === "true") return;
    button.dataset.feedbackBound = "true";
    button.addEventListener("click", openFeedbackModal);
  });

  const profileForm = document.getElementById("feedbackForm");
  if (profileForm && profileForm.dataset.feedbackBound !== "true") {
    profileForm.dataset.feedbackBound = "true";
    profileForm.addEventListener("submit", (event) => {
      event.preventDefault();
      submitFeedbackForm(profileForm);
    });
  }

  const backdrop = document.getElementById("feedbackBackdrop");
  if (backdrop && backdrop.dataset.feedbackBound !== "true") {
    backdrop.dataset.feedbackBound = "true";
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop || event.target.closest("[data-feedback-close]")) {
        closeFeedbackModal();
      }
    });
    backdrop.querySelector("#feedbackModalForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      submitFeedbackForm(event.currentTarget);
    });
  }

  if (feedbackBound) return;
  feedbackBound = true;
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeFeedbackModal();
  });
}
