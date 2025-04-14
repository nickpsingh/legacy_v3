export type DocumentType = 'will' | 'living-trust' | 'living-will' | 'power-of-attorney';
export type DocumentStatus = 'draft' | 'completed' | 'submitted';

export interface DocumentMetadata {
  documentId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  status: DocumentStatus;
}

export interface DocumentData {
  type: DocumentType;
  metadata: DocumentMetadata;
  content: any; // This is generic as each document type has different content structure
} 