interface NotificationOptions {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  persistent?: boolean;
}

class NotificationManager {
  private notifications: Map<string, NotificationOptions & { id: string; timestamp: number }> = new Map();
  private listeners: Set<(notifications: Array<NotificationOptions & { id: string; timestamp: number }>) => void> = new Set();

  show(options: NotificationOptions): string {
    const id = Math.random().toString(36).substr(2, 9);
    const notification = {
      ...options,
      id,
      timestamp: Date.now(),
      duration: options.duration ?? 5000,
    };

    this.notifications.set(id, notification);
    this.notifyListeners();

    // Auto-remove notification after duration (unless persistent)
    if (!options.persistent && notification.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, notification.duration);
    }

    return id;
  }

  remove(id: string): void {
    this.notifications.delete(id);
    this.notifyListeners();
  }

  clear(): void {
    this.notifications.clear();
    this.notifyListeners();
  }

  subscribe(listener: (notifications: Array<NotificationOptions & { id: string; timestamp: number }>) => void): () => void {
    this.listeners.add(listener);
    
    // Send current notifications to new listener
    listener(Array.from(this.notifications.values()));
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const notifications = Array.from(this.notifications.values())
      .sort((a, b) => b.timestamp - a.timestamp);
    
    this.listeners.forEach(listener => listener(notifications));
  }

  // Convenience methods
  success(title: string, message: string, options?: Partial<NotificationOptions>): string {
    return this.show({ ...options, title, message, type: 'success' });
  }

  error(title: string, message: string, options?: Partial<NotificationOptions>): string {
    return this.show({ ...options, title, message, type: 'error', persistent: true });
  }

  warning(title: string, message: string, options?: Partial<NotificationOptions>): string {
    return this.show({ ...options, title, message, type: 'warning' });
  }

  info(title: string, message: string, options?: Partial<NotificationOptions>): string {
    return this.show({ ...options, title, message, type: 'info' });
  }
}

export const notifications = new NotificationManager();

// React hook for using notifications
import { useState, useEffect } from 'react';

export function useNotifications() {
  const [notificationList, setNotificationList] = useState<Array<NotificationOptions & { id: string; timestamp: number }>>([]);

  useEffect(() => {
    const unsubscribe = notifications.subscribe(setNotificationList);
    return unsubscribe;
  }, []);

  return {
    notifications: notificationList,
    show: notifications.show.bind(notifications),
    remove: notifications.remove.bind(notifications),
    clear: notifications.clear.bind(notifications),
    success: notifications.success.bind(notifications),
    error: notifications.error.bind(notifications),
    warning: notifications.warning.bind(notifications),
    info: notifications.info.bind(notifications),
  };
}