import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { fetchDocumentsFromDB } from '../features/documents/documentsSlice';
import { generateNotificationsFromDocuments, getNotificationColor } from '../services/notifications.service';

const Notifications: React.FC = () => {
  const dispatch = useDispatch();
  const { documents } = useSelector((state: RootState) => state.documents);
  
  const DEMO_USER_UID = 'ec540338-923f-400d-a185-6028c5d5f823';
  
  useEffect(() => {
    // @ts-ignore
    dispatch(fetchDocumentsFromDB(DEMO_USER_UID));
  }, [dispatch]);

  // Generate notifications from actual documents
  const notifications = documents ? generateNotificationsFromDocuments(documents) : [];

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
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-[#989AA1]">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                  {notification.documentType && (
                    <span className="text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded">
                      {notification.documentType.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  )}
                </div>
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