import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  dateOfBirth?: string;
  contact: {
    email?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
  };
  roles?: {
    isExecutor?: boolean;
    isTrustee?: boolean;
    isBeneficiary?: boolean;
    isHealthcareAgent?: boolean;
    isPowerOfAttorney?: boolean;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface PeopleState {
  people: Person[];
  loading: boolean;
  error: string | null;
}

// Load state from localStorage
const loadState = (): PeopleState => {
  try {
    const serializedState = localStorage.getItem('people');
    if (serializedState === null) {
      return {
        people: [],
        loading: false,
        error: null
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading people state:', err);
    return {
      people: [],
      loading: false,
      error: null
    };
  }
};

const peopleSlice = createSlice({
  name: 'people',
  initialState: loadState(),
  reducers: {
    addPerson: (state, action: PayloadAction<Omit<Person, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newPerson: Person = {
        ...action.payload,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      state.people.push(newPerson);
      // Save to localStorage
      localStorage.setItem('people', JSON.stringify(state));
    },
    updatePerson: (state, action: PayloadAction<{ id: string; updates: Partial<Person> }>) => {
      const index = state.people.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.people[index] = {
          ...state.people[index],
          ...action.payload.updates,
          updatedAt: new Date().toISOString()
        };
        // Save to localStorage
        localStorage.setItem('people', JSON.stringify(state));
      }
    },
    deletePerson: (state, action: PayloadAction<string>) => {
      state.people = state.people.filter(p => p.id !== action.payload);
      // Save to localStorage
      localStorage.setItem('people', JSON.stringify(state));
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const {
  addPerson,
  updatePerson,
  deletePerson,
  setLoading,
  setError
} = peopleSlice.actions;

export default peopleSlice.reducer; 