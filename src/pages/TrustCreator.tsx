import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { RootState } from '../store/store';
import { documentService } from '../services/document.service';
import DocumentLayout from '../components/DocumentLayout';
import { TrustBeneficiary, UserProfile } from '../features/user/userSlice';
import { Person } from '../features/people/peopleSlice';
import Select from '../components/Select';
import { DocumentType } from '../types/document.types';
import DocumentSteps from '../components/DocumentSteps';
import AddPersonModal from '../components/AddPersonModal';
import { useSnackbar } from 'notistack';
import Modal from '../components/Modal';
import { FiInfo } from 'react-icons/fi';
import { IconType } from 'react-icons';
import type { IconBaseProps } from 'react-icons';

interface Trustee {
  id: string;
  name: string;
  relationship: string;
  role: 'primary' | 'successor';
  contact: {
    email: string;
    phone: string;
  };
}

interface TrustData {
  type: 'revocable' | 'irrevocable';
  trustees: Trustee[];
  beneficiaries: TrustBeneficiary[];
  assets: {
    description: string;
    value: string;
    type: 'real-estate' | 'financial' | 'personal-property';
  }[];
  distribution: {
    type: 'equal' | 'specific' | 'percentage';
    instructions: string;
  };
}

interface TrustDocument {
  type: 'living-trust';
  currentStep: number;
  lastUpdated: string;
  trustees: Trustee[];
  beneficiaries: TrustBeneficiary[];
  assets: {
    description: string;
    value: string;
    type: 'real-estate' | 'financial' | 'personal-property';
  }[];
  distribution: {
    type: 'equal' | 'specific' | 'percentage';
    instructions: string;
  };
}

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
  { id: 1, title: 'Trust Type' },
  { id: 2, title: 'Trustee Selection' },
  { id: 3, title: 'Beneficiaries' },
  { id: 4, title: 'Trust Assets' },
  { id: 5, title: 'Distribution' },
  { id: 6, title: 'Review & Sign' }
];

const TrustCreator: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const existingDocumentId = searchParams.get('id');
  
  const profile = useSelector((state: RootState) => state.user.profile) as UserProfile | null;
  const { people } = useSelector((state: RootState) => state.people);
  const [currentStep, setCurrentStep] = useState(0);
  const [documentId, setDocumentId] = useState<string | null>(existingDocumentId);
  const [trustType, setTrustType] = useState<'revocable' | 'irrevocable'>('revocable');
  const [trustees, setTrustees] = useState<Trustee[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<TrustBeneficiary[]>([]);
  const [assets, setAssets] = useState<TrustData['assets']>([]);
  const [distribution, setDistribution] = useState<TrustData['distribution']>({
    type: 'equal',
    instructions: '',
  });
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [addingRole, setAddingRole] = useState<'trustee' | 'beneficiary' | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<TrustDocument>({
    type: 'living-trust',
    currentStep: 0,
    lastUpdated: new Date().toISOString(),
    trustees: [],
    beneficiaries: [],
    assets: [],
    distribution: {
      type: 'equal',
      instructions: '',
    },
  });

  useEffect(() => {
    const loadExistingDocument = async () => {
      if (existingDocumentId) {
        try {
          setIsLoading(true);
          setError(null);
          const doc = await documentService.getDraft(existingDocumentId);
          if (doc) {
            setCurrentStep(0); // Start at the beginning but with loaded data
            setTrustees(doc.content.trustees || []);
            setBeneficiaries(doc.content.beneficiaries || []);
            setAssets(doc.content.assets || []);
            setSpecialInstructions(doc.content.specialInstructions || '');
            setDocumentId(doc.metadata.documentId);
          }
        } catch (error) {
          console.error('Error loading document:', error);
          setError('Failed to load document');
          enqueueSnackbar('Failed to load document', { variant: 'error' });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadExistingDocument();
  }, [existingDocumentId, enqueueSnackbar]);

  const handleCreateNewPerson = () => {
    navigate('/people/new');
  };

  const handleSelectTrustee = (personId: string, role: 'primary' | 'successor') => {
    const person = people.find(p => p.id === personId);
    if (person) {
      const newTrustee: Trustee = {
        id: person.id,
        name: `${person.firstName} ${person.lastName}`,
        relationship: person.relationship,
        role: role,
        contact: {
          email: person.contact.email || '',
          phone: person.contact.phone || ''
        }
      };
      setTrustees([...trustees.filter(t => t.role !== role), newTrustee]);
    }
  };

  const handleSelectBeneficiary = (personId: string) => {
    const person = people.find(p => p.id === personId);
    if (person) {
      const newBeneficiary: TrustBeneficiary = {
        id: person.id,
        type: 'trust',
        firstName: person.firstName,
        lastName: person.lastName,
        relationship: person.relationship,
        share: 0,
        contact: person.contact,
        distribution: '',
        conditions: ''
      };
      setBeneficiaries([...beneficiaries, newBeneficiary]);
    }
  };

  const handleUpdateBeneficiary = (index: number, field: keyof TrustBeneficiary, value: string | number) => {
    const newBeneficiaries = [...beneficiaries];
    newBeneficiaries[index] = {
      ...newBeneficiaries[index],
      [field]: value
    };
    setBeneficiaries(newBeneficiaries);
  };

  const handleAddAsset = () => {
    setAssets([...assets, { description: '', value: '', type: 'financial' }]);
  };

  const handleAssetChange = (index: number, field: keyof TrustData['assets'][0], value: string) => {
    const newAssets = [...assets];
    newAssets[index] = { ...newAssets[index], [field]: value as any };
    setAssets(newAssets);
  };

  const handleSave = async () => {
    if (!profile) {
      setError('User profile is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const trustData: TrustData = {
        type: trustType,
        trustees,
        beneficiaries,
        assets,
        distribution,
      };

      const userProfile = {
        ...profile,
        financialInfo: {
          ...profile.financialInfo,
          totalValue: profile.financialInfo.totalValue || 0
        }
      };

      const document = await documentService.generateDocument('living-trust' as DocumentType, trustData, userProfile);
      await documentService.saveDocumentDraft(document);
      setDocumentId(document.metadata.documentId);
      setShowSuccessModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving the document');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!documentId) {
      setError('No document ID available');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const document = await documentService.getDraft(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      const pdfBlob = await documentService.generatePDF(document);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!documentId) {
        throw new Error('Document ID is required');
      }

      const document = await documentService.getDraft(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      const result = await documentService.submitDocument(document);
      if (!result.success) {
        throw new Error(result.message);
      }

      navigate('/documents');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProgress = async () => {
    if (!profile) {
      console.error('User profile not found');
      alert('Please log in to save your progress');
      return;
    }

    const progressData = {
      currentStep,
      trustees,
      beneficiaries,
      assets,
      distribution,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('trustCreatorProgress', JSON.stringify(progressData));

    const urlParams = new URLSearchParams(window.location.search);
    const existingId = urlParams.get('id');

    const documentData = {
      type: 'living-trust' as DocumentType,
      metadata: {
        documentId: existingId || crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: {
          uid: profile.uid,
          name: `${profile.firstName} ${profile.lastName}`,
          email: profile.email
        },
        status: 'draft' as const
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

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
    setDocument(prev => ({
      ...prev,
      currentStep: step
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              Trust Type
              <Tooltip text="Choose between a revocable trust that can be modified during your lifetime, or an irrevocable trust that cannot be changed once established." />
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="revocable"
                  name="trustType"
                  value="revocable"
                  checked={trustType === 'revocable'}
                  onChange={(e) => setTrustType(e.target.value as 'revocable')}
                  className="form-radio text-primary-600"
                />
                <label htmlFor="revocable" className="ml-2 text-gray-300 flex items-center">
                  Revocable Living Trust
                  <Tooltip text="A flexible trust that can be modified or revoked during your lifetime. Provides privacy and helps avoid probate." />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="irrevocable"
                  name="trustType"
                  value="irrevocable"
                  checked={trustType === 'irrevocable'}
                  onChange={(e) => setTrustType(e.target.value as 'irrevocable')}
                  className="form-radio text-primary-600"
                />
                <label htmlFor="irrevocable" className="ml-2 text-gray-300 flex items-center">
                  Irrevocable Trust
                  <Tooltip text="A permanent trust that cannot be modified once established. Often used for tax planning and asset protection." />
                </label>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              Trustee Selection
              <Tooltip text="Trustees are responsible for managing and distributing trust assets according to your wishes. Choose people you trust who are capable of handling financial responsibilities." />
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#989AA1] mb-1 flex items-center">
                  Select Primary Trustee
                  <Tooltip text="Your primary trustee will manage the trust during your lifetime (if you're not the trustee) and/or after your passing." />
                </label>
                <Select
                  value={trustees.find(t => t.role === 'primary')?.id || ''}
                  onChange={(value) => handleSelectTrustee(value, 'primary')}
                  options={people
                    .filter(p => p.roles?.isTrustee)
                    .map(p => ({ 
                      value: p.id, 
                      label: `${p.firstName} ${p.lastName}` 
                    }))}
                  placeholder="Select a primary trustee"
                />
                <button
                  onClick={handleCreateNewPerson}
                  className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                >
                  + Create New Person
                </button>
              </div>
              {trustees.find(t => t.role === 'primary') && (
                <div className="bg-[#1A1B1E] p-4 rounded-lg">
                  <p>Name: {trustees.find(t => t.role === 'primary')?.name}</p>
                  <p>Relationship: {trustees.find(t => t.role === 'primary')?.relationship}</p>
                  <p>Contact: {trustees.find(t => t.role === 'primary')?.contact.email}</p>
                </div>
              )}
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                Successor Trustee
                <Tooltip text="A successor trustee takes over if the primary trustee is unable or unwilling to serve. It's important to have a backup plan." />
              </h3>
              <div>
                <label className="block text-sm font-medium text-[#989AA1] mb-1">Select Successor Trustee</label>
                <Select
                  value={trustees.find(t => t.role === 'successor')?.id || ''}
                  onChange={(value) => handleSelectTrustee(value, 'successor')}
                  options={people
                    .filter(p => p.roles?.isTrustee && p.id !== trustees.find(t => t.role === 'primary')?.id)
                    .map(p => ({ 
                      value: p.id, 
                      label: `${p.firstName} ${p.lastName}` 
                    }))}
                  placeholder="Select a successor trustee"
                />
                <button
                  onClick={handleCreateNewPerson}
                  className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                >
                  + Create New Person
                </button>
              </div>
              {trustees.find(t => t.role === 'successor') && (
                <div className="bg-[#1A1B1E] p-4 rounded-lg mt-2">
                  <p>Name: {trustees.find(t => t.role === 'successor')?.name}</p>
                  <p>Relationship: {trustees.find(t => t.role === 'successor')?.relationship}</p>
                  <p>Contact: {trustees.find(t => t.role === 'successor')?.contact.email}</p>
                </div>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              Beneficiaries
              <Tooltip text="Beneficiaries are the people or organizations who will receive assets from your trust. You can specify how much each beneficiary receives and under what conditions." />
            </h2>
            <div>
              <label className="block text-sm font-medium text-[#989AA1] mb-1">Add Beneficiary</label>
              <Select
                value=""
                onChange={handleSelectBeneficiary}
                options={people
                  .filter(p => p.roles?.isBeneficiary && !beneficiaries.some(b => b.id === p.id))
                  .map(p => ({ 
                    value: p.id, 
                    label: `${p.firstName} ${p.lastName}` 
                  }))}
                placeholder="Select a beneficiary"
              />
              <button
                onClick={handleCreateNewPerson}
                className="mt-2 text-sm text-blue-500 hover:text-blue-600"
              >
                + Create New Person
              </button>
            </div>
            <div className="space-y-4 mt-4">
              {beneficiaries.map((beneficiary, index) => (
                <div key={beneficiary.id} className="bg-[#1A1B1E] p-4 rounded-lg">
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-[#989AA1] mb-1 flex items-center">
                      Share Percentage
                      <Tooltip text="The percentage of trust assets this beneficiary will receive. The total of all beneficiaries' shares should equal 100%." />
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={beneficiary.share}
                      onChange={(e) => handleUpdateBeneficiary(index, 'share', Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-[#989AA1] mt-1">{beneficiary.share}%</p>
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-[#989AA1] mb-1 flex items-center">
                      Distribution Instructions
                      <Tooltip text="Specify any special instructions for how and when this beneficiary should receive their share of the trust assets." />
                    </label>
                    <textarea
                      value={beneficiary.distribution}
                      onChange={(e) => handleUpdateBeneficiary(index, 'distribution', e.target.value)}
                      className="w-full p-2 bg-[#2D2F33] rounded-lg"
                      rows={2}
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-[#989AA1] mb-1 flex items-center">
                      Conditions
                      <Tooltip text="Optional conditions that must be met before the beneficiary can receive their inheritance (e.g., reaching a certain age, graduating college)." />
                    </label>
                    <textarea
                      value={beneficiary.conditions}
                      onChange={(e) => handleUpdateBeneficiary(index, 'conditions', e.target.value)}
                      className="w-full p-2 bg-[#2D2F33] rounded-lg"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white flex items-center">
                Trust Assets
                <Tooltip text="List the major assets you plan to transfer into your trust. This helps ensure nothing is overlooked and provides clarity for your trustees." />
              </h3>
              <button
                onClick={handleAddAsset}
                className="text-primary-400 hover:text-primary-300"
              >
                + Add Asset
              </button>
            </div>
            <div className="space-y-4">
              {assets.map((asset, index) => (
                <div key={index} className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={asset.description}
                    onChange={(e) => handleAssetChange(index, 'description', e.target.value)}
                    placeholder="Description"
                    className="input-field bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  />
                  <input
                    type="text"
                    value={asset.value}
                    onChange={(e) => handleAssetChange(index, 'value', e.target.value)}
                    placeholder="Value"
                    className="input-field bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  />
                  <select
                    value={asset.type}
                    onChange={(e) => handleAssetChange(index, 'type', e.target.value)}
                    className="input-field bg-gray-800 border-gray-700 text-white"
                  >
                    <option value="real-estate">Real Estate</option>
                    <option value="financial">Financial Assets</option>
                    <option value="personal-property">Personal Property</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h3 className="text-lg font-medium text-white flex items-center mb-4">
              Distribution Instructions
              <Tooltip text="Specify how you want your trust assets distributed among beneficiaries. You can choose equal shares, specific amounts, or percentage-based distribution." />
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  Distribution Type
                  <Tooltip text="Equal: Assets split evenly among beneficiaries. Specific: Set dollar amounts for each. Percentage: Custom percentage for each beneficiary." />
                </label>
                <select
                  value={distribution.type}
                  onChange={(e) => setDistribution({ ...distribution, type: e.target.value as any })}
                  className="input-field bg-gray-800 border-gray-700 text-white w-full"
                >
                  <option value="equal">Equal Distribution</option>
                  <option value="specific">Specific Distribution</option>
                  <option value="percentage">Percentage-based Distribution</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  Additional Instructions
                  <Tooltip text="Include any special conditions, timing of distributions, or other important details about how you want your assets distributed." />
                </label>
                <textarea
                  value={distribution.instructions}
                  onChange={(e) => setDistribution({ ...distribution, instructions: e.target.value })}
                  rows={4}
                  className="input-field bg-gray-800 border-gray-700 text-white w-full"
                  placeholder="Enter any additional distribution instructions or conditions..."
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DocumentLayout
      documentType="living-trust"
      currentStep={currentStep}
      steps={steps}
      onStepClick={handleStepClick}
      onSave={handleSave}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Create Your Living Trust</h1>
          <p className="text-[#989AA1]">Follow the steps below to create your living trust document.</p>
        </div>

        <div className="flex h-screen">
          <DocumentSteps
            type="living-trust"
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
          {renderStep()}
        </div>

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

        {error && (
          <div className="mt-4 p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg text-red-500">
            {error}
          </div>
        )}
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

export default TrustCreator; 