import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Asset {
  type: string;
  value: number;
  description: string;
  source: 'plaid' | 'manual';
  lastUpdated: string;
  institution?: string;
  documentUrl?: string;
}

interface Liability {
  type: string;
  amount: number;
  description: string;
  lastUpdated: string;
}

interface FinancialInfo {
  totalValue: number;
  totalAssets: number;
  totalLiabilities: number;
  lastUpdated: string;
  assets: Asset[];
  liabilities: Liability[];
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  age?: string;
  name: string;  // Full name (firstName + lastName)
  state: string; // US State
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  financialInfo: FinancialInfo;
}

interface UserState {
  profile: UserProfile | null;
}

const initialState: UserState = {
  profile: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.profile = action.payload;
    },
    updateFinancialInfo: (state, action: PayloadAction<Asset[]>) => {
      if (state.profile) {
        const totalValue = action.payload.reduce((sum, asset) => sum + asset.value, 0);
        state.profile.financialInfo = {
          assets: action.payload,
          totalValue,
          totalAssets: totalValue,
          totalLiabilities: 0,
          lastUpdated: new Date().toISOString(),
          liabilities: state.profile.financialInfo?.liabilities || []
        };
      }
    },
    addAsset: (state, action: PayloadAction<Asset>) => {
      if (state.profile) {
        state.profile.financialInfo.assets.push(action.payload);
        state.profile.financialInfo.totalValue += action.payload.value;
        state.profile.financialInfo.totalAssets += action.payload.value;
        state.profile.financialInfo.lastUpdated = new Date().toISOString();
      }
    },
    removeAsset: (state, action: PayloadAction<string>) => {
      if (state.profile) {
        const assetToRemove = state.profile.financialInfo.assets.find(
          asset => asset.type === action.payload
        );
        if (assetToRemove) {
          state.profile.financialInfo.assets = state.profile.financialInfo.assets.filter(
            asset => asset.type !== action.payload
          );
          state.profile.financialInfo.totalValue -= assetToRemove.value;
          state.profile.financialInfo.totalAssets -= assetToRemove.value;
          state.profile.financialInfo.lastUpdated = new Date().toISOString();
        }
      }
    },
    updateAsset: (state, action: PayloadAction<{ type: string; updates: Partial<Asset> }>) => {
      if (state.profile) {
        const { type, updates } = action.payload;
        const assetIndex = state.profile.financialInfo.assets.findIndex(
          asset => asset.type === type
        );
        if (assetIndex >= 0) {
          const oldValue = state.profile.financialInfo.assets[assetIndex].value;
          state.profile.financialInfo.assets[assetIndex] = {
            ...state.profile.financialInfo.assets[assetIndex],
            ...updates
          };
          if (updates.value !== undefined) {
            state.profile.financialInfo.totalValue += updates.value - oldValue;
            state.profile.financialInfo.totalAssets += updates.value - oldValue;
          }
          state.profile.financialInfo.lastUpdated = new Date().toISOString();
        }
      }
    }
  }
});

export const {
  updateProfile,
  updateFinancialInfo,
  addAsset,
  removeAsset,
  updateAsset
} = userSlice.actions;

export type { Asset, FinancialInfo };
export default userSlice.reducer; 