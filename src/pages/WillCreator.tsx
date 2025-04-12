import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { getStateLaws } from '../services/ai.service';

interface Beneficiary {
  firstName: string;
  lastName: string;
  email: string;
  relationship: string;
  birthDate: string;
  assetAllocations: {
    assetId: string;
    percentage: number;
    amount: number;
  }[];
  totalAmount: number;
}

interface PersonalInfo {
  age: number;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  hasChildren: boolean;
  numberOfChildren: number;
}

interface WillFormData {
  personalInfo: {
    fullName: string;
    address: string;
    maritalStatus: string;
    children: string[];
  };
  executorInfo: {
    name: string;
    relationship: string;
    contact: string;
  };
  assets: {
    realEstate: string[];
    bankAccounts: string[];
    investments: string[];
    personalProperty: string[];
  };
  beneficiaries: Array<{
    name: string;
    relationship: string;
    allocation: string;
    specificBequests: string;
  }>;
  specialInstructions: string;
}

const WillCreator: React.FC = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const [currentStep, setCurrentStep] = useState(1);
  const [isAIAssisted, setIsAIAssisted] = useState(false);
  const [alternateGuardianName, setAlternateGuardianName] = useState('');
  const [alternateGuardianRelation, setAlternateGuardianRelation] = useState('');
  const [willFormData, setWillFormData] = useState<WillFormData>({
    personalInfo: {
      fullName: '',
      address: '',
      maritalStatus: '',
      children: []
    },
    executorInfo: {
      name: '',
      relationship: '',
      contact: ''
    },
    assets: {
      realEstate: [],
      bankAccounts: [],
      investments: [],
      personalProperty: []
    },
    beneficiaries: [],
    specialInstructions: ''
  });
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    age: 0,
    maritalStatus: 'single',
    hasChildren: false,
    numberOfChildren: 0
  });
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [executor, setExecutor] = useState({ name: '', relationship: '' });
  const [alternateExecutor, setAlternateExecutor] = useState({ name: '', relationship: '' });
  const [guardianInfo, setGuardianInfo] = useState({ name: '', relationship: '' });
  const [specificRequests, setSpecificRequests] = useState<string[]>([]);
  const [stateLaws, setStateLaws] = useState<string[]>([]);
  const [showLaws, setShowLaws] = useState(false);
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);

  const totalSteps = 5;

  const calculateAssetAmount = (assetValue: number, percentage: number) => {
    return (assetValue * percentage) / 100;
  };

  const updateBeneficiaryAllocation = (beneficiaryIndex: number, assetId: string, percentage: number) => {
    const asset = profile?.financialInfo.assets.find(a => a.type === assetId);
    if (!asset) return;

    const newBeneficiaries = [...beneficiaries];
    const beneficiary = newBeneficiaries[beneficiaryIndex];
    
    // Update or add asset allocation
    const allocationIndex = beneficiary.assetAllocations.findIndex(a => a.assetId === assetId);
    const amount = calculateAssetAmount(asset.value, percentage);
    
    if (allocationIndex >= 0) {
      beneficiary.assetAllocations[allocationIndex] = { assetId, percentage, amount };
    } else {
      beneficiary.assetAllocations.push({ assetId, percentage, amount });
    }

    // Recalculate total amount
    beneficiary.totalAmount = beneficiary.assetAllocations.reduce((sum, allocation) => sum + allocation.amount, 0);
    
    setBeneficiaries(newBeneficiaries);
  };

  const handleAIAutofill = () => {
    // This would integrate with an AI service to pre-fill the form
    setIsAIAssisted(true);
    // Simulate AI autofill with profile data
    if (profile) {
      setWillFormData(prevData => ({
        ...prevData,
        personalInfo: {
          ...prevData.personalInfo,
          fullName: `${profile.firstName} ${profile.lastName}`,
          address: `${profile.address?.street}, ${profile.address?.city}, ${profile.address?.state} ${profile.address?.zipCode}`,
          maritalStatus: profile.maritalStatus || ''
        }
      }));
    }
  };

  const handleLawyerReview = () => {
    // This would integrate with a lawyer matching service
    window.alert('Connecting you with a qualified estate planning attorney...');
  };

  const handleEFile = () => {
    // This would handle the e-filing process
    window.alert('Preparing your will for electronic filing...');
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleAddBequest = () => {
    setWillFormData(prev => ({
      ...prev,
      beneficiaries: [...prev.beneficiaries, { name: '', relationship: '', allocation: '', specificBequests: '' }]
    }));
  };

  const handleAddBeneficiary = () => {
    setWillFormData(prev => ({
      ...prev,
      beneficiaries: [...prev.beneficiaries, { name: '', relationship: '', allocation: '', specificBequests: '' }]
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Personal Information Review</h2>
            <div className="grid grid-cols-2 gap-4 bg-[#1A1B1E] p-4 rounded-lg">
              <div>
                <p className="text-[#989AA1]">Name</p>
                <p className="text-white">{profile?.firstName} {profile?.lastName}</p>
              </div>
              <div>
                <p className="text-[#989AA1]">Age</p>
                <p className="text-white">{profile?.age}</p>
              </div>
              <div>
                <p className="text-[#989AA1]">Marital Status</p>
                <p className="text-white">{profile?.maritalStatus}</p>
              </div>
              <div>
                <p className="text-[#989AA1]">State</p>
                <p className="text-white">{profile?.address?.state}</p>
              </div>
            </div>
            <p className="text-[#989AA1]">Please verify your information above. This will be used in your will.</p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Executor Appointment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Primary Executor Name</label>
                <input
                  type="text"
                  value={willFormData.executorInfo.name}
                  onChange={(e) => setWillFormData({
                    ...willFormData,
                    executorInfo: { ...willFormData.executorInfo, name: e.target.value } }
                  )}
                  className="w-full bg-[#1A1B1E] text-white p-2 rounded-lg border border-[#2A2B2E]"
                  placeholder="Full name of your executor"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Relationship to Executor</label>
                <input
                  type="text"
                  value={willFormData.executorInfo.relationship}
                  onChange={(e) => setWillFormData({
                    ...willFormData,
                    executorInfo: { ...willFormData.executorInfo, relationship: e.target.value } }
                  )}
                  className="w-full bg-[#1A1B1E] text-white p-2 rounded-lg border border-[#2A2B2E]"
                  placeholder="e.g., Spouse, Child, Sibling"
                />
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium text-white mb-4">Alternate Executor</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={willFormData.executorInfo.contact}
                    onChange={(e) => setWillFormData({
                      ...willFormData,
                      executorInfo: { ...willFormData.executorInfo, contact: e.target.value } }
                    )}
                    className="w-full bg-[#1A1B1E] text-white p-2 rounded-lg border border-[#2A2B2E]"
                    placeholder="Full name of alternate executor"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Guardian Appointment</h2>
            <p className="text-[#989AA1]">If you have minor children, please designate a guardian.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Primary Guardian Name</label>
                <input
                  type="text"
                  value={guardianInfo.name}
                  onChange={(e) => setGuardianInfo({ ...guardianInfo, name: e.target.value })}
                  className="w-full bg-[#1A1B1E] text-white p-2 rounded-lg border border-[#2A2B2E]"
                  placeholder="Full name of guardian"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Relationship to Guardian</label>
                <input
                  type="text"
                  value={guardianInfo.relationship}
                  onChange={(e) => setGuardianInfo({ ...guardianInfo, relationship: e.target.value })}
                  className="w-full bg-[#1A1B1E] text-white p-2 rounded-lg border border-[#2A2B2E]"
                  placeholder="e.g., Sibling, Friend"
                />
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium text-white mb-4">Alternate Guardian</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={alternateGuardianName}
                    onChange={(e) => setAlternateGuardianName(e.target.value)}
                    className="w-full bg-[#1A1B1E] text-white p-2 rounded-lg border border-[#2A2B2E]"
                    placeholder="Full name of alternate guardian"
                  />
                  <input
                    type="text"
                    value={alternateGuardianRelation}
                    onChange={(e) => setAlternateGuardianRelation(e.target.value)}
                    className="w-full bg-[#1A1B1E] text-white p-2 rounded-lg border border-[#2A2B2E]"
                    placeholder="Relationship to alternate guardian"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Asset Distribution</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Specific Bequests</h3>
                {willFormData.beneficiaries.map((beneficiary, index) => (
                  <div key={index} className="mb-4 p-4 bg-[#1A1B1E] rounded-lg space-y-3">
                    <input
                      type="text"
                      value={beneficiary.name}
                      onChange={(e) => {
                        const newBeneficiaries = [...willFormData.beneficiaries];
                        newBeneficiaries[index].name = e.target.value;
                        setWillFormData({ ...willFormData, beneficiaries: newBeneficiaries });
                      }}
                      className="w-full bg-[#2A2B2E] text-white p-2 rounded-lg"
                      placeholder="Beneficiary name"
                    />
                    <input
                      type="text"
                      value={beneficiary.relationship}
                      onChange={(e) => {
                        const newBeneficiaries = [...willFormData.beneficiaries];
                        newBeneficiaries[index].relationship = e.target.value;
                        setWillFormData({ ...willFormData, beneficiaries: newBeneficiaries });
                      }}
                      className="w-full bg-[#2A2B2E] text-white p-2 rounded-lg"
                      placeholder="Relationship"
                    />
                    <input
                      type="text"
                      value={beneficiary.allocation}
                      onChange={(e) => {
                        const newBeneficiaries = [...willFormData.beneficiaries];
                        newBeneficiaries[index].allocation = e.target.value;
                        setWillFormData({ ...willFormData, beneficiaries: newBeneficiaries });
                      }}
                      className="w-full bg-[#2A2B2E] text-white p-2 rounded-lg"
                      placeholder="Allocation"
                    />
                    <input
                      type="text"
                      value={beneficiary.specificBequests}
                      onChange={(e) => {
                        const newBeneficiaries = [...willFormData.beneficiaries];
                        newBeneficiaries[index].specificBequests = e.target.value;
                        setWillFormData({ ...willFormData, beneficiaries: newBeneficiaries });
                      }}
                      className="w-full bg-[#2A2B2E] text-white p-2 rounded-lg"
                      placeholder="Specific Bequests"
                    />
                  </div>
                ))}
                <button
                  onClick={handleAddBequest}
                  className="mt-4 px-4 py-2 bg-[#2A2B2E] text-white rounded-lg hover:bg-[#3A3B3E] transition-colors"
                >
                  Add Another Bequest
                </button>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-white mb-4">Residual Estate Distribution</h3>
                {willFormData.beneficiaries.map((beneficiary, index) => (
                  <div key={index} className="mb-4 p-4 bg-[#1A1B1E] rounded-lg space-y-3">
                    <input
                      type="text"
                      value={beneficiary.name}
                      onChange={(e) => {
                        const newBeneficiaries = [...willFormData.beneficiaries];
                        newBeneficiaries[index].name = e.target.value;
                        setWillFormData({ ...willFormData, beneficiaries: newBeneficiaries });
                      }}
                      className="w-full bg-[#2A2B2E] text-white p-2 rounded-lg"
                      placeholder="Beneficiary name"
                    />
                    <input
                      type="text"
                      value={beneficiary.relationship}
                      onChange={(e) => {
                        const newBeneficiaries = [...willFormData.beneficiaries];
                        newBeneficiaries[index].relationship = e.target.value;
                        setWillFormData({ ...willFormData, beneficiaries: newBeneficiaries });
                      }}
                      className="w-full bg-[#2A2B2E] text-white p-2 rounded-lg"
                      placeholder="Relationship"
                    />
                    <input
                      type="text"
                      value={beneficiary.allocation}
                      onChange={(e) => {
                        const newBeneficiaries = [...willFormData.beneficiaries];
                        newBeneficiaries[index].allocation = e.target.value;
                        setWillFormData({ ...willFormData, beneficiaries: newBeneficiaries });
                      }}
                      className="w-full bg-[#2A2B2E] text-white p-2 rounded-lg"
                      placeholder="Allocation"
                    />
                    <input
                      type="text"
                      value={beneficiary.specificBequests}
                      onChange={(e) => {
                        const newBeneficiaries = [...willFormData.beneficiaries];
                        newBeneficiaries[index].specificBequests = e.target.value;
                        setWillFormData({ ...willFormData, beneficiaries: newBeneficiaries });
                      }}
                      className="w-full bg-[#2A2B2E] text-white p-2 rounded-lg"
                      placeholder="Specific Bequests"
                    />
                  </div>
                ))}
                <button
                  onClick={handleAddBeneficiary}
                  className="mt-4 px-4 py-2 bg-[#2A2B2E] text-white rounded-lg hover:bg-[#3A3B3E] transition-colors"
                >
                  Add Another Beneficiary
                </button>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Final Wishes and Instructions</h2>
            <div>
              <label className="block text-white mb-2">Additional Instructions or Final Wishes</label>
              <textarea
                value={willFormData.specialInstructions}
                onChange={(e) => setWillFormData({ ...willFormData, specialInstructions: e.target.value })}
                className="w-full bg-[#1A1B1E] text-white p-4 rounded-lg border border-[#2A2B2E] min-h-[200px]"
                placeholder="Enter any additional instructions, funeral preferences, or final messages to your loved ones..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleViewStateLaws = async () => {
    if (profile?.state) {
      try {
        const laws = await getStateLaws(profile.state, 'will');
        setStateLaws(laws);
        setShowLaws(true);
      } catch (error) {
        console.error('Error fetching state laws:', error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-[#101113] rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-semibold text-white mb-4">Create Your Will</h1>
        
        {/* AI Assistant Option */}
        <div className="mb-8">
          <button
            onClick={handleAIAutofill}
            className="bg-[#2D2F34] text-white px-4 py-2 rounded-md hover:bg-[#3D3F44] transition-colors mr-4"
          >
            {isAIAssisted ? '✓ AI Assisted' : '🤖 Use AI to Help Fill Form'}
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`w-1/5 h-2 rounded-full mx-1 ${
                step <= currentStep ? 'bg-blue-500' : 'bg-[#2D2F34]'
              }`}
            />
          ))}
        </div>

        {/* Form Content */}
        <div className="space-y-6">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            className={`bg-[#2D2F34] text-white px-4 py-2 rounded-md hover:bg-[#3D3F44] transition-colors`}
            disabled={currentStep === 1}
          >
            Previous
          </button>
          <div className="flex gap-4">
            {currentStep === 5 && (
              <>
                <button
                  onClick={handleLawyerReview}
                  className="bg-[#2D2F34] text-white px-4 py-2 rounded-md hover:bg-[#3D3F44] transition-colors"
                >
                  👨‍⚖️ Get Lawyer Review
                </button>
                <button
                  onClick={handleEFile}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  📤 E-File Will
                </button>
              </>
            )}
            {currentStep < 5 && (
              <button
                onClick={handleNext}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WillCreator; 