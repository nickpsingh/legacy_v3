import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

const dummyAssets: Asset[] = [
  {
    id: '1',
    name: 'Primary Residence',
    type: 'real_estate',
    value: 750000,
    amount: 750000,
    description: '4 bedroom house in San Francisco',
    lastUpdated: new Date().toISOString()
  },
  {
    id: '2',
    name: '401(k) Account',
    type: 'investment',
    value: 250000,
    amount: 250000,
    description: 'Retirement account with Fidelity',
    lastUpdated: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Checking Account',
    type: 'bank_account',
    value: 25000,
    amount: 25000,
    description: 'Main checking account with Chase',
    lastUpdated: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Tesla Model 3',
    type: 'vehicle',
    value: 45000,
    amount: 45000,
    description: '2022 Tesla Model 3 Long Range',
    lastUpdated: new Date().toISOString()
  }
];

const dummyLiabilities: Liability[] = [
  {
    id: '1',
    name: 'Mortgage',
    type: 'mortgage',
    amount: 500000,
    description: 'Primary residence mortgage',
    interestRate: 3.5,
    lastUpdated: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Car Loan',
    type: 'loan',
    amount: 35000,
    description: 'Tesla Model 3 auto loan',
    interestRate: 4.2,
    lastUpdated: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Credit Card',
    type: 'credit_card',
    amount: 5000,
    description: 'Chase Sapphire Reserve balance',
    interestRate: 16.99,
    lastUpdated: new Date().toISOString()
  }
];

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
    uid: '',
    firstName: '',
    lastName: '',
    name: '',
    email: '',
    phone: '',
    age: 0,
    dateOfBirth: '',
    maritalStatus: 'single',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    state: '',
    financialInfo: {
      income: 0,
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
  initialState: loadState(),
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
            type: existingBeneficiary.type, // Preserve the original type
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
    addLiability: (state, action: PayloadAction<Liability>) => {
      if (state.profile?.financialInfo) {
        state.profile.financialInfo.liabilities.push(action.payload);
      }
    },
    updateLiability: (state, action: PayloadAction<Liability>) => {
      if (!state.profile?.financialInfo) return;

      // Create a new array with the updated liability
      const updatedLiabilities = state.profile.financialInfo.liabilities.map(liability => 
        liability.id === action.payload.id 
          ? { ...action.payload, lastUpdated: new Date().toISOString() }
          : liability
      );

      // Calculate totals
      const totalAssets = state.profile.financialInfo.assets.reduce(
        (sum, asset) => sum + Number(asset.value),
        0
      );
      
      const totalLiabilities = updatedLiabilities.reduce(
        (sum, liability) => sum + Number(liability.amount),
        0
      );

      // Update the entire financial info to ensure state changes are detected
      state.profile.financialInfo = {
        ...state.profile.financialInfo,
        liabilities: updatedLiabilities,
        netWorth: totalAssets - totalLiabilities,
        lastUpdated: new Date().toISOString()
      };

      // Force a state update by updating the profile's lastUpdated
      state.profile.lastUpdated = new Date().toISOString();
    },
    deleteLiability: (state, action: PayloadAction<string>) => {
      if (state.profile) {
        state.profile.financialInfo.liabilities = state.profile.financialInfo.liabilities.filter(
          liability => liability.id !== action.payload
        );
        // Update net worth after deleting liability
        const totalAssets = state.profile.financialInfo.assets.reduce((sum, asset) => sum + asset.value, 0);
        const totalLiabilities = state.profile.financialInfo.liabilities.reduce((sum, liability) => sum + liability.amount, 0);
        state.profile.financialInfo.netWorth = totalAssets - totalLiabilities;
      }
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
  updateProfile,
  updateFinancialInfo,
  addBeneficiary,
  updateBeneficiary,
  addAsset,
  updateAsset,
  deleteAsset,
  addLiability,
  updateLiability,
  deleteLiability,
  setLoading,
  setError
} = userSlice.actions;

export default userSlice.reducer; 