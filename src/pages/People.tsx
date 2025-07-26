import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { 
  Person, 
  fetchPeopleFromDB, 
  addPersonToDB, 
  updatePersonInDB, 
  deletePersonFromDB 
} from '../features/people/peopleSlice';

const People: React.FC = () => {
  const dispatch = useDispatch();
  const { people, loading, error } = useSelector((state: RootState) => state.people);
  const DEMO_USER_ID = 'ec540338-923f-400d-a185-6028c5d5f823'; // John Smith's UUID ID

  // Load people from database when component mounts
  useEffect(() => {
    dispatch(fetchPeopleFromDB(DEMO_USER_ID) as any);
  }, [dispatch]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
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
      isExecutor: false,
      isTrustee: false,
      isBeneficiary: false,
      isHealthcareAgent: false,
      isPowerOfAttorney: false,
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
    if (editingPerson) {
      dispatch(updatePersonInDB({ personId: editingPerson.id, updates: formData }) as any);
    } else {
      dispatch(addPersonToDB({ 
        userId: DEMO_USER_ID, 
        personData: formData as Omit<Person, 'id' | 'createdAt' | 'updatedAt'> 
      }) as any);
    }
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
    setShowAddForm(false);
    setEditingPerson(null);
  };

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setFormData(person);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this person?')) {
      dispatch(deletePersonFromDB(id) as any);
    }
  };

  return (
    <div className="p-6">
      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-4">
          <div className="text-gray-400">Loading people...</div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-900 text-red-300 p-4 rounded-lg mb-6">
          Error: {error}
        </div>
      )}
      
              <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">People</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {showAddForm ? 'Cancel' : '+ Add Person'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#1A1B1E] p-6 rounded-lg mb-6">
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

          <div className="mt-4">
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

          <div className="mt-4">
            <label className="block text-sm font-medium text-[#989AA1] mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full p-2 bg-[#2D2F33] rounded text-white"
              rows={3}
            />
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {editingPerson ? 'Update Person' : 'Add Person'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {people.map((person) => (
          <div key={person.id} className="bg-[#1A1B1E] p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium">{person.firstName} {person.lastName}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(person)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(person.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-[#989AA1]">{person.relationship}</p>
            {person.contact?.email && (
              <p className="text-sm text-[#989AA1]">{person.contact.email}</p>
            )}
            {person.contact?.phone && (
              <p className="text-sm text-[#989AA1]">{person.contact.phone}</p>
            )}
            {Object.entries(person.roles || {}).filter(([_, value]) => value).length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-[#989AA1]">Roles:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {person.roles?.isExecutor && (
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Executor</span>
                  )}
                  {person.roles?.isTrustee && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Trustee</span>
                  )}
                  {person.roles?.isBeneficiary && (
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Beneficiary</span>
                  )}
                  {person.roles?.isHealthcareAgent && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Healthcare Agent</span>
                  )}
                  {person.roles?.isPowerOfAttorney && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">Power of Attorney</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default People; 