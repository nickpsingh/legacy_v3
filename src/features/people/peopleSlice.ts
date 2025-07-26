import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as peopleService from '../../services/people.service';

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

const initialState: PeopleState = {
  people: [],
  loading: false,
  error: null
};

// Async thunks for database operations
export const fetchPeopleFromDB = createAsyncThunk(
  'people/fetchPeopleFromDB',
  async (userId: string) => {
    const result = await peopleService.fetchPeople(userId);
    if (!result.success) {
      throw new Error('Failed to fetch people');
    }
    return result.data || [];
  }
);

export const addPersonToDB = createAsyncThunk(
  'people/addPersonToDB',
  async ({ userId, personData }: { userId: string; personData: Omit<Person, 'id' | 'createdAt' | 'updatedAt'> }) => {
    const result = await peopleService.addPerson(userId, personData);
    if (!result.success || !result.data) {
      throw new Error('Failed to add person');
    }
    return result.data;
  }
);

export const updatePersonInDB = createAsyncThunk(
  'people/updatePersonInDB',
  async ({ personId, updates }: { personId: string; updates: Partial<Person> }) => {
    const result = await peopleService.updatePerson(personId, updates);
    if (!result.success || !result.data) {
      throw new Error('Failed to update person');
    }
    return result.data;
  }
);

export const deletePersonFromDB = createAsyncThunk(
  'people/deletePersonFromDB',
  async (personId: string) => {
    const result = await peopleService.deletePerson(personId);
    if (!result.success) {
      throw new Error('Failed to delete person');
    }
    return personId;
  }
);

const peopleSlice = createSlice({
  name: 'people',
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
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch people
      .addCase(fetchPeopleFromDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPeopleFromDB.fulfilled, (state, action) => {
        state.loading = false;
        state.people = action.payload;
        state.error = null;
      })
      .addCase(fetchPeopleFromDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch people';
      })
      
      // Add person
      .addCase(addPersonToDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPersonToDB.fulfilled, (state, action) => {
        state.loading = false;
        state.people.push(action.payload);
        state.error = null;
      })
      .addCase(addPersonToDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add person';
      })
      
      // Update person
      .addCase(updatePersonInDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePersonInDB.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.people.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.people[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updatePersonInDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update person';
      })
      
      // Delete person
      .addCase(deletePersonFromDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePersonFromDB.fulfilled, (state, action) => {
        state.loading = false;
        state.people = state.people.filter(p => p.id !== action.payload);
        state.error = null;
      })
      .addCase(deletePersonFromDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete person';
      });
  }
});

export const { setLoading, setError, clearError } = peopleSlice.actions;

export default peopleSlice.reducer; 