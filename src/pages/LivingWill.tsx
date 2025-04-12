import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import DocumentEditor from '../components/DocumentEditor';
import { getStateLaws } from '../services/ai.service';

interface HealthcareAgent {
  name: string;
  relationship: string;
  phone: string;
  type: 'primary' | 'alternate';
}

interface MedicalPreference {
  category: string;
  description: string;
  preference: 'yes' | 'no' | 'undecided';
}

const LivingWill: React.FC = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const [agents, setAgents] = useState<HealthcareAgent[]>([]);
  const [stateLaws, setStateLaws] = useState<string[]>([]);
  const [showLaws, setShowLaws] = useState(false);
  const [organDonation, setOrganDonation] = useState<'yes' | 'no' | 'specific'>('no');
  const [specificOrgans, setSpecificOrgans] = useState<string>('');

  const [preferences, setPreferences] = useState<MedicalPreference[]>([
    {
      category: 'Life Support',
      description: 'Use of breathing machines and other life support equipment',
      preference: 'undecided',
    },
    {
      category: 'Pain Management',
      description: 'Use of pain medication, even if it might hasten death',
      preference: 'undecided',
    },
    {
      category: 'Artificial Nutrition',
      description: 'Feeding through tubes or IV',
      preference: 'undecided',
    },
    {
      category: 'Artificial Hydration',
      description: 'Providing water through IV or tubes',
      preference: 'undecided',
    },
    {
      category: 'CPR',
      description: 'Cardiopulmonary resuscitation if heart stops',
      preference: 'undecided',
    },
    {
      category: 'Hospice Care',
      description: 'Comfort care in terminal illness',
      preference: 'undecided',
    },
  ]);

  const handleAddAgent = () => {
    setAgents([...agents, { name: '', relationship: '', phone: '', type: 'primary' }]);
  };

  const handleAgentChange = (index: number, field: keyof HealthcareAgent, value: string) => {
    const newAgents = [...agents];
    newAgents[index] = { ...newAgents[index], [field]: value };
    setAgents(newAgents);
  };

  const handlePreferenceChange = (index: number, value: 'yes' | 'no' | 'undecided') => {
    const newPreferences = [...preferences];
    newPreferences[index] = { ...newPreferences[index], preference: value };
    setPreferences(newPreferences);
  };

  const handleViewStateLaws = async () => {
    if (profile?.state) {
      try {
        const laws = await getStateLaws(profile.state, 'living-will');
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Living Will</h2>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Healthcare Agents</h3>
              <button
                onClick={handleAddAgent}
                className="text-primary-600 hover:text-primary-700"
              >
                + Add Agent
              </button>
            </div>
            <div className="space-y-4">
              {agents.map((agent, index) => (
                <div key={index} className="grid grid-cols-4 gap-4">
                  <input
                    type="text"
                    value={agent.name}
                    onChange={(e) => handleAgentChange(index, 'name', e.target.value)}
                    placeholder="Name"
                    className="input-field"
                  />
                  <input
                    type="text"
                    value={agent.relationship}
                    onChange={(e) => handleAgentChange(index, 'relationship', e.target.value)}
                    placeholder="Relationship"
                    className="input-field"
                  />
                  <input
                    type="tel"
                    value={agent.phone}
                    onChange={(e) => handleAgentChange(index, 'phone', e.target.value)}
                    placeholder="Phone"
                    className="input-field"
                  />
                  <select
                    value={agent.type}
                    onChange={(e) => handleAgentChange(index, 'type', e.target.value as 'primary' | 'alternate')}
                    className="input-field"
                  >
                    <option value="primary">Primary Agent</option>
                    <option value="alternate">Alternate Agent</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Preferences</h3>
            <div className="space-y-6">
              {preferences.map((pref, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{pref.category}</h4>
                      <p className="text-sm text-gray-500">{pref.description}</p>
                    </div>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          checked={pref.preference === 'yes'}
                          onChange={() => handlePreferenceChange(index, 'yes')}
                          className="form-radio text-primary-600"
                        />
                        <span className="ml-2">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          checked={pref.preference === 'no'}
                          onChange={() => handlePreferenceChange(index, 'no')}
                          className="form-radio text-primary-600"
                        />
                        <span className="ml-2">No</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          checked={pref.preference === 'undecided'}
                          onChange={() => handlePreferenceChange(index, 'undecided')}
                          className="form-radio text-primary-600"
                        />
                        <span className="ml-2">Undecided</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Organ Donation</h3>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="yes"
                    checked={organDonation === 'yes'}
                    onChange={(e) => setOrganDonation(e.target.value as 'yes')}
                    className="form-radio text-primary-600"
                  />
                  <span className="ml-2">Yes, donate any needed organs</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="no"
                    checked={organDonation === 'no'}
                    onChange={(e) => setOrganDonation(e.target.value as 'no')}
                    className="form-radio text-primary-600"
                  />
                  <span className="ml-2">No organ donation</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="specific"
                    checked={organDonation === 'specific'}
                    onChange={(e) => setOrganDonation(e.target.value as 'specific')}
                    className="form-radio text-primary-600"
                  />
                  <span className="ml-2">Specific organs only</span>
                </label>
              </div>
              {organDonation === 'specific' && (
                <textarea
                  value={specificOrgans}
                  onChange={(e) => setSpecificOrgans(e.target.value)}
                  placeholder="List specific organs for donation"
                  className="input-field h-24"
                />
              )}
            </div>
          </div>

          <div>
            <button
              onClick={handleViewStateLaws}
              className="text-primary-600 hover:text-primary-700"
            >
              View {profile?.state} Living Will Laws
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
        type="living-will"
      />
    </div>
  );
};

export default LivingWill; 