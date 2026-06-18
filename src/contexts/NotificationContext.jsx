import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext({
  unreadCount: 0,
  refreshUnreadCount: () => {},
  markAllRead: async () => {},
});

export function NotificationProvider({ children }) {
  const auth = useAuth();
  const token = auth?.token || null;
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }

    try {
      const res = await api.get('/api/notifications/unread', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(res.data?.unread_count || 0);
    } catch (err) {
      console.error('Failed to refresh unread count:', err);
    }
  }, [token]);

  const markAllRead = useCallback(async () => {
    if (!token) return;

    try {
      await api.put('/api/notifications/read-all', null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshUnreadCount();
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  }, [token, refreshUnreadCount]);

  useEffect(() => {
    if (!token) return;
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [token, refreshUnreadCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
