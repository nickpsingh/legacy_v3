import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Asset {
  id: string;
  name: string;
  type: 'real_estate' | 'investment' | 'bank_account' | 'vehicle' | 'other';
  value: number;
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
  assets: Asset[];
  liabilities: Liability[];
  netWorth?: number;
  plaidConnected?: boolean;
  totalValue: number;
  lastUpdated: string;
}

export interface Beneficiary {
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
}

export interface UserProfile {
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
    description: '4 bedroom house in San Francisco',
    lastUpdated: new Date().toISOString()
  },
  {
    id: '2',
    name: '401(k) Account',
    type: 'investment',
    value: 250000,
    description: 'Retirement account with Fidelity',
    lastUpdated: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Checking Account',
    type: 'bank_account',
    value: 25000,
    description: 'Main checking account with Chase',
    lastUpdated: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Tesla Model 3',
    type: 'vehicle',
    value: 45000,
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
    const serializedState = localStorage.getItem('userProfile');
    if (serializedState === null) {
      return {
        profile: null,
        loading: false,
        error: null
      };
    }
    const profile = JSON.parse(serializedState);
    return {
      profile,
      loading: false,
      error: null
    };
  } catch (err) {
    return {
      profile: null,
      loading: false,
      error: null
    };
  }
};

const initialState: UserState = {
  profile: {
    firstName: '',
    lastName: '',
    name: '',
    email: '',
    phone: '',
    age: 0,
    maritalStatus: 'single',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    state: '',
    financialInfo: {
      assets: [],
      liabilities: [],
      lastUpdated: '',
      totalValue: 0,
    },
    beneficiaries: [],
  },
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<UserProfile | null>) => {
      if (action.payload) {
        // Merge with existing profile data if it exists
        if (state.profile) {
          state.profile = {
            ...state.profile,
            ...action.payload,
            // Preserve nested objects by merging them
            address: {
              ...state.profile.address,
              ...(action.payload.address || {}),
            },
            financialInfo: {
              ...state.profile.financialInfo,
              ...(action.payload.financialInfo || {}),
              // Preserve arrays by concatenating and deduplicating
              assets: [
                ...(state.profile.financialInfo.assets || []),
                ...(action.payload.financialInfo?.assets || [])
              ].filter((asset, index, self) => 
                index === self.findIndex((a) => a.id === asset.id)
              ),
              liabilities: [
                ...(state.profile.financialInfo.liabilities || []),
                ...(action.payload.financialInfo?.liabilities || [])
              ].filter((liability, index, self) => 
                index === self.findIndex((l) => l.id === liability.id)
              ),
            },
          };
        } else {
          state.profile = action.payload;
        }

        // Ensure required fields
        if (state.profile) {
          state.profile.name = `${state.profile.firstName} ${state.profile.lastName}`;
          state.profile.state = state.profile.address?.state || '';
          
          // Ensure financialInfo exists and has required fields
          if (!state.profile.financialInfo) {
            state.profile.financialInfo = {
              assets: [],
              liabilities: [],
              netWorth: 0,
              plaidConnected: false,
              totalValue: 0,
              lastUpdated: new Date().toISOString()
            };
          }

          // Calculate totalValue and netWorth
          const totalAssets = state.profile.financialInfo.assets.reduce(
            (sum, asset) => sum + asset.value,
            0
          );
          const totalLiabilities = state.profile.financialInfo.liabilities.reduce(
            (sum, liability) => sum + liability.amount,
            0
          );
          
          state.profile.financialInfo.totalValue = totalAssets;
          state.profile.financialInfo.netWorth = totalAssets - totalLiabilities;
          state.profile.financialInfo.lastUpdated = new Date().toISOString();

          // Save to localStorage
          localStorage.setItem('userProfile', JSON.stringify(state.profile));
        }
      } else {
        // On logout, preserve the data in localStorage but clear the state
        state.profile = null;
      }
    },
    addDummyFinancialData: (state) => {
      if (state.profile) {
        // Preserve existing assets and liabilities, add dummy ones
        const existingAssets = state.profile.financialInfo?.assets || [];
        const existingLiabilities = state.profile.financialInfo?.liabilities || [];

        // Combine existing and dummy data, removing duplicates by ID
        const combinedAssets = [...existingAssets, ...dummyAssets]
          .filter((asset, index, self) => 
            index === self.findIndex((a) => a.id === asset.id)
          );

        const combinedLiabilities = [...existingLiabilities, ...dummyLiabilities]
          .filter((liability, index, self) => 
            index === self.findIndex((l) => l.id === liability.id)
          );

        // Calculate new totals
        const totalAssets = combinedAssets.reduce((sum, asset) => sum + asset.value, 0);
        const totalLiabilities = combinedLiabilities.reduce((sum, liability) => sum + liability.amount, 0);

        const updatedProfile = {
          ...state.profile,
          financialInfo: {
            ...state.profile.financialInfo,
            assets: combinedAssets,
            liabilities: combinedLiabilities,
            netWorth: totalAssets - totalLiabilities,
            totalValue: totalAssets,
            lastUpdated: new Date().toISOString()
          }
        };

        // Update state and persist to localStorage
        state.profile = updatedProfile;
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { updateProfile, addDummyFinancialData, setLoading, setError } = userSlice.actions;
export default userSlice.reducer; 