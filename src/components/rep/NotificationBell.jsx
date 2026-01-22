import React, { useContext, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Bell, X } from 'lucide-react';
import { NotificationContext } from '../context/NotificationContext';

export default function NotificationBell() {
  const { notifications, removeNotification } = useContext(NotificationContext);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {notifications.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <p>No notifications</p>
              </div>
            ) : (
              <div className="space-y-0">
                {notifications.map(notification => (
                  <div key={notification.id} className="p-4 border-b hover:bg-slate-50 transition-colors flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm">{notification.title}</p>
                      <p className="text-xs text-slate-600 mt-1">{notification.message}</p>
                      {notification.timestamp && (
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="text-slate-400 hover:text-slate-600 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}