import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import DocumentEditor from '../components/DocumentEditor';
import { getStateLaws } from '../services/ai.service';

interface Agent {
  name: string;
  relationship: string;
  type: 'primary' | 'successor';
}

interface Power {
  category: string;
  description: string;
  isGranted: boolean;
}

const PowerOfAttorney: React.FC = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [poaType, setPoaType] = useState<'general' | 'limited' | 'durable'>('general');
  const [effectiveDate, setEffectiveDate] = useState<'immediate' | 'springing'>('immediate');
  const [stateLaws, setStateLaws] = useState<string[]>([]);
  const [showLaws, setShowLaws] = useState(false);

  const [powers, setPowers] = useState<Power[]>([
    { category: 'Real Estate', description: 'Buy, sell, and manage real estate properties', isGranted: false },
    { category: 'Financial', description: 'Manage bank accounts and make financial decisions', isGranted: false },
    { category: 'Business', description: 'Operate and manage business interests', isGranted: false },
    { category: 'Legal', description: 'Represent in legal matters and file lawsuits', isGranted: false },
    { category: 'Healthcare', description: 'Make healthcare decisions (if applicable)', isGranted: false },
    { category: 'Taxes', description: 'Handle tax matters and file tax returns', isGranted: false },
  ]);

  const handleAddAgent = () => {
    setAgents([...agents, { name: '', relationship: '', type: 'primary' }]);
  };

  const handleAgentChange = (index: number, field: keyof Agent, value: string) => {
    const newAgents = [...agents];
    newAgents[index] = { ...newAgents[index], [field]: value };
    setAgents(newAgents);
  };

  const handlePowerToggle = (index: number) => {
    const newPowers = [...powers];
    newPowers[index] = { ...newPowers[index], isGranted: !newPowers[index].isGranted };
    setPowers(newPowers);
  };

  const handleViewStateLaws = async () => {
    if (profile?.state) {
      try {
        const laws = await getStateLaws(profile.state, 'power-of-attorney');
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Power of Attorney</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Type of Power of Attorney</h3>
            <div className="grid grid-cols-3 gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="general"
                  checked={poaType === 'general'}
                  onChange={(e) => setPoaType(e.target.value as 'general')}
                  className="form-radio text-primary-600"
                />
                <span className="ml-2">General</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="limited"
                  checked={poaType === 'limited'}
                  onChange={(e) => setPoaType(e.target.value as 'limited')}
                  className="form-radio text-primary-600"
                />
                <span className="ml-2">Limited</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="durable"
                  checked={poaType === 'durable'}
                  onChange={(e) => setPoaType(e.target.value as 'durable')}
                  className="form-radio text-primary-600"
                />
                <span className="ml-2">Durable</span>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">When should it take effect?</h3>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="immediate"
                  checked={effectiveDate === 'immediate'}
                  onChange={(e) => setEffectiveDate(e.target.value as 'immediate')}
                  className="form-radio text-primary-600"
                />
                <span className="ml-2">Immediate</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="springing"
                  checked={effectiveDate === 'springing'}
                  onChange={(e) => setEffectiveDate(e.target.value as 'springing')}
                  className="form-radio text-primary-600"
                />
                <span className="ml-2">Springing (upon incapacity)</span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Agents</h3>
              <button
                onClick={handleAddAgent}
                className="text-primary-600 hover:text-primary-700"
              >
                + Add Agent
              </button>
            </div>
            <div className="space-y-4">
              {agents.map((agent, index) => (
                <div key={index} className="grid grid-cols-3 gap-4">
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
                  <select
                    value={agent.type}
                    onChange={(e) => handleAgentChange(index, 'type', e.target.value as 'primary' | 'successor')}
                    className="input-field"
                  >
                    <option value="primary">Primary Agent</option>
                    <option value="successor">Successor Agent</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Powers Granted</h3>
            <div className="space-y-4">
              {powers.map((power, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={power.isGranted}
                    onChange={() => handlePowerToggle(index)}
                    className="form-checkbox text-primary-600 h-5 w-5"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{power.category}</h4>
                    <p className="text-sm text-gray-500">{power.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <button
              onClick={handleViewStateLaws}
              className="text-primary-600 hover:text-primary-700"
            >
              View {profile?.state} Power of Attorney Laws
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
        type="power-of-attorney"
      />
    </div>
  );
};

export default PowerOfAttorney; 