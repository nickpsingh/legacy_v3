import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { Link, useNavigate } from 'react-router-dom';
import { Asset, Liability } from '../features/user/userSlice';
import { FiArrowRight } from 'react-icons/fi';

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
  const navigate = useNavigate();
  const { profile } = useSelector((state: RootState) => state.user);

  const calculateAssetTotal = (assets: Asset[]): number => {
    return assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  };

  const calculateLiabilityTotal = (liabilities: Liability[]): number => {
    return liabilities.reduce((sum, liability) => sum + (liability.amount || 0), 0);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const assets = profile?.financialInfo?.assets || [];
  const liabilities = profile?.financialInfo?.liabilities || [];
  const assetTotal = calculateAssetTotal(assets);
  const liabilityTotal = calculateLiabilityTotal(liabilities);
  const netWorth = assetTotal - liabilityTotal;

  const documentProgress = {
    completed: MOCK_DOCUMENTS.filter(doc => doc.status === 'submitted').length,
    total: MOCK_DOCUMENTS.length
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {profile?.firstName || 'Demo User'}!
        </h1>
        <p className="text-blue-100">
          Your estate planning progress: {documentProgress.completed} of {documentProgress.total} documents completed
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#101113] rounded-lg p-6 border border-[#1D1F23]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[#989AA1]">Total Assets</h3>
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">📈</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(assetTotal)}</p>
          <Link 
            to="/assets"
            className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-flex items-center"
          >
            Manage Assets
            <ArrowIcon />
          </Link>
        </div>

        <div className="bg-[#101113] rounded-lg p-6 border border-[#1D1F23]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[#989AA1]">Total Liabilities</h3>
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">📉</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(liabilityTotal)}</p>
          <Link 
            to="/liabilities"
            className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-flex items-center"
          >
            Manage Liabilities
            <ArrowIcon />
          </Link>
        </div>

        <div className="bg-[#101113] rounded-lg p-6 border border-[#1D1F23]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[#989AA1]">Net Worth</h3>
            <div className={`w-8 h-8 ${netWorth >= 0 ? 'bg-blue-500' : 'bg-yellow-500'} rounded-lg flex items-center justify-center`}>
              <span className="text-white text-lg">💰</span>
            </div>
          </div>
          <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-400' : 'text-yellow-400'}`}>
            {formatCurrency(netWorth)}
          </p>
          <Link 
            to="/profile"
            className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-flex items-center"
          >
            View Profile
            <ArrowIcon />
          </Link>
        </div>
      </div>

      {/* Documents and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <div className="bg-[#101113] rounded-lg p-6 border border-[#1D1F23]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Documents</h2>
            <Link 
              to="/documents"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_DOCUMENTS.slice(0, 3).map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-[#1A1B1E] rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-white">{doc.title}</h3>
                  <p className="text-xs text-[#989AA1]">
                    Updated {formatDate(doc.lastUpdated)}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    doc.status === 'submitted'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {doc.status === 'submitted' ? 'Complete' : 'In Progress'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-[#101113] rounded-lg p-6 border border-[#1D1F23]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <Link 
              to="/notifications"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_NOTIFICATIONS.slice(0, 3).map((notification) => (
              <div key={notification.id} className="flex items-start space-x-3 p-3 bg-[#1A1B1E] rounded-lg">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    notification.type === 'info'
                      ? 'bg-blue-400'
                      : notification.type === 'success'
                      ? 'bg-green-400'
                      : 'bg-yellow-400'
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm text-white">{notification.message}</p>
                  <p className="text-xs text-[#989AA1] mt-1">
                    {formatDate(notification.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#101113] rounded-lg p-6 border border-[#1D1F23]">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/will/create"
            className="flex flex-col items-center p-4 bg-[#1A1B1E] rounded-lg hover:bg-[#2D2F34] transition-colors"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
              <span className="text-white text-xl">📝</span>
            </div>
            <span className="text-sm font-medium text-white">Create Will</span>
          </Link>

          <Link
            to="/trust/create"
            className="flex flex-col items-center p-4 bg-[#1A1B1E] rounded-lg hover:bg-[#2D2F34] transition-colors"
          >
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
              <span className="text-white text-xl">🏛️</span>
            </div>
            <span className="text-sm font-medium text-white">Create Trust</span>
          </Link>

          <Link
            to="/assets"
            className="flex flex-col items-center p-4 bg-[#1A1B1E] rounded-lg hover:bg-[#2D2F34] transition-colors"
          >
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-3">
              <span className="text-white text-xl">🏠</span>
            </div>
            <span className="text-sm font-medium text-white">Add Assets</span>
          </Link>

          <Link
            to="/people"
            className="flex flex-col items-center p-4 bg-[#1A1B1E] rounded-lg hover:bg-[#2D2F34] transition-colors"
          >
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-3">
              <span className="text-white text-xl">👥</span>
            </div>
            <span className="text-sm font-medium text-white">Add People</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 