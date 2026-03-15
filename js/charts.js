/**
 * Sleep Cycle Calculator - Chart Visualization
 * @module charts
 */

export class ChartManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas?.getContext('2d');
    this.chart = null;
  }

  createSleepPatternChart(historyData) {
    if (!this.ctx) return;

    // Destroy existing chart
    if (this.chart) {
      this.chart.destroy();
    }

    const dates = historyData.map(entry => 
      new Date(entry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
    );

    const sleepHours = historyData.map(entry => {
      const sleepDate = new Date(entry.sleepTime);
      const wakeDate = new Date(entry.wakeTimes[entry.wakeTimes.length - 1]?.time || entry.sleepTime);
      return ((wakeDate - sleepDate) / (1000 * 60 * 60)).toFixed(1);
    });

    const cycleCounts = historyData.map(entry => entry.wakeTimes.length);

    // Create gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#4a9eff');
    gradient.addColorStop(1, '#6c5ce7');

    this.chart = new Chart(this.ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Sleep Duration (hours)',
            data: sleepHours,
            borderColor: gradient,
            backgroundColor: 'rgba(74, 158, 255, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y'
          },
          {
            label: 'Sleep Cycles',
            data: cycleCounts,
            borderColor: '#00b894',
            backgroundColor: 'rgba(0, 184, 148, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            labels: {
              color: getComputedStyle(document.body).getPropertyValue('--text-primary')
            }
          },
          tooltip: {
            backgroundColor: getComputedStyle(document.body).getPropertyValue('--bg-card'),
            titleColor: getComputedStyle(document.body).getPropertyValue('--text-primary'),
            bodyColor: getComputedStyle(document.body).getPropertyValue('--text-secondary'),
            borderColor: getComputedStyle(document.body).getPropertyValue('--border-color'),
            borderWidth: 1
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Hours',
              color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
            },
            grid: {
              color: getComputedStyle(document.body).getPropertyValue('--border-color')
            },
            ticks: {
              color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Cycles',
              color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
            },
            grid: {
              drawOnChartArea: false
            },
            ticks: {
              color: getComputedStyle(document.body).getPropertyValue('--text-secondary'),
              stepSize: 1
            }
          },
          x: {
            grid: {
              color: getComputedStyle(document.body).getPropertyValue('--border-color')
            },
            ticks: {
              color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
            }
          }
        }
      }
    });

    return this.chart;
  }

  createCycleDistributionChart(historyData) {
    if (!this.ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    // Count cycle completions
    const cycleCounts = {};
    historyData.forEach(entry => {
      const cycles = entry.wakeTimes.length;
      cycleCounts[cycles] = (cycleCounts[cycles] || 0) + 1;
    });

    const labels = Object.keys(cycleCounts).map(c => `${c} cycles`);
    const data = Object.values(cycleCounts);

    this.chart = new Chart(this.ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#4a9eff',
            '#6c5ce7',
            '#00b894',
            '#fdcb6e',
            '#e17055',
            '#d63031'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: getComputedStyle(document.body).getPropertyValue('--text-primary')
            }
          }
        }
      }
    });

    return this.chart;
  }
}