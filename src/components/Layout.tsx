import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { updateProfile } from '../store/userSlice';

interface NavigationItem {
  name: string;
  path: string;
  icon: string;
  description: string;
}

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { profile } = useSelector((state: RootState) => state.user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    // @ts-ignore - Temporarily ignore type error for logout
    dispatch(updateProfile(null));
    navigate('/login');
  };

  const navigationItems: NavigationItem[] = [
    { 
      name: 'Get Started', 
      path: '/get-started', 
      icon: '🚀',
      description: 'Begin your legacy journey with our guided questionnaire'
    },
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: '📊',
      description: 'Overview of your estate portfolio'
    },
    {
      name: 'My Documents',
      path: '/documents',
      icon: '📄',
      description: 'Manage all your estate planning documents'
    },
    { 
      name: 'Assets', 
      path: '/assets', 
      icon: '💰',
      description: 'Manage your assets and property'
    },
    { 
      name: 'Liabilities', 
      path: '/liabilities', 
      icon: '📊',
      description: 'Track your debts and obligations'
    },
    { 
      name: 'Beneficiaries', 
      path: '/beneficiaries', 
      icon: '👥',
      description: 'Manage your beneficiaries'
    },
    { 
      name: 'Profile', 
      path: '/profile', 
      icon: '👤',
      description: 'View and edit your profile'
    }
  ];

  const renderNavigationItem = (item: NavigationItem) => (
    <Link
      key={item.path}
      to={item.path}
      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
        location.pathname === item.path
          ? 'bg-[#1D1F23] text-white'
          : 'text-[#989AA1] hover:text-white hover:bg-[#1D1F23]'
      }`}
    >
      <span className="mr-3">{item.icon}</span>
      <span>{item.name}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#000000] font-['Inter']">
      {/* Top Navigation */}
      <div className="fixed top-0 z-50 w-full border-b border-[#1D1F23] bg-[#000000]">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-white">Legacy</h1>
          </div>

          {/* User section */}
          <div className="flex items-center">
            {profile && (
              <button
                onClick={handleLogout}
                className="text-sm text-[#989AA1] hover:text-white transition-colors"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex pt-14">
        {/* Sidebar Navigation */}
        <div className="fixed w-64 h-full bg-[#000000] border-r border-[#1D1F23] p-4">
          <nav className="space-y-1">
            {navigationItems.map(item => renderNavigationItem(item))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout; 