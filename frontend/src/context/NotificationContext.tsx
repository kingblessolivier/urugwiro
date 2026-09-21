import React, { createContext, useContext, useEffect, useState } from 'react';
import { Bell, XCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'repost' | 'message' | 'system';
  message: string;
  link?: string;
  createdAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Notification) => void;
  markAsRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode, userId: string }> = ({ children, userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const wsProto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${wsProto}://${window.location.host}/ws/notifications/${userId}/`);

    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.type === 'notification') {
        const newNotif: Notification = {
          id: Math.random().toString(36).substr(2, 9),
          type: d.notification_type,
          message: d.message,
          link: d.link,
          createdAt: new Date(),
        };
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Trigger global toast event
        window.dispatchEvent(new CustomEvent('urugwiro-toast', { detail: newNotif }));
      } else if (d.type === 'init') {
        setUnreadCount(d.unread_count);
      }
    };

    return () => ws.close();
  }, [userId]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification: (n) => setNotifications(prev => [n, ...prev]), markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
