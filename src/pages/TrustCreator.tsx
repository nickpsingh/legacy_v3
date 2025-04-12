import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import DocumentEditor from '../components/DocumentEditor';
import { getStateLaws } from '../services/ai.service';

interface Trustee {
  name: string;
  relationship: string;
  role: 'primary' | 'successor';
}

interface Beneficiary {
  name: string;
  relationship: string;
  distribution: string;
  conditions: string;
}

const TrustCreator: React.FC = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const [trustees, setTrustees] = useState<Trustee[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [trustType, setTrustType] = useState<'revocable' | 'irrevocable'>('revocable');
  const [stateLaws, setStateLaws] = useState<string[]>([]);
  const [showLaws, setShowLaws] = useState(false);

  const handleAddTrustee = () => {
    setTrustees([...trustees, { name: '', relationship: '', role: 'primary' }]);
  };

  const handleAddBeneficiary = () => {
    setBeneficiaries([...beneficiaries, { name: '', relationship: '', distribution: '', conditions: '' }]);
  };

  const handleTrusteeChange = (index: number, field: keyof Trustee, value: string) => {
    const newTrustees = [...trustees];
    newTrustees[index] = { ...newTrustees[index], [field]: value };
    setTrustees(newTrustees);
  };

  const handleBeneficiaryChange = (index: number, field: keyof Beneficiary, value: string) => {
    const newBeneficiaries = [...beneficiaries];
    newBeneficiaries[index] = { ...newBeneficiaries[index], [field]: value };
    setBeneficiaries(newBeneficiaries);
  };

  const handleViewStateLaws = async () => {
    if (profile?.state) {
      try {
        const laws = await getStateLaws(profile.state, 'trust');
        setStateLaws(laws);
        setShowLaws(true);
      } catch (error) {
        console.error('Error fetching state laws:', error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Your Trust</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Trust Type</h3>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="revocable"
                  checked={trustType === 'revocable'}
                  onChange={(e) => setTrustType(e.target.value as 'revocable')}
                  className="form-radio text-primary-600"
                />
                <span className="ml-2">Revocable Trust</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="irrevocable"
                  checked={trustType === 'irrevocable'}
                  onChange={(e) => setTrustType(e.target.value as 'irrevocable')}
                  className="form-radio text-primary-600"
                />
                <span className="ml-2">Irrevocable Trust</span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Trustees</h3>
              <button
                onClick={handleAddTrustee}
                className="text-primary-600 hover:text-primary-700"
              >
                + Add Trustee
              </button>
            </div>
            <div className="space-y-4">
              {trustees.map((trustee, index) => (
                <div key={index} className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={trustee.name}
                    onChange={(e) => handleTrusteeChange(index, 'name', e.target.value)}
                    placeholder="Name"
                    className="input-field"
                  />
                  <input
                    type="text"
                    value={trustee.relationship}
                    onChange={(e) => handleTrusteeChange(index, 'relationship', e.target.value)}
                    placeholder="Relationship"
                    className="input-field"
                  />
                  <select
                    value={trustee.role}
                    onChange={(e) => handleTrusteeChange(index, 'role', e.target.value as 'primary' | 'successor')}
                    className="input-field"
                  >
                    <option value="primary">Primary Trustee</option>
                    <option value="successor">Successor Trustee</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Beneficiaries</h3>
              <button
                onClick={handleAddBeneficiary}
                className="text-primary-600 hover:text-primary-700"
              >
                + Add Beneficiary
              </button>
            </div>
            <div className="space-y-4">
              {beneficiaries.map((beneficiary, index) => (
                <div key={index} className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={beneficiary.name}
                    onChange={(e) => handleBeneficiaryChange(index, 'name', e.target.value)}
                    placeholder="Name"
                    className="input-field"
                  />
                  <input
                    type="text"
                    value={beneficiary.relationship}
                    onChange={(e) => handleBeneficiaryChange(index, 'relationship', e.target.value)}
                    placeholder="Relationship"
                    className="input-field"
                  />
                  <input
                    type="text"
                    value={beneficiary.distribution}
                    onChange={(e) => handleBeneficiaryChange(index, 'distribution', e.target.value)}
                    placeholder="Distribution (e.g., $10,000 annually)"
                    className="input-field"
                  />
                  <input
                    type="text"
                    value={beneficiary.conditions}
                    onChange={(e) => handleBeneficiaryChange(index, 'conditions', e.target.value)}
                    placeholder="Conditions (e.g., reach age 25)"
                    className="input-field"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <button
              onClick={handleViewStateLaws}
              className="text-primary-600 hover:text-primary-700"
            >
              View {profile?.state} Trust Laws
            </button>
            {showLaws && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">State Laws</h4>
                <ul className="list-disc pl-5 space-y-2">
                  {stateLaws.map((law, index) => (
                    <li key={index} className="text-sm text-gray-600">{law}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <DocumentEditor
        type="trust"
      />
    </div>
  );
};

export default TrustCreator; 