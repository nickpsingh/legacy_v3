import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  percentage: number;
}

const Beneficiaries: React.FC = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const { profile } = useSelector((state: RootState) => state.user);
  const [isAddingBeneficiary, setIsAddingBeneficiary] = useState(false);
  const [newBeneficiary, setNewBeneficiary] = useState<Omit<Beneficiary, 'id'>>({
    name: '',
    relationship: '',
    percentage: 0
  });

  const handleAddBeneficiary = () => {
    if (newBeneficiary.name && newBeneficiary.relationship) {
      setBeneficiaries([
        ...beneficiaries,
        {
          id: Date.now().toString(),
          ...newBeneficiary
        }
      ]);
      setNewBeneficiary({
        name: '',
        relationship: '',
        percentage: 0
      });
      setIsAddingBeneficiary(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Beneficiaries</h1>
        <button 
          onClick={() => setIsAddingBeneficiary(true)}
          className="bg-[#1D1F23] text-white px-4 py-2 rounded-lg hover:bg-[#2D2F33] transition-colors"
        >
          Add Beneficiary
        </button>
      </div>

      {isAddingBeneficiary && (
        <div className="bg-[#101113] p-6 rounded-lg border border-[#1D1F23]">
          <h2 className="text-xl font-semibold text-white mb-4">Add New Beneficiary</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[#989AA1] mb-2">Name</label>
              <input
                type="text"
                value={newBeneficiary.name}
                onChange={(e) => setNewBeneficiary({ ...newBeneficiary, name: e.target.value })}
                className="w-full bg-[#1D1F23] text-white px-4 py-2 rounded"
              />
            </div>
            <div>
              <label className="block text-[#989AA1] mb-2">Relationship</label>
              <input
                type="text"
                value={newBeneficiary.relationship}
                onChange={(e) => setNewBeneficiary({ ...newBeneficiary, relationship: e.target.value })}
                className="w-full bg-[#1D1F23] text-white px-4 py-2 rounded"
              />
            </div>
            <div>
              <label className="block text-[#989AA1] mb-2">Percentage</label>
              <input
                type="number"
                value={newBeneficiary.percentage}
                onChange={(e) => setNewBeneficiary({ ...newBeneficiary, percentage: Number(e.target.value) })}
                className="w-full bg-[#1D1F23] text-white px-4 py-2 rounded"
                min="0"
                max="100"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsAddingBeneficiary(false)}
                className="px-4 py-2 text-[#989AA1] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBeneficiary}
                className="px-4 py-2 bg-[#5E6AD2] text-white rounded hover:bg-[#6E7AE7] transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {beneficiaries.map((beneficiary) => (
          <div key={beneficiary.id} className="bg-[#101113] p-4 rounded-lg border border-[#1D1F23]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-white">{beneficiary.name}</h3>
                <p className="text-[#989AA1] text-sm">Relationship: {beneficiary.relationship}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">{beneficiary.percentage}%</p>
              </div>
            </div>
          </div>
        ))}

        {beneficiaries.length === 0 && !isAddingBeneficiary && (
          <div className="text-center py-8 text-[#989AA1]">
            <p>No beneficiaries added yet. Click the "Add Beneficiary" button to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Beneficiaries; 