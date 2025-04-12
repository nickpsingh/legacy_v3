import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Asset {
  type: string;
  value: number;
  description: string;
}

export interface Liability {
  type: string;
  amount: number;
  description: string;
}

export interface UserProfile {
  name: string;
  state: string;
  financialInfo: {
    assets: Asset[];
    liabilities: Liability[];
  };
}

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: {
    name: 'Test User',
    state: 'California',
    financialInfo: {
      assets: [
        { type: 'Real Estate', value: 500000, description: 'Primary Residence' },
        { type: 'Vehicle', value: 25000, description: 'Car' },
        { type: 'Bank Account', value: 50000, description: 'Savings Account' }
      ],
      liabilities: [
        { type: 'Mortgage', amount: 300000, description: 'Home Loan' },
        { type: 'Auto Loan', amount: 15000, description: 'Car Loan' }
      ]
    },
  },
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.profile = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setProfile, setLoading, setError } = userSlice.actions;
export default userSlice.reducer; 