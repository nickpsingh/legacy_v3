import React, { useState } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  isRead: boolean;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Document Update Required',
      message: 'Your will needs to be reviewed and updated.',
      type: 'warning',
      date: '2024-03-15T10:00:00Z',
      isRead: false,
    },
    {
      id: '2',
      title: 'Asset Value Updated',
      message: 'Your investment portfolio value has been automatically updated.',
      type: 'info',
      date: '2024-03-14T15:30:00Z',
      isRead: true,
    },
    {
      id: '3',
      title: 'Beneficiary Added',
      message: 'New beneficiary has been successfully added to your estate plan.',
      type: 'success',
      date: '2024-03-13T09:15:00Z',
      isRead: true,
    }
  ]);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };

  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return 'bg-blue-500 bg-opacity-20 text-blue-500';
      case 'warning':
        return 'bg-yellow-500 bg-opacity-20 text-yellow-500';
      case 'success':
        return 'bg-green-500 bg-opacity-20 text-green-500';
      case 'error':
        return 'bg-red-500 bg-opacity-20 text-red-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Notifications</h1>
        <div className="flex items-center space-x-4">
          <button className="text-sm text-[#989AA1] hover:text-white transition-colors">
            Mark all as read
          </button>
          <button className="text-sm text-[#989AA1] hover:text-white transition-colors">
            Clear all
          </button>
        </div>
      </div>

      <div className="bg-[#101113] rounded-lg border border-[#1D1F23]">
        <div className="divide-y divide-[#1D1F23]">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 hover:bg-[#1A1B1E] transition-colors ${
                !notification.isRead ? 'bg-[#1A1B1E]' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeStyles(
                        notification.type
                      )}`}
                    >
                      {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                    </span>
                    <span className="text-sm text-[#989AA1] ml-2">
                      {formatDate(notification.date)}
                    </span>
                  </div>
                  <h3 className="text-white font-medium mt-1">{notification.title}</h3>
                  <p className="text-[#989AA1] mt-1">{notification.message}</p>
                </div>
                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-sm text-[#5E6AD2] hover:text-[#6E7AE7] ml-4"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-8 text-[#989AA1]">
              <p>No notifications to display.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications; 