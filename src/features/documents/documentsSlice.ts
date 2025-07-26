import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { documentsService, DocumentData, DocumentTemplate, DocumentStep } from '../../services/documents.service';

interface DocumentsState {
  documents: DocumentData[];
  templates: DocumentTemplate[];
  steps: { [documentType: string]: DocumentStep[] };
  loading: boolean;
  error: string | null;
}

const initialState: DocumentsState = {
  documents: [],
  templates: [],
  steps: {},
  loading: false,
  error: null,
};

// Async thunks for document operations
export const fetchDocumentsFromDB = createAsyncThunk(
  'documents/fetchFromDB',
  async (userId: string) => {
    console.log('🚀 Redux: fetchDocumentsFromDB called with userId:', userId);
    const result = await documentsService.fetchDocuments(userId);
    console.log('📤 Redux: fetchDocumentsFromDB returning:', result);
    return result;
  }
);

export const fetchTemplatesFromDB = createAsyncThunk(
  'documents/fetchTemplates',
  async () => {
    return await documentsService.fetchTemplates();
  }
);

export const fetchWorkflowSteps = createAsyncThunk(
  'documents/fetchWorkflowSteps',
  async (documentType: string) => {
    return await documentsService.fetchWorkflowSteps(documentType);
  }
);

export const createDocumentInDB = createAsyncThunk(
  'documents/create',
  async (documentData: Omit<DocumentData, 'id' | 'created_at' | 'updated_at'>) => {
    return await documentsService.createDocument(documentData);
  }
);

export const updateDocumentInDB = createAsyncThunk(
  'documents/update',
  async ({ documentId, updates }: { documentId: string; updates: Partial<DocumentData> }) => {
    return await documentsService.updateDocument(documentId, updates);
  }
);

export const deleteDocumentFromDB = createAsyncThunk(
  'documents/delete',
  async (documentId: string) => {
    const success = await documentsService.deleteDocument(documentId);
    if (success) {
      return documentId;
    }
    throw new Error('Failed to delete document');
  }
);

export const submitDocumentToDB = createAsyncThunk(
  'documents/submit',
  async ({ documentId, userId }: { documentId: string; userId: string }) => {
    const success = await documentsService.submitDocument(documentId, userId);
    if (success) {
      return documentId;
    }
    throw new Error('Failed to submit document');
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch documents
    builder
      .addCase(fetchDocumentsFromDB.pending, (state) => {
        console.log('⏳ Redux: fetchDocumentsFromDB.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentsFromDB.fulfilled, (state, action) => {
        console.log('✅ Redux: fetchDocumentsFromDB.fulfilled with:', action.payload);
        console.log('📋 Redux: Setting documents count:', action.payload.length);
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocumentsFromDB.rejected, (state, action) => {
        console.log('❌ Redux: fetchDocumentsFromDB.rejected with:', action.error);
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch documents';
      });

    // Fetch templates
    builder
      .addCase(fetchTemplatesFromDB.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTemplatesFromDB.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
      })
      .addCase(fetchTemplatesFromDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch templates';
      });

    // Fetch workflow steps
    builder
      .addCase(fetchWorkflowSteps.fulfilled, (state, action) => {
        if (action.payload.length > 0) {
          const documentType = action.payload[0].document_type;
          state.steps[documentType] = action.payload;
        }
      });

    // Create document
    builder
      .addCase(createDocumentInDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDocumentInDB.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.documents.unshift(action.payload);
        }
      })
      .addCase(createDocumentInDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create document';
      });

    // Update document
    builder
      .addCase(updateDocumentInDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDocumentInDB.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.documents.findIndex(doc => doc.id === action.payload!.id);
          if (index !== -1) {
            state.documents[index] = action.payload;
          }
        }
      })
      .addCase(updateDocumentInDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update document';
      });

    // Delete document
    builder
      .addCase(deleteDocumentFromDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDocumentFromDB.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = state.documents.filter(doc => doc.id !== action.payload);
      })
      .addCase(deleteDocumentFromDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete document';
      });

    // Submit document
    builder
      .addCase(submitDocumentToDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitDocumentToDB.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.documents.findIndex(doc => doc.id === action.payload);
        if (index !== -1) {
          state.documents[index].status = 'submitted';
          state.documents[index].progress_percentage = 100;
          state.documents[index].submitted_at = new Date().toISOString();
        }
      })
      .addCase(submitDocumentToDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to submit document';
      });
  },
});

export const { setLoading, setError, clearError } = documentsSlice.actions;
export default documentsSlice.reducer; 