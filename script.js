document.addEventListener("DOMContentLoaded", () => {
  const rightNowBtn = document.getElementById('rightNowBtn');
  const selectTimeBtn = document.getElementById('selectTimeBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const themeToggle = document.getElementById('theme-toggle');

  rightNowBtn.addEventListener('click', () => {
    calculateCycles(new Date());
  });

  selectTimeBtn.addEventListener('click', () => {
    const sleepTimeStr = document.getElementById('sleepInput').value;
    if (!sleepTimeStr) {
      alert("Please select a sleep time first.");
      return;
    }
    const [hour, minute] = sleepTimeStr.split(":").map(Number);
    const now = new Date();
    const selected = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
    calculateCycles(selected);
  });

  themeToggle.addEventListener('click', toggleTheme);

  downloadBtn.addEventListener('click', async () => {
    const resultEl = document.getElementById('result');
    const resultContent = document.getElementById('resultContent');

    if (!resultContent.innerHTML.trim()) {
      alert("No result to download.");
      return;
    }

    // temporarily hide the download button so it isn't part of the image
    const btn = document.getElementById('downloadBtn');
    const prevDisplay = btn.style.display;
    btn.style.display = 'none';

    // Ensure the element is visible for capture
    resultEl.style.display = 'block';

    try {
      const canvas = await html2canvas(resultEl, {
        backgroundColor: null,
        scale: Math.max(1, window.devicePixelRatio || 1)
      });

      const link = document.createElement('a');
      link.download = 'sleep-cycles.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Error capturing result:', e);
      alert('Unable to create image. See console for details.');
    } finally {
      // restore button visibility
      btn.style.display = prevDisplay || '';
    }
  });
});

/**
 * Calculate recommended wake times (90-minute cycles) from sleepTime (Date).
 * Renders results inside #resultContent and shows #result.
 */
function calculateCycles(sleepTime) {
  const resultDiv = document.getElementById('result');
  const resultContent = document.getElementById('resultContent');
  const cycleLength = 90; // minutes
  const maxCycles = 6; // show up to 6 cycles (≈9 hours)

  const lines = [];
  for (let i = 1; i <= maxCycles; i++) {
    const wake = new Date(sleepTime.getTime() + i * cycleLength * 60000);
    const formatted = wake.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    lines.push(`<div class="result-line">${formatted} — after ${i} cycle${i > 1 ? 's' : ''}</div>`);
  }

  const html = `
    <h3>Recommended Wake-Up Times</h3>
    ${lines.join("\n")}
    <div class="result-note">Note: Adults generally need 7–9 hours (≈5–6 cycles). If urgent, pick the shortest complete cycle.</div>
     <div class="result-note">If you urgently need to wake up, aim to wake at the end of a 90-minute cycle.</div>
  `;
  resultContent.innerHTML = html;
  resultDiv.style.display = 'block';
}

/** simple theme toggle between .dark and .light */
function toggleTheme() {
  const body = document.body;
  const btn = document.getElementById('theme-toggle');
  if (body.classList.contains('dark')) {
    body.classList.remove('dark');
    body.classList.add('light');
    btn.innerText = 'Light';
  } else {
    body.classList.remove('light');
    body.classList.add('dark');
    btn.innerText = 'Dark';
  }
}
