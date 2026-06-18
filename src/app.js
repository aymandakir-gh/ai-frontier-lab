// Client-side catalogue filtering (no dependencies).
// Category is single-select (with an "All" reset); severity chips toggle.
(() => {
  "use strict";
  const cards = Array.from(document.querySelectorAll(".card"));
  const empty = document.getElementById("empty");
  if (!cards.length) return;

  let category = "";
  const severities = new Set();

  function apply() {
    let visible = 0;
    for (const card of cards) {
      const okCat = !category || card.dataset.category === category;
      const okSev = severities.size === 0 || severities.has(card.dataset.severity);
      const show = okCat && okSev;
      card.hidden = !show;
      if (show) visible++;
    }
    if (empty) empty.hidden = visible !== 0;
  }

  document.querySelectorAll("[data-filter-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      category = btn.dataset.filterCategory;
      document
        .querySelectorAll("[data-filter-category]")
        .forEach((b) => b.classList.toggle("is-active", b === btn));
      apply();
    });
  });

  document.querySelectorAll("[data-filter-severity]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sev = btn.dataset.filterSeverity;
      if (severities.has(sev)) severities.delete(sev);
      else severities.add(sev);
      btn.classList.toggle("is-active");
      apply();
    });
  });

  apply();
})();
