export type DocumentType = 'will' | 'living-trust' | 'living-will' | 'power-of-attorney';

export interface DocumentMetadata {
  documentId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    uid: string;
    name: string;
    email: string;
  };
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export interface DocumentData<T = any> {
  id?: string;
  type: DocumentType;
  title: string;
  content: T;
  metadata: DocumentMetadata;
}

export interface BaseDocument {
  currentStep: number;
  lastUpdated: string;
}

export interface WillDocument extends BaseDocument {
  type: 'will';
  // ... will specific fields
}

export interface TrustDocument extends BaseDocument {
  type: 'living-trust';
  // ... trust specific fields
}

export interface LivingWillDocument extends BaseDocument {
  type: 'living-will';
  // ... living will specific fields
}

export interface PowerOfAttorneyDocument extends BaseDocument {
  type: 'power-of-attorney';
  // ... power of attorney specific fields
} 