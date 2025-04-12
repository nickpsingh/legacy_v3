import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateProfile } from '../store/userSlice';
import { UserProfile } from '../store/userSlice';

interface Step {
  id: string;
  title: string;
  description: string;
}

// Extend UserProfile to ensure compatibility
interface FormData extends UserProfile {
  firstName: string;
  lastName: string;
  selectedServices: string[];
  selectedAssetTypes: string[];
  connectPlaid: boolean;
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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    },
    state: '',
    maritalStatus: 'single',
    financialInfo: {
      assets: [],
      liabilities: [],
      totalValue: 0,
      totalAssets: 0,
      totalLiabilities: 0,
      lastUpdated: new Date().toISOString()
    },
    selectedServices: [],
    selectedAssetTypes: [],
    connectPlaid: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address!,
          [addressField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId]
    }));
  };

  const handleAssetTypeToggle = (assetType: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAssetTypes: prev.selectedAssetTypes.includes(assetType)
        ? prev.selectedAssetTypes.filter(type => type !== assetType)
        : [...prev.selectedAssetTypes, assetType]
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Combine firstName and lastName into name before dispatching
      const profileData: UserProfile = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`
      };
      dispatch(updateProfile(profileData));
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center">
            <div className="text-4xl mb-4">🌟</div>
            <p className="text-[#989AA1] max-w-md mx-auto">
              Welcome to your legacy journey. We'll help you create a comprehensive estate plan
              that protects your family's future and preserves your wishes.
            </p>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(service => (
                <button
                  key={service.id}
                  onClick={() => handleServiceToggle(service.id)}
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
                  onClick={() => handleAssetTypeToggle(asset.id)}
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
                    onClick={() => setFormData(prev => ({ ...prev, connectPlaid: !prev.connectPlaid }))}
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
        <div className="mb-8">
          <div className="h-2 bg-gray-700 rounded-full">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{steps[currentStep].title}</h1>
          <p className="text-gray-400">{steps[currentStep].description}</p>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {renderStepContent()}
          </form>

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
        </div>
      </div>
    </div>
  );
};

export default GetStarted; 