import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, Asset } from '../features/user/userSlice';
import { RootState } from '../store/store';

const AssetConnection: React.FC = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.user.profile);
  const [isUploading, setIsUploading] = useState(false);

  const handleAddAsset = (newAsset: Asset) => {
    if (!profile) return;
    
    const updatedProfile = {
      ...profile,
      financialInfo: {
        ...profile.financialInfo,
        assets: [...profile.financialInfo.assets, newAsset],
        lastUpdated: new Date().toISOString()
      }
    };
    
    dispatch(updateProfile(updatedProfile));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsUploading(true);
    // Simulate file processing
    setTimeout(() => {
      const newAsset: Asset = {
        id: Date.now().toString(),
        name: 'Investment Portfolio',
        type: 'investment',
        value: 100000,
        amount: 100000,
        description: 'Uploaded investment portfolio',
        lastUpdated: new Date().toISOString()
      };
      handleAddAsset(newAsset);
      setIsUploading(false);
    }, 1500);
  }, [dispatch, profile, handleAddAsset]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/pdf': ['.pdf']
    }
  });

  return (
    <div className="p-6 bg-[#101113] rounded-lg border border-[#1D1F23]">
      <h2 className="text-lg font-medium text-white mb-4">Connect Your Assets</h2>
      <div
        {...getRootProps()}
        className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-[#1D1F23] hover:border-[#2D2F33]'
        }`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        ) : isDragActive ? (
          <p className="text-[#989AA1]">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-white mb-2">Drag and drop files here, or click to select files</p>
            <p className="text-sm text-[#989AA1]">
              Supported formats: CSV, PDF, Excel files from major financial institutions
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetConnection; 