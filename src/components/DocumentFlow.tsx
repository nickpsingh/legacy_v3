import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface Step {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isRequired: boolean;
}

interface DocumentFlowProps {
  type: 'living-trust' | 'living-will' | 'power-of-attorney';
  children: React.ReactNode;
  onSave: () => void;
  onPreview: () => void;
  onSubmit: () => void;
}

const DocumentFlow: React.FC<DocumentFlowProps> = ({
  type,
  children,
  onSave,
  onPreview,
  onSubmit,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useSelector((state: RootState) => state.user);

  const steps: Record<DocumentFlowProps['type'], Step[]> = {
    'living-trust': [
      { id: 'basic-info', title: 'Basic Information', description: 'Trust type and general information', isCompleted: false, isRequired: true },
      { id: 'trustees', title: 'Trustees', description: 'Add primary and successor trustees', isCompleted: false, isRequired: true },
      { id: 'beneficiaries', title: 'Beneficiaries', description: 'Add trust beneficiaries', isCompleted: false, isRequired: true },
      { id: 'assets', title: 'Assets', description: 'Specify assets to be placed in trust', isCompleted: false, isRequired: true },
      { id: 'distribution', title: 'Distribution', description: 'Define asset distribution rules', isCompleted: false, isRequired: true },
      { id: 'review', title: 'Review & Sign', description: 'Review and sign document', isCompleted: false, isRequired: true },
    ],
    'living-will': [
      { id: 'personal-info', title: 'Personal Information', description: 'Your basic information', isCompleted: false, isRequired: true },
      { id: 'healthcare-agents', title: 'Healthcare Agents', description: 'Choose your healthcare representatives', isCompleted: false, isRequired: true },
      { id: 'medical-preferences', title: 'Medical Preferences', description: 'Specify your medical care preferences', isCompleted: false, isRequired: true },
      { id: 'organ-donation', title: 'Organ Donation', description: 'Organ donation preferences', isCompleted: false, isRequired: false },
      { id: 'special-instructions', title: 'Special Instructions', description: 'Additional medical or personal care instructions', isCompleted: false, isRequired: false },
      { id: 'review', title: 'Review & Sign', description: 'Review and sign document', isCompleted: false, isRequired: true },
    ],
    'power-of-attorney': [
      { id: 'poa-type', title: 'POA Type', description: 'Choose type of power of attorney', isCompleted: false, isRequired: true },
      { id: 'agents', title: 'Agents', description: 'Designate your agents', isCompleted: false, isRequired: true },
      { id: 'powers', title: 'Powers', description: 'Specify granted powers', isCompleted: false, isRequired: true },
      { id: 'limitations', title: 'Limitations', description: 'Set any limitations or conditions', isCompleted: false, isRequired: false },
      { id: 'duration', title: 'Duration', description: 'Specify effective dates and duration', isCompleted: false, isRequired: true },
      { id: 'review', title: 'Review & Sign', description: 'Review and sign document', isCompleted: false, isRequired: true },
    ],
  };

  const currentSteps = steps[type];

  const handleNext = () => {
    if (currentStep < currentSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    try {
      await onSave();
      // Show success message
    } catch (error) {
      // Show error message
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
    onPreview();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
      // Show success message
    } catch (error) {
      // Show error message
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {currentSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${
                index < currentStep
                  ? 'text-primary-400'
                  : index === currentStep
                  ? 'text-primary-300'
                  : 'text-gray-600'
              }`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    index <= currentStep ? 'border-primary-400' : 'border-gray-600'
                  }`}
                >
                  {step.isCompleted ? (
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="mt-2 text-sm font-medium">{step.title}</span>
              </div>
              {index < currentSteps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 bg-gray-700" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="bg-gray-900 shadow-lg rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-6">
          {currentSteps[currentStep].title}
        </h2>
        <p className="text-gray-400 mb-6">{currentSteps[currentStep].description}</p>
        
        {children}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded ${
              currentStep === 0
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Previous
          </button>
          <div className="flex space-x-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
            >
              Save Draft
            </button>
            {currentStep === currentSteps.length - 1 ? (
              <>
                <button
                  onClick={handlePreview}
                  className="px-4 py-2 bg-primary-900 text-primary-300 rounded hover:bg-primary-800"
                >
                  Preview
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:bg-gray-800 disabled:text-gray-600"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </>
            ) : (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentFlow; 