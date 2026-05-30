export function showModal({
  title,
  body,
  actionLabel = "Đã hiểu",
  onAction,
  secondaryLabel,
  onSecondary
}) {
  const existing = document.querySelector(".modal-backdrop");
  if (existing) existing.remove();

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  const actions = secondaryLabel
    ? `<div class="modal-actions">
        <button class="btn secondary modal-secondary" type="button">${secondaryLabel}</button>
        <button class="btn primary modal-primary" type="button">${actionLabel}</button>
      </div>`
    : `<button class="btn primary modal-primary" type="button">${actionLabel}</button>`;

  backdrop.innerHTML = `
    <section class="modal" role="dialog" aria-modal="true" aria-label="${title}">
      <h2>${title}</h2>
      <p>${body}</p>
      ${actions}
    </section>
  `;

  backdrop.querySelector(".modal-primary").addEventListener("click", () => {
    backdrop.remove();
    onAction?.();
  });

  const secondary = backdrop.querySelector(".modal-secondary");
  if (secondary) {
    secondary.addEventListener("click", () => {
      backdrop.remove();
      onSecondary?.();
    });
  }

  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) backdrop.remove();
  });
  document.body.append(backdrop);
}
