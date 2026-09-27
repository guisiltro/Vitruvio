document.querySelectorAll("[data-download]").forEach((button) =>
  button.addEventListener("click", () => {
    button.textContent = "Arquivo em preparação ↗";
  }),
);
