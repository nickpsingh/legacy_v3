import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store/store';
import { documentService } from '../services/document.service';
import DocumentLayout from '../components/DocumentLayout';
import Select from '../components/Select';
import {
  DocumentType,
  DocumentStatus,
  DocumentData,
  HealthcareAgent,
  LivingWillContent,
  LivingWillDocument
} from '../types/document.types';
import DocumentSteps from '../components/DocumentSteps';
import { FiInfo } from 'react-icons/fi';
import { IconType } from 'react-icons';
import type { IconBaseProps } from 'react-icons';

interface MedicalPreference {
  category: string;
  description: string;
  preference: 'yes' | 'no' | 'undecided';
}

type OrganDonationPreference = 'yes' | 'no' | 'specific';

interface LivingWillData {
  agents: HealthcareAgent[];
  preferences: {
    lifeSupportPreference: string;
    painManagement: string;
    organDonation: {
      preference: 'yes' | 'no' | 'specific';
      specificOrgans?: string[];
    };
    specialInstructions: string;
    religiousPreferences: string;
    notificationRequirements: string[];
  };
}

// Add Modal component at the top level
const SaveSuccessModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleReturnToDocuments = () => {
    navigate('/documents');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1A1B1E] p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold text-white mb-4">Success!</h3>
        <p className="text-gray-300 mb-6">Your progress has been saved successfully.</p>
        <button
          onClick={handleReturnToDocuments}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Return to My Documents
        </button>
      </div>
    </div>
  );
};

const steps = [
  { id: 1, title: 'Healthcare Agent' },
  { id: 2, title: 'Medical Preferences' },
  { id: 3, title: 'Organ Donation' },
  { id: 4, title: 'Special Instructions' },
  { id: 5, title: 'Religious Preferences' },
  { id: 6, title: 'Review & Sign' }
];

// Add Tooltip component
const Tooltip: React.FC<{ text: string }> = ({ text }) => {
  const Icon = FiInfo as React.FC<IconBaseProps>;
  return (
    <div className="group relative inline-block ml-2">
      <Icon className="text-[#989AA1] hover:text-white cursor-help w-4 h-4" />
      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#2D2F33] text-white text-sm rounded-lg py-2 px-3 absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 shadow-lg">
        {text}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-[#2D2F33]"></div>
      </div>
    </div>
  );
};

const LivingWill: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useSelector((state: RootState) => state.user);
  const [currentStep, setCurrentStep] = useState(0);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [agents, setAgents] = useState<HealthcareAgent[]>([]);
  const [organDonation, setOrganDonation] = useState<OrganDonationPreference>('no');
  const [specificOrgans, setSpecificOrgans] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [religiousPreferences, setReligiousPreferences] = useState<string>('');
  const [notificationRequirements, setNotificationRequirements] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Mock data for existing people - replace with actual data from your store
  const existingPeople = [
    { id: '1', name: 'John Doe', relationship: 'Brother', contact: { email: 'john@example.com', phone: '123-456-7890' } },
    { id: '2', name: 'Jane Smith', relationship: 'Sister', contact: { email: 'jane@example.com', phone: '098-765-4321' } },
  ];

  const handleCreateNewPerson = () => {
    navigate('/people/new');
  };

  const handleSelectAgent = (personId: string, type: 'primary' | 'alternate') => {
    const person = existingPeople.find(p => p.id === personId);
    if (person) {
      const newAgent: HealthcareAgent = {
        id: person.id,
        name: person.name,
        relationship: person.relationship,
        type: type,
        contact: person.contact
      };
      setAgents([...agents.filter(a => a.type !== type), newAgent]);
    }
  };

  const [preferences, setPreferences] = useState({
    lifeSupportPreference: '',
    painManagement: '',
  });

  const handlePreferenceChange = (key: keyof typeof preferences, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddNotification = () => {
    setNotificationRequirements([...notificationRequirements, '']);
  };

  const handleNotificationChange = (index: number, value: string) => {
    const newNotifications = [...notificationRequirements];
    newNotifications[index] = value;
    setNotificationRequirements(newNotifications);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              Healthcare Agent
              <Tooltip text="Your healthcare agent (also known as a medical proxy) will make medical decisions on your behalf if you're unable to do so. Choose someone who understands and will respect your wishes." />
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#989AA1] mb-1 flex items-center">
                  Primary Healthcare Agent
                  <Tooltip text="This person will be your first choice for making medical decisions. They should be familiar with your values and healthcare preferences." />
                </label>
                <Select
                  value={agents.find(a => a.type === 'primary')?.id || ''}
                  onChange={(value) => handleSelectAgent(value, 'primary')}
                  options={existingPeople.map(p => ({ value: p.id, label: p.name }))}
                  placeholder="Select a primary healthcare agent"
                />
                <button
                  onClick={handleCreateNewPerson}
                  className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                >
                  + Create New Person
                </button>
              </div>
              {agents.find(a => a.type === 'primary') && (
                <div className="bg-[#1A1B1E] p-4 rounded-lg">
                  <p>Name: {agents.find(a => a.type === 'primary')?.name}</p>
                  <p>Relationship: {agents.find(a => a.type === 'primary')?.relationship}</p>
                  <p>Contact: {agents.find(a => a.type === 'primary')?.contact.email}</p>
                </div>
              )}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-[#989AA1] mb-1 flex items-center">
                Alternate Healthcare Agent
                <Tooltip text="Your backup agent who steps in if your primary agent is unavailable. They should also understand your healthcare wishes." />
              </label>
              <div>
                <Select
                  value={agents.find(a => a.type === 'alternate')?.id || ''}
                  onChange={(value) => handleSelectAgent(value, 'alternate')}
                  options={existingPeople
                    .filter(p => p.id !== agents.find(a => a.type === 'primary')?.id)
                    .map(p => ({ value: p.id, label: p.name }))}
                  placeholder="Select an alternate healthcare agent"
                />
                <button
                  onClick={handleCreateNewPerson}
                  className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                >
                  + Create New Person
                </button>
              </div>
              {agents.find(a => a.type === 'alternate') && (
                <div className="bg-[#1A1B1E] p-4 rounded-lg mt-2">
                  <p>Name: {agents.find(a => a.type === 'alternate')?.name}</p>
                  <p>Relationship: {agents.find(a => a.type === 'alternate')?.relationship}</p>
                  <p>Contact: {agents.find(a => a.type === 'alternate')?.contact.email}</p>
                </div>
              )}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              Medical Preferences
              <Tooltip text="Specify your preferences for medical treatment in various situations. These instructions guide your healthcare team and agent in making decisions that align with your wishes." />
            </h2>
            <div className="space-y-4">
              <div className="bg-[#1A1B1E] p-4 rounded-lg">
                <h3 className="font-medium mb-2">Life-Sustaining Treatment</h3>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={preferences.lifeSupportPreference === 'yes'}
                      onChange={() => handlePreferenceChange('lifeSupportPreference', 'yes')}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={preferences.lifeSupportPreference === 'no'}
                      onChange={() => handlePreferenceChange('lifeSupportPreference', 'no')}
                      className="mr-2"
                    />
                    No
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={preferences.lifeSupportPreference === 'undecided'}
                      onChange={() => handlePreferenceChange('lifeSupportPreference', 'undecided')}
                      className="mr-2"
                    />
                    Undecided
                  </label>
                </div>
              </div>
              <div className="bg-[#1A1B1E] p-4 rounded-lg">
                <h3 className="font-medium mb-2">Pain Management</h3>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={preferences.painManagement === 'yes'}
                      onChange={() => handlePreferenceChange('painManagement', 'yes')}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={preferences.painManagement === 'no'}
                      onChange={() => handlePreferenceChange('painManagement', 'no')}
                      className="mr-2"
                    />
                    No
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={preferences.painManagement === 'undecided'}
                      onChange={() => handlePreferenceChange('painManagement', 'undecided')}
                      className="mr-2"
                    />
                    Undecided
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              Organ Donation
              <Tooltip text="Decide whether you want to donate your organs and tissues after death. Your choice can help save or improve the lives of others." />
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={organDonation === 'yes'}
                    onChange={() => setOrganDonation('yes')}
                    className="mr-2"
                  />
                  Yes, donate any needed organs
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={organDonation === 'no'}
                    onChange={() => setOrganDonation('no')}
                    className="mr-2"
                  />
                  No organ donation
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={organDonation === 'specific'}
                    onChange={() => setOrganDonation('specific')}
                    className="mr-2"
                  />
                  Specific organs only
                </label>
              </div>
              {organDonation === 'specific' && (
                <textarea
                  value={specificOrgans.join(', ')}
                  onChange={(e) => setSpecificOrgans(e.target.value.split(', '))}
                  placeholder="List specific organs for donation"
                  className="w-full p-2 bg-[#2D2F33] rounded-lg"
                  rows={3}
                />
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              Additional Instructions
              <Tooltip text="Include any other healthcare preferences, religious considerations, or personal values that should guide your care." />
            </h2>
            <div>
              <label className="block text-sm font-medium text-[#989AA1] mb-1 flex items-center">
                Special Requests
                <Tooltip text="Add specific instructions about your care, such as religious practices, preferred healthcare facilities, or other personal preferences." />
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special instructions or preferences for your medical care..."
                className="w-full p-2 bg-[#2D2F33] rounded-lg"
                rows={3}
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Religious/Cultural Preferences</h2>
            <textarea
              value={religiousPreferences}
              onChange={(e) => setReligiousPreferences(e.target.value)}
              placeholder="Any religious or cultural preferences that should be respected..."
              className="w-full p-2 bg-[#2D2F33] rounded-lg"
              rows={3}
            />
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Notification Requirements</h2>
            <div className="space-y-4">
              <button
                onClick={handleAddNotification}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                + Add Requirement
              </button>
              {notificationRequirements.map((requirement, index) => (
                <div key={index} className="flex items-center justify-between">
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) => handleNotificationChange(index, e.target.value)}
                    placeholder="E.g., Notify family members before major procedures"
                    className="w-full p-2 bg-[#2D2F33] rounded-lg"
                  />
                  <button
                    onClick={() => handleNotificationChange(index, '')}
                    className="text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Review and Submit</h2>
            <button
              onClick={handleSave}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              Save and Submit
            </button>
          </div>
        );
    }
  };

  const handleSave = async () => {
    if (!profile) {
      console.error('User profile is required');
      return;
    }

    const livingWillData: LivingWillData = {
      agents,
      preferences: {
        lifeSupportPreference: preferences.lifeSupportPreference,
        painManagement: preferences.painManagement,
        organDonation: {
          preference: organDonation,
          specificOrgans: organDonation === 'specific' ? specificOrgans : undefined,
        },
        specialInstructions,
        religiousPreferences,
        notificationRequirements,
      },
    };

    // Cast profile to match the expected type
    const userProfile = {
      ...profile,
      financialInfo: {
        ...profile.financialInfo,
        totalValue: profile.financialInfo.totalValue || 0
      }
    };

    const document = documentService.generateDocument('living-will' as DocumentType, livingWillData, userProfile);
    await documentService.saveDocumentDraft(document);
    setDocumentId(document.metadata.documentId);
  };

  const handlePreview = async () => {
    if (!documentId) return;

    const document = await documentService.getDraft(documentId);
    if (!document) return;

    const pdfBlob = await documentService.generatePDF(document);
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl);
  };

  const handleSubmit = async () => {
    if (!documentId) return;

    const document = await documentService.getDraft(documentId);
    if (!document) return;

    const result = await documentService.submitDocument(document);
    if (result.success) {
      // Show success message and redirect
    } else {
      // Show error message
    }
  };

  const handleSaveProgress = async () => {
    if (!profile) {
      console.error('User profile not found');
      alert('Please log in to save your progress');
      return;
    }

    const progressData: LivingWillContent = {
      currentStep,
      agents,
      preferences: {
        lifeSupportPreference: preferences.lifeSupportPreference,
        painManagement: preferences.painManagement,
        organDonation: {
          preference: organDonation,
          specificOrgans: organDonation === 'specific' ? specificOrgans : undefined,
        },
        specialInstructions,
        religiousPreferences,
        notificationRequirements,
      },
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('livingWillProgress', JSON.stringify(progressData));

    const urlParams = new URLSearchParams(window.location.search);
    const existingId = urlParams.get('id');

    const documentData: LivingWillDocument = {
      type: 'living-will',
      title: `${profile.firstName}'s Living Will`,
      metadata: {
        documentId: existingId || crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: {
          uid: profile.uid,
          name: `${profile.firstName} ${profile.lastName}`,
          email: profile.email
        },
        status: 'draft'
      },
      content: progressData
    };

    try {
      await documentService.saveDocumentDraft(documentData);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving progress:', error);
      alert('Failed to save progress. Please try again.');
    }
  };

  useEffect(() => {
    const savedProgress = localStorage.getItem('livingWillProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setCurrentStep(progress.currentStep);
      setAgents(progress.agents);
      setPreferences(progress.preferences);
      setOrganDonation(progress.organDonation);
      setSpecificOrgans(progress.specificOrgans || []);
      setSpecialInstructions(progress.specialInstructions);
      setReligiousPreferences(progress.religiousPreferences);
      setNotificationRequirements(progress.notificationRequirements);
    }
  }, []);

  return (
    <DocumentLayout
      documentType="living-will"
      currentStep={currentStep}
      steps={steps}
      onStepClick={(step) => setCurrentStep(step)}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Create Your Living Will</h1>
          <p className="text-[#989AA1]">Follow the steps below to create your living will and healthcare directive.</p>
        </div>

        {renderStep()}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            className={`px-6 py-2 rounded-lg ${
              currentStep === 0
                ? 'bg-[#1D1F23] text-[#989AA1] cursor-not-allowed'
                : 'bg-[#1D1F23] text-white hover:bg-[#2D2F33]'
            }`}
            disabled={currentStep === 0}
          >
            Previous
          </button>
          <div className="flex gap-4">
            <button
              onClick={handleSaveProgress}
              className="px-6 py-2 bg-[#1D1F23] text-white rounded-lg hover:bg-[#2D2F33]"
            >
              Save Progress
            </button>
            <button
              onClick={() => {
                if (currentStep === steps.length - 1) {
                  handleSave();
                } else {
                  setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
                }
              }}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {currentStep === steps.length - 1 ? 'Submit' : 'Continue'}
            </button>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <SaveSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </DocumentLayout>
  );
};

export default LivingWill; 