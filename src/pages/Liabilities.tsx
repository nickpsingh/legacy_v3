import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { 
  fetchLiabilitiesFromDB, 
  addLiabilityToDB, 
  updateLiabilityInDB, 
  deleteLiabilityFromDB 
} from '../features/liabilities/liabilitiesSlice';
import { Liability } from '../services/liabilities.service';
import Modal from '../components/Modal';
import { useSnackbar } from 'notistack';
import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import ConfirmationModal from '../components/ConfirmationModal';

// Create icon components with proper typing
const ViewIcon = () => {
  const Icon = FiEye as React.ComponentType<{ size?: number }>;
  return <Icon size={18} />;
};

const EditIcon = () => {
  const Icon = FiEdit2 as React.ComponentType<{ size?: number }>;
  return <Icon size={18} />;
};

const DeleteIcon = () => {
  const Icon = FiTrash2 as React.ComponentType<{ size?: number }>;
  return <Icon size={18} />;
};

interface LiabilityFormData {
  name: string;
  type: 'mortgage' | 'loan' | 'credit_card' | 'other';
  amount: number;
  description: string;
  interestRate: number;
}

const LIABILITY_TYPES = [
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'loan', label: 'Loan' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'other', label: 'Other' }
];

const Liabilities: React.FC = () => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { liabilities, loading, error } = useSelector((state: RootState) => state.liabilities);
  const DEMO_USER_ID = 'ec540338-923f-400d-a185-6028c5d5f823'; // John Smith's UUID ID

  // Load liabilities from database when component mounts
  useEffect(() => {
    dispatch(fetchLiabilitiesFromDB(DEMO_USER_ID) as any);
  }, [dispatch]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLiability, setSelectedLiability] = useState<Liability | null>(null);
  const [liabilityToDelete, setLiabilityToDelete] = useState<Liability | null>(null);
  const [formData, setFormData] = useState<LiabilityFormData>({
    name: '',
    type: 'mortgage',
    amount: 0,
    description: '',
    interestRate: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amount' || name === 'interestRate') {
      // Remove any non-numeric characters except decimal point
      const sanitizedValue = value.replace(/[^\d.]/g, '');
      // Ensure only one decimal point
      const parts = sanitizedValue.split('.');
      const cleanValue = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');
      // Convert to number, default to 0 if empty or invalid
      const numValue = cleanValue === '' ? 0 : parseFloat(cleanValue);
      
      console.log(`Setting ${name} to:`, numValue); // Debug log
      
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEdit = (liability: Liability) => {
    setSelectedLiability(liability);
    setFormData({
      name: liability.name,
      type: liability.type,
      amount: Number(liability.amount),
      description: liability.description,
      interestRate: Number(liability.interestRate)
    });
    setShowAddDialog(true);
  };

  const handleView = (liability: Liability) => {
    setSelectedLiability(liability);
    setShowViewDialog(true);
  };

  const handleDelete = (liability: Liability) => {
    setLiabilityToDelete(liability);
  };

  const confirmDelete = async () => {
    if (!liabilityToDelete) return;

    try {
      dispatch(deleteLiabilityFromDB(liabilityToDelete.id) as any);
      enqueueSnackbar('Liability deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting liability:', error);
      enqueueSnackbar('Failed to delete liability', { variant: 'error' });
    } finally {
      setLiabilityToDelete(null);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (!formData.name.trim()) {
        enqueueSnackbar('Please enter a liability name', { variant: 'error' });
        return;
      }

      // Parse and validate amount
      const amount = parseFloat(formData.amount.toString());
      if (isNaN(amount) || amount <= 0) {
        enqueueSnackbar('Please enter a valid liability amount', { variant: 'error' });
        return;
      }

      // Parse and validate interest rate
      const interestRate = parseFloat(formData.interestRate.toString());
      if (isNaN(interestRate) || interestRate < 0) {
        enqueueSnackbar('Please enter a valid interest rate', { variant: 'error' });
        return;
      }

      const liabilityData = {
        name: formData.name.trim(),
        type: formData.type,
        amount: Number(amount.toFixed(2)), // Ensure amount is rounded to 2 decimal places
        description: formData.description.trim(),
        interestRate: Number(interestRate.toFixed(2)), // Ensure interest rate is rounded to 2 decimal places
      };

      if (selectedLiability) {
        // For updates, ensure we're using the exact same ID
        dispatch(updateLiabilityInDB({
          liabilityId: selectedLiability.id,
          updates: liabilityData
        }) as any);
      } else {
        dispatch(addLiabilityToDB({
          userId: DEMO_USER_ID,
          liabilityData: liabilityData
        }) as any);
      }

      // Close the dialog and reset form
      setShowAddDialog(false);
      setSelectedLiability(null);
      setFormData({
        name: '',
        type: 'mortgage',
        amount: 0,
        description: '',
        interestRate: 0
      });

      // Show success message
      enqueueSnackbar(
        selectedLiability ? 'Liability updated successfully' : 'Liability added successfully',
        { variant: 'success' }
      );

    } catch (error) {
      console.error('Error saving liability:', error);
      enqueueSnackbar('Failed to save liability', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Liabilities</h1>
        <button 
          onClick={() => {
            setSelectedLiability(null);
            setFormData({
              name: '',
              type: 'mortgage',
              amount: 0,
              description: '',
              interestRate: 0
            });
            setShowAddDialog(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Liability
        </button>
      </div>

      <div className="grid gap-4">
        {liabilities.map((liability: Liability) => (
          <div key={liability.id} className="bg-[#101113] p-4 rounded-lg border border-[#1D1F23]">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-medium text-white">{liability.name}</h3>
                  <span className="text-sm px-2 py-0.5 bg-[#1D1F23] text-[#989AA1] rounded">
                    {LIABILITY_TYPES.find(type => type.value === liability.type)?.label}
                  </span>
                </div>
                <p className="text-[#989AA1] text-sm">{liability.description}</p>
                <p className="text-[#989AA1] text-sm">Interest Rate: {liability.interestRate}%</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-right mr-4">
                  <p className="text-white font-medium">
                    ${liability.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                  <p className="text-[#989AA1] text-sm">
                    Last updated: {new Date(liability.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(liability)}
                    className="p-2 text-[#989AA1] hover:text-white hover:bg-[#1D1F23] rounded-lg transition-colors"
                  >
                    <ViewIcon />
                  </button>
                  <button
                    onClick={() => handleEdit(liability)}
                    className="p-2 text-[#989AA1] hover:text-white hover:bg-[#1D1F23] rounded-lg transition-colors"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => handleDelete(liability)}
                    className="p-2 text-[#989AA1] hover:text-white hover:bg-[#1D1F23] rounded-lg transition-colors"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-center py-8 text-[#989AA1]">
            <p>Loading liabilities...</p>
          </div>
        )}

        {!loading && liabilities.length === 0 && (
          <div className="text-center py-8 text-[#989AA1]">
            <p>No liabilities added yet. Click the "Add Liability" button to get started.</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-400">
            <p>Error loading liabilities: {error}</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setSelectedLiability(null);
        }}
        title={selectedLiability ? 'Edit Liability' : 'Add Liability'}
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Liability Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full bg-[#1A1B1E] text-white border border-[#2D2F33] rounded-lg px-3 py-2"
              disabled={isSubmitting}
            >
              {LIABILITY_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Liability Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-[#1A1B1E] text-white border border-[#2D2F33] rounded-lg px-3 py-2"
              placeholder="Enter liability name"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Amount
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full bg-[#1A1B1E] text-white border border-[#2D2F33] rounded-lg px-3 py-2"
              placeholder="Enter amount"
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Interest Rate (%)
            </label>
            <input
              type="number"
              name="interestRate"
              value={formData.interestRate}
              onChange={handleInputChange}
              className="w-full bg-[#1A1B1E] text-white border border-[#2D2F33] rounded-lg px-3 py-2"
              placeholder="Enter interest rate"
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full bg-[#1A1B1E] text-white border border-[#2D2F33] rounded-lg px-3 py-2"
              placeholder="Enter description"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => {
                setShowAddDialog(false);
                setSelectedLiability(null);
              }}
              className="px-4 py-2 text-[#989AA1] hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isSubmitting || loading}
            >
              {(isSubmitting || loading) ? 'Saving...' : selectedLiability ? 'Save Changes' : 'Add Liability'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showViewDialog}
        onClose={() => setShowViewDialog(false)}
        title="View Liability Details"
      >
        {selectedLiability && (
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-medium text-white mb-4">{selectedLiability.name}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#989AA1]">Type</p>
                  <p className="text-white">{LIABILITY_TYPES.find(type => type.value === selectedLiability.type)?.label}</p>
                </div>
                <div>
                  <p className="text-sm text-[#989AA1]">Amount</p>
                  <p className="text-white">
                    ${selectedLiability.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#989AA1]">Interest Rate</p>
                  <p className="text-white">{selectedLiability.interestRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-[#989AA1]">Last Updated</p>
                  <p className="text-white">{new Date(selectedLiability.lastUpdated).toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-[#989AA1]">Description</p>
                  <p className="text-white">{selectedLiability.description}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationModal
        isOpen={!!liabilityToDelete}
        onClose={() => setLiabilityToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Liability"
        message="Are you sure you want to delete this liability? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
};

export default Liabilities; 