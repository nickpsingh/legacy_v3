import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const Profile: React.FC = () => {
  const { profile } = useSelector((state: RootState) => state.user);

  if (!profile) {
    return (
      <div className="text-center py-8 text-[#989AA1]">
        <p>Profile not found. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">My Profile</h1>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Edit Profile
        </button>
      </div>

      <div className="grid gap-6">
        {/* Personal Information */}
        <div className="bg-[#101113] p-6 rounded-lg border border-[#1D1F23]">
          <h2 className="text-lg font-medium text-white mb-4">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#989AA1]">Full Name</label>
              <div className="mt-1 text-white">{profile.name}</div>
            </div>
            <div>
              <label className="block text-sm text-[#989AA1]">Email</label>
              <div className="mt-1 text-white">{profile.email}</div>
            </div>
            <div>
              <label className="block text-sm text-[#989AA1]">Phone</label>
              <div className="mt-1 text-white">{profile.phone}</div>
            </div>
            <div>
              <label className="block text-sm text-[#989AA1]">Marital Status</label>
              <div className="mt-1 text-white">{profile.maritalStatus}</div>
            </div>
          </div>
        </div>

        {/* Address */}
        {profile.address && (
          <div className="bg-[#101113] p-6 rounded-lg border border-[#1D1F23]">
            <h2 className="text-lg font-medium text-white mb-4">Address</h2>
            <div className="space-y-2">
              <div>
                <label className="block text-sm text-[#989AA1]">Street</label>
                <div className="mt-1 text-white">{profile.address.street}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-[#989AA1]">City</label>
                  <div className="mt-1 text-white">{profile.address.city}</div>
                </div>
                <div>
                  <label className="block text-sm text-[#989AA1]">State</label>
                  <div className="mt-1 text-white">{profile.address.state}</div>
                </div>
                <div>
                  <label className="block text-sm text-[#989AA1]">ZIP Code</label>
                  <div className="mt-1 text-white">{profile.address.zipCode}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Overview */}
        <div className="bg-[#101113] p-6 rounded-lg border border-[#1D1F23]">
          <h2 className="text-lg font-medium text-white mb-4">Financial Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#989AA1]">Total Assets</label>
              <div className="mt-1 text-white">
                ${profile.financialInfo.totalValue.toLocaleString()}
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#989AA1]">Last Updated</label>
              <div className="mt-1 text-white">
                {new Date(profile.financialInfo.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 