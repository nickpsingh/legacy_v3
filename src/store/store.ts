import { configureStore } from '@reduxjs/toolkit';
import documentsReducer from '../features/documents/documentsSlice';
import userReducer from '../store/userSlice';

// Create the store
export const store = configureStore({
  reducer: {
    user: userReducer,
    documents: documentsReducer,
  },
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 