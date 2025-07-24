import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { UserProfile, updateProfile } from '../features/user/userSlice';
import { LAYOUT_NAVIGATION_ITEMS, NavigationItem } from '../constants/navigation';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { profile } = useSelector((state: RootState) => state.user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Initialize default user profile if none exists
    if (!profile || (!profile.uid && !profile.name)) {
      const newProfile: UserProfile = {
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
      dispatch(updateProfile(newProfile));
    }
  }, [dispatch, profile]);

  const handleLogout = () => {
    dispatch(updateProfile({
      uid: '',
      firstName: '',
      lastName: '',
      name: '',
      email: '',
      phone: '',
      age: 0,
      dateOfBirth: '',
      maritalStatus: 'single',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      state: '',
      financialInfo: {
        assets: [],
        liabilities: [],
        lastUpdated: new Date().toISOString(),
        totalValue: 0,
      },
      beneficiaries: [],
      lastUpdated: new Date().toISOString()
    }));
    navigate('/dashboard');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigationItems = LAYOUT_NAVIGATION_ITEMS;

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
            <button
              onClick={handleLogout}
              className="text-sm text-[#989AA1] hover:text-white transition-colors"
            >
              Sign out
            </button>
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
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-[#989AA1] hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex pt-14">
        {/* Sidebar Navigation */}
        <div className="hidden md:block fixed w-64 h-full bg-[#000000] border-r border-[#1D1F23] p-4">
          <nav className="space-y-1">
            {navigationItems.map(item => renderNavigationItem(item))}
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