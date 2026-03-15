/**
 * Sleep Cycle Calculator - History Manager
 * @module history
 */

export class HistoryManager {
  constructor(maxEntries = 50) {
    this.maxEntries = maxEntries;
    this.history = [];
    this.loadHistory();
  }

  addEntry(sleepTime, wakeTimes, quality, notes = '') {
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
      quality: quality || this.assessQuality(wakeTimes),
      notes,
      date: new Date().toLocaleDateString()
    };

    this.history.unshift(entry);
    
    // Keep only max entries
    if (this.history.length > this.maxEntries) {
      this.history = this.history.slice(0, this.maxEntries);
    }

    this.saveHistory();
    return entry;
  }

  assessQuality(wakeTimes) {
    // Quality based on completing 5-6 cycles
    const hasIdealCycles = wakeTimes.some(wt => wt.cycleNumber >= 5);
    return hasIdealCycles ? 'optimal' : 'suboptimal';
  }

  getHistory(options = {}) {
    let filtered = [...this.history];

    if (options.startDate) {
      filtered = filtered.filter(e => new Date(e.timestamp) >= options.startDate);
    }

    if (options.endDate) {
      filtered = filtered.filter(e => new Date(e.timestamp) <= options.endDate);
    }

    if (options.quality) {
      filtered = filtered.filter(e => e.quality === options.quality);
    }

    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
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
    
    // Count sleep times
    const sleepTimeCounts = {};
    this.history.forEach(entry => {
      const time = new Date(entry.sleepTime).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      sleepTimeCounts[time] = (sleepTimeCounts[time] || 0) + 1;
    });

    // Find most common sleep time
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

  deleteEntry(entryId) {
    const index = this.history.findIndex(e => e.id === entryId);
    if (index !== -1) {
      this.history.splice(index, 1);
      this.saveHistory();
      return true;
    }
    return false;
  }

  clearHistory() {
    this.history = [];
    this.saveHistory();
  }

  exportHistory() {
    const data = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      entries: this.history
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `sleep-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  importHistory(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      if (data.version && data.entries) {
        this.history = [...data.entries, ...this.history].slice(0, this.maxEntries);
        this.saveHistory();
        return true;
      }
    } catch (e) {
      console.error('Failed to import history:', e);
    }
    return false;
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