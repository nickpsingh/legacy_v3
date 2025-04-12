import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Liability } from '../store/userSlice';

const Liabilities: React.FC = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const liabilities = profile?.financialInfo?.liabilities || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Liabilities</h1>
        <button className="bg-[#1D1F23] text-white px-4 py-2 rounded-lg hover:bg-[#2D2F33] transition-colors">
          Add Liability
        </button>
      </div>

      <div className="grid gap-4">
        {liabilities.map((liability: Liability, index: number) => (
          <div key={index} className="bg-[#101113] p-4 rounded-lg border border-[#1D1F23]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-white">{liability.name}</h3>
                <p className="text-[#989AA1] text-sm">{liability.description}</p>
                <p className="text-[#989AA1] text-sm">Interest Rate: {liability.interestRate}%</p>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">${liability.amount.toLocaleString()}</p>
                <p className="text-[#989AA1] text-sm">Last updated: {new Date(liability.lastUpdated).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}

        {liabilities.length === 0 && (
          <div className="text-center py-8 text-[#989AA1]">
            <p>No liabilities added yet. Click the "Add Liability" button to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Liabilities; 