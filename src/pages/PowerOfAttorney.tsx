import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store/store';
import { documentService } from '../services/document.service';
import DocumentLayout from '../components/DocumentLayout';
import Select from '../components/Select';
import { DocumentType } from '../types/document.types';
import DocumentFlow from '../components/DocumentFlow';
import DocumentSteps from '../components/DocumentSteps';
import { Person } from '../features/people/peopleSlice';
import Modal from '../components/Modal';
import { useSnackbar } from 'notistack';
import { FiInfo } from 'react-icons/fi';
import { IconType } from 'react-icons';
import type { IconBaseProps } from 'react-icons';

interface Agent {
  id: string;
  name: string;
  relationship: string;
  type: 'primary' | 'successor';
  contact: {
    phone: string;
    email: string;
    address: string;
  };
}

interface Power {
  category: string;
  description: string;
  isGranted: boolean;
  limitations?: string;
}

interface PowerOfAttorneyData {
  type: 'general' | 'limited' | 'durable';
  effectiveDate: 'immediate' | 'springing';
  agents: Agent[];
  powers: Power[];
  limitations: string[];
  duration: {
    type: 'indefinite' | 'specific' | 'until-revoked';
    endDate?: string;
    conditions?: string;
  };
  revocationProcess: string;
}

const steps = [
  { id: 1, title: 'POA Type' },
  { id: 2, title: 'Agent Selection' },
  { id: 3, title: 'Powers Granted' },
  { id: 4, title: 'Limitations' },
  { id: 5, title: 'Duration' },
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

const PowerOfAttorney: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useSelector((state: RootState) => state.user);
  const { people } = useSelector((state: RootState) => state.people);
  const { enqueueSnackbar } = useSnackbar();
  const [currentStep, setCurrentStep] = useState(0);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [poaType, setPoaType] = useState<'general' | 'limited' | 'durable'>('general');
  const [effectiveDate, setEffectiveDate] = useState<'immediate' | 'springing'>('immediate');
  const [limitations, setLimitations] = useState<string[]>([]);
  const [duration, setDuration] = useState<PowerOfAttorneyData['duration']>({
    type: 'indefinite',
  });
  const [revocationProcess, setRevocationProcess] = useState<string>('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleCreateNewPerson = () => {
    navigate('/people/new');
  };

  const handleSelectAgent = (personId: string, type: 'primary' | 'successor') => {
    const person = people.find(p => p.id === personId);
    if (person) {
      const newAgent: Agent = {
        id: person.id,
        name: `${person.firstName} ${person.lastName}`,
        relationship: person.relationship,
        type: type,
        contact: {
          phone: person.contact.phone || '',
          email: person.contact.email || '',
          address: person.contact.address ? 
            `${person.contact.address.street}, ${person.contact.address.city}, ${person.contact.address.state} ${person.contact.address.zipCode}` : 
            ''
        }
      };
      setAgents([...agents.filter(a => a.type !== type), newAgent]);
    }
  };

  const [powers, setPowers] = useState<Power[]>([
    { category: 'Real Estate', description: 'Buy, sell, and manage real estate properties', isGranted: false },
    { category: 'Financial', description: 'Manage bank accounts and make financial decisions', isGranted: false },
    { category: 'Business', description: 'Operate and manage business interests', isGranted: false },
    { category: 'Legal', description: 'Represent in legal matters and file lawsuits', isGranted: false },
    { category: 'Healthcare', description: 'Make healthcare decisions (if applicable)', isGranted: false },
    { category: 'Taxes', description: 'Handle tax matters and file tax returns', isGranted: false },
  ]);

  const handlePowerToggle = (index: number) => {
    const newPowers = [...powers];
    newPowers[index] = { ...newPowers[index], isGranted: !newPowers[index].isGranted };
    setPowers(newPowers);
  };

  const handlePowerLimitationChange = (index: number, value: string) => {
    const newPowers = [...powers];
    newPowers[index] = { ...newPowers[index], limitations: value };
    setPowers(newPowers);
  };

  const handleAddLimitation = () => {
    setLimitations([...limitations, '']);
  };

  const handleLimitationChange = (index: number, value: string) => {
    const newLimitations = [...limitations];
    newLimitations[index] = value;
    setLimitations(newLimitations);
  };

  useEffect(() => {
    const savedProgress = localStorage.getItem('poaCreatorProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setCurrentStep(progress.currentStep);
      setDocumentId(progress.documentId);
      setAgents(progress.agents);
      setPoaType(progress.poaType);
      setEffectiveDate(progress.effectiveDate);
      setPowers(progress.powers);
      setLimitations(progress.limitations);
      setDuration(progress.duration);
      setRevocationProcess(progress.revocationProcess);
    }
  }, []);

  const handleSave = async () => {
    if (!profile) {
      enqueueSnackbar('Please log in to save your progress', { variant: 'error' });
      return;
    }

    try {
      let existingDoc = null;
      if (documentId) {
        existingDoc = await documentService.getDraft(documentId);
      }

      const poaData = {
        type: poaType,
        effectiveDate,
        agents,
        powers,
        limitations,
        duration,
        revocationProcess,
      };

      const document = {
        type: 'power-of-attorney' as DocumentType,
        metadata: {
          createdAt: existingDoc?.metadata.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'draft' as const,
          documentId: documentId || `poa-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        },
        content: {
          personalInfo: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            phone: profile.phone,
            address: profile.address
          },
          ...poaData
        }
      };

      await documentService.saveDocumentDraft(document);
      
      // Save progress with documentId
      localStorage.setItem('poaCreatorProgress', JSON.stringify({
        currentStep,
        documentId: document.metadata.documentId,
        agents,
        poaType,
        effectiveDate,
        powers,
        limitations,
        duration,
        revocationProcess
      }));

      // Store the documentId for future saves
      setDocumentId(document.metadata.documentId);
      
      enqueueSnackbar('Progress saved successfully', { variant: 'success' });
      setShowSaveModal(true);
    } catch (error) {
      console.error('Error saving power of attorney:', error);
      enqueueSnackbar('Failed to save progress', { variant: 'error' });
      throw error;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              Type of Power of Attorney
              <Tooltip text="Choose the type of authority you want to grant. A general POA gives broad powers, while a limited POA restricts authority to specific matters." />
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="general"
                  name="poaType"
                  value="general"
                  checked={poaType === 'general'}
                  onChange={(e) => setPoaType(e.target.value as 'general')}
                  className="form-radio"
                />
                <label htmlFor="general" className="ml-2 text-gray-300 flex items-center">
                  General Power of Attorney
                  <Tooltip text="Grants broad authority to handle most financial and legal matters on your behalf. Useful for comprehensive coverage but requires absolute trust." />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="limited"
                  name="poaType"
                  value="limited"
                  checked={poaType === 'limited'}
                  onChange={(e) => setPoaType(e.target.value as 'limited')}
                  className="form-radio"
                />
                <label htmlFor="limited" className="ml-2 text-gray-300 flex items-center">
                  Limited Power of Attorney
                  <Tooltip text="Restricts authority to specific transactions or time periods. Provides more control but may need multiple documents for different purposes." />
                </label>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              Agent Selection
              <Tooltip text="Your agent (attorney-in-fact) will make decisions on your behalf. Choose someone trustworthy who understands your wishes and can handle the responsibility." />
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#989AA1] mb-1 flex items-center">
                  Primary Agent
                  <Tooltip text="Your primary agent will be the first person authorized to act on your behalf. They should be someone you trust completely with your financial and legal matters." />
                </label>
                <Select
                  value={agents.find(a => a.type === 'primary')?.id || ''}
                  onChange={(value) => handleSelectAgent(value, 'primary')}
                  options={people
                    .filter(p => p.roles?.isPowerOfAttorney)
                    .map(p => ({ 
                      value: p.id, 
                      label: `${p.firstName} ${p.lastName}` 
                    }))}
                  placeholder="Select a primary agent"
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
                Successor Agent
                <Tooltip text="A backup agent who can step in if your primary agent is unable or unwilling to serve. Having a successor ensures continuity of protection." />
              </label>
              <div>
                <Select
                  value={agents.find(a => a.type === 'successor')?.id || ''}
                  onChange={(value) => handleSelectAgent(value, 'successor')}
                  options={people
                    .filter(p => p.roles?.isPowerOfAttorney && p.id !== agents.find(a => a.type === 'primary')?.id)
                    .map(p => ({ 
                      value: p.id, 
                      label: `${p.firstName} ${p.lastName}` 
                    }))}
                  placeholder="Select a successor agent"
                />
                <button
                  onClick={handleCreateNewPerson}
                  className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                >
                  + Create New Person
                </button>
              </div>
              {agents.find(a => a.type === 'successor') && (
                <div className="bg-[#1A1B1E] p-4 rounded-lg mt-2">
                  <p>Name: {agents.find(a => a.type === 'successor')?.name}</p>
                  <p>Relationship: {agents.find(a => a.type === 'successor')?.relationship}</p>
                  <p>Contact: {agents.find(a => a.type === 'successor')?.contact.email}</p>
                </div>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              Powers and Limitations
              <Tooltip text="Specify what your agent can and cannot do on your behalf. Be clear about any restrictions to prevent misuse of authority." />
            </h2>
            <div>
              <label className="block text-sm font-medium text-[#989AA1] mb-1 flex items-center">
                Financial Powers
                <Tooltip text="Authority to handle banking, investments, property transactions, and other financial matters. Consider which powers are necessary for your situation." />
              </label>
              <div className="space-y-6">
                {powers.map((power, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={power.isGranted}
                        onChange={() => handlePowerToggle(index)}
                        className="form-checkbox text-primary-600 bg-gray-800 border-gray-700"
                      />
                      <div>
                        <h4 className="font-medium text-white">{power.category}</h4>
                        <p className="text-sm text-gray-300">{power.description}</p>
                      </div>
                    </div>
                    {power.isGranted && (
                      <textarea
                        value={power.limitations || ''}
                        onChange={(e) => handlePowerLimitationChange(index, e.target.value)}
                        placeholder={`Any limitations or conditions for ${power.category.toLowerCase()} powers...`}
                        className="input-field h-24 w-full mt-2 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-[#989AA1] mb-1 flex items-center">
                Limitations and Restrictions
                <Tooltip text="Set specific limits on your agent's authority. This might include maximum transaction amounts or requiring consultation before major decisions." />
              </label>
              <div className="mt-4">
                <textarea
                  value={limitations.join('\n')}
                  onChange={(e) => setLimitations(e.target.value.split('\n'))}
                  rows={4}
                  className="input-field bg-gray-800 border-gray-700 text-white w-full"
                  placeholder="Enter any limitations or restrictions on the agent's powers..."
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              Duration and Activation
              <Tooltip text="Specify when the power of attorney begins and ends. Consider whether it should be effective immediately or only under specific circumstances." />
            </h2>
            <div>
              <label className="block text-sm font-medium text-[#989AA1] mb-1 flex items-center">
                Effective Date
                <Tooltip text="Choose when your POA becomes active. 'Springing' POAs only activate if you become incapacitated, while immediate POAs take effect upon signing." />
              </label>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="immediate"
                    name="effectiveDate"
                    value="immediate"
                    checked={effectiveDate === 'immediate'}
                    onChange={(e) => setEffectiveDate(e.target.value as 'immediate')}
                    className="form-radio text-primary-600"
                  />
                  <label htmlFor="immediate" className="ml-2 text-gray-300">
                    Immediately upon signing
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="springing"
                    name="effectiveDate"
                    value="springing"
                    checked={effectiveDate === 'springing'}
                    onChange={(e) => setEffectiveDate(e.target.value as 'springing')}
                    className="form-radio text-primary-600"
                  />
                  <label htmlFor="springing" className="ml-2 text-gray-300">
                    Only if I become incapacitated (Springing Power)
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-[#989AA1] mb-1 flex items-center">
                Expiration
                <Tooltip text="Set when the POA ends. This could be a specific date, upon your incapacity, or only upon your revocation." />
              </label>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="indefinite"
                    name="duration"
                    value="indefinite"
                    checked={duration.type === 'indefinite'}
                    onChange={(e) => setDuration({ ...duration, type: 'indefinite' })}
                    className="form-radio text-primary-600"
                  />
                  <label htmlFor="indefinite" className="ml-2 text-gray-300">
                    Indefinite until revoked
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="specific"
                    name="duration"
                    value="specific"
                    checked={duration.type === 'specific'}
                    onChange={(e) => setDuration({ ...duration, type: 'specific' })}
                    className="form-radio text-primary-600"
                  />
                  <label htmlFor="specific" className="ml-2 text-gray-300">
                    Specific end date
                  </label>
                </div>
                {duration.type === 'specific' && (
                  <input
                    type="date"
                    value={duration.endDate || ''}
                    onChange={(e) => setDuration({ ...duration, endDate: e.target.value })}
                    className="input-field bg-gray-800 border-gray-700 text-white"
                  />
                )}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Revocation Process</h3>
            <div className="space-y-4">
              <p className="text-gray-300">
                You can revoke this Power of Attorney at any time by:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Destroying all copies of the document</li>
                <li>Creating a new Power of Attorney that explicitly revokes this one</li>
                <li>Submitting a written revocation notice to your agent(s)</li>
                <li>Filing a revocation with the appropriate county clerk's office</li>
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DocumentLayout
      documentType="power-of-attorney"
      currentStep={currentStep}
      steps={steps}
      onStepClick={setCurrentStep}
      onSave={handleSave}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Create Your Power of Attorney</h1>
          <p className="text-[#989AA1]">Follow the steps below to create your power of attorney document.</p>
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
              onClick={handleSave}
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

      {/* Save Success Modal */}
      <Modal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Progress Saved"
      >
        <div className="p-6">
          <p className="text-lg text-gray-300 mb-6">
            Your progress has been saved successfully.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => navigate('/documents')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Return to My Documents
            </button>
            <button
              onClick={() => setShowSaveModal(false)}
              className="px-4 py-2 bg-[#1D1F23] text-white rounded-lg hover:bg-[#2D2F33] transition-colors"
            >
              Continue Editing
            </button>
          </div>
        </div>
      </Modal>
    </DocumentLayout>
  );
};

export default PowerOfAttorney; 