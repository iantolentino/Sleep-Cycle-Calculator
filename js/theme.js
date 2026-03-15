/**
 * Sleep Cycle Calculator - Theme Management
 * @module theme
 */

import { loadFromStorage, saveToStorage } from './utils.js';

/**
 * Theme Manager class to handle dark/light mode
 */
export class ThemeManager {
  /**
   * Create a ThemeManager instance
   * @param {string} defaultTheme - 'dark' or 'light'
   */
  constructor(defaultTheme = 'dark') {
    this.themes = ['dark', 'light'];
    this.icons = {
      dark: '✹',
      light: '⏾'
    };
    this.currentTheme = loadFromStorage('theme', defaultTheme);
    this.init();
  }

  /**
   * Initialize theme manager
   */
  init() {
    this.applyTheme(this.currentTheme);
    this.setupListener();
  }

  /**
   * Apply theme to document body
   * @param {string} theme - Theme to apply
   */
  applyTheme(theme) {
    if (!this.themes.includes(theme)) {
      console.warn(`Invalid theme: ${theme}, falling back to dark`);
      theme = 'dark';
    }

    // Remove existing theme classes
    this.themes.forEach(t => {
      document.body.classList.remove(t);
    });

    // Add new theme class
    document.body.classList.add(theme);
    this.currentTheme = theme;

    // Update icon if it exists
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.textContent = this.icons[theme];
    }

    // Save preference
    saveToStorage('theme', theme);
  }

  /**
   * Toggle between dark and light themes
   * @returns {string} New theme
   */
  toggle() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    
    // Add rotation animation
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.classList.add('rotate');
      setTimeout(() => icon.classList.remove('rotate'), 500);
    }

    return newTheme;
  }

  /**
   * Set up theme toggle button listener
   */
  setupListener() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
    }
  }

  /**
   * Get current theme
   * @returns {string} Current theme
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Check if dark mode is active
   * @returns {boolean}
   */
  isDark() {
    return this.currentTheme === 'dark';
  }
}