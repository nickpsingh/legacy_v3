import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Person, addPersonToDB } from '../features/people/peopleSlice';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPersonAdded?: (person: Person) => void;
  defaultRole?: 'executor' | 'trustee' | 'beneficiary' | 'healthcareAgent' | 'powerOfAttorney';
}

const AddPersonModal: React.FC<AddPersonModalProps> = ({ isOpen, onClose, onPersonAdded, defaultRole }) => {
  const dispatch = useDispatch();
  const DEMO_USER_ID = 'demo-user-123'; // In a real app, this would come from auth
  const [formData, setFormData] = useState<Partial<Person>>({
    firstName: '',
    lastName: '',
    relationship: '',
    dateOfBirth: '',
    contact: {
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
    },
    roles: {
      isExecutor: defaultRole === 'executor',
      isTrustee: defaultRole === 'trustee',
      isBeneficiary: defaultRole === 'beneficiary',
      isHealthcareAgent: defaultRole === 'healthcareAgent',
      isPowerOfAttorney: defaultRole === 'powerOfAttorney',
    },
    notes: '',
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.includes('.')) {
      const [parent, child, grandchild] = field.split('.');
      setFormData(prev => {
        const parentObj = prev[parent as keyof Person];
        if (!parentObj || typeof parentObj !== 'object') {
          return prev;
        }

        return {
          ...prev,
          [parent]: {
            ...(parentObj as object),
            [child]: grandchild
              ? {
                  ...((parentObj as any)[child] || {}),
                  [grandchild]: value,
                }
              : value,
          },
        };
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(addPersonToDB({ 
      userId: DEMO_USER_ID, 
      personData: formData as Omit<Person, 'id' | 'createdAt' | 'updatedAt'> 
    }) as any).then((action: any) => {
      if (onPersonAdded && action.payload) {
        onPersonAdded(action.payload as Person);
      }
    });
    setFormData({
      firstName: '',
      lastName: '',
      relationship: '',
      dateOfBirth: '',
      contact: {
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
      },
      roles: {
        isExecutor: false,
        isTrustee: false,
        isBeneficiary: false,
        isHealthcareAgent: false,
        isPowerOfAttorney: false,
      },
      notes: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1A1B1E] p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Add New Person</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#989AA1] mb-1">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full p-2 bg-[#2D2F33] rounded text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#989AA1] mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full p-2 bg-[#2D2F33] rounded text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#989AA1] mb-1">Relationship</label>
              <input
                type="text"
                value={formData.relationship}
                onChange={(e) => handleInputChange('relationship', e.target.value)}
                className="w-full p-2 bg-[#2D2F33] rounded text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#989AA1] mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="w-full p-2 bg-[#2D2F33] rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#989AA1] mb-1">Email</label>
              <input
                type="email"
                value={formData.contact?.email}
                onChange={(e) => handleInputChange('contact.email', e.target.value)}
                className="w-full p-2 bg-[#2D2F33] rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#989AA1] mb-1">Phone</label>
              <input
                type="tel"
                value={formData.contact?.phone}
                onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                className="w-full p-2 bg-[#2D2F33] rounded text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#989AA1] mb-2">Roles</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.roles?.isExecutor}
                  onChange={(e) => handleInputChange('roles.isExecutor', e.target.checked)}
                  className="mr-2"
                />
                Executor
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.roles?.isTrustee}
                  onChange={(e) => handleInputChange('roles.isTrustee', e.target.checked)}
                  className="mr-2"
                />
                Trustee
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.roles?.isBeneficiary}
                  onChange={(e) => handleInputChange('roles.isBeneficiary', e.target.checked)}
                  className="mr-2"
                />
                Beneficiary
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.roles?.isHealthcareAgent}
                  onChange={(e) => handleInputChange('roles.isHealthcareAgent', e.target.checked)}
                  className="mr-2"
                />
                Healthcare Agent
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.roles?.isPowerOfAttorney}
                  onChange={(e) => handleInputChange('roles.isPowerOfAttorney', e.target.checked)}
                  className="mr-2"
                />
                Power of Attorney
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Person
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPersonModal; 