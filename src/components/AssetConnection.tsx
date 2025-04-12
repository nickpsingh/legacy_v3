import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import { updateFinancialInfo } from '../store/userSlice';

interface Asset {
  type: string;
  value: number;
  description: string;
  source: 'plaid' | 'manual';
  lastUpdated: string;
  institution?: string;
  documentUrl?: string;
}

interface AssetConnectionProps {
  onComplete?: () => void;
}

const AssetConnection: React.FC<AssetConnectionProps> = ({ onComplete }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualAssets, setManualAssets] = useState<Asset[]>([]);
  const [showManualForm, setShowManualForm] = useState(false);
  const [newManualAsset, setNewManualAsset] = useState<Partial<Asset>>({
    type: '',
    value: 0,
    description: '',
    source: 'manual'
  });

  // File upload handling
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      acceptedFiles.forEach(file => {
        formData.append('documents', file);
      });

      // For now, simulate a successful upload since we don't have a backend
      // In production, this would be a real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add the uploaded document to manual assets
      setManualAssets(prev => [...prev, {
        type: 'Bank Statement',
        value: 0,
        description: `Uploaded document: ${acceptedFiles[0].name}`,
        source: 'manual',
        lastUpdated: new Date().toISOString(),
        documentUrl: URL.createObjectURL(acceptedFiles[0])
      }]);
    } catch (err) {
      setError('Failed to upload document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1
  });

  const handleManualAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newManualAsset.type && newManualAsset.value) {
      const asset: Asset = {
        ...newManualAsset as Asset,
        lastUpdated: new Date().toISOString(),
        source: 'manual'
      };
      setManualAssets(prev => [...prev, asset]);
      dispatch(updateFinancialInfo([...manualAssets, asset]));
      setNewManualAsset({ type: '', value: 0, description: '', source: 'manual' });
      setShowManualForm(false);
      onComplete?.();
    }
  };

  const handleConnectBank = () => {
    setError('Bank connection feature is coming soon! For now, please use manual entry or document upload.');
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Connect Your Financial Accounts</h3>
        
        {/* Bank Connection (placeholder) */}
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-2">Bank Connection</h4>
          <p className="text-sm text-gray-600 mb-4">
            Securely connect your bank accounts to automatically import your assets.
          </p>
          <button
            onClick={handleConnectBank}
            disabled={isLoading}
            className="btn-primary w-full md:w-auto"
          >
            {isLoading ? 'Connecting...' : 'Connect Bank Account'}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Coming soon! For now, please use manual entry or document upload.
          </p>
        </div>

        {/* Manual Upload */}
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium mb-2">Manual Document Upload</h4>
          <p className="text-sm text-gray-600 mb-4">
            Upload your bank statements or other financial documents.
          </p>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}`}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <p className="text-gray-600">
                {isDragActive
                  ? 'Drop your documents here'
                  : 'Drag and drop your bank statements, or click to select files'}
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: PDF, PNG, JPG (max 10MB)
              </p>
            </div>
          </div>
        </div>

        {/* Manual Asset Entry */}
        <div className="border-t pt-6 mt-6">
          <h4 className="text-lg font-medium mb-2">Manual Asset Entry</h4>
          <p className="text-sm text-gray-600 mb-4">
            Add assets manually if you prefer.
          </p>
          
          {!showManualForm ? (
            <button
              onClick={() => setShowManualForm(true)}
              className="btn-primary w-full md:w-auto"
            >
              Add Asset Manually
            </button>
          ) : (
            <form onSubmit={handleManualAssetSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Asset Type</label>
                <input
                  type="text"
                  value={newManualAsset.type}
                  onChange={e => setNewManualAsset({ ...newManualAsset, type: e.target.value })}
                  className="input-field mt-1"
                  placeholder="e.g., Savings Account, Investment Account"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Value</label>
                <input
                  type="number"
                  value={newManualAsset.value}
                  onChange={e => setNewManualAsset({ ...newManualAsset, value: Number(e.target.value) })}
                  className="input-field mt-1"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newManualAsset.description}
                  onChange={e => setNewManualAsset({ ...newManualAsset, description: e.target.value })}
                  className="input-field mt-1"
                  placeholder="Add any additional details about this asset"
                />
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary">
                  Add Asset
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Asset List */}
      {(manualAssets.length > 0) && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Your Assets</h3>
          <div className="space-y-4">
            {manualAssets.map((asset, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">{asset.type}</h4>
                  <p className="text-sm text-gray-600">{asset.description}</p>
                  {asset.documentUrl && (
                    <a
                      href={asset.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      View Document
                    </a>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">${asset.value.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(asset.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default AssetConnection; 