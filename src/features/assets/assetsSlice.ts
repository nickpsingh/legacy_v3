import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as assetsService from '../../services/assets.service';
import { Asset } from '../user/userSlice';

interface AssetsState {
  assets: Asset[];
  loading: boolean;
  error: string | null;
}

const initialState: AssetsState = {
  assets: [],
  loading: false,
  error: null
};

// Async thunks for database operations
export const fetchAssetsFromDB = createAsyncThunk(
  'assets/fetchAssetsFromDB',
  async (userId: string) => {
    const result = await assetsService.fetchAssets(userId);
    if (!result.success) {
      throw new Error('Failed to fetch assets');
    }
    return result.data || [];
  }
);

export const addAssetToDB = createAsyncThunk(
  'assets/addAssetToDB',
  async (
    { userId, assetData }: { userId: string; assetData: Omit<Asset, 'id' | 'lastUpdated'> },
    { rejectWithValue }
  ) => {
    const result = await assetsService.addAsset(userId, assetData);
    if (!result.success || !result.data) {
      const msg =
        typeof (result as { error?: unknown }).error === 'string'
          ? (result as { error: string }).error
          : 'Failed to add asset';
      return rejectWithValue(msg);
    }
    return result.data;
  }
);

export const updateAssetInDB = createAsyncThunk(
  'assets/updateAssetInDB',
  async ({ assetId, updates }: { assetId: string; updates: Partial<Asset> }) => {
    const result = await assetsService.updateAsset(assetId, updates);
    if (!result.success || !result.data) {
      throw new Error('Failed to update asset');
    }
    return result.data;
  }
);

export const deleteAssetFromDB = createAsyncThunk(
  'assets/deleteAssetFromDB',
  async (assetId: string) => {
    const result = await assetsService.deleteAsset(assetId);
    if (!result.success) {
      throw new Error('Failed to delete asset');
    }
    return assetId;
  }
);

const assetsSlice = createSlice({
  name: 'assets',
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
      // Fetch assets
          .addCase(fetchAssetsFromDB.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchAssetsFromDB.fulfilled, (state, action) => {
      state.loading = false;
      state.assets = action.payload;
      state.error = null;
    })
    .addCase(fetchAssetsFromDB.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch assets';
    })
      
      // Add asset
      .addCase(addAssetToDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAssetToDB.fulfilled, (state, action) => {
        state.loading = false;
        state.assets.push(action.payload);
        state.error = null;
      })
      .addCase(addAssetToDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add asset';
      })
      
      // Update asset
      .addCase(updateAssetInDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAssetInDB.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.assets.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.assets[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateAssetInDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update asset';
      })
      
      // Delete asset
      .addCase(deleteAssetFromDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssetFromDB.fulfilled, (state, action) => {
        state.loading = false;
        state.assets = state.assets.filter(a => a.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteAssetFromDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete asset';
      });
  }
});

export const { setLoading, setError, clearError } = assetsSlice.actions;

export default assetsSlice.reducer; 