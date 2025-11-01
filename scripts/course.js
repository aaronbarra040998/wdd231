const courses = [
  { subject: "CSE", number: 110, title: "Introduction to Programming", credits: 2 },
  { subject: "WDD", number: 130, title: "Web Fundamentals", credits: 2 },
  { subject: "CSE", number: 111, title: "Programming with Functions", credits: 2 },
  { subject: "CSE", number: 210, title: "Programming with Classes", credits: 2 },
  { subject: "WDD", number: 131, title: "Dynamic Web Fundamentals", credits: 2 },
  { subject: "WDD", number: 231, title: "Frontend Web Development I", credits: 2 }
];

document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("courseList");
  const total = document.getElementById("totalCredits");

  function render(filtered) {
    list.innerHTML = filtered
      .map(c => `
        <article class="course-card">
          <h3>${c.subject} ${c.number} — ${c.title}</h3>
          <p><strong>Credits:</strong> ${c.credits}</p>
        </article>`)
      .join("");

    total.textContent = filtered.reduce((sum, c) => sum + c.credits, 0);
  }

  const allBtn = document.getElementById("filter-all");
  const cseBtn = document.getElementById("filter-cse");
  const wddBtn = document.getElementById("filter-wdd");

  const setActive = btn => {
    [allBtn, cseBtn, wddBtn].forEach(b => b.setAttribute("aria-pressed", "false"));
    btn.setAttribute("aria-pressed", "true");
  };

  allBtn.addEventListener("click", () => { render(courses); setActive(allBtn); });
  cseBtn.addEventListener("click", () => { render(courses.filter(c => c.subject === "CSE")); setActive(cseBtn); });
  wddBtn.addEventListener("click", () => { render(courses.filter(c => c.subject === "WDD")); setActive(wddBtn); });

  render(courses);
});
