import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Link } from 'react-router-dom';

interface NotificationWidget {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success';
}

const Dashboard: React.FC = () => {
  const { profile } = useSelector((state: RootState) => state.user);

  // Mock notifications - replace with real data later
  const notifications: NotificationWidget[] = [
    {
      id: '1',
      title: 'Will Update Required',
      message: 'Your will needs to be reviewed and updated.',
      timestamp: new Date().toISOString(),
      type: 'warning'
    },
    {
      id: '2',
      title: 'New Asset Added',
      message: 'Successfully added your investment portfolio.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      type: 'success'
    }
  ];

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-yellow-500 bg-yellow-500/10';
      case 'success': return 'text-green-500 bg-green-500/10';
      default: return 'text-blue-500 bg-blue-500/10';
    }
  };

  if (!profile) {
    return (
      <div className="text-center py-8 text-[#989AA1]">
        <p>Please log in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">
          Welcome back, Nick
        </h1>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Financial Widgets */}
        <div className="lg:col-span-2 space-y-6">
          {/* Net Worth Widget */}
          <div className="bg-[#101113] rounded-lg border border-[#1D1F23] p-6">
            <h2 className="text-lg font-medium text-white mb-4">Net Worth Overview</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-[#989AA1]">Total Assets</p>
                <p className="text-xl font-semibold text-white">
                  ${profile.financialInfo?.totalAssets?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#989AA1]">Total Liabilities</p>
                <p className="text-xl font-semibold text-white">
                  ${profile.financialInfo?.totalLiabilities?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#989AA1]">Net Worth</p>
                <p className="text-xl font-semibold text-white">
                  ${((profile.financialInfo?.totalAssets || 0) - (profile.financialInfo?.totalLiabilities || 0)).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Assets Widget */}
          <div className="bg-[#101113] rounded-lg border border-[#1D1F23] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-white">My Assets</h2>
              <Link to="/assets" className="text-sm text-blue-500 hover:text-blue-400">View All →</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {profile.financialInfo?.assets?.map((asset, index) => (
                <div key={index} className="p-4 bg-[#1A1B1E] rounded-lg">
                  <p className="text-sm text-[#989AA1]">{asset.type}</p>
                  <p className="text-lg font-medium text-white">${asset.value.toLocaleString()}</p>
                  <p className="text-xs text-[#989AA1] mt-1">{asset.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Liabilities Widget */}
          <div className="bg-[#101113] rounded-lg border border-[#1D1F23] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-white">My Liabilities</h2>
              <Link to="/liabilities" className="text-sm text-blue-500 hover:text-blue-400">View All →</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {profile.financialInfo?.liabilities?.map((liability, index) => (
                <div key={index} className="p-4 bg-[#1A1B1E] rounded-lg">
                  <p className="text-sm text-[#989AA1]">{liability.type}</p>
                  <p className="text-lg font-medium text-white">${liability.amount.toLocaleString()}</p>
                  <p className="text-xs text-[#989AA1] mt-1">{liability.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Notifications and Quick Actions */}
        <div className="space-y-6">
          {/* Notifications Widget */}
          <div className="bg-[#101113] rounded-lg border border-[#1D1F23] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-white">Notifications</h2>
              <Link to="/notifications" className="text-sm text-blue-500 hover:text-blue-400">View All →</Link>
            </div>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-4 bg-[#1A1B1E] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getNotificationColor(notification.type)}`}>
                      {notification.type}
                    </span>
                    <span className="text-xs text-[#989AA1]">
                      {new Date(notification.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-white">{notification.title}</h3>
                  <p className="text-sm text-[#989AA1] mt-1">{notification.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Widget */}
          <div className="bg-[#101113] rounded-lg border border-[#1D1F23] p-6">
            <h2 className="text-lg font-medium text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link 
                to="/will/create" 
                className="block p-3 bg-[#1A1B1E] rounded-lg hover:bg-[#2A2B2E] transition-colors"
              >
                <p className="text-white font-medium">Create Will</p>
                <p className="text-sm text-[#989AA1]">Start your estate planning</p>
              </Link>
              <Link 
                to="/trust/create" 
                className="block p-3 bg-[#1A1B1E] rounded-lg hover:bg-[#2A2B2E] transition-colors"
              >
                <p className="text-white font-medium">Create Trust</p>
                <p className="text-sm text-[#989AA1]">Set up a living trust</p>
              </Link>
              <Link 
                to="/beneficiaries" 
                className="block p-3 bg-[#1A1B1E] rounded-lg hover:bg-[#2A2B2E] transition-colors"
              >
                <p className="text-white font-medium">Manage Beneficiaries</p>
                <p className="text-sm text-[#989AA1]">Update your beneficiaries</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 