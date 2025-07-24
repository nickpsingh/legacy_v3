import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { UserProfile, updateProfile } from '../features/user/userSlice';

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

  useEffect(() => {
    // Initialize default user profile if none exists
    if (!profile) {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          dispatch(updateProfile(parsedProfile));
        } catch (error) {
          console.error('Error parsing saved profile:', error);
          initializeDefaultProfile();
        }
      } else {
        initializeDefaultProfile();
      }
    }
  }, [profile, dispatch]);

  const initializeDefaultProfile = () => {
    const defaultProfile: UserProfile = {
      uid: crypto.randomUUID(),
      firstName: 'Demo',
      lastName: 'User',
      name: 'Demo User',
      email: 'demo@example.com',
      phone: '',
      age: 0,
      dateOfBirth: '',
      maritalStatus: 'single',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      state: '',
      financialInfo: {
        assets: [],
        liabilities: [],
        netWorth: 0,
        plaidConnected: false,
        totalValue: 0,
        lastUpdated: new Date().toISOString()
      },
      beneficiaries: [],
      lastUpdated: new Date().toISOString()
    };
    dispatch(updateProfile(defaultProfile));
    localStorage.setItem('userProfile', JSON.stringify(defaultProfile));
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
      name: 'Assets', 
      path: '/assets', 
      icon: '🏠',
      description: 'Manage your properties and investments'
    },
    { 
      name: 'Liabilities', 
      path: '/liabilities', 
      icon: '💳',
      description: 'Track debts and obligations'
    },
    { 
      name: 'People', 
      path: '/people', 
      icon: '👥',
      description: 'Manage beneficiaries and contacts'
    },
    { 
      name: 'Documents', 
      path: '/documents', 
      icon: '📋',
      description: 'Create and manage estate documents'
    },
    { 
      name: 'Profile', 
      path: '/profile', 
      icon: '👤',
      description: 'Personal information and settings'
    },
    { 
      name: 'Notifications', 
      path: '/notifications', 
      icon: '🔔',
      description: 'Important updates and reminders'
    }
  ];

  const handleLogout = () => {
    // Simple logout - just redirect to dashboard
    navigate('/dashboard');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-[#101113] shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-[#1D1F23]">
            <Link to="/dashboard" className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold">L</span>
              </div>
              <span className="text-xl font-bold text-white">Legacy V2</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-500 text-white'
                    : 'text-[#989AA1] hover:bg-[#1D1F23] hover:text-white'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs opacity-75">{item.description}</div>
                </div>
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="px-4 py-4 border-t border-[#1D1F23]">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-medium">
                  {profile?.firstName?.[0] || 'D'}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">
                  {profile?.name || 'Demo User'}
                </div>
                <div className="text-xs text-[#989AA1]">
                  {profile?.email || 'demo@example.com'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-[#101113] border-b border-[#1D1F23] h-16 flex items-center justify-between px-6">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-white">
              {navigationItems.find(item => item.path === location.pathname)?.name || 'Legacy V2'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="text-[#989AA1] hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 