import React, { useState } from 'react';

interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  percentage: number;
  contact: {
    email: string;
    phone: string;
  };
}

const Beneficiaries: React.FC = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    {
      id: '1',
      name: 'John Doe',
      relationship: 'Spouse',
      percentage: 50,
      contact: {
        email: 'john@example.com',
        phone: '(555) 123-4567'
      }
    },
    {
      id: '2',
      name: 'Jane Doe',
      relationship: 'Child',
      percentage: 25,
      contact: {
        email: 'jane@example.com',
        phone: '(555) 234-5678'
      }
    },
    {
      id: '3',
      name: 'James Doe',
      relationship: 'Child',
      percentage: 25,
      contact: {
        email: 'james@example.com',
        phone: '(555) 345-6789'
      }
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">My Beneficiaries</h1>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Add Beneficiary
        </button>
      </div>

      <div className="bg-[#101113] rounded-lg border border-[#1D1F23]">
        <div className="px-4 py-3 border-b border-[#1D1F23]">
          <h2 className="text-lg font-medium text-white">Beneficiary Details</h2>
        </div>
        <div className="divide-y divide-[#1D1F23]">
          {beneficiaries.map((beneficiary) => (
            <div key={beneficiary.id} className="p-4 hover:bg-[#1A1B1E] transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">{beneficiary.name}</h3>
                  <div className="mt-1 text-sm text-[#989AA1]">
                    {beneficiary.relationship} • {beneficiary.percentage}% Share
                  </div>
                  <div className="mt-1 text-sm text-[#989AA1]">
                    {beneficiary.contact.email} • {beneficiary.contact.phone}
                  </div>
                </div>
                <div className="text-right">
                  <button className="text-sm text-[#5E6AD2] hover:text-[#6E7AE7]">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}

          {beneficiaries.length === 0 && (
            <div className="text-center py-8 text-[#989AA1]">
              <p>No beneficiaries added yet. Click the "Add Beneficiary" button to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Beneficiaries; 