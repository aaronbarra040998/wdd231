document.addEventListener("DOMContentLoaded", () => {
  const img = document.querySelector(".photo-card img");
  if (!img) return;

  img.decode?.().then(() => img.classList.add("is-loaded")).catch(() => {
    if (img.complete) img.classList.add("is-loaded");
  });
});
