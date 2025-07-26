import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DocumentSteps from './DocumentSteps';
import { DocumentType } from '../types/document';
import { RootState } from '../store/store';
import Modal from './Modal';
import { LAYOUT_NAVIGATION_ITEMS } from '../constants/navigation';

interface DocumentLayoutProps {
  children: React.ReactNode;
  documentType: DocumentType;
  currentStep: number;
  steps: Array<{ id: number; title: string }>;
  onStepClick?: (step: number) => void;
  onSave?: () => Promise<void>;
}

const DocumentLayout: React.FC<DocumentLayoutProps> = ({
  children,
  documentType,
  currentStep,
  steps,
  onStepClick,
  onSave
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useSelector((state: RootState) => state.user);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const navigationItems = LAYOUT_NAVIGATION_ITEMS;

  const handleSave = async () => {
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave();
        setShowSaveModal(true);
      } catch (error) {
        console.error('Error saving document:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#000000]">
      {/* Left Navigation */}
      <div className="fixed left-0 top-14 bottom-0 w-64 bg-[#000000] border-r border-[#1D1F23] overflow-y-auto">
        <div className="p-4">
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'bg-[#1D1F23] text-white'
                    : 'text-[#989AA1] hover:text-white hover:bg-[#1D1F23]'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-[#1D1F23]">
          <DocumentSteps
            type={documentType}
            currentStep={currentStep}
            onStepClick={onStepClick}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        {children}
      </div>

      {/* Save Success Modal */}
      <Modal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Progress Saved"
      >
        <div className="p-6">
          <p className="text-lg text-gray-300 mb-6">
            Your progress has been saved successfully.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => navigate('/documents')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go to My Documents
            </button>
            <button
              onClick={() => setShowSaveModal(false)}
              className="px-4 py-2 bg-[#1D1F23] text-white rounded-lg hover:bg-[#2D2F33] transition-colors"
            >
              Continue Editing
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DocumentLayout; 