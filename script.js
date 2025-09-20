document.addEventListener("DOMContentLoaded", function() {
  const rightNowBtn = document.getElementById('rightNowBtn');
  const selectTimeBtn = document.getElementById('selectTimeBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const themeToggle = document.getElementById('theme-toggle');

  rightNowBtn.addEventListener('click', () => calculateCycles(new Date()));
  selectTimeBtn.addEventListener('click', () => {
    const sleepTimeStr = document.getElementById('sleepInput').value;
    if (!sleepTimeStr) {
      alert("Please select a sleep time.");
      return;
    }
    const [hour, minute] = sleepTimeStr.split(":").map(Number);
    let selectedTime = new Date();
    selectedTime.setHours(hour, minute, 0, 0);
    calculateCycles(selectedTime);
  });

  themeToggle.addEventListener('click', toggleTheme);

  downloadBtn.addEventListener('click', () => {
    const result = document.getElementById('result');
    if (!result.innerHTML.trim()) {
      alert("No result to download!");
      return;
    }

    html2canvas(result).then(canvas => {
      const link = document.createElement("a");
      link.download = "sleep-cycle-result.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  });
});

function calculateCycles(sleepTime) {
  const resultDiv = document.getElementById('result');
  const cycleLength = 90; // minutes
  const cycles = 6; // recommended full cycles

  let cycleTimes = [];
  for (let i = 1; i <= cycles; i++) {
    const cycleEnd = new Date(sleepTime.getTime() + i * cycleLength * 60000);
    const formattedTime = cycleEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    cycleTimes.push(`${formattedTime} - ${i} cycle${i > 1 ? 's' : ''}`);
  }

  let resultText = `<strong>Recommended Sleep Cycles:</strong><br>`;
  cycleTimes.forEach(time => {
    resultText += `<span class="result-line">${time}</span>`;
  });

  resultText += `<br><em>Note: Adults need 7–9 hours of sleep (5–6 cycles). If urgent, waking up at the end of a cycle will help you feel less groggy.</em>`;

  resultDiv.style.display = 'block';
  resultDiv.innerHTML = resultText;
}

function toggleTheme() {
  const body = document.body;
  const themeToggle = document.getElementById('theme-toggle');
  if (body.classList.contains('dark')) {
    body.classList.remove('dark');
    body.classList.add('light');
    themeToggle.innerText = "Light";
  } else {
    body.classList.remove('light');
    body.classList.add('dark');
    themeToggle.innerText = "Dark";
  }
}
