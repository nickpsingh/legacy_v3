import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { updateProfile, UserProfile, Asset } from '../features/user/userSlice';
import { Liability } from '../services/liabilities.service';
import { fetchAssetsFromDB } from '../features/assets/assetsSlice';
import { fetchLiabilitiesFromDB } from '../features/liabilities/liabilitiesSlice';

interface Step {
  id: string;
  title: string;
  description: string;
}

// Extend UserProfile to ensure compatibility
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  assets: Asset[];
  liabilities: Liability[];
  selectedServices: string[];
  selectedAssetTypes: string[];
  connectPlaid: boolean;
  financialInfo: {
    totalValue: number;
    lastUpdated: string;
  };
}

const steps: Step[] = [
  {
    id: 'welcome',
    title: 'Welcome to your Legacy',
    description: 'Let\'s begin your journey to securing your family\'s future.',
  },
  {
    id: 'services',
    title: 'Select Services',
    description: 'Which estate planning services are you interested in?',
  },
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Please provide your basic personal information.',
  },
  {
    id: 'contact',
    title: 'Contact Information',
    description: 'How can we reach you?',
  },
  {
    id: 'address',
    title: 'Address Information',
    description: 'Where do you currently reside?',
  },
  {
    id: 'assets',
    title: 'Asset Overview',
    description: 'What types of assets would you like to include in your estate plan?',
  },
  {
    id: 'connect',
    title: 'Connect Assets',
    description: 'Would you like to connect your financial accounts for automatic updates?',
  }
];

const services = [
  { id: 'will', name: 'Last Will and Testament', description: 'Ensure your assets are distributed according to your wishes.' },
  { id: 'trust', name: 'Living Trust', description: 'Protect your assets and avoid probate.' },
  { id: 'poa', name: 'Power of Attorney', description: 'Designate someone to make decisions on your behalf.' },
  { id: 'living-will', name: 'Living Will', description: 'Specify your medical care preferences.' }
];

const assetTypes = [
  { id: 'real-estate', name: 'Real Estate', icon: '🏠' },
  { id: 'investments', name: 'Investment Accounts', icon: '📈' },
  { id: 'bank-accounts', name: 'Bank Accounts', icon: '🏦' },
  { id: 'vehicles', name: 'Vehicles', icon: '🚗' },
  { id: 'life-insurance', name: 'Life Insurance', icon: '📄' },
  { id: 'personal-property', name: 'Personal Property', icon: '💎' }
];

const GetStarted: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile } = useSelector((state: RootState) => state.user);
  const { assets } = useSelector((state: RootState) => state.assets);
  const { liabilities } = useSelector((state: RootState) => state.liabilities);
  const [currentStep, setCurrentStep] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Fetch assets and liabilities when component mounts
  useEffect(() => {
    const DEMO_USER_UID = 'demo-user-123';
    // @ts-ignore
    dispatch(fetchAssetsFromDB(DEMO_USER_UID));
    // @ts-ignore
    dispatch(fetchLiabilitiesFromDB(DEMO_USER_UID));
  }, [dispatch]);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    maritalStatus: 'single',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    assets: [],
    liabilities: [],
    selectedServices: [],
    selectedAssetTypes: [],
    connectPlaid: false,
    financialInfo: {
      totalValue: 0,
      lastUpdated: new Date().toISOString()
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      if (section === 'address') {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            [field]: value
          }
        }));
      } else if (section === 'financialInfo') {
        setFormData(prev => ({
          ...prev,
          financialInfo: {
            ...prev.financialInfo,
            [field]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleServiceSelection = (service: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(service)
        ? prev.selectedServices.filter(s => s !== service)
        : [...prev.selectedServices, service]
    }));
  };

  const handleAssetTypeSelection = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAssetTypes: prev.selectedAssetTypes.includes(id)
        ? prev.selectedAssetTypes.filter(type => type !== id)
        : [...prev.selectedAssetTypes, id]
    }));
  };

  const handlePlaidToggle = () => {
    setFormData(prev => ({
      ...prev,
      connectPlaid: !prev.connectPlaid
    }));
  };

  const handleSubmit = () => {
    const profileData: UserProfile = {
      uid: crypto.randomUUID(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phone: formData.phone,
      age: calculateAge(formData.dateOfBirth),
      dateOfBirth: formData.dateOfBirth,
      maritalStatus: formData.maritalStatus,
      address: formData.address,
      state: formData.address.state,
      financialInfo: {
        assets: [],
        liabilities: [],
        totalValue: 0,
        lastUpdated: new Date().toISOString()
      },
      beneficiaries: [],
      lastUpdated: new Date().toISOString()
    };
    dispatch(updateProfile(profileData));
    navigate('/dashboard');
  };

  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderReviewContent = () => {
    if (!profile) return null;

    return (
      <div className="space-y-8">
        {/* Personal Information */}
        <div className="bg-[#101113] p-6 rounded-lg border border-[#1D1F23]">
          <h3 className="text-white font-medium mb-4">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[#989AA1]">Name:</span>
              <span className="text-white ml-2">{profile.firstName} {profile.lastName}</span>
            </div>
            <div>
              <span className="text-[#989AA1]">Email:</span>
              <span className="text-white ml-2">{profile.email}</span>
            </div>
            <div>
              <span className="text-[#989AA1]">Phone:</span>
              <span className="text-white ml-2">{profile.phone}</span>
            </div>
            <div>
              <span className="text-[#989AA1]">Marital Status:</span>
              <span className="text-white ml-2 capitalize">{profile.maritalStatus}</span>
            </div>
          </div>
        </div>

        {/* Address Information */}
        {profile.address && (
          <div className="bg-[#101113] p-6 rounded-lg border border-[#1D1F23]">
            <h3 className="text-white font-medium mb-4">Address</h3>
            <div className="text-sm">
              <div className="text-white">
                {profile.address.street}<br />
                {profile.address.city}, {profile.address.state} {profile.address.zipCode}
              </div>
            </div>
          </div>
        )}

        {/* Financial Overview */}
        <div className="bg-[#101113] p-6 rounded-lg border border-[#1D1F23]">
          <h3 className="text-white font-medium mb-4">Financial Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-[#0A0B0D] rounded-lg">
              <div className="text-2xl font-bold text-green-400">
                {assets?.length || 0}
              </div>
              <div className="text-sm text-[#989AA1]">Assets</div>
            </div>
            <div className="text-center p-4 bg-[#0A0B0D] rounded-lg">
              <div className="text-2xl font-bold text-red-400">
                {liabilities?.length || 0}
              </div>
              <div className="text-sm text-[#989AA1]">Liabilities</div>
            </div>
            <div className="text-center p-4 bg-[#0A0B0D] rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                ${((assets?.reduce((total, asset) => total + (asset.value || 0), 0) || 0) - 
                   (liabilities?.reduce((total, liability) => total + (liability.amount || 0), 0) || 0)).toLocaleString()}
              </div>
              <div className="text-sm text-[#989AA1]">Net Worth</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setIsReviewMode(false)}
            className="px-4 py-2 text-gray-400 hover:text-white"
          >
            Back
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-left">
              <p className="text-[#989AA1] text-base">
                We'll help you create a comprehensive estate plan that protects your family's future and preserves your wishes.
              </p>
            </div>
            
            {/* Show different CTAs based on user data */}
            {profile && profile.firstName ? (
              <div className="mt-8 space-y-4">
                <div className="p-6 bg-[#101113] rounded-lg border border-[#1D1F23]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#989AA1]">
                        Welcome back, {profile.firstName}. You can review your information here. Navigate to the appropriate sections to make any changes.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => setIsReviewMode(true)}
                        className="px-3 py-1 text-xs border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8">
                <div className="p-6 bg-[#101113] rounded-lg border border-[#1D1F23]">
                  <h3 className="text-white font-medium mb-2">Ready to get started?</h3>
                  <p className="text-sm text-[#989AA1] mb-4">
                    Complete our onboarding process to create your personalized estate plan.
                  </p>
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Continue Setup
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(service => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelection(service.id)}
                  className={`p-4 rounded-lg border transition-colors text-left ${
                    formData.selectedServices.includes(service.id)
                      ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                      : 'border-[#1D1F23] hover:border-blue-500'
                  }`}
                >
                  <h3 className="text-white font-medium">{service.name}</h3>
                  <p className="text-sm text-[#989AA1] mt-1">{service.description}</p>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#989AA1] mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#989AA1] mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#989AA1] mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#989AA1] mb-1">
                Marital Status
              </label>
              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#989AA1] mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#989AA1] mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#989AA1] mb-1">
                Street Address
              </label>
              <input
                type="text"
                name="address.street"
                value={formData.address?.street || ''}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#989AA1] mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address?.city || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#989AA1] mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address?.state || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#989AA1] mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                name="address.zipCode"
                value={formData.address?.zipCode || ''}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {assetTypes.map(asset => (
                <button
                  key={asset.id}
                  onClick={() => handleAssetTypeSelection(asset.id)}
                  className={`p-4 rounded-lg border transition-colors text-center ${
                    formData.selectedAssetTypes.includes(asset.id)
                      ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                      : 'border-[#1D1F23] hover:border-blue-500'
                  }`}
                >
                  <div className="text-2xl mb-2">{asset.icon}</div>
                  <div className="text-white font-medium">{asset.name}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <div className="bg-[#101113] p-6 rounded-lg border border-[#1D1F23]">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">🔒</div>
                <div>
                  <h3 className="text-white font-medium">Connect Your Accounts</h3>
                  <p className="text-sm text-[#989AA1] mt-1">
                    Securely connect your financial accounts to automatically track and update your asset values.
                    We use Plaid to ensure your information remains safe and private.
                  </p>
                  <button
                    onClick={handlePlaidToggle}
                    className={`mt-4 px-4 py-2 rounded transition-colors ${
                      formData.connectPlaid
                        ? 'bg-blue-500 text-white'
                        : 'border border-[#1D1F23] text-[#989AA1] hover:text-white'
                    }`}
                  >
                    {formData.connectPlaid ? 'Connected' : 'Connect Accounts'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        {!isReviewMode && (
          <div className="mb-8">
            <div className="h-2 bg-gray-700 rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-6">
          {isReviewMode ? (
            <>
              <h1 className="text-3xl font-bold">Review Your Information</h1>
              <p className="text-gray-400">Review your saved profile information and selections.</p>
              {renderReviewContent()}
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold">{steps[currentStep].title}</h1>
              <p className="text-gray-400">{steps[currentStep].description}</p>

              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                {renderStepContent()}
              </form>

              {/* Only show navigation for steps after welcome if user doesn't have existing data */}
              {!(currentStep === 0 && profile && profile.firstName) && (
                <div className="flex justify-between mt-8">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
                  >
                    {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GetStarted; 