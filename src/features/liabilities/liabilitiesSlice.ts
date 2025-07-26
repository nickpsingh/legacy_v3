import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as liabilitiesService from '../../services/liabilities.service';
import { Liability } from '../../services/liabilities.service';

interface LiabilitiesState {
  liabilities: Liability[];
  loading: boolean;
  error: string | null;
}

const initialState: LiabilitiesState = {
  liabilities: [],
  loading: false,
  error: null
};

// Async thunks for database operations
export const fetchLiabilitiesFromDB = createAsyncThunk(
  'liabilities/fetchLiabilitiesFromDB',
  async (userId: string) => {
    const result = await liabilitiesService.fetchLiabilities(userId);
    if (!result.success) {
      throw new Error('Failed to fetch liabilities');
    }
    return result.data || [];
  }
);

export const addLiabilityToDB = createAsyncThunk(
  'liabilities/addLiabilityToDB',
  async ({ userId, liabilityData }: { userId: string; liabilityData: Omit<Liability, 'id' | 'lastUpdated'> }) => {
    const result = await liabilitiesService.addLiability(userId, liabilityData);
    if (!result.success || !result.data) {
      throw new Error('Failed to add liability');
    }
    return result.data;
  }
);

export const updateLiabilityInDB = createAsyncThunk(
  'liabilities/updateLiabilityInDB',
  async ({ liabilityId, updates }: { liabilityId: string; updates: Partial<Liability> }) => {
    const result = await liabilitiesService.updateLiability(liabilityId, updates);
    if (!result.success || !result.data) {
      throw new Error('Failed to update liability');
    }
    return result.data;
  }
);

export const deleteLiabilityFromDB = createAsyncThunk(
  'liabilities/deleteLiabilityFromDB',
  async (liabilityId: string) => {
    const result = await liabilitiesService.deleteLiability(liabilityId);
    if (!result.success) {
      throw new Error('Failed to delete liability');
    }
    return liabilityId;
  }
);

const liabilitiesSlice = createSlice({
  name: 'liabilities',
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
      // Fetch liabilities
      .addCase(fetchLiabilitiesFromDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLiabilitiesFromDB.fulfilled, (state, action) => {
        state.loading = false;
        state.liabilities = action.payload;
        state.error = null;
      })
      .addCase(fetchLiabilitiesFromDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch liabilities';
      })
      
      // Add liability
      .addCase(addLiabilityToDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addLiabilityToDB.fulfilled, (state, action) => {
        state.loading = false;
        state.liabilities.push(action.payload);
        state.error = null;
      })
      .addCase(addLiabilityToDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add liability';
      })
      
      // Update liability
      .addCase(updateLiabilityInDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLiabilityInDB.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.liabilities.findIndex(l => l.id === action.payload.id);
        if (index !== -1) {
          state.liabilities[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateLiabilityInDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update liability';
      })
      
      // Delete liability
      .addCase(deleteLiabilityFromDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLiabilityFromDB.fulfilled, (state, action) => {
        state.loading = false;
        state.liabilities = state.liabilities.filter(l => l.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteLiabilityFromDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete liability';
      });
  }
});

export const { setLoading, setError, clearError } = liabilitiesSlice.actions;

export default liabilitiesSlice.reducer; 