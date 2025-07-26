import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { Asset } from '../features/user/userSlice';
import { fetchAssetsFromDB, addAssetToDB, updateAssetInDB, deleteAssetFromDB } from '../features/assets/assetsSlice';
import Modal from '../components/Modal';
import { useSnackbar } from 'notistack';
import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { IconType } from 'react-icons';
import ConfirmationModal from '../components/ConfirmationModal';

interface AssetFormData {
  name: string;
  type: Asset['type'];
  value: number;
  valuationDate: string;
  amount: number;
  description: string;
}

const ASSET_TYPES = [
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'investment', label: 'Investment' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'bank_account', label: 'Bank Account' },
  { value: 'other', label: 'Other' }
];

// Create icon components with proper typing
const ViewIcon = () => {
  const Icon = FiEye as React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
  return <Icon size={18} aria-hidden={true} />;
};

const EditIcon = () => {
  const Icon = FiEdit2 as React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
  return <Icon size={18} aria-hidden={true} />;
};

const DeleteIcon = () => {
  const Icon = FiTrash2 as React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
  return <Icon size={18} aria-hidden={true} />;
};

const Assets: React.FC = () => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const assetsState = useSelector((state: RootState) => state.assets);
  const { assets = [], loading = false, error = null } = assetsState || {};
  

  const DEMO_USER_ID = 'ec540338-923f-400d-a185-6028c5d5f823'; // John Smith's ID
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    type: 'real_estate',
    value: 0,
    valuationDate: new Date().toISOString().split('T')[0],
    amount: 0,
    description: ''
  });

  // Load assets from database when component mounts
  useEffect(() => {
    dispatch(fetchAssetsFromDB(DEMO_USER_ID) as any);
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'value' || name === 'amount' ? Number(value) || 0 : value
    }));
  };

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type,
      value: asset.value,
      valuationDate: new Date(asset.lastUpdated).toISOString().split('T')[0],
      amount: asset.amount,
      description: asset.description
    });
    setShowAddDialog(true);
  };

  const handleView = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowViewDialog(true);
  };

  const handleDelete = (asset: Asset) => {
    setAssetToDelete(asset);
  };

  const confirmDelete = async () => {
    if (!assetToDelete) return;

    try {
      await dispatch(deleteAssetFromDB(assetToDelete.id) as any);
      enqueueSnackbar('Asset deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting asset:', error);
      enqueueSnackbar('Failed to delete asset', { variant: 'error' });
    } finally {
      setAssetToDelete(null);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (!formData.name.trim()) {
        enqueueSnackbar('Please enter an asset name', { variant: 'error' });
        return;
      }

      if (formData.value <= 0) {
        enqueueSnackbar('Please enter a valid asset value', { variant: 'error' });
        return;
      }

      if (selectedAsset) {
        const updates = {
          name: formData.name.trim(),
          type: formData.type,
          value: Number(formData.value),
          amount: Number(formData.amount),
          description: formData.description.trim()
        };
        await dispatch(updateAssetInDB({ assetId: selectedAsset.id, updates }) as any);
        enqueueSnackbar('Asset updated successfully', { variant: 'success' });
      } else {
        const assetData = {
          name: formData.name.trim(),
          type: formData.type,
          value: Number(formData.value),
          amount: Number(formData.amount),
          description: formData.description.trim()
        };
        await dispatch(addAssetToDB({ userId: DEMO_USER_ID, assetData }) as any);
        enqueueSnackbar('Asset added successfully', { variant: 'success' });
      }
      
      setShowAddDialog(false);
      setSelectedAsset(null);
      setFormData({
        name: '',
        type: 'real_estate',
        value: 0,
        valuationDate: new Date().toISOString().split('T')[0],
        amount: 0,
        description: ''
      });
    } catch (error) {
      console.error('Error saving asset:', error);
      enqueueSnackbar('Failed to save asset', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-4">
          <div className="text-gray-400">Loading assets...</div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-900 text-red-300 p-4 rounded-lg mb-6">
          Error: {error}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Assets</h1>
        <button 
          onClick={() => {
            setSelectedAsset(null);
            setFormData({
              name: '',
              type: 'real_estate',
              value: 0,
              valuationDate: new Date().toISOString().split('T')[0],
              amount: 0,
              description: ''
            });
            setShowAddDialog(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Asset
        </button>
      </div>

      <div className="grid gap-4">        
        {assets && assets.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="text-gray-400">No assets found. Click "Add Asset" to get started.</div>
          </div>
        )}
        
        {assets && assets.map((asset: Asset) => (
          <div key={asset.id} className="bg-[#101113] p-4 rounded-lg border border-[#1D1F23]">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-medium text-white">{asset.name}</h3>
                  <span className="text-sm px-2 py-0.5 bg-[#1D1F23] text-[#989AA1] rounded">
                    {ASSET_TYPES.find(type => type.value === asset.type)?.label}
                  </span>
                </div>
                <p className="text-[#989AA1] text-sm">{asset.description}</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-right mr-4">
                  <p className="text-white font-medium">${asset.value.toLocaleString()}</p>
                  <p className="text-[#989AA1] text-sm">Amount: {asset.amount}</p>
                  <p className="text-[#989AA1] text-sm">
                    Last updated: {new Date(asset.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(asset)}
                    className="p-2 text-[#989AA1] hover:text-white hover:bg-[#1D1F23] rounded-lg transition-colors"
                  >
                    <ViewIcon />
                  </button>
                  <button
                    onClick={() => handleEdit(asset)}
                    className="p-2 text-[#989AA1] hover:text-white hover:bg-[#1D1F23] rounded-lg transition-colors"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => handleDelete(asset)}
                    className="p-2 text-[#989AA1] hover:text-white hover:bg-[#1D1F23] rounded-lg transition-colors"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {assets.length === 0 && (
          <div className="text-center py-8 text-[#989AA1]">
            <p>No assets added yet. Click the "Add Asset" button to get started.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setSelectedAsset(null);
        }}
        title={selectedAsset ? 'Edit Asset' : 'Add Asset'}
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Asset Category
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full bg-[#1A1B1E] text-white border border-[#2D2F33] rounded-lg px-3 py-2"
              disabled={isSubmitting}
            >
              {ASSET_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Asset Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-[#1A1B1E] text-white border border-[#2D2F33] rounded-lg px-3 py-2"
              placeholder="Enter asset name"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Value
            </label>
            <input
              type="number"
              name="value"
              value={formData.value}
              onChange={handleInputChange}
              className="w-full bg-[#1A1B1E] text-white border border-[#2D2F33] rounded-lg px-3 py-2"
              placeholder="Enter value"
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Amount/Quantity
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full bg-[#1A1B1E] text-white border border-[#2D2F33] rounded-lg px-3 py-2"
              placeholder="Enter amount"
              min="0"
              step="1"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Valuation Date
            </label>
            <input
              type="date"
              name="valuationDate"
              value={formData.valuationDate}
              onChange={handleInputChange}
              className="w-full bg-[#1A1B1E] text-white border border-[#2D2F33] rounded-lg px-3 py-2"
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
                setSelectedAsset(null);
              }}
              className="px-4 py-2 text-[#989AA1] hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : selectedAsset ? 'Save Changes' : 'Add Asset'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={!!assetToDelete}
        onClose={() => setAssetToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Asset"
        message="Are you sure you want to delete this asset? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
};

export default Assets; 