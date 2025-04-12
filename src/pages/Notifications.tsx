import React from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const Notifications: React.FC = () => {
  const [notifications] = React.useState<Notification[]>([
    {
      id: '1',
      title: 'Welcome to Legacy',
      message: 'Thank you for starting your estate planning journey with us.',
      date: new Date().toLocaleDateString(),
      read: false
    },
    {
      id: '2',
      title: 'Complete Your Profile',
      message: 'Please complete your profile to get personalized estate planning recommendations.',
      date: new Date().toLocaleDateString(),
      read: false
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Notifications</h1>
        <button className="px-4 py-2 text-sm text-[#989AA1] hover:text-white transition-colors">
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border ${
              notification.read ? 'bg-[#101113] border-[#1D1F23]' : 'bg-[#1D1F23] border-[#2D2F33]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-white font-medium">{notification.title}</h3>
                <p className="text-sm text-[#989AA1]">{notification.message}</p>
              </div>
              <span className="text-xs text-[#989AA1]">{notification.date}</span>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-8 text-[#989AA1]">
            <p>No new notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications; 