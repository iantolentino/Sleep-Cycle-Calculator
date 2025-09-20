document.addEventListener("DOMContentLoaded", () => {
  const nowBtn = document.getElementById("nowBtn");
  const selectBtn = document.getElementById("selectBtn");
  const themeToggle = document.getElementById("theme-toggle");
  const downloadBtn = document.getElementById("downloadBtn");

  nowBtn.addEventListener("click", () => calculateCycles(new Date()));
  selectBtn.addEventListener("click", getCustomTime);
  themeToggle.addEventListener("click", toggleTheme);
  downloadBtn.addEventListener("click", downloadResult);
});

function getCustomTime() {
  const hour = parseInt(document.getElementById("hour").value);
  const minute = parseInt(document.getElementById("minute").value) || 0;
  const ampm = document.getElementById("ampm").value;

  if (!hour || hour < 1 || hour > 12) {
    alert("Please enter a valid hour (1–12).");
    return;
  }
  if (minute < 0 || minute > 59) {
    alert("Please enter a valid minute (0–59).");
    return;
  }

  let hour24 = hour % 12;
  if (ampm === "PM") hour24 += 12;

  const now = new Date();
  const sleepTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour24, minute);
  calculateCycles(sleepTime);
}

function calculateCycles(sleepTime) {
  const resultDiv = document.getElementById("result");
  const cycleLength = 90; // minutes
  const cycles = 6; // calculate up to 6 cycles (~9 hrs)

  let results = `<h3>Recommended Wake-Up Times</h3>`;
  let times = [];

  for (let i = 1; i <= cycles; i++) {
    const wakeTime = new Date(sleepTime.getTime() + i * cycleLength * 60000);
    const formatted = wakeTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    times.push(`<span class="result-line">${formatted} — after ${i} cycle${i > 1 ? "s" : ""}</span>`);
  }

  results += times.join("");
  resultDiv.innerHTML = results;
  resultDiv.style.display = "block";
}

function toggleTheme() {
  const body = document.body;
  const btn = document.getElementById("theme-toggle");
  body.classList.toggle("dark");
  body.classList.toggle("light");
  btn.innerText = body.classList.contains("dark") ? "Dark" : "Light";
}

function downloadResult() {
  const resultDiv = document.querySelector(".container");
  html2canvas(resultDiv).then(canvas => {
    const link = document.createElement("a");
    link.download = "sleep_cycles.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}
