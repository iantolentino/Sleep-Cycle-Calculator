/**
 * Sleep Cycle Calculator - Consolidated Working Version
 * All functions in one file to avoid module errors
 */

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format a date object to localized time string
 */
function formatTime(date) {
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

/**
 * Calculate wake-up times based on sleep start and cycle length
 */
function calculateWakeTimes(sleepTime, cycleLength = 90, maxCycles = 6) {
  const wakeTimes = [];
  
  for (let i = 1; i <= maxCycles; i++) {
    const wakeDate = new Date(sleepTime.getTime() + (i * cycleLength * 60 * 1000));
    const hours = (i * cycleLength) / 60;
    
    wakeTimes.push({
      cycleNumber: i,
      time: wakeDate,
      formattedTime: formatTime(wakeDate),
      totalSleepMinutes: i * cycleLength,
      totalSleepHours: hours.toFixed(1),
      description: `${i} cycle${i > 1 ? 's' : ''} (${hours.toFixed(1)} hours)`
    });
  }
  
  return wakeTimes;
}

/**
 * Validate if a time string is valid
 */
function isValidTime(timeStr) {
  if (!timeStr) return false;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (
    !isNaN(hours) && !isNaN(minutes) &&
    hours >= 0 && hours <= 23 &&
    minutes >= 0 && minutes <= 59
  );
}

/**
 * Create a Date object from time string
 */
function timeStringToDate(timeStr) {
  if (!isValidTime(timeStr)) return null;
  
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0,
    0
  );
}

/**
 * Save data to local storage
 */
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

/**
 * Load data from local storage
 */
function loadFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
    return defaultValue;
  }
}

// ==================== SLEEP CALCULATOR CLASS ====================

class SleepCalculator {
  constructor(cycleLength = 90, maxCycles = 6) {
    this.cycleLength = cycleLength;
    this.maxCycles = maxCycles;
    this.lastCalculation = null;
  }

  calculate(sleepTime) {
    if (!(sleepTime instanceof Date) || isNaN(sleepTime)) {
      throw new Error('Invalid sleep time provided');
    }

    const wakeTimes = calculateWakeTimes(sleepTime, this.cycleLength, this.maxCycles);
    
    this.lastCalculation = {
      sleepTime,
      wakeTimes,
      timestamp: new Date(),
      totalCycles: wakeTimes.length,
      recommendedCycles: this.getRecommendedCycles(wakeTimes)
    };

    return this.lastCalculation;
  }

  getRecommendedCycles(wakeTimes) {
    return wakeTimes.filter(wt => wt.cycleNumber >= 5);
  }

  formatResults(calculation) {
    if (!calculation) return '';

    const { wakeTimes } = calculation;

    const wakeTimesHtml = wakeTimes.map(wt => `
      <div class="result-line ${wt.cycleNumber >= 5 ? 'recommended' : ''}">
        <span class="cycle-time">${wt.formattedTime}</span>
        <span class="cycle-desc">— ${wt.description}</span>
        ${wt.cycleNumber >= 5 ? '<span class="badge">✨ Ideal</span>' : ''}
      </div>
    `).join('');

    return `
      <h3>🌅 Recommended Wake-Up Times</h3>
      ${wakeTimesHtml}
      <div class="result-note">
        <p><strong>💡 Quick Tips:</strong></p>
        <ul>
          <li>✨ 5-6 cycles (7.5-9 hours) is ideal for adults</li>
          <li>⚠️ Waking mid-cycle causes sleep inertia (grogginess)</li>
          <li>⏰ Add 15 minutes to account for falling asleep</li>
        </ul>
      </div>
      <div class="result-note">
        Based on ${this.cycleLength}-minute cycles. Individual variations may occur.
      </div>
    `;
  }

  assessWakeQuality(wakeTime, sleepTime) {
    const diffMinutes = (wakeTime - sleepTime) / (1000 * 60);
    const cycles = diffMinutes / this.cycleLength;
    const remainder = diffMinutes % this.cycleLength;
    
    let quality = 'poor';
    let message = '';

    if (Math.abs(remainder) < 5 || Math.abs(remainder - this.cycleLength) < 5) {
      quality = 'excellent';
      message = 'Perfect! You\'ll wake at the end of a cycle.';
    } else if (Math.abs(remainder - this.cycleLength / 2) < 10) {
      quality = 'poor';
      message = 'Warning: You\'ll wake in the middle of deep sleep.';
    } else {
      quality = 'fair';
      message = 'You might feel somewhat groggy.';
    }

    return {
      quality,
      message,
      cyclesCompleted: Math.floor(cycles),
      minutesIntoCycle: Math.round(remainder)
    };
  }
}

// ==================== THEME MANAGER ====================

class ThemeManager {
  constructor(defaultTheme = 'dark') {
    this.themes = ['dark', 'light'];
    this.icons = {
      dark: '✹',
      light: '⏾'
    };
    this.currentTheme = loadFromStorage('theme', defaultTheme);
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.setupListener();
  }

  applyTheme(theme) {
    if (!this.themes.includes(theme)) {
      console.warn(`Invalid theme: ${theme}, falling back to dark`);
      theme = 'dark';
    }

    this.themes.forEach(t => {
      document.body.classList.remove(t);
    });

    document.body.classList.add(theme);
    this.currentTheme = theme;

    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.textContent = this.icons[theme];
    }

    saveToStorage('theme', theme);
  }

  toggle() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.classList.add('rotate');
      setTimeout(() => icon.classList.remove('rotate'), 500);
    }

    return newTheme;
  }

  setupListener() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
    }
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  isDark() {
    return this.currentTheme === 'dark';
  }
}

// ==================== NOTIFICATION MANAGER ====================

class NotificationManager {
  constructor() {
    this.permission = null;
    this.reminders = [];
    this.init();
  }

  async init() {
    this.permission = await this.checkPermission();
    this.loadReminders();
  }

  async checkPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return 'unsupported';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  async requestPermission() {
    this.permission = await Notification.requestPermission();
    return this.permission;
  }

  scheduleReminder(sleepTime, wakeTime, reminderMinutes = 30) {
    const now = new Date();
    const sleepDateTime = this.createDateTime(sleepTime);
    const reminderTime = new Date(sleepDateTime.getTime() - reminderMinutes * 60000);

    if (reminderTime > now) {
      const timeoutId = setTimeout(() => {
        this.sendSleepReminder(sleepTime, wakeTime);
      }, reminderTime - now);

      this.reminders.push({
        id: Date.now(),
        sleepTime,
        wakeTime,
        reminderTime,
        timeoutId
      });

      this.saveReminders();
      return true;
    }
    return false;
  }

  createDateTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    if (date < new Date()) {
      date.setDate(date.getDate() + 1);
    }
    
    return date;
  }

  sendSleepReminder(sleepTime, wakeTime) {
    if (this.permission !== 'granted') return;

    const options = {
      body: `Time to prepare for sleep. Wake up at ${wakeTime} for optimal cycles.`,
      icon: '/assets/images/icon-192x192.png',
      badge: '/assets/images/icon-72x72.png',
      vibrate: [200, 100, 200],
      data: {
        sleepTime,
        wakeTime,
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'snooze',
          title: 'Snooze 15min'
        },
        {
          action: 'calculate',
          title: 'Recalculate'
        }
      ]
    };

    new Notification('🌙 Time to wind down', options);
  }

  cancelReminder(reminderId) {
    const index = this.reminders.findIndex(r => r.id === reminderId);
    if (index !== -1) {
      clearTimeout(this.reminders[index].timeoutId);
      this.reminders.splice(index, 1);
      this.saveReminders();
      return true;
    }
    return false;
  }

  loadReminders() {
    try {
      const saved = localStorage.getItem('sleepReminders');
      if (saved) {
        const reminders = JSON.parse(saved);
        reminders.forEach(reminder => {
          this.scheduleReminder(reminder.sleepTime, reminder.wakeTime);
        });
      }
    } catch (e) {
      console.error('Failed to load reminders:', e);
    }
  }

  saveReminders() {
    try {
      const remindersToSave = this.reminders.map(({ id, sleepTime, wakeTime, reminderTime }) => ({
        id, sleepTime, wakeTime, reminderTime
      }));
      localStorage.setItem('sleepReminders', JSON.stringify(remindersToSave));
    } catch (e) {
      console.error('Failed to save reminders:', e);
    }
  }
}

// ==================== HISTORY MANAGER ====================

class HistoryManager {
  constructor(maxEntries = 50) {
    this.maxEntries = maxEntries;
    this.history = [];
    this.loadHistory();
  }

  addEntry(sleepTime, wakeTimes, quality = 'optimal', notes = '') {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      sleepTime: sleepTime.toISOString(),
      wakeTimes: wakeTimes.map(wt => ({
        time: wt.time.toISOString(),
        cycleNumber: wt.cycleNumber,
        formattedTime: wt.formattedTime
      })),
      selectedWakeTime: wakeTimes[0]?.formattedTime,
      quality,
      notes,
      date: new Date().toLocaleDateString()
    };

    this.history.unshift(entry);
    
    if (this.history.length > this.maxEntries) {
      this.history = this.history.slice(0, this.maxEntries);
    }

    this.saveHistory();
    return entry;
  }

  getStats() {
    if (this.history.length === 0) {
      return {
        totalEntries: 0,
        optimalPercentage: 0,
        averageCycles: 0,
        mostCommonSleepTime: null
      };
    }

    const optimalCount = this.history.filter(e => e.quality === 'optimal').length;
    
    const sleepTimeCounts = {};
    this.history.forEach(entry => {
      const time = new Date(entry.sleepTime).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      sleepTimeCounts[time] = (sleepTimeCounts[time] || 0) + 1;
    });

    let mostCommonTime = null;
    let maxCount = 0;
    for (const [time, count] of Object.entries(sleepTimeCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonTime = time;
      }
    }

    return {
      totalEntries: this.history.length,
      optimalPercentage: Math.round((optimalCount / this.history.length) * 100),
      optimalCount,
      suboptimalCount: this.history.length - optimalCount,
      mostCommonSleepTime: mostCommonTime,
      mostCommonTimeCount: maxCount
    };
  }

  loadHistory() {
    try {
      const saved = localStorage.getItem('sleepHistory');
      if (saved) {
        this.history = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
      this.history = [];
    }
  }

  saveHistory() {
    try {
      localStorage.setItem('sleepHistory', JSON.stringify(this.history));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  }
}

// ==================== UI MANAGER ====================

class UIManager {
  constructor(calculator, historyManager, themeManager) {
    this.calculator = calculator;
    this.historyManager = historyManager;
    this.themeManager = themeManager;
    this.notificationManager = new NotificationManager();
    this.elements = this.cacheElements();
    this.init();
  }

  cacheElements() {
    return {
      sleepInput: document.getElementById('sleepInput'),
      rightNowBtn: document.getElementById('rightNowBtn'),
      selectTimeBtn: document.getElementById('selectTimeBtn'),
      downloadBtn: document.getElementById('downloadBtn'),
      result: document.getElementById('result'),
      resultContent: document.getElementById('resultContent'),
      infoToggle: document.getElementById('info-toggle'),
      infoPanel: document.getElementById('info-panel'),
      expandArticle: document.getElementById('expandArticle'),
      articleModal: document.getElementById('articleModal'),
      closeModal: document.querySelector('.close-modal'),
      readMoreLink: document.getElementById('read-more-link')
    };
  }

  init() {
    this.setupEventListeners();
    this.setDefaultTime();
    this.setupKeyboardShortcuts();
  }

  setupEventListeners() {
    const { elements } = this;

    if (elements.rightNowBtn) {
      elements.rightNowBtn.addEventListener('click', () => {
        this.handleRightNow();
      });
    }

    if (elements.selectTimeBtn) {
      elements.selectTimeBtn.addEventListener('click', () => {
        this.handleSelectedTime();
      });
    }

    if (elements.downloadBtn) {
      elements.downloadBtn.addEventListener('click', () => {
        this.handleDownload();
      });
    }

    if (elements.infoToggle) {
      elements.infoToggle.addEventListener('click', () => {
        this.toggleInfoPanel();
      });
    }

    if (elements.expandArticle) {
      elements.expandArticle.addEventListener('click', (e) => {
        e.preventDefault();
        this.openArticleModal();
      });
    }

    if (elements.closeModal) {
      elements.closeModal.addEventListener('click', () => {
        this.closeArticleModal();
      });
    }

    if (elements.readMoreLink) {
      elements.readMoreLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.openArticleModal();
      });
    }

    window.addEventListener('click', (e) => {
      if (e.target === elements.articleModal) {
        this.closeArticleModal();
      }
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.handleSelectedTime();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        this.handleRightNow();
      }
      
      if (e.key === 't' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        this.themeManager.toggle();
      }
      
      if (e.key === 'Escape' && this.elements.articleModal.style.display === 'block') {
        this.closeArticleModal();
      }
    });
  }

  setDefaultTime() {
    if (this.elements.sleepInput && !this.elements.sleepInput.value) {
      this.elements.sleepInput.value = '23:00';
    }
  }

  handleRightNow() {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    this.elements.sleepInput.value = timeString;
    this.calculateAndDisplay(now);
  }

  handleSelectedTime() {
    const timeStr = this.elements.sleepInput.value;
    if (!timeStr) {
      alert('Please select a sleep time first');
      return;
    }

    const sleepTime = timeStringToDate(timeStr);
    if (!sleepTime) {
      alert('Invalid time format');
      return;
    }

    this.calculateAndDisplay(sleepTime);
  }

  calculateAndDisplay(sleepTime) {
    try {
      const calculation = this.calculator.calculate(sleepTime);
      const html = this.calculator.formatResults(calculation);
      
      this.elements.resultContent.innerHTML = html;
      this.elements.result.style.display = 'block';
      
      // Add to history
      this.historyManager.addEntry(sleepTime, calculation.wakeTimes, 'optimal');
      
      // Show stats in console for now (we'll add UI later)
      console.log('Sleep Stats:', this.historyManager.getStats());
      
      this.elements.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Error calculating sleep times');
    }
  }

  async handleDownload() {
    const { result, resultContent, downloadBtn } = this.elements;

    if (!resultContent.innerHTML.trim()) {
      alert('No result to download');
      return;
    }

    const originalDisplay = downloadBtn.style.display;
    downloadBtn.style.display = 'none';

    try {
      const canvas = await html2canvas(result, {
        backgroundColor: null,
        scale: window.devicePixelRatio || 2,
        logging: false,
        allowTaint: false,
        useCORS: true
      });

      const link = document.createElement('a');
      link.download = `sleep-cycles-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      alert('Image downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to create image');
    } finally {
      downloadBtn.style.display = originalDisplay;
    }
  }

  toggleInfoPanel() {
    const { infoPanel } = this.elements;
    const isVisible = infoPanel.style.display !== 'none';
    infoPanel.style.display = isVisible ? 'none' : 'block';
  }

  openArticleModal() {
    this.elements.articleModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    this.loadArticleContent();
  }

  closeArticleModal() {
    this.elements.articleModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  loadArticleContent() {
    const contentDiv = document.getElementById('articleContent');
    if (contentDiv.innerHTML.trim()) return;

    const articleContent = `
      <h1>The Science of Sleep Cycles</h1>
      
      <h2>Understanding Your Body's Natural Rhythm</h2>
      <p>Sleep is far from a passive state. During sleep, your brain is actively processing information, consolidating memories, and clearing out toxins.</p>
      
      <h2>What Are Sleep Cycles?</h2>
      <p>A sleep cycle lasts approximately <strong>90 minutes</strong> and consists of four stages:</p>
      
      <h3>Stage 1: Light Sleep (N1)</h3>
      <p><strong>Duration:</strong> 1-5 minutes<br>
      Your body begins to relax, eye movements slow, and you can be easily awakened.</p>
      
      <h3>Stage 2: True Sleep (N2)</h3>
      <p><strong>Duration:</strong> 10-25 minutes per cycle<br>
      Heart rate slows, body temperature drops, and brain shows sleep spindles.</p>
      
      <h3>Stage 3: Deep Sleep (N3)</h3>
      <p><strong>Duration:</strong> 20-40 minutes in early cycles<br>
      Difficult to wake, body repairs tissue, strengthens immune system.</p>
      
      <h3>Stage 4: REM Sleep</h3>
      <p><strong>Duration:</strong> 10-60 minutes (increases throughout night)<br>
      Most dreaming occurs, eyes move rapidly, brain is highly active.</p>
      
      <h2>Why Waking at Cycle Ends Matters</h2>
      <p>When you wake during deep sleep, you experience <strong>sleep inertia</strong> — that groggy feeling that can last 30 minutes to 4 hours.</p>
      
      <h2>Research</h2>
      <p><strong>Stanford Sleep Medicine Center (2019):</strong> Participants who woke at cycle ends reported 40% less sleep inertia.</p>
      
      <h2>Practical Tips</h2>
      <ul>
        <li>Calculate backward from wake time: 7:00 AM → sleep at 11:30 PM or 1:00 AM</li>
        <li>Account for 10-20 minutes to fall asleep</li>
        <li>Be consistent with sleep/wake times</li>
        <li>Avoid caffeine and blue light before bed</li>
      </ul>
    `;
    
    contentDiv.innerHTML = articleContent;
  }
}

// ==================== MAIN APP INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
  console.log('Sleep Cycle Calculator initializing...');

  // Initialize core modules
  const calculator = new SleepCalculator(90, 6);
  const themeManager = new ThemeManager('dark');
  const historyManager = new HistoryManager();
  const uiManager = new UIManager(calculator, historyManager, themeManager);

  console.log('Application ready!');
});