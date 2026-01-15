import React, { createContext, useState, useCallback, useEffect } from 'react';

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [notifiedSmsSids, setNotifiedSmsSids] = useState([]);

  // Load notified SMS SIDs from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('notifiedSmsSids');
    if (stored) {
      try {
        setNotifiedSmsSids(JSON.parse(stored));
      } catch (e) {
        setNotifiedSmsSids([]);
      }
    }
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotif = {
      id,
      timestamp: new Date(),
      ...notification
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Track SMS SID if it exists
    if (notification.smsSid) {
      setNotifiedSmsSids(prev => {
        const updated = [...new Set([...prev, notification.smsSid])];
        localStorage.setItem('notifiedSmsSids', JSON.stringify(updated));
        return updated;
      });
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const isSmsSidNotified = useCallback((smsSid) => {
    return notifiedSmsSids.includes(smsSid);
  }, [notifiedSmsSids]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAllNotifications,
      isSmsSidNotified,
      notifiedSmsSids
    }}>
      {children}
    </NotificationContext.Provider>
  );
}