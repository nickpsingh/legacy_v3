import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../app/store';
import { Link, useNavigate } from 'react-router-dom';
import { Asset, Liability, UserProfile, updateProfile } from '../features/user/userSlice';
import { FiArrowRight } from 'react-icons/fi';
import type { IconType } from 'react-icons';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success';
  message: string;
  date: string;
}

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'info',
    message: 'Your will document has been updated',
    date: '2024-03-10T10:00:00Z'
  },
  {
    id: '2',
    type: 'success',
    message: 'Living trust document submitted successfully',
    date: '2024-03-09T15:30:00Z'
  },
  {
    id: '3',
    type: 'warning',
    message: 'Power of attorney document requires review',
    date: '2024-03-08T09:15:00Z'
  }
];

const MOCK_DOCUMENTS = [
  {
    id: '1',
    title: 'Last Will and Testament',
    status: 'submitted',
    lastUpdated: '2024-03-10T10:00:00Z'
  },
  {
    id: '2',
    title: 'Living Trust',
    status: 'in_progress',
    lastUpdated: '2024-03-09T15:30:00Z'
  },
  {
    id: '3',
    title: 'Power of Attorney',
    status: 'submitted',
    lastUpdated: '2024-03-08T09:15:00Z'
  }
];

// Create a properly typed arrow icon component
const ArrowIcon = () => {
  const Icon = FiArrowRight as React.ComponentType<{ size?: number }>;
  return <Icon size={18} />;
};

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile } = useSelector((state: RootState) => state.user);

  // Profile initialization is now handled by Layout component
  // No Auth0 initialization needed

  const calculateAssetTotal = (assets: Asset[]): number => {
    return assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  };

  const calculateLiabilityTotal = (liabilities: Liability[]): number => {
    return liabilities.reduce((sum, liability) => sum + (liability.amount || 0), 0);
  };

  const totalAssets = calculateAssetTotal(profile?.financialInfo?.assets ?? []);
  const totalLiabilities = calculateLiabilityTotal(profile?.financialInfo?.liabilities ?? []);
  const netWorth = totalAssets - totalLiabilities;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Welcome back, {profile?.firstName || 'Guest'}</h1>

        <div className="grid grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="col-span-2 space-y-8">
            {/* Recent Activity */}
            <div className="bg-[#111] rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Recent Activity</h2>
                <button 
                  onClick={() => navigate('/notifications')}
                  className="text-blue-500 hover:text-blue-400 flex items-center gap-2"
                >
                  View All <ArrowIcon />
                </button>
              </div>
              <div className="space-y-4">
                {MOCK_NOTIFICATIONS.map((notification) => (
                  <div key={notification.id} className="bg-[#1A1A1A] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-200">{notification.message}</span>
                      <span className="text-gray-400 text-sm">{formatDate(notification.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Documents */}
            <div className="bg-[#111] rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">My Documents</h2>
                <button
                  onClick={() => navigate('/documents')}
                  className="text-blue-500 hover:text-blue-400 flex items-center gap-2"
                >
                  View All <ArrowIcon />
                </button>
              </div>
              <div className="space-y-4">
                {MOCK_DOCUMENTS.map((doc) => (
                  <div key={doc.id} className="bg-[#1A1A1A] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-200">{doc.title}</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        doc.status === 'submitted' 
                          ? 'bg-green-900 text-green-200' 
                          : 'bg-yellow-900 text-yellow-200'
                      }`}>
                        {doc.status === 'submitted' ? 'Submitted' : 'In Progress'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">Last updated {formatDate(doc.lastUpdated)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Net Worth */}
          <div className="bg-[#111] rounded-xl p-4">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-1">Net Worth</h2>
              <p className="text-3xl font-bold">${netWorth.toLocaleString()}</p>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-400">Total Assets</p>
                  <Link to="/assets" className="text-blue-500 hover:text-blue-400 text-sm">View →</Link>
                </div>
                <p className="text-xl font-bold text-green-500">${totalAssets.toLocaleString()}</p>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-400">Total Liabilities</p>
                  <Link to="/liabilities" className="text-blue-500 hover:text-blue-400 text-sm">View →</Link>
                </div>
                <p className="text-xl font-bold text-red-500">${totalLiabilities.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 