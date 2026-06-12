/** Thông tin tác giả — dùng chung các dự án EdTech. */
export const AUTHOR = {
  name: "Nguyễn Anh Vũ",
  email: "navuitag@gmail.com",
  phone: "0986201079",
  phoneTel: "+84986201079"
};

export function renderAppFooter() {
  return `
    <footer class="app-footer" aria-label="Thông tin tác giả">
      <p class="app-footer-title">Tác giả · ${AUTHOR.name}</p>
      <p class="app-footer-links">
        <a href="mailto:${AUTHOR.email}">${AUTHOR.email}</a>
        <span aria-hidden="true"> · </span>
        <a href="tel:${AUTHOR.phoneTel}">${AUTHOR.phone}</a>
      </p>
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
