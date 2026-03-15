/**
 * Sleep Cycle Calculator - Utility Functions
 * @module utils
 */

/**
 * Format a date object to localized time string
 * @param {Date} date - Date object to format
 * @returns {string} Formatted time (HH:MM AM/PM)
 */
export function formatTime(date) {
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

/**
 * Calculate wake-up times based on sleep start and cycle length
 * @param {Date} sleepTime - When user falls asleep
 * @param {number} cycleLength - Length of sleep cycle in minutes (default: 90)
 * @param {number} maxCycles - Maximum number of cycles to calculate (default: 6)
 * @returns {Array<Object>} Array of wake-up time objects
 */
export function calculateWakeTimes(sleepTime, cycleLength = 90, maxCycles = 6) {
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
 * @param {string} timeStr - Time string in HH:MM format
 * @returns {boolean} True if valid
 */
export function isValidTime(timeStr) {
  if (!timeStr) return false;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (
    !isNaN(hours) && !isNaN(minutes) &&
    hours >= 0 && hours <= 23 &&
    minutes >= 0 && minutes <= 59
  );
}

/**
 * Create a Date object from time string (using current date)
 * @param {string} timeStr - Time string in HH:MM format
 * @returns {Date|null} Date object or null if invalid
 */
export function timeStringToDate(timeStr) {
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
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Save data to local storage
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 */
export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

/**
 * Load data from local storage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Retrieved data or default value
 */
export function loadFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
    return defaultValue;
  }
}