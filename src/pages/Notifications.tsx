import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

const Notifications: React.FC = () => {
  // This will be connected to your notifications state once implemented
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Document Updated',
      message: 'Your living trust document has been successfully updated.',
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: '2',
      title: 'Reminder',
      message: 'Please complete your will document setup.',
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false
    }
  ];

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 text-green-500';
      case 'error':
        return 'bg-red-500/10 text-red-500';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'bg-blue-500/10 text-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Notifications</h1>
      </div>

      <div className="grid gap-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border border-[#1D1F23] ${
              notification.read ? 'bg-[#101113]' : 'bg-[#1D1F23]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-medium text-white">
                    {notification.title}
                  </h3>
                  <span
                    className={`text-sm px-2 py-0.5 rounded ${getNotificationColor(
                      notification.type
                    )}`}
                  >
                    {notification.type}
                  </span>
                  {!notification.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  )}
                </div>
                <p className="text-[#989AA1]">{notification.message}</p>
                <p className="text-sm text-[#989AA1] mt-2">
                  {new Date(notification.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-8 text-[#989AA1]">
            <p>No notifications at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications; 