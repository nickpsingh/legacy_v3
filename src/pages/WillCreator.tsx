import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { UserProfile } from '../features/user/userSlice';

const WillCreator: React.FC = () => {
  const profile = useSelector((state: RootState) => state.user.profile) as UserProfile | null;
  const [currentStep, setCurrentStep] = useState(0);
  const [executor, setExecutor] = useState({ name: '', relationship: '', contact: '' });
  const [alternateExecutor, setAlternateExecutor] = useState({ name: '', relationship: '', contact: '' });
  const [beneficiaries, setBeneficiaries] = useState<Array<{ name: string; relationship: string; allocation: number }>>([]);
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);
  const [stateLaws, setStateLaws] = useState<string[]>([]);
  const [showLaws, setShowLaws] = useState(false);

  const handleAddBeneficiary = () => {
    setShowAddBeneficiary(true);
  };

  const handleSaveBeneficiary = (beneficiary: { name: string; relationship: string; allocation: number }) => {
    setBeneficiaries([...beneficiaries, beneficiary]);
    setShowAddBeneficiary(false);
  };

  const handleUpdateBeneficiary = (index: number, allocation: number) => {
    const updatedBeneficiaries = [...beneficiaries];
    updatedBeneficiaries[index].allocation = allocation;
    setBeneficiaries(updatedBeneficiaries);
  };

  const handleViewStateLaws = async () => {
    if (profile?.address?.state) {
      try {
        setStateLaws(['Loading state laws...']);
        setShowLaws(true);
        // Simulated API call to get state laws
        setTimeout(() => {
          setStateLaws([
            'Last will must be in writing',
            'Must be signed by the testator',
            'Requires two witnesses',
            'Witnesses must be disinterested parties'
          ]);
        }, 1000);
      } catch (error) {
        console.error('Error fetching state laws:', error);
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <p className="text-[#989AA1]">Review and confirm your personal information</p>
            <div className="bg-[#1A1B1E] p-4 rounded-lg">
              <p>Name: {profile?.firstName} {profile?.lastName}</p>
              <p>Address: {profile?.address?.street}, {profile?.address?.city}, {profile?.address?.state} {profile?.address?.zipCode}</p>
              <p>Email: {profile?.email}</p>
              <p>Phone: {profile?.phone}</p>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Executor Appointment</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#989AA1] mb-1">Executor Name</label>
                <input
                  type="text"
                  value={executor.name}
                  onChange={(e) => setExecutor({ ...executor, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#989AA1] mb-1">Relationship</label>
                <input
                  type="text"
                  value={executor.relationship}
                  onChange={(e) => setExecutor({ ...executor, relationship: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#989AA1] mb-1">Contact Information</label>
                <input
                  type="text"
                  value={executor.contact}
                  onChange={(e) => setExecutor({ ...executor, contact: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Alternate Executor</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#989AA1] mb-1">Name</label>
                  <input
                    type="text"
                    value={alternateExecutor.name}
                    onChange={(e) => setAlternateExecutor({ ...alternateExecutor, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#989AA1] mb-1">Relationship</label>
                  <input
                    type="text"
                    value={alternateExecutor.relationship}
                    onChange={(e) => setAlternateExecutor({ ...alternateExecutor, relationship: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#989AA1] mb-1">Contact Information</label>
                  <input
                    type="text"
                    value={alternateExecutor.contact}
                    onChange={(e) => setAlternateExecutor({ ...alternateExecutor, contact: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Beneficiaries</h2>
            <div className="space-y-4">
              {beneficiaries.map((beneficiary, index) => (
                <div key={index} className="bg-[#1A1B1E] p-4 rounded-lg">
                  <p>Name: {beneficiary.name}</p>
                  <p>Relationship: {beneficiary.relationship}</p>
                  <p>Allocation: {beneficiary.allocation}%</p>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={beneficiary.allocation}
                    onChange={(e) => handleUpdateBeneficiary(index, Number(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
              ))}
              <button
                onClick={handleAddBeneficiary}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Beneficiary
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">State Laws</h2>
            <button
              onClick={handleViewStateLaws}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              View State Laws
            </button>
            {showLaws && (
              <div className="bg-[#1A1B1E] p-4 rounded-lg mt-4">
                {stateLaws.map((law, index) => (
                  <p key={index} className="mb-2">{law}</p>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create Your Will</h1>
        <div className="mb-8">
          <div className="h-2 bg-gray-700 rounded-full">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / 4) * 100}%` }}
            />
          </div>
        </div>
        {renderStep()}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 text-[#989AA1] hover:text-white disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {currentStep === 3 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WillCreator; 