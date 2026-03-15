/**
 * Sleep Cycle Calculator - UI Management
 * @module ui
 */

import { SleepCalculator } from './calculator.js';
import { timeStringToDate, formatTime } from './utils.js';

/**
 * UI Manager class to handle all DOM interactions
 */
export class UIManager {
  /**
   * Create a UIManager instance
   * @param {SleepCalculator} calculator - Calculator instance
   */
  constructor(calculator) {
    this.calculator = calculator;
    this.elements = this.cacheElements();
    this.init();
  }

  /**
   * Cache DOM elements for better performance
   * @returns {Object} Cached elements
   */
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

  /**
   * Initialize UI manager
   */
  init() {
    this.setupEventListeners();
    this.setDefaultTime();
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    const { elements } = this;

    // Main calculator buttons
    elements.rightNowBtn.addEventListener('click', () => {
      this.handleRightNow();
    });

    elements.selectTimeBtn.addEventListener('click', () => {
      this.handleSelectedTime();
    });

    elements.downloadBtn.addEventListener('click', () => {
      this.handleDownload();
    });

    // Info panel
    if (elements.infoToggle) {
      elements.infoToggle.addEventListener('click', () => {
        this.toggleInfoPanel();
      });
    }

    // Article modal
    if (elements.expandArticle) {
      elements.expandArticle.addEventListener('click', () => {
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

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === elements.articleModal) {
        this.closeArticleModal();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && elements.articleModal.style.display === 'block') {
        this.closeArticleModal();
      }
    });
  }

  /**
   * Set default time to 11:00 PM
   */
  setDefaultTime() {
    if (this.elements.sleepInput && !this.elements.sleepInput.value) {
      this.elements.sleepInput.value = '23:00';
    }
  }

  /**
   * Handle "Right Now" button click
   */
  handleRightNow() {
    const now = new Date();
    this.elements.sleepInput.value = formatTime(now).replace(/\s?[AP]M/, '');
    this.calculateAndDisplay(now);
  }

  /**
   * Handle "Selected Time" button click
   */
  handleSelectedTime() {
    const timeStr = this.elements.sleepInput.value;
    if (!timeStr) {
      this.showNotification('Please select a sleep time first', 'warning');
      return;
    }

    const sleepTime = timeStringToDate(timeStr);
    if (!sleepTime) {
      this.showNotification('Invalid time format', 'error');
      return;
    }

    this.calculateAndDisplay(sleepTime);
  }

  /**
   * Calculate and display results
   * @param {Date} sleepTime - Sleep start time
   */
  calculateAndDisplay(sleepTime) {
    try {
      const calculation = this.calculator.calculate(sleepTime);
      const html = this.calculator.formatResults(calculation);
      
      this.elements.resultContent.innerHTML = html;
      this.elements.result.style.display = 'block';
      
      // Smooth scroll to results
      this.elements.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (error) {
      console.error('Calculation error:', error);
      this.showNotification('Error calculating sleep times', 'error');
    }
  }

  /**
   * Handle download button click
   */
  async handleDownload() {
    const { result, resultContent, downloadBtn } = this.elements;

    if (!resultContent.innerHTML.trim()) {
      this.showNotification('No result to download', 'warning');
      return;
    }

    // Hide download button temporarily
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

      // Create download link
      const link = document.createElement('a');
      link.download = `sleep-cycles-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      this.showNotification('Image downloaded successfully!', 'success');
    } catch (error) {
      console.error('Download error:', error);
      this.showNotification('Failed to create image', 'error');
    } finally {
      downloadBtn.style.display = originalDisplay;
    }
  }

  /**
   * Toggle info panel visibility
   */
  toggleInfoPanel() {
    const { infoPanel } = this.elements;
    const isVisible = infoPanel.style.display !== 'none';
    
    infoPanel.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
      infoPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Open article modal
   */
  openArticleModal() {
    this.elements.articleModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Load article content if not already loaded
    this.loadArticleContent();
  }

  /**
   * Close article modal
   */
  closeArticleModal() {
    this.elements.articleModal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
  }

  /**
   * Load article content into modal
   */
  async loadArticleContent() {
    const contentDiv = document.getElementById('articleContent');
    if (contentDiv.innerHTML.trim()) return; // Already loaded

    try {
      const response = await fetch('articles/sleep-science.md');
      const markdown = await response.text();
      
      // Simple markdown to HTML conversion (you might want to use a library)
      const html = this.markdownToHtml(markdown);
      contentDiv.innerHTML = html;
    } catch (error) {
      console.error('Failed to load article:', error);
      contentDiv.innerHTML = '<p>Sorry, article could not be loaded.</p>';
    }
  }

  /**
   * Simple markdown to HTML converter (for demo purposes)
   * @param {string} markdown - Markdown text
   * @returns {string} HTML
   */
  markdownToHtml(markdown) {
    return markdown
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" style="max-width:100%">')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  }

  /**
   * Show notification to user
   * @param {string} message - Message to show
   * @param {string} type - 'success', 'warning', 'error'
   */
  showNotification(message, type = 'info') {
    // Simple alert for now - you could enhance this with a toast notification
    alert(message);
  }
}