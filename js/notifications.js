/**
 * Sleep Cycle Calculator - Notification Manager
 * @module notifications
 */

export class NotificationManager {
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
    
    // If time is in the past, schedule for tomorrow
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

  // Handle notification clicks
  setupNotificationListeners() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.action === 'notification-click') {
          this.handleNotificationClick(event.data.notification);
        }
      });
    }
  }

  handleNotificationClick(notification) {
    if (notification.data?.sleepTime) {
      // Focus or open the app
      window.focus();
      
      // Pre-fill the sleep time
      document.getElementById('sleepInput').value = notification.data.sleepTime;
      
      // Trigger calculation
      document.getElementById('selectTimeBtn').click();
    }
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
        // Recreate timeouts for saved reminders
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

  getUpcomingReminders() {
    const now = new Date();
    return this.reminders
      .filter(r => r.reminderTime > now)
      .sort((a, b) => a.reminderTime - b.reminderTime);
  }
}