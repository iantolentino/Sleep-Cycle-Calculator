/**
 * Sleep Cycle Calculator - Core Calculation Logic
 * @module calculator
 */

import { calculateWakeTimes, formatTime } from './utils.js';

/**
 * Sleep Calculator class to manage cycle calculations
 */
export class SleepCalculator {
  /**
   * Create a SleepCalculator instance
   * @param {number} cycleLength - Length of sleep cycle in minutes (default: 90)
   * @param {number} maxCycles - Maximum cycles to calculate (default: 6)
   */
  constructor(cycleLength = 90, maxCycles = 6) {
    this.cycleLength = cycleLength;
    this.maxCycles = maxCycles;
    this.lastCalculation = null;
  }

  /**
   * Calculate wake-up times from sleep start
   * @param {Date} sleepTime - When user falls asleep
   * @returns {Object} Calculation results with metadata
   */
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

  /**
   * Get recommended cycles based on optimal sleep duration
   * @param {Array} wakeTimes - Array of wake time objects
   * @returns {Array} Filtered recommended cycles (5-6 cycles for adults)
   */
  getRecommendedCycles(wakeTimes) {
    return wakeTimes.filter(wt => wt.cycleNumber >= 5);
  }

  /**
   * Format calculation results for display
   * @param {Object} calculation - Calculation object from this.calculate()
   * @returns {string} HTML string for display
   */
  formatResults(calculation) {
    if (!calculation) return '';

    const { wakeTimes, recommendedCycles } = calculation;

    const wakeTimesHtml = wakeTimes.map(wt => `
      <div class="result-line ${wt.cycleNumber >= 5 ? 'recommended' : ''}">
        <span class="cycle-time">${wt.formattedTime}</span>
        <span class="cycle-desc">— ${wt.description}</span>
        ${wt.cycleNumber >= 5 ? '<span class="badge">✨ Ideal</span>' : ''}
      </div>
    `).join('');

    const sleepDuration = wakeTimes[wakeTimes.length - 1].totalSleepHours;

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

  /**
   * Get sleep quality recommendation based on selected wake time
   * @param {Date} wakeTime - Proposed wake time
   * @param {Date} sleepTime - Sleep start time
   * @returns {Object} Quality assessment
   */
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