document.addEventListener("DOMContentLoaded", function() {
    const calculateButton = document.getElementById('calculateButton');
    calculateButton.addEventListener('click', calculateCycles);
    
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', toggleTheme);
  });
  
  function calculateCycles() {
    const sleepTimeStr = document.getElementById('sleepTime').value;
    const wakeTimeStr = document.getElementById('wakeTime').value;
    const resultDiv = document.getElementById('result');
    
    if (!sleepTimeStr || !wakeTimeStr) {
      alert('Please enter both sleep time and wake-up time.');
      return;
    }
    
    const now = new Date();
    let sleepTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let wakeTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const [sleepHour, sleepMinute] = sleepTimeStr.split(':').map(Number);
    const [wakeHour, wakeMinute] = wakeTimeStr.split(':').map(Number);
    
    sleepTime.setHours(sleepHour, sleepMinute, 0, 0);
    wakeTime.setHours(wakeHour, wakeMinute, 0, 0);
    
    // If wake time is before or equal to sleep time, assume it's the next day
    if (wakeTime <= sleepTime) {
      wakeTime.setDate(wakeTime.getDate() + 1);
    }
    
    // Calculate total sleep minutes and complete 90-minute cycles
    const diffMinutes = (wakeTime - sleepTime) / (1000 * 60);
    const cycleLength = 90;
    const cycles = Math.floor(diffMinutes / cycleLength);
    
    let cycleTimes = [];
    for (let i = 1; i <= cycles; i++) {
      const cycleEnd = new Date(sleepTime.getTime() + i * cycleLength * 60000);
      const formattedTime = cycleEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      cycleTimes.push(`${formattedTime} - ${i} cycle${i > 1 ? 's' : ''}`);
    }
    
    let resultText = `Total sleep time:<br> ${diffMinutes} minutes. You can have ${cycles} complete 90-minute cycle${cycles !== 1 ? 's' : ''}.<br><br>`;
    
    if (cycleTimes.length > 0) {
      resultText += `Cycle End Times:<br>`;
      cycleTimes.forEach(time => {
        resultText += `<span class="result-line">${time}</span>`;
      });
    }
    
    // Show the result container and apply typing animation
    resultDiv.style.display = 'block';
    resultDiv.classList.remove('typing-desc');
    void resultDiv.offsetWidth; // Trigger reflow to restart animation
    resultDiv.innerHTML = resultText;
    resultDiv.classList.add('typing-desc');
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
  