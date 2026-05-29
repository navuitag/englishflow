export function showModal({ title, body, actionLabel = "Đã hiểu" }) {
  const existing = document.querySelector(".modal-backdrop");
  if (existing) existing.remove();

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <section class="modal" role="dialog" aria-modal="true" aria-label="${title}">
      <h2>${title}</h2>
      <p>${body}</p>
      <button class="btn primary" type="button">${actionLabel}</button>
    </section>
  `;
  backdrop.querySelector("button").addEventListener("click", () => backdrop.remove());
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) backdrop.remove();
  });
  document.body.append(backdrop);
}
