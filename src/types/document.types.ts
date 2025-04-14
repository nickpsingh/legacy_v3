// Document Types
export type DocumentType = 'will' | 'living-trust' | 'living-will' | 'power-of-attorney';

// Document Status
export type DocumentStatus = 'draft' | 'submitted' | 'completed';

// Document Metadata
export interface DocumentMetadata {
  documentId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    uid: string;
    name: string;
    email: string;
  };
  status: DocumentStatus;
}

// Base Document Interface
export interface DocumentData<T = any> {
  type: DocumentType;
  title: string;
  metadata: DocumentMetadata;
  content: T;
}

// Living Will Specific Types
export interface HealthcareAgent {
  id: string;
  name: string;
  relationship: string;
  type: 'primary' | 'alternate';
  contact: {
    email: string;
    phone: string;
  };
}

export interface LivingWillContent {
  currentStep: number;
  agents: HealthcareAgent[];
  preferences: {
    lifeSupportPreference: string;
    painManagement: string;
    organDonation: {
      preference: 'yes' | 'no' | 'specific';
      specificOrgans?: string[];
    };
    specialInstructions: string;
    religiousPreferences: string;
    notificationRequirements: string[];
  };
  lastUpdated: string;
}

export type LivingWillDocument = DocumentData<LivingWillContent>; 