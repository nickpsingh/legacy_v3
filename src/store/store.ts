import { configureStore } from '@reduxjs/toolkit';
import documentsReducer from '../features/documents/documentsSlice';
import userReducer from '../features/user/userSlice';
import peopleReducer from '../features/people/peopleSlice';

// Load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('estateplannerState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading state:', err);
    return undefined;
  }
};

// Save state to localStorage
const saveState = (state: RootState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('estateplannerState', serializedState);
  } catch (err) {
    console.error('Error saving state:', err);
  }
};

// Create the store with preloaded state
export const store = configureStore({
  reducer: {
    user: userReducer,
    documents: documentsReducer,
    people: peopleReducer,
  },
  preloadedState: loadState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for dates
    }),
});

// Subscribe to store changes and save to localStorage
store.subscribe(() => {
  const state = store.getState();
  saveState(state);
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 