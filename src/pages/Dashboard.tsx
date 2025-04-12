import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';
import { RootState } from '../app/store';
import { Link } from 'react-router-dom';
import { Asset, Liability, UserProfile, Beneficiary, addDummyFinancialData } from '../features/user/userSlice';
import { FaChartLine, FaFileAlt, FaUsers, FaArrowRight } from 'react-icons/fa';

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.user.profile) as UserProfile | null;
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center py-8">
        <p className="text-[#989AA1] mb-4">Please log in to view your dashboard.</p>
        <Link 
          to="/login"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#000000]">
        <p className="text-white">Please complete your profile to view the dashboard.</p>
      </div>
    );
  }

  const calculateAssetTotal = (assets: Asset[]): number => {
    return assets.reduce((sum, asset) => sum + asset.value, 0);
  };

  const calculateLiabilityTotal = (liabilities: Liability[]): number => {
    return liabilities.reduce((sum, liability) => sum + liability.amount, 0);
  };

  const totalAssets = calculateAssetTotal(profile.financialInfo.assets ?? []);
  const totalLiabilities = calculateLiabilityTotal(profile.financialInfo.liabilities ?? []);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="min-h-screen bg-[#000000] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {profile.firstName}</h1>
          <button
            onClick={() => dispatch(addDummyFinancialData())}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Load Sample Data
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Net Worth Widget */}
          <div className="bg-gradient-to-br from-[#1A1B1E] to-[#1D1F23] rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FaChartLine className="text-blue-500" />
                Net Worth
              </h2>
              <span className="text-2xl font-bold text-blue-500">${netWorth.toLocaleString()}</span>
            </div>
            
            <div className="space-y-4">
              <Link to="/assets" className="block">
                <div className="flex items-center justify-between p-4 bg-[#1D1F23]/50 rounded-lg hover:bg-[#1D1F23] transition-colors">
                  <div>
                    <p className="text-[#989AA1]">Total Assets</p>
                    <p className="text-lg font-medium text-green-500">${totalAssets.toLocaleString()}</p>
                  </div>
                  <FaArrowRight className="text-[#989AA1]" />
                </div>
              </Link>
              
              <Link to="/liabilities" className="block">
                <div className="flex items-center justify-between p-4 bg-[#1D1F23]/50 rounded-lg hover:bg-[#1D1F23] transition-colors">
                  <div>
                    <p className="text-[#989AA1]">Total Liabilities</p>
                    <p className="text-lg font-medium text-red-500">${totalLiabilities.toLocaleString()}</p>
                  </div>
                  <FaArrowRight className="text-[#989AA1]" />
                </div>
              </Link>
            </div>
          </div>

          {/* Documents Widget */}
          <div className="bg-gradient-to-br from-[#1A1B1E] to-[#1D1F23] rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FaFileAlt className="text-blue-500" />
                My Documents
              </h2>
              <Link to="/documents" className="text-blue-500 hover:text-blue-400 transition-colors">
                Manage
              </Link>
            </div>
            
            <div className="space-y-3">
              <Link to="/will-creator" className="block p-3 bg-[#1D1F23]/50 rounded-lg hover:bg-[#1D1F23] transition-colors">
                <p className="font-medium">Last Will and Testament</p>
                <p className="text-sm text-[#989AA1]">Draft in progress</p>
              </Link>
              <Link to="/living-will" className="block p-3 bg-[#1D1F23]/50 rounded-lg hover:bg-[#1D1F23] transition-colors">
                <p className="font-medium">Living Will</p>
                <p className="text-sm text-[#989AA1]">Not started</p>
              </Link>
              <Link to="/power-of-attorney" className="block p-3 bg-[#1D1F23]/50 rounded-lg hover:bg-[#1D1F23] transition-colors">
                <p className="font-medium">Power of Attorney</p>
                <p className="text-sm text-[#989AA1]">Not started</p>
              </Link>
            </div>
          </div>

          {/* Beneficiaries Widget */}
          <div className="bg-gradient-to-br from-[#1A1B1E] to-[#1D1F23] rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FaUsers className="text-blue-500" />
                My Beneficiaries
              </h2>
              <Link to="/beneficiaries" className="text-blue-500 hover:text-blue-400 transition-colors">
                Manage
              </Link>
            </div>
            
            <div className="space-y-3">
              {profile?.beneficiaries?.length ? (
                profile.beneficiaries.slice(0, 3).map((beneficiary: Beneficiary, index: number) => (
                  <div key={index} className="p-3 bg-[#1D1F23]/50 rounded-lg">
                    <p className="font-medium">{`${beneficiary.firstName} ${beneficiary.lastName}`}</p>
                    <p className="text-sm text-[#989AA1]">{beneficiary.relationship}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#989AA1] mb-4">No beneficiaries added yet</p>
                  <Link 
                    to="/beneficiaries"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add Beneficiaries
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 