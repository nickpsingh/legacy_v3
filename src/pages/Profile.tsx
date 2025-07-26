import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { UserProfile, updateProfile, fetchUserFromDB, updateUserInDB } from '../features/user/userSlice';
import { useSnackbar } from 'notistack';

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { profile, loading, error } = useSelector((state: RootState) => state.user);
  const DEMO_USER_UID = 'ec540338-923f-400d-a185-6028c5d5f823';

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  // Load user from database when component mounts
  useEffect(() => {
    console.log('Profile: Loading user from database...');
    dispatch(fetchUserFromDB(DEMO_USER_UID) as any);
  }, [dispatch]);

  // Update form data when profile loads from database
  useEffect(() => {
    if (profile) {
      console.log('Profile: Setting form data from profile:', profile);
      setFormData({
        uid: profile.uid || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        age: profile.age || 0,
        dateOfBirth: profile.dateOfBirth || '',
        maritalStatus: profile.maritalStatus || 'single',
        address: profile.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        },
        state: profile.state || ''
      });
    }
  }, [profile]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to current profile
    if (profile) {
      setFormData({
        uid: profile.uid || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        age: profile.age || 0,
        dateOfBirth: profile.dateOfBirth || '',
        maritalStatus: profile.maritalStatus || 'single',
        address: profile.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        },
        state: profile.state || ''
      });
    }
  };

  const handleSave = async () => {
    try {
      console.log('Profile: Saving changes to database...', formData);
      
      // Update in database first
      await dispatch(updateUserInDB({ 
        uid: DEMO_USER_UID, 
        updates: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          age: formData.age,
          dateOfBirth: formData.dateOfBirth,
          maritalStatus: formData.maritalStatus,
          address: formData.address,
          state: formData.state
        }
      }) as any);
      
      setIsEditing(false);
      enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      enqueueSnackbar('Failed to update profile', { variant: 'error' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      if (section === 'address') {
        setFormData(prev => ({
          ...prev,
          address: {
            ...(prev.address || {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: 'USA'
            }),
            [field]: value
          }
        }));
      }
    } else if (name === 'name') {
      // When name changes, also update firstName and lastName
      const nameParts = value.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      setFormData(prev => ({
        ...prev,
        name: value,
        firstName: firstName,
        lastName: lastName
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'age' ? parseInt(value) || 0 : value
      }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-white">My Profile</h1>
        <div className="text-center py-8 text-[#989AA1]">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-white">My Profile</h1>
        <div className="text-center py-8 text-red-400">
          <p>Error loading profile: {error}</p>
          <button 
            onClick={() => dispatch(fetchUserFromDB(DEMO_USER_UID) as any)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-white">My Profile</h1>
        <div className="text-center py-8 text-[#989AA1]">
          <p>No profile found.</p>
          <button 
            onClick={() => dispatch(fetchUserFromDB(DEMO_USER_UID) as any)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Load Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">My Profile</h1>
        {isEditing ? (
          <div className="space-x-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
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
              <label className="block text-sm text-[#989AA1]">First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleChange}
                  className="mt-1 w-full bg-[#1D1F23] text-white rounded border border-[#2D2F33] px-3 py-2"
                />
              ) : (
                <div className="mt-1 text-white">{profile.firstName || 'Not set'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm text-[#989AA1]">Last Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleChange}
                  className="mt-1 w-full bg-[#1D1F23] text-white rounded border border-[#2D2F33] px-3 py-2"
                />
              ) : (
                <div className="mt-1 text-white">{profile.lastName || 'Not set'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm text-[#989AA1]">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
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
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="mt-1 w-full bg-[#1D1F23] text-white rounded border border-[#2D2F33] px-3 py-2"
                />
              ) : (
                <div className="mt-1 text-white">{profile.phone || 'Not set'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm text-[#989AA1]">Age</label>
              {isEditing ? (
                <input
                  type="number"
                  name="age"
                  value={formData.age || ''}
                  onChange={handleChange}
                  className="mt-1 w-full bg-[#1D1F23] text-white rounded border border-[#2D2F33] px-3 py-2"
                />
              ) : (
                <div className="mt-1 text-white">{profile.age || 'Not set'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm text-[#989AA1]">Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth || ''}
                  onChange={handleChange}
                  className="mt-1 w-full bg-[#1D1F23] text-white rounded border border-[#2D2F33] px-3 py-2"
                />
              ) : (
                <div className="mt-1 text-white">
                  {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not set'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm text-[#989AA1]">Marital Status</label>
              {isEditing ? (
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus || ''}
                  onChange={handleChange}
                  className="mt-1 w-full bg-[#1D1F23] text-white rounded border border-[#2D2F33] px-3 py-2"
                >
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              ) : (
                <div className="mt-1 text-white capitalize">{profile.maritalStatus || 'Not set'}</div>
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
                  value={formData.address?.street || ''}
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
                    value={formData.address?.city || ''}
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
                    value={formData.address?.state || ''}
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
                    value={formData.address?.zipCode || ''}
                    onChange={handleChange}
                    className="mt-1 w-full bg-[#1D1F23] text-white rounded border border-[#2D2F33] px-3 py-2"
                  />
                ) : (
                  <div className="mt-1 text-white">{profile.address?.zipCode || 'Not set'}</div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#989AA1]">Country</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address.country"
                  value={formData.address?.country || ''}
                  onChange={handleChange}
                  className="mt-1 w-full bg-[#1D1F23] text-white rounded border border-[#2D2F33] px-3 py-2"
                />
              ) : (
                <div className="mt-1 text-white">{profile.address?.country || 'Not set'}</div>
              )}
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-[#101113] p-6 rounded-lg border border-[#1D1F23]">
          <h2 className="text-lg font-medium text-white mb-4">System Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#989AA1]">User ID</label>
              <div className="mt-1 text-white font-mono text-sm">{profile.uid || 'Not set'}</div>
            </div>
            <div>
              <label className="block text-sm text-[#989AA1]">Last Updated</label>
              <div className="mt-1 text-white">
                {profile.lastUpdated
                  ? new Date(profile.lastUpdated).toLocaleString()
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