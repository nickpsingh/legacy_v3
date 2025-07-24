import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { RootState } from '../store/store';
import { UserProfile, Address, Asset, addAsset } from '../features/user/userSlice';
import { Person } from '../features/people/peopleSlice';
import DocumentSteps from '../components/DocumentSteps';
import DocumentLayout from '../components/DocumentLayout';
import Select from '../components/Select';
import AddPersonModal from '../components/AddPersonModal';
import { documentService } from '../services/document.service';
import { DocumentData, DocumentType } from '../types/document';
import { useSnackbar } from 'notistack';
import Modal from '../components/Modal';
import { FiInfo, FiPlus, FiCheck } from 'react-icons/fi';
import { IconType } from 'react-icons';
import type { IconBaseProps } from 'react-icons';

// Create icon components with proper typing
const PlusIcon = () => {
  const Icon = FiPlus as React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
  return <Icon size={16} aria-hidden={true} />;
};

const CheckIcon = () => {
  const Icon = FiCheck as React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
  return <Icon size={12} aria-hidden={true} />;
};

interface WillExecutor extends Omit<Person, 'roles'> {
  roles: {
    isExecutor: true;
  };
  createdAt: string;
  updatedAt: string;
}

interface WillBeneficiary extends Omit<Person, 'roles'> {
  type: 'individual' | 'organization';
  allocation: number;
  share: string;
  roles: {
    isBeneficiary: true;
  };
  createdAt: string;
  updatedAt: string;
}

interface WillData {
  id?: string;
  type: DocumentType;
  metadata: {
    createdAt: string;
    updatedAt: string;
    status: 'draft' | 'completed' | 'submitted';
    documentId: string;
  };
  content: {
    personalInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: Address;
    };
    executors: WillExecutor[];
    beneficiaries: WillBeneficiary[];
    assets: Asset[];
    specialRequests: string;
  };
}

const steps = [
  { id: 1, title: 'Personal Information' },
  { id: 2, title: 'Executors' },
  { id: 3, title: 'Beneficiaries' },
  { id: 4, title: 'Assets' },
  { id: 5, title: 'Special Requests' },
  { id: 6, title: 'Review & Submit' }
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

const WillCreator: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const searchParams = new URLSearchParams(location.search);
  const existingDocumentId = searchParams.get('id');
  
  const profile = useSelector((state: RootState) => state.user.profile) as UserProfile | null;
  const { people } = useSelector((state: RootState) => state.people);
  const userAssets = profile?.financialInfo?.assets || [];
  
  const [currentStep, setCurrentStep] = useState(0);
  const [documentId, setDocumentId] = useState<string | null>(existingDocumentId);
  const [documentStatus, setDocumentStatus] = useState<'draft' | 'completed' | 'submitted'>('draft');
  const [executor, setExecutor] = useState<WillExecutor | null>(null);
  const [alternateExecutor, setAlternateExecutor] = useState<WillExecutor | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<WillBeneficiary[]>([]);
  const [stateLaws, setStateLaws] = useState<string[]>([]);
  const [showLaws, setShowLaws] = useState(false);
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [addingRole, setAddingRole] = useState<'executor' | 'beneficiary' | null>(null);
  const [specialRequests, setSpecialRequests] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [newAssetForm, setNewAssetForm] = useState({
    name: '',
    type: 'real_estate' as Asset['type'],
    value: 0,
    amount: 0,
    description: ''
  });

  useEffect(() => {
    const loadExistingDocument = async () => {
      if (existingDocumentId) {
        try {
          const doc = await documentService.getDraft(existingDocumentId);
          if (doc) {
            setCurrentStep(0);
            setExecutor(doc.content.executors[0] || null);
            setAlternateExecutor(doc.content.executors[1] || null);
            setBeneficiaries(doc.content.beneficiaries || []);
            setSelectedAssets(doc.content.assets || []);
            setSpecialRequests(doc.content.specialRequests || '');
            setDocumentId(doc.metadata.documentId);
            setDocumentStatus(doc.metadata.status);
          }
        } catch (error) {
          console.error('Error loading document:', error);
          enqueueSnackbar('Failed to load document', { variant: 'error' });
        }
      } else {
        // Try to load from localStorage
        const savedProgress = localStorage.getItem('willCreatorProgress');
        if (savedProgress) {
          try {
            const {
              currentStep: savedStep,
              executor: savedExecutor,
              alternateExecutor: savedAlternateExecutor,
              beneficiaries: savedBeneficiaries,
              selectedAssets: savedAssets,
              specialRequests: savedSpecialRequests,
              documentId: savedDocumentId
            } = JSON.parse(savedProgress);

            setCurrentStep(savedStep || 0);
            setExecutor(savedExecutor || null);
            setAlternateExecutor(savedAlternateExecutor || null);
            setBeneficiaries(savedBeneficiaries || []);
            setSelectedAssets(savedAssets || []);
            setSpecialRequests(savedSpecialRequests || '');
            setDocumentId(savedDocumentId || null);
          } catch (error) {
            console.error('Error parsing saved progress:', error);
          }
        }
      }
    };

    loadExistingDocument();
  }, [existingDocumentId, enqueueSnackbar]);

  const handleCreateNewPerson = (role: 'executor' | 'beneficiary') => {
    setAddingRole(role);
    setShowAddPersonModal(true);
  };

  const handleSelectPerson = (person: Person) => {
    const now = new Date().toISOString();
    
    if (addingRole === 'executor') {
      const executorData: WillExecutor = {
        id: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        relationship: person.relationship,
        contact: person.contact,
        roles: { isExecutor: true as const },
        createdAt: now,
        updatedAt: now
      };
      setExecutor(executorData);
    } else if (addingRole === 'beneficiary') {
      const beneficiaryData: WillBeneficiary = {
        id: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        relationship: person.relationship,
        contact: person.contact,
        type: 'individual',
        allocation: 0,
        share: '',
        roles: { isBeneficiary: true as const },
        createdAt: now,
        updatedAt: now
      };
      setBeneficiaries(prevBeneficiaries => prevBeneficiaries.concat(beneficiaryData));
    }
  };

  const handleSelectExecutor = (personId: string) => {
    const person = people.find(p => p.id === personId);
    if (person) {
      const executorData: WillExecutor = {
        id: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        relationship: person.relationship,
        contact: person.contact,
        roles: { isExecutor: true as const },
        createdAt: person.createdAt,
        updatedAt: new Date().toISOString()
      };
      setExecutor(executorData);
    }
  };

  const handleSelectAlternateExecutor = (personId: string) => {
    const person = people.find(p => p.id === personId);
    if (person) {
      const alternateExecutorData: WillExecutor = {
        id: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        relationship: person.relationship,
        contact: person.contact,
        roles: { isExecutor: true as const },
        createdAt: person.createdAt,
        updatedAt: new Date().toISOString()
      };
      setAlternateExecutor(alternateExecutorData);
    }
  };

  const handleUpdateBeneficiary = (index: number, newAllocation: number) => {
    setBeneficiaries(prevBeneficiaries => {
      // Calculate total allocation excluding the current beneficiary
      const otherAllocationsTotal = prevBeneficiaries.reduce((sum, b, i) => 
        i === index ? sum : sum + b.allocation, 0);
      
      // Ensure new total doesn't exceed 100%
      if (otherAllocationsTotal + newAllocation > 100) {
        // If exceeding, set to remaining available percentage
        newAllocation = 100 - otherAllocationsTotal;
      }

      return prevBeneficiaries.map((beneficiary, i) => {
        if (i === index) {
          return {
            ...beneficiary,
            allocation: newAllocation,
            share: newAllocation.toString(),
            updatedAt: new Date().toISOString()
          };
        }
        return beneficiary;
      });
    });
  };

  const getTotalAllocation = () => {
    return beneficiaries.reduce((sum, beneficiary) => sum + beneficiary.allocation, 0);
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

  const handleAddExecutor = () => {
    const newExecutor: WillExecutor = {
      id: crypto.randomUUID(),
      firstName: '',
      lastName: '',
      relationship: '',
      contact: {
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      },
      roles: {
        isExecutor: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setExecutor(newExecutor);
  };

  const handleAddBeneficiary = () => {
    const newBeneficiary: WillBeneficiary = {
      id: crypto.randomUUID(),
      firstName: '',
      lastName: '',
      relationship: '',
      contact: {
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      },
      roles: { isBeneficiary: true as const },
      type: 'individual',
      allocation: 0,
      share: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setBeneficiaries(beneficiaries.concat([newBeneficiary]));
  };

  const handleExecutorChange = (field: string, value: string) => {
    if (!executor) return;
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      const updatedExecutor: WillExecutor = {
        id: executor.id,
        firstName: executor.firstName,
        lastName: executor.lastName,
        relationship: executor.relationship,
        contact: parent === 'contact' 
          ? {
              email: child === 'email' ? value : executor.contact.email,
              phone: child === 'phone' ? value : executor.contact.phone,
              address: child === 'address' ? executor.contact.address : executor.contact.address
            }
          : executor.contact,
        roles: { isExecutor: true as const },
        createdAt: executor.createdAt,
        updatedAt: new Date().toISOString()
      };
      setExecutor(updatedExecutor);
    } else {
      const updatedExecutor: WillExecutor = {
        id: executor.id,
        firstName: field === 'firstName' ? value : executor.firstName,
        lastName: field === 'lastName' ? value : executor.lastName,
        relationship: field === 'relationship' ? value : executor.relationship,
        contact: executor.contact,
        roles: { isExecutor: true as const },
        createdAt: executor.createdAt,
        updatedAt: new Date().toISOString()
      };
      setExecutor(updatedExecutor);
    }
  };

  const handleBeneficiaryChange = (index: number, field: string, value: string) => {
    setBeneficiaries(prevBeneficiaries => {
      return prevBeneficiaries.map((beneficiary, i) => {
        if (i !== index) return beneficiary;

        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          return {
            id: beneficiary.id,
            firstName: beneficiary.firstName,
            lastName: beneficiary.lastName,
            relationship: beneficiary.relationship,
            contact: parent === 'contact'
              ? {
                  email: child === 'email' ? value : beneficiary.contact.email,
                  phone: child === 'phone' ? value : beneficiary.contact.phone,
                  address: child === 'address' ? beneficiary.contact.address : beneficiary.contact.address
                }
              : beneficiary.contact,
            type: beneficiary.type,
            allocation: beneficiary.allocation,
            share: beneficiary.share,
            roles: { isBeneficiary: true as const },
            createdAt: beneficiary.createdAt,
            updatedAt: new Date().toISOString()
          };
        } else {
          return {
            id: beneficiary.id,
            firstName: field === 'firstName' ? value : beneficiary.firstName,
            lastName: field === 'lastName' ? value : beneficiary.lastName,
            relationship: field === 'relationship' ? value : beneficiary.relationship,
            contact: beneficiary.contact,
            type: field === 'type' ? value as 'individual' | 'organization' : beneficiary.type,
            allocation: field === 'allocation' ? Number(value) : beneficiary.allocation,
            share: field === 'share' ? value : beneficiary.share,
            roles: { isBeneficiary: true as const },
            createdAt: beneficiary.createdAt,
            updatedAt: new Date().toISOString()
          };
        }
      });
    });
  };

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

      const willData: WillData = {
        type: 'will',
        metadata: {
          createdAt: existingDoc?.metadata.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'draft',
          documentId: documentId || `will-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        },
        content: {
          personalInfo: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            phone: profile.phone,
            address: profile.address
          },
          executors: [
            ...(executor ? [executor] : []),
            ...(alternateExecutor ? [alternateExecutor] : [])
          ],
          beneficiaries,
          assets: selectedAssets,
          specialRequests: specialRequests || ''
        }
      };

      await documentService.saveDocumentDraft(willData);
      
      // Save progress with all form data
      localStorage.setItem('willCreatorProgress', JSON.stringify({
        currentStep,
        executor,
        alternateExecutor,
        beneficiaries,
        selectedAssets,
        specialRequests,
        documentId: willData.metadata.documentId
      }));

      // Store the documentId for future saves
      setDocumentId(willData.metadata.documentId);
      
      enqueueSnackbar('Progress saved successfully', { variant: 'success' });
      setShowSaveModal(true);
    } catch (error) {
      console.error('Error saving will:', error);
      enqueueSnackbar('Failed to save progress', { variant: 'error' });
      throw error;
    }
  };

  const handleAddAsset = () => {
    setShowAddAssetModal(true);
  };

  const handleAssetToggle = (asset: Asset) => {
    setSelectedAssets(prevSelected => {
      const isSelected = prevSelected.some(a => a.id === asset.id);
      if (isSelected) {
        return prevSelected.filter(a => a.id !== asset.id);
      } else {
        return [...prevSelected, asset];
      }
    });
  };

  const handleCreateNewAsset = () => {
    if (!newAssetForm.name.trim()) {
      enqueueSnackbar('Please enter an asset name', { variant: 'error' });
      return;
    }

    const newAsset: Asset = {
      id: crypto.randomUUID(),
      name: newAssetForm.name,
      type: newAssetForm.type,
      value: newAssetForm.value,
      amount: newAssetForm.amount || newAssetForm.value,
      description: newAssetForm.description,
      lastUpdated: new Date().toISOString()
    };

    dispatch(addAsset(newAsset));
    setSelectedAssets(prev => [...prev, newAsset]);
    setNewAssetForm({
      name: '',
      type: 'real_estate',
      value: 0,
      amount: 0,
      description: ''
    });
    setShowAddAssetModal(false);
    enqueueSnackbar('Asset added successfully', { variant: 'success' });
  };



  const handleSubmit = async () => {
    if (!profile) {
      enqueueSnackbar('Please log in to submit your will', { variant: 'error' });
      return;
    }

    try {
      const willData: WillData = {
        type: 'will',
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'submitted',
          documentId: documentId || `will-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        },
        content: {
          personalInfo: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            phone: profile.phone,
            address: profile.address
          },
          executors: [
            ...(executor ? [executor] : []),
            ...(alternateExecutor ? [alternateExecutor] : [])
          ],
          beneficiaries,
          assets: selectedAssets,
          specialRequests: specialRequests || ''
        }
      };

      const result = await documentService.submitDocument(willData);
      
      if (result.success) {
        setDocumentStatus('submitted');
        enqueueSnackbar('Will submitted successfully', { variant: 'success' });
        localStorage.removeItem('willCreatorProgress');
        navigate('/documents');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error submitting will:', error);
      enqueueSnackbar('Failed to submit will', { variant: 'error' });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              Personal Information
              <Tooltip text="Basic information about you that will be used in your will. This ensures your will is properly identified and legally valid." />
            </h2>
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
            <h2 className="text-xl font-semibold flex items-center">
              Executor Selection
              <Tooltip text="An executor is the person responsible for carrying out the instructions in your will after your passing. They will manage your estate, pay debts, and distribute assets to beneficiaries." />
            </h2>
            <div>
              <label className="block text-sm font-medium text-[#989AA1] mb-1 flex items-center">
                Primary Executor
                <Tooltip text="Your primary executor is the first person responsible for handling your estate. Choose someone trustworthy and capable of managing financial and legal matters." />
              </label>
              <Select
                value={executor?.id || ''}
                onChange={handleSelectExecutor}
                options={people
                  .filter(p => p.roles?.isExecutor)
                  .map(p => ({ 
                    value: p.id, 
                    label: `${p.firstName} ${p.lastName}` 
                  }))}
                placeholder="Select an executor"
              />
              <button
                onClick={() => handleCreateNewPerson('executor')}
                className="mt-2 text-sm text-blue-500 hover:text-blue-600"
              >
                + Create New Person
              </button>
            </div>
            {executor && (
              <div className="bg-[#1A1B1E] p-4 rounded-lg">
                <p>Name: {executor.firstName} {executor.lastName}</p>
                <p>Relationship: {executor.relationship}</p>
                <p>Contact: {executor.contact.email} / {executor.contact.phone}</p>
              </div>
            )}
            <div className="mt-4">
              <label className="block text-sm font-medium text-[#989AA1] mb-1 flex items-center">
                Alternate Executor
                <Tooltip text="An alternate executor serves as a backup if your primary executor is unable or unwilling to serve. It's important to have a backup plan." />
              </label>
              <div>
                <Select
                  value={alternateExecutor?.id || ''}
                  onChange={handleSelectAlternateExecutor}
                  options={people
                    .filter(p => p.roles?.isExecutor && p.id !== executor?.id)
                    .map(p => ({ 
                      value: p.id, 
                      label: `${p.firstName} ${p.lastName}` 
                    }))}
                  placeholder="Select an alternate executor"
                />
                <button
                  onClick={() => handleCreateNewPerson('executor')}
                  className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                >
                  + Create New Person
                </button>
              </div>
              {alternateExecutor && (
                <div className="bg-[#1A1B1E] p-4 rounded-lg mt-2">
                  <p>Name: {alternateExecutor.firstName} {alternateExecutor.lastName}</p>
                  <p>Relationship: {alternateExecutor.relationship}</p>
                  <p>Contact: {alternateExecutor.contact.email} / {alternateExecutor.contact.phone}</p>
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
              <Tooltip text="Beneficiaries are the people or organizations who will inherit your assets. You can specify what each beneficiary receives and any conditions on their inheritance." />
            </h2>
            <div>
              <label className="block text-sm font-medium text-[#989AA1] mb-1 flex items-center">
                Add Beneficiary
                <Tooltip text="Add people or organizations who will receive portions of your estate. You can specify exact amounts or percentages for each beneficiary." />
              </label>
              <Select
                value=""
                onChange={(value) => {
                  const person = people.find(p => p.id === value);
                  if (person) {
                    const now = new Date().toISOString();
                    const beneficiaryData: WillBeneficiary = {
                      id: person.id,
                      firstName: person.firstName,
                      lastName: person.lastName,
                      relationship: person.relationship,
                      contact: person.contact,
                      type: 'individual',
                      allocation: 0,
                      share: '',
                      roles: { isBeneficiary: true as const },
                      createdAt: now,
                      updatedAt: now
                    };
                    setBeneficiaries(prevBeneficiaries => [...prevBeneficiaries, beneficiaryData]);
                  }
                }}
                options={people
                  .filter(p => p.roles?.isBeneficiary && !beneficiaries.some(b => b.id === p.id))
                  .map(p => ({ 
                    value: p.id, 
                    label: `${p.firstName} ${p.lastName}` 
                  }))}
                placeholder="Select a beneficiary"
              />
              <button
                onClick={() => handleCreateNewPerson('beneficiary')}
                className="mt-2 text-sm text-blue-500 hover:text-blue-600"
              >
                + Create New Person
              </button>
            </div>
            <div className="space-y-4">
              {beneficiaries.map((beneficiary, index) => (
                <div key={index} className="bg-[#1A1B1E] p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p>Name: {beneficiary.firstName} {beneficiary.lastName}</p>
                      <p>Relationship: {beneficiary.relationship}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{beneficiary.allocation}%</p>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={100 - (getTotalAllocation() - beneficiary.allocation)}
                    value={beneficiary.allocation}
                    onChange={(e) => handleUpdateBeneficiary(index, Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              ))}
              <div className="mt-4 p-4 bg-[#2D2F33] rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Allocation:</span>
                  <span className={`text-lg font-bold ${getTotalAllocation() === 100 ? 'text-green-500' : 'text-yellow-500'}`}>
                    {getTotalAllocation()}%
                  </span>
                </div>
                {getTotalAllocation() !== 100 && (
                  <p className="text-sm text-yellow-500 mt-2">
                    {getTotalAllocation() < 100 
                      ? `Please allocate the remaining ${100 - getTotalAllocation()}%`
                      : 'Total allocation cannot exceed 100%'}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold flex items-center">
                Assets
                <Tooltip text="Select assets from your existing list or add new ones to be included in your will. This helps your executor identify and locate your assets." />
              </h2>
              <p className="text-[#989AA1]">Select assets to include in your will</p>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={handleAddAsset}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <PlusIcon />
                Add New Asset
              </button>
            </div>

            {/* Existing Assets */}
            {userAssets.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Your Assets</h3>
                <div className="space-y-2">
                  {userAssets.map((asset) => {
                    const isSelected = selectedAssets.some(a => a.id === asset.id);
                    return (
                      <div 
                        key={asset.id} 
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-500/10' 
                            : 'border-[#2D2F33] bg-[#1A1B1E] hover:border-[#404040]'
                        }`}
                        onClick={() => handleAssetToggle(asset)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected ? 'border-blue-500 bg-blue-500' : 'border-[#989AA1]'
                              }`}>
                                {isSelected && <CheckIcon />}
                              </div>
                              <div>
                                <p className="text-white font-medium">{asset.name}</p>
                                <p className="text-[#989AA1] text-sm">{asset.description}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">${asset.value.toLocaleString()}</p>
                            <p className="text-[#989AA1] text-sm capitalize">{asset.type.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selected Assets Summary */}
            {selectedAssets.length > 0 && (
              <div className="bg-[#1A1B1E] p-4 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-3">Selected Assets ({selectedAssets.length})</h3>
                <div className="space-y-2">
                  {selectedAssets.map((asset) => (
                    <div key={asset.id} className="flex justify-between items-center">
                      <span className="text-white">{asset.name}</span>
                      <span className="text-[#989AA1]">${asset.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-[#2D2F33]">
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-white">Total Value:</span>
                    <span className="text-white">
                      ${selectedAssets.reduce((sum, asset) => sum + asset.value, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {userAssets.length === 0 && (
              <div className="text-center py-8 bg-[#1A1B1E] rounded-lg">
                <p className="text-[#989AA1] mb-4">No assets found. Add some assets to include in your will.</p>
                <button
                  onClick={handleAddAsset}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Add Your First Asset
                </button>
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              Special Requests
              <Tooltip text="Include any specific instructions, personal messages, or special conditions for distributing your assets. You can also specify funeral arrangements or other final wishes." />
            </h2>
            <p className="text-[#989AA1]">Add any special requests or instructions for your will</p>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="w-full h-32 bg-[#1A1B1E] text-white border border-[#2D2F33] rounded-lg p-3"
              placeholder="Enter any special requests or instructions..."
            />
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Review and Submit</h2>
            <div className="space-y-4">
              <div className="bg-[#1A1B1E] p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                <p>Name: {profile?.firstName} {profile?.lastName}</p>
                <p>Email: {profile?.email}</p>
                <p>Phone: {profile?.phone}</p>
                <p>Address: {profile?.address?.street}, {profile?.address?.city}, {profile?.address?.state} {profile?.address?.zipCode}</p>
              </div>
              
              <div className="bg-[#1A1B1E] p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Executor</h3>
                {executor ? (
                  <>
                    <p>Name: {executor.firstName} {executor.lastName}</p>
                    <p>Relationship: {executor.relationship}</p>
                    <p>Contact: {executor.contact.email} / {executor.contact.phone}</p>
                  </>
                ) : (
                  <p className="text-yellow-500">No executor selected</p>
                )}
              </div>

              <div className="bg-[#1A1B1E] p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Alternate Executor</h3>
                {alternateExecutor ? (
                  <>
                    <p>Name: {alternateExecutor.firstName} {alternateExecutor.lastName}</p>
                    <p>Relationship: {alternateExecutor.relationship}</p>
                    <p>Contact: {alternateExecutor.contact.email} / {alternateExecutor.contact.phone}</p>
                  </>
                ) : (
                  <p className="text-yellow-500">No alternate executor selected</p>
                )}
              </div>

              <div className="bg-[#1A1B1E] p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Beneficiaries</h3>
                {beneficiaries.length > 0 ? (
                  <div className="space-y-2">
                    {beneficiaries.map((beneficiary, index) => (
                      <div key={index} className="border-b border-[#2D2F33] last:border-0 pb-2">
                        <p>Name: {beneficiary.firstName} {beneficiary.lastName}</p>
                        <p>Relationship: {beneficiary.relationship}</p>
                        <p>Allocation: {beneficiary.allocation}%</p>
                      </div>
                    ))}
                    <p className="text-sm font-medium mt-2">Total Allocation: {getTotalAllocation()}%</p>
                  </div>
                ) : (
                  <p className="text-yellow-500">No beneficiaries added</p>
                )}
              </div>

              {specialRequests && (
                <div className="bg-[#1A1B1E] p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Special Requests</h3>
                  <p className="whitespace-pre-wrap">{specialRequests}</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DocumentLayout
      documentType="will"
      currentStep={currentStep}
      steps={steps}
      onStepClick={setCurrentStep}
      onSave={handleSave}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Create Your Will</h1>
          <p className="text-[#989AA1]">Follow the steps below to create your last will and testament.</p>
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
                  setShowSubmitDialog(true);
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

      {showAddPersonModal && (
        <AddPersonModal
          isOpen={showAddPersonModal}
          onClose={() => {
            setShowAddPersonModal(false);
            setAddingRole(null);
          }}
          onPersonAdded={handleSelectPerson}
          defaultRole={addingRole || undefined}
        />
      )}

      {/* Submit Confirmation Dialog */}
      <Modal
        isOpen={showSubmitDialog}
        onClose={() => setShowSubmitDialog(false)}
        title="Confirm Submission"
      >
        <div className="p-6">
          <p className="text-lg text-gray-300 mb-6">
            Your will document will be filed electronically. Please confirm all details are correct.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowSubmitDialog(false)}
              className="px-4 py-2 bg-[#1D1F23] text-white rounded-lg hover:bg-[#2D2F33] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowSubmitDialog(false);
                handleSubmit();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Submit for Filing
            </button>
          </div>
        </div>
      </Modal>

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

      {/* Add Asset Modal */}
      <Modal 
        isOpen={showAddAssetModal} 
        onClose={() => setShowAddAssetModal(false)}
        title="Add New Asset"
      >
        <div className="bg-[#1A1B1E] p-6 rounded-lg max-w-md w-full">
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#989AA1] mb-1">Asset Name</label>
              <input
                type="text"
                value={newAssetForm.name}
                onChange={(e) => setNewAssetForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-[#2D2F33] text-white border border-[#2D2F33] rounded-lg p-2"
                placeholder="Enter asset name (e.g., Primary Residence)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#989AA1] mb-1">Asset Type</label>
              <select
                value={newAssetForm.type}
                onChange={(e) => setNewAssetForm(prev => ({ ...prev, type: e.target.value as Asset['type'] }))}
                className="w-full bg-[#2D2F33] text-white border border-[#2D2F33] rounded-lg p-2"
              >
                <option value="real_estate">Real Estate</option>
                <option value="investment">Investment</option>
                <option value="bank_account">Bank Account</option>
                <option value="vehicle">Vehicle</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#989AA1] mb-1">Estimated Value</label>
              <input
                type="number"
                value={newAssetForm.value}
                onChange={(e) => setNewAssetForm(prev => ({ 
                  ...prev, 
                  value: Number(e.target.value),
                  amount: Number(e.target.value) // Keep amount in sync with value
                }))}
                className="w-full bg-[#2D2F33] text-white border border-[#2D2F33] rounded-lg p-2"
                placeholder="Enter asset value"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#989AA1] mb-1">Description</label>
              <textarea
                value={newAssetForm.description}
                onChange={(e) => setNewAssetForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-[#2D2F33] text-white border border-[#2D2F33] rounded-lg p-2 h-20"
                placeholder="Enter asset description (optional)"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleCreateNewAsset}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Asset
            </button>
            <button
              onClick={() => setShowAddAssetModal(false)}
              className="px-4 py-2 bg-[#1D1F23] text-white rounded-lg hover:bg-[#2D2F33] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </DocumentLayout>
  );
};

export default WillCreator; 