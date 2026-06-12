import { AUTHOR } from "./contact.js";
import { renderFeedbackFooterAction } from "./feedback.js";

export { AUTHOR };

function renderZaloQrFooter() {
  return `
      <figure class="app-footer-zalo" aria-label="Mã QR Zalo kết bạn">
        <img src="${AUTHOR.zaloQrSrc}" width="200" height="224" alt="Quét mã QR để kết bạn Zalo với ${AUTHOR.name}" loading="lazy" decoding="async">
        <figcaption>Kết bạn Zalo</figcaption>
      </figure>`;
}

export function renderAppFooter() {
  return `
    <footer class="app-footer" aria-label="Thông tin tác giả">
      <p class="app-footer-title">Tác giả · ${AUTHOR.name}</p>
      <p class="app-footer-links">
        <a href="mailto:${AUTHOR.email}">${AUTHOR.email}</a>
        <span aria-hidden="true"> · </span>
        <a href="tel:${AUTHOR.phoneTel}">${AUTHOR.phone}</a>
        <span aria-hidden="true"> · </span>
        ${renderFeedbackFooterAction()}
      </p>
      ${renderZaloQrFooter()}
    </footer>`;
}

export function renderAuthorCard() {
  return `
    <article class="author-card">
      <h2>Tác giả</h2>
      <p><strong>${AUTHOR.name}</strong></p>
      <p><a href="mailto:${AUTHOR.email}">${AUTHOR.email}</a></p>
      <p><a href="tel:${AUTHOR.phoneTel}">${AUTHOR.phone}</a></p>
    </article>`;
}
