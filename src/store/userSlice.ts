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

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  financialInfo: {
    totalValue: number;
    lastUpdated: string;
    assets: Asset[];
    liabilities: Liability[];
  };
}

interface UserState {
  profile: UserProfile | null;
}

const initialState: UserState = {
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    age: 35,
    maritalStatus: 'married',
    address: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    },
    financialInfo: {
      totalValue: 1810000,
      lastUpdated: new Date().toISOString(),
      assets: [
        {
          id: '1',
          name: 'Primary Residence',
          type: 'real_estate',
          value: 1200000,
          description: '4 bed, 3 bath home in Pacific Heights',
          lastUpdated: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Investment Portfolio',
          type: 'investment',
          value: 500000,
          description: 'Diversified stock and bond portfolio',
          lastUpdated: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Checking Account',
          type: 'bank_account',
          value: 25000,
          description: 'Primary checking account',
          lastUpdated: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Tesla Model S',
          type: 'vehicle',
          value: 85000,
          description: '2023 Tesla Model S Plaid',
          lastUpdated: new Date().toISOString()
        }
      ],
      liabilities: [
        {
          id: '1',
          name: 'Mortgage',
          type: 'mortgage',
          amount: 800000,
          description: 'Primary residence mortgage',
          interestRate: 3.5,
          lastUpdated: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Car Loan',
          type: 'loan',
          amount: 50000,
          description: 'Tesla Model S auto loan',
          interestRate: 4.2,
          lastUpdated: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Credit Card',
          type: 'credit_card',
          amount: 5000,
          description: 'Chase Sapphire Reserve',
          interestRate: 18.99,
          lastUpdated: new Date().toISOString()
        }
      ]
    }
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.profile = action.payload;
    },
    addAsset: (state, action: PayloadAction<Asset>) => {
      if (state.profile) {
        state.profile.financialInfo.assets.push(action.payload);
        state.profile.financialInfo.totalValue += action.payload.value;
        state.profile.financialInfo.lastUpdated = new Date().toISOString();
      }
    },
    updateAsset: (state, action: PayloadAction<Asset>) => {
      if (state.profile) {
        const index = state.profile.financialInfo.assets.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          const oldValue = state.profile.financialInfo.assets[index].value;
          state.profile.financialInfo.assets[index] = action.payload;
          state.profile.financialInfo.totalValue += (action.payload.value - oldValue);
          state.profile.financialInfo.lastUpdated = new Date().toISOString();
        }
      }
    },
    deleteAsset: (state, action: PayloadAction<string>) => {
      if (state.profile) {
        const asset = state.profile.financialInfo.assets.find(a => a.id === action.payload);
        if (asset) {
          state.profile.financialInfo.totalValue -= asset.value;
          state.profile.financialInfo.assets = state.profile.financialInfo.assets.filter(a => a.id !== action.payload);
          state.profile.financialInfo.lastUpdated = new Date().toISOString();
        }
      }
    },
    addLiability: (state, action: PayloadAction<Liability>) => {
      if (state.profile) {
        state.profile.financialInfo.liabilities.push(action.payload);
        state.profile.financialInfo.lastUpdated = new Date().toISOString();
      }
    },
    updateLiability: (state, action: PayloadAction<Liability>) => {
      if (state.profile) {
        const index = state.profile.financialInfo.liabilities.findIndex(l => l.id === action.payload.id);
        if (index !== -1) {
          state.profile.financialInfo.liabilities[index] = action.payload;
          state.profile.financialInfo.lastUpdated = new Date().toISOString();
        }
      }
    },
    deleteLiability: (state, action: PayloadAction<string>) => {
      if (state.profile) {
        state.profile.financialInfo.liabilities = state.profile.financialInfo.liabilities.filter(l => l.id !== action.payload);
        state.profile.financialInfo.lastUpdated = new Date().toISOString();
      }
    }
  }
});

export const { 
  updateProfile, 
  addAsset, 
  updateAsset, 
  deleteAsset,
  addLiability,
  updateLiability,
  deleteLiability
} = userSlice.actions;

export default userSlice.reducer; 