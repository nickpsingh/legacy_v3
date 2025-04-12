import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { updateProfile, UserProfile } from '../features/user/userSlice';

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state: RootState) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(profile);

  if (!profile) {
    return (
      <div className="text-center py-8 text-[#989AA1]">
        <p>Profile not found. Please log in again.</p>
      </div>
    );
  }

  const handleEdit = () => {
    setEditedProfile(profile);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedProfile) {
      dispatch(updateProfile(editedProfile));
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editedProfile) {
      if (name.includes('.')) {
        const [section, field] = name.split('.');
        if (section === 'address') {
          setEditedProfile({
            ...editedProfile,
            address: {
              ...(editedProfile.address || {
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: ''
              }),
              [field]: value
            }
          });
        } else if (section === 'financialInfo') {
          setEditedProfile({
            ...editedProfile,
            financialInfo: {
              ...(editedProfile.financialInfo || {
                totalValue: 0,
                lastUpdated: new Date().toISOString()
              }),
              [field]: value
            }
          });
        }
      } else {
        setEditedProfile({
          ...editedProfile,
          [name]: value
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">My Profile</h1>
        {isEditing ? (
          <div className="space-x-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-[#1D1F23] text-white rounded hover:bg-[#2D2F33]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid gap-6">
        {/* Personal Information */}
        <div className="bg-[#101113] p-6 rounded-lg border border-[#1D1F23]">
          <h2 className="text-lg font-medium text-white mb-4">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#989AA1]">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editedProfile?.name || ''}
                  onChange={handleChange}
                  className="mt-1 w-full bg-[#1D1F23] text-white rounded border border-[#2D2F33] px-3 py-2"
                />
              ) : (
                <div className="mt-1 text-white">{profile.name || 'Not set'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm text-[#989AA1]">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editedProfile?.email || ''}
                  onChange={handleChange}
                  className="mt-1 w-full bg-[#1D1F23] text-white rounded border border-[#2D2F33] px-3 py-2"
                />
              ) : (
                <div className="mt-1 text-white">{profile.email || 'Not set'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm text-[#989AA1]">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={editedProfile?.phone || ''}
                  onChange={handleChange}
                  className="mt-1 w-full bg-[#1D1F23] text-white rounded border border-[#2D2F33] px-3 py-2"
                />
              ) : (
                <div className="mt-1 text-white">{profile.phone || 'Not set'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm text-[#989AA1]">Marital Status</label>
              {isEditing ? (
                <input
                  type="text"
                  name="maritalStatus"
                  value={editedProfile?.maritalStatus || ''}
                  onChange={handleChange}
                  className="mt-1 w-full bg-[#1D1F23] text-white rounded border border-[#2D2F33] px-3 py-2"
                />
              ) : (
                <div className="mt-1 text-white">{profile.maritalStatus || 'Not set'}</div>
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-[#101113] p-6 rounded-lg border border-[#1D1F23]">
          <h2 className="text-lg font-medium text-white mb-4">Address</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#989AA1]">Street</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address.street"
                  value={editedProfile?.address?.street || ''}
                  onChange={handleChange}
                  className="mt-1 w-full bg-[#1D1F23] text-white rounded border border-[#2D2F33] px-3 py-2"
                />
              ) : (
                <div className="mt-1 text-white">{profile.address?.street || 'Not set'}</div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-[#989AA1]">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.city"
                    value={editedProfile?.address?.city || ''}
                    onChange={handleChange}
                    className="mt-1 w-full bg-[#1D1F23] text-white rounded border border-[#2D2F33] px-3 py-2"
                  />
                ) : (
                  <div className="mt-1 text-white">{profile.address?.city || 'Not set'}</div>
                )}
              </div>
              <div>
                <label className="block text-sm text-[#989AA1]">State</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.state"
                    value={editedProfile?.address?.state || ''}
                    onChange={handleChange}
                    className="mt-1 w-full bg-[#1D1F23] text-white rounded border border-[#2D2F33] px-3 py-2"
                  />
                ) : (
                  <div className="mt-1 text-white">{profile.address?.state || 'Not set'}</div>
                )}
              </div>
              <div>
                <label className="block text-sm text-[#989AA1]">ZIP Code</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.zipCode"
                    value={editedProfile?.address?.zipCode || ''}
                    onChange={handleChange}
                    className="mt-1 w-full bg-[#1D1F23] text-white rounded border border-[#2D2F33] px-3 py-2"
                  />
                ) : (
                  <div className="mt-1 text-white">{profile.address?.zipCode || 'Not set'}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="bg-[#101113] p-6 rounded-lg border border-[#1D1F23]">
          <h2 className="text-lg font-medium text-white mb-4">Financial Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#989AA1]">Total Assets</label>
              <div className="mt-1 text-white">
                ${profile.financialInfo?.totalValue?.toLocaleString() || '0'}
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#989AA1]">Last Updated</label>
              <div className="mt-1 text-white">
                {profile.financialInfo?.lastUpdated
                  ? new Date(profile.financialInfo.lastUpdated).toLocaleDateString()
                  : 'Never'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 