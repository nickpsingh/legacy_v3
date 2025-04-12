import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const Assets: React.FC = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const assets = profile?.financialInfo?.assets || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">My Assets</h1>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Add Asset
        </button>
      </div>

      <div className="grid gap-4">
        {assets.map((asset, index) => (
          <div key={index} className="bg-[#101113] p-4 rounded-lg border border-[#1D1F23]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-white">{asset.type}</h3>
                <p className="text-[#989AA1] mt-1">{asset.description}</p>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">${asset.value.toLocaleString()}</div>
                <div className="text-sm text-[#989AA1]">Last updated: {new Date(asset.lastUpdated).toLocaleDateString()}</div>
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
    </div>
  );
};

export default Assets; 