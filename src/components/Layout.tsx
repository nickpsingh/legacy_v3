import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';
import { RootState } from '../app/store';
import { updateProfile } from '../features/user/userSlice';

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
  const { isAuthenticated, isLoading, logout, user } = useAuth0();
  const { profile } = useSelector((state: RootState) => state.user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && !profile) {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        dispatch(updateProfile({
          ...parsedProfile,
          email: user.email || parsedProfile.email,
          name: parsedProfile.name || `${parsedProfile.firstName} ${parsedProfile.lastName}`,
        }));
      } else if (user.email === 'nickpaulsingh@gmail.com') {
        dispatch(updateProfile({
          firstName: 'Nick',
          lastName: 'Singh',
          name: 'Nick Singh',
          email: user.email,
          phone: user.phone || '',
          age: 0,
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
          beneficiaries: []
        }));
      }
    }
  }, [isAuthenticated, user, profile, dispatch]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname]);

  const handleLogout = () => {
    if (profile) {
      localStorage.setItem('userProfile', JSON.stringify(profile));
    }
    dispatch(updateProfile(null));
    logout({ logoutParams: { returnTo: window.location.origin + '/login' } });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#000000]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-[#989AA1]">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && location.pathname !== '/login') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#000000] font-['Inter']">
      {/* Top Navigation */}
      <div className="fixed top-0 z-50 w-full border-b border-[#1D1F23] bg-[#000000]">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-xl font-semibold text-white hover:text-blue-500 transition-colors">
              Legacy
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white"
            aria-label="Toggle mobile menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

          {/* User section - Always visible on desktop */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && (
              <>
                <span className="text-sm text-[#989AA1]">
                  {profile?.firstName || user?.name || user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-[#989AA1] hover:text-white transition-colors"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#000000] border-b border-[#1D1F23]">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm ${
                    location.pathname === item.path
                      ? 'bg-[#1D1F23] text-white'
                      : 'text-[#989AA1] hover:text-white hover:bg-[#1D1F23]'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-[#989AA1] hover:text-white transition-colors"
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex pt-14">
        {/* Sidebar Navigation */}
        <div className="hidden md:block fixed w-64 h-full bg-[#000000] border-r border-[#1D1F23] p-4">
          <nav className="space-y-1">
            {navigationItems.map(item => renderNavigationItem(item))}
            {/* Sign out button in sidebar */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="w-full mt-4 px-3 py-2 text-sm text-[#989AA1] hover:text-white transition-colors flex items-center"
              >
                <span className="mr-3">🚪</span>
                Sign out
              </button>
            )}
          </nav>
        </div>

        {/* Main Content */}
        <div className="w-full md:ml-64 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout; 