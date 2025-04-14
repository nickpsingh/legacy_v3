import React from 'react';
import { DocumentType } from '../types/documents';

interface DocumentStep {
  id: number;
  title: string;
  description: string;
}

const documentSteps: Record<DocumentType, DocumentStep[]> = {
  'will': [
    { id: 0, title: 'Personal Information', description: 'Basic details about you' },
    { id: 1, title: 'Executor Selection', description: 'Choose your executor' },
    { id: 2, title: 'Beneficiaries', description: 'Add your beneficiaries' },
    { id: 3, title: 'Asset Distribution', description: 'Specify how assets should be distributed' },
    { id: 4, title: 'Special Requests', description: 'Any special instructions or requests' },
    { id: 5, title: 'Review & Submit', description: 'Review and finalize your will' }
  ],
  'living-trust': [
    { id: 0, title: 'Trust Type', description: 'Choose the type of trust' },
    { id: 1, title: 'Trustee Selection', description: 'Choose your trustees' },
    { id: 2, title: 'Beneficiaries', description: 'Add trust beneficiaries' },
    { id: 3, title: 'Trust Assets', description: 'Add assets to the trust' },
    { id: 4, title: 'Distribution', description: 'Specify distribution rules' }
  ],
  'living-will': [
    { id: 0, title: 'Healthcare Agent', description: 'Choose your healthcare agent' },
    { id: 1, title: 'Medical Preferences', description: 'Specify medical care preferences' },
    { id: 2, title: 'Organ Donation', description: 'Organ donation preferences' },
    { id: 3, title: 'Special Instructions', description: 'Additional medical instructions' },
    { id: 4, title: 'Religious Preferences', description: 'Religious or cultural preferences' },
    { id: 5, title: 'Notifications', description: 'Notification requirements' },
    { id: 6, title: 'Review & Submit', description: 'Review and finalize' }
  ],
  'power-of-attorney': [
    { id: 0, title: 'POA Type', description: 'Choose the type of power of attorney' },
    { id: 1, title: 'Agent Selection', description: 'Choose your agent(s)' },
    { id: 2, title: 'Effective Date', description: 'When the POA takes effect' },
    { id: 3, title: 'Powers Granted', description: 'Specify granted powers' },
    { id: 4, title: 'Limitations', description: 'Add any limitations' },
    { id: 5, title: 'Duration', description: 'Specify duration of powers' },
    { id: 6, title: 'Review & Submit', description: 'Review and finalize' }
  ]
};

interface DocumentStepsProps {
  type: DocumentType;
  currentStep: number;
  onStepClick?: (step: number) => void;
  status?: 'draft' | 'completed' | 'submitted';
}

const DocumentSteps: React.FC<DocumentStepsProps> = ({ type, currentStep, onStepClick, status = 'draft' }) => {
  const handleStepClick = (step: number) => {
    if (onStepClick && status !== 'submitted') {
      onStepClick(step);
    }
  };

  const steps = documentSteps[type];

  if (status === 'submitted') {
    return (
      <div className="fixed left-64 top-0 h-screen w-64 bg-[#111] border-r border-[#1D1F23] overflow-y-auto z-10">
        <div className="pt-14 px-4 pb-4">
          <h2 className="text-lg font-semibold text-white mb-4">Document Steps</h2>
          <div className="space-y-1">
            {steps.map((step) => (
              <div
                key={step.id}
                className="w-full text-left p-2 rounded-lg bg-[#1A1B1E] text-gray-600"
              >
                <div className="flex items-center">
                  <div className="w-5 h-5 text-sm rounded-full flex items-center justify-center mr-2 bg-green-500 text-white">
                    ✓
                  </div>
                  <div>
                    <div className="font-medium text-sm">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed left-64 top-0 h-screen w-64 bg-[#111] border-r border-[#1D1F23] overflow-y-auto z-10">
      <div className="pt-14 px-4 pb-4">
        <h2 className="text-lg font-semibold text-white mb-4">Document Steps</h2>
        <div className="space-y-1">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              className={`w-full text-left p-2 rounded-lg transition-colors ${
                currentStep === step.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1A1B1E] text-gray-400 hover:bg-[#2D2F33] hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 text-sm rounded-full flex items-center justify-center mr-2 ${
                  currentStep === step.id
                    ? 'bg-white text-blue-600'
                    : currentStep > step.id
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {currentStep > step.id ? '✓' : step.id + 1}
                </div>
                <div>
                  <div className="font-medium text-sm">{step.title}</div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentSteps; 