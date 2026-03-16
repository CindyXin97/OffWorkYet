// Browser Notification utilities

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendNotification = (title: string, options?: NotificationOptions): void => {
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/rice-ball.png',
      badge: '/rice-ball.png',
      ...options,
    });
  }
};

export const notify8Hours = (): void => {
  sendNotification('Time to go home! 🍣', {
    body: "You've worked 8 hours today. Your hourly rate is dropping!",
    tag: '8-hour-reminder',
    requireInteraction: true,
  });
};

export const notify10Hours = (): void => {
  sendNotification('Seriously, go home! 🍞', {
    body: "You've worked 10 hours! You're in Bread mode now. 😰",
    tag: '10-hour-reminder',
    requireInteraction: true,
  });
};
