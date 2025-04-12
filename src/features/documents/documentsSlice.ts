import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DocumentType = 'will' | 'trust' | 'power-of-attorney' | 'living-will' | 'all';

export interface Document {
  id: string;
  title: string;
  content: string;
  type: DocumentType;
  createdAt: string;
  updatedAt: string;
}

interface DocumentsState {
  documents: Document[];
  loading: boolean;
  error: string | null;
}

const initialState: DocumentsState = {
  documents: [],
  loading: false,
  error: null,
};

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setDocuments: (state, action: PayloadAction<Document[]>) => {
      state.documents = action.payload;
    },
    addDocument: (state, action: PayloadAction<Document>) => {
      state.documents.push(action.payload);
    },
    updateDocument: (state, action: PayloadAction<Document>) => {
      const index = state.documents.findIndex(doc => doc.id === action.payload.id);
      if (index !== -1) {
        state.documents[index] = action.payload;
      }
    },
    deleteDocument: (state, action: PayloadAction<string>) => {
      state.documents = state.documents.filter(doc => doc.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  setLoading,
  setError,
} = documentsSlice.actions;

export default documentsSlice.reducer; 