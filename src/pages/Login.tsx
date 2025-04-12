import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateProfile } from '../store/userSlice';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = () => {
    // Set a default user profile
    dispatch(updateProfile({
      firstName: 'Test',
      lastName: 'User',
      name: 'Test User',
      email: 'test@example.com',
      phone: '(555) 123-4567',
      age: '35',
      state: 'California',
      maritalStatus: 'single',
      address: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA'
      },
      financialInfo: {
        assets: [
          {
            type: 'Real Estate',
            value: 500000,
            description: 'Primary Residence',
            source: 'manual',
            lastUpdated: new Date().toISOString()
          },
          {
            type: 'Investment',
            value: 250000,
            description: '401(k)',
            source: 'manual',
            lastUpdated: new Date().toISOString()
          }
        ],
        totalValue: 750000,
        totalAssets: 750000,
        totalLiabilities: 315000,
        lastUpdated: new Date().toISOString(),
        liabilities: [
          { 
            type: 'Mortgage', 
            amount: 300000, 
            description: 'Home Loan',
            lastUpdated: new Date().toISOString()
          },
          { 
            type: 'Auto Loan', 
            amount: 15000, 
            description: 'Car Loan',
            lastUpdated: new Date().toISOString()
          }
        ]
      }
    }));
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Estate Planner
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Secure your legacy with our comprehensive estate planning tools
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={handleLogin}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Sign in to get started
          </button>
          <div className="text-sm text-center">
            <p className="text-gray-500">
              By signing in, you agree to our{' '}
              <button className="font-medium text-primary-600 hover:text-primary-500">
                Terms of Service
              </button>{' '}
              and{' '}
              <button className="font-medium text-primary-600 hover:text-primary-500">
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 