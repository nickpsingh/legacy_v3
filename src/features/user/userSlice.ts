import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as usersService from '../../services/users.service';

export interface Asset {
  id: string;
  name: string;
  type: 'real_estate' | 'investment' | 'bank_account' | 'vehicle' | 'other';
  value: number;
  amount: number;
  description: string;
  lastUpdated: string;
}

export interface Liability {
  id: string;
  name: string;
  type: 'mortgage' | 'loan' | 'credit_card' | 'other';
  amount: number;
  description: string;
  interestRate: number;
  lastUpdated: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface FinancialInfo {
  income?: number;
  assets: Asset[];
  liabilities: Liability[];
  netWorth?: number;
  plaidConnected?: boolean;
  totalValue?: number;
  lastUpdated: string;
}

export interface BaseBeneficiary {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  dateOfBirth?: string;
  share: number;
  contact: {
    email?: string;
    phone?: string;
  };
  lastUpdated?: string;
}

export interface WillBeneficiary extends BaseBeneficiary {
  type: 'will';
  allocation: number;
}

export interface TrustBeneficiary extends BaseBeneficiary {
  type: 'trust';
  distribution: string;
  conditions: string;
}

export type Beneficiary = WillBeneficiary | TrustBeneficiary;

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  dateOfBirth?: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  address: Address;
  state: string;
  financialInfo: FinancialInfo;
  beneficiaries: Beneficiary[];
  lastUpdated?: string;
}

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const DEMO_USER_UID = 'ec540338-923f-400d-a185-6028c5d5f823'; // John Smith's UUID ID

// Async thunks for database operations
export const fetchUserFromDB = createAsyncThunk(
  'user/fetchUserFromDB',
  async (uid: string = DEMO_USER_UID) => {
    console.log('Fetching user from DB with UID:', uid);
    const result = await usersService.fetchUserByUID(uid);
    
    if (!result.success) {
      console.log('User not found, error:', result.error);
      console.log('Creating demo user...');
      
      // If user doesn't exist, create it
      const createResult = await usersService.createUser({
        uid: DEMO_USER_UID,
        firstName: 'John',
        lastName: 'Smith',
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '(555) 123-4567',
        age: 35,
        dateOfBirth: '1988-06-15',
        maritalStatus: 'married',
        address: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'USA'
        },
        state: 'CA'
      });
      
      if (!createResult.success) {
        console.error('Failed to create user:', createResult.error);
        throw new Error(`Failed to create user: ${JSON.stringify(createResult.error)}`);
      }
      console.log('Created user:', createResult.data);
      return createResult.data;
    }
    
    console.log('Fetched user:', result.data);
    return result.data;
  }
);

export const updateUserInDB = createAsyncThunk(
  'user/updateUserInDB',
  async ({ uid = DEMO_USER_UID, updates }: { uid?: string; updates: Partial<UserProfile> }) => {
    console.log('updateUserInDB called with:', { uid, updates });
    const result = await usersService.updateUser(uid, updates);
    if (!result.success || !result.data) {
      console.error('Update failed:', result.error);
      throw new Error(`Failed to update user: ${JSON.stringify(result.error)}`);
    }
    console.log('Update result:', result.data);
    return result.data;
  }
);

export const createUserInDB = createAsyncThunk(
  'user/createUserInDB',
  async (userData: Omit<UserProfile, 'financialInfo' | 'beneficiaries' | 'lastUpdated'>) => {
    const result = await usersService.createUser(userData);
    if (!result.success || !result.data) {
      throw new Error('Failed to create user');
    }
    return result.data;
  }
);

// Load initial state from localStorage
const loadState = (): UserState => {
  try {
    const serializedState = localStorage.getItem('estateplannerState');
    if (serializedState === null) {
      return {
        profile: null,
        loading: false,
        error: null
      };
    }
    const state = JSON.parse(serializedState);
    return state.user || {
      profile: null,
      loading: false,
      error: null
    };
  } catch (err) {
    console.error('Error loading state:', err);
    return {
      profile: null,
      loading: false,
      error: null
    };
  }
};

const initialState: UserState = {
  profile: {
    uid: DEMO_USER_UID,
    firstName: 'John',
    lastName: 'Smith',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    age: 35,
    dateOfBirth: '1988-06-15',
    maritalStatus: 'married',
    address: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    },
    state: 'CA',
    financialInfo: {
      income: 150000,
      assets: [],
      liabilities: [],
      netWorth: 0,
      plaidConnected: false,
      totalValue: 0,
      lastUpdated: new Date().toISOString()
    },
    beneficiaries: [],
    lastUpdated: new Date().toISOString()
  },
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    updateFinancialInfo: (state, action: PayloadAction<Partial<FinancialInfo>>) => {
      if (state.profile) {
        state.profile.financialInfo = {
          ...state.profile.financialInfo,
          ...action.payload,
          lastUpdated: new Date().toISOString()
        };
      }
    },
    addBeneficiary: (state, action: PayloadAction<Beneficiary>) => {
      if (state.profile) {
        state.profile.beneficiaries = [
          ...state.profile.beneficiaries,
          {
            ...action.payload,
            id: crypto.randomUUID(),
            lastUpdated: new Date().toISOString()
          }
        ];
      }
    },
    updateBeneficiary: (state, action: PayloadAction<{ id: string; beneficiary: Partial<Beneficiary> }>) => {
      if (state.profile) {
        const index = state.profile.beneficiaries.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          const existingBeneficiary = state.profile.beneficiaries[index];
          const updatedBeneficiary = {
            ...existingBeneficiary,
            ...action.payload.beneficiary,
            type: existingBeneficiary.type,
            lastUpdated: new Date().toISOString()
          };
          state.profile.beneficiaries[index] = updatedBeneficiary as WillBeneficiary | TrustBeneficiary;
        }
      }
    },
    addAsset: (state, action: PayloadAction<Asset>) => {
      if (state.profile?.financialInfo) {
        state.profile.financialInfo.assets.push(action.payload);
      }
    },
    updateAsset: (state, action: PayloadAction<Asset>) => {
      if (state.profile?.financialInfo) {
        const index = state.profile.financialInfo.assets.findIndex(
          asset => asset.id === action.payload.id
        );
        if (index !== -1) {
          state.profile.financialInfo.assets[index] = action.payload;
        }
      }
    },
    deleteAsset: (state, action: PayloadAction<string>) => {
      if (state.profile?.financialInfo) {
        state.profile.financialInfo.assets = state.profile.financialInfo.assets.filter(
          asset => asset.id !== action.payload
        );
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user from database
      .addCase(fetchUserFromDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserFromDB.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && state.profile) {
          // Merge database user data with existing financial info and beneficiaries
          state.profile = {
            ...state.profile,
            ...action.payload,
            uid: action.payload.uid || state.profile.uid,
            name: `${action.payload.firstName} ${action.payload.lastName}`.trim(),
            financialInfo: state.profile.financialInfo,
            beneficiaries: state.profile.beneficiaries
          };
        } else if (action.payload) {
          // Create new profile with default financial info
          state.profile = {
            ...action.payload,
            uid: action.payload.uid || DEMO_USER_UID,
            name: `${action.payload.firstName} ${action.payload.lastName}`.trim(),
            financialInfo: {
              income: 0,
              assets: [],
              liabilities: [],
              netWorth: 0,
              plaidConnected: false,
              totalValue: 0,
              lastUpdated: new Date().toISOString()
            },
            beneficiaries: []
          };
        }
        state.error = null;
      })
      .addCase(fetchUserFromDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user';
      })
      
      // Update user in database
      .addCase(updateUserInDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserInDB.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && state.profile) {
          // Merge database updates with existing data
          state.profile = {
            ...state.profile,
            ...action.payload,
            uid: action.payload.uid || state.profile.uid,
            name: `${action.payload.firstName} ${action.payload.lastName}`.trim(),
            financialInfo: state.profile.financialInfo,
            beneficiaries: state.profile.beneficiaries
          };
        }
        state.error = null;
      })
      .addCase(updateUserInDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update user';
      })
      
      // Create user in database
      .addCase(createUserInDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserInDB.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.profile = {
            ...action.payload,
            uid: action.payload.uid || DEMO_USER_UID,
            name: `${action.payload.firstName} ${action.payload.lastName}`.trim(),
            financialInfo: {
              income: 0,
              assets: [],
              liabilities: [],
              netWorth: 0,
              plaidConnected: false,
              totalValue: 0,
              lastUpdated: new Date().toISOString()
            },
            beneficiaries: []
          };
        }
        state.error = null;
      })
      .addCase(createUserInDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create user';
      });
  }
});

export const {
  updateProfile,
  updateFinancialInfo,
  addBeneficiary,
  updateBeneficiary,
  addAsset,
  updateAsset,
  deleteAsset,
  setLoading,
  setError
} = userSlice.actions;

export default userSlice.reducer; 