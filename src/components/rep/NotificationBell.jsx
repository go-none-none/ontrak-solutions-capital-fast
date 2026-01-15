import React, { useState, useContext } from 'react';
import { Bell, X } from 'lucide-react';
import { NotificationContext } from '../context/NotificationContext';
import { Button } from '@/components/ui/button';

export default function NotificationBell() {
  const { notifications, removeNotification, clearAllNotifications } = useContext(NotificationContext);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.length;

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-96 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-xs text-slate-600 hover:text-slate-900"
              >
                Clear all
              </button>
            )}
          </div>

          {unreadCount === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Bell className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {notifications.map(notif => (
                <a
                  key={notif.id}
                  href={notif.link}
                  onClick={() => setIsOpen(false)}
                  className="block p-3 rounded-lg hover:bg-slate-100 transition-colors border-l-4 border-orange-600 bg-orange-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                      <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{formatTime(notif.timestamp)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeNotification(notif.id);
                      }}
                      className="ml-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}