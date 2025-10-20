
import { useState, useEffect, useCallback } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Set initial permission status on component mount
    setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(setPermission);
    } else if (Notification.permission === 'denied') {
        alert("Notifications are blocked. Please enable them in your browser settings to receive live updates.");
    }
  }, []);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
      // Check if the page is visible. If not, a notification is more useful.
      // If visible, the UI change is already an indicator, but notification confirms the action.
      const notification = new Notification(title, { ...options, tag: 'team-break-tracker' });
    }
  }, []);

  return { permission, requestPermission, showNotification };
}
