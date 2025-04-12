import axios from 'axios';

interface Asset {
  type: string;
  value: number;
  description: string;
}

interface Liability {
  type: string;
  amount: number;
  description: string;
}

interface AIResponse {
  content: string;
  suggestions?: string[];
}

interface StateLawsResponse {
  laws: string[];
}

interface SuggestionsResponse {
  suggestions: string[];
}

interface DocumentRequest {
  type: "will" | "trust" | "power-of-attorney" | "living-will";
  userProfile: {
    name: string;
    state: string;
    assets: Asset[];
    liabilities: Liability[];
  };
  preferences?: {
    beneficiaries?: string[];
    executors?: string[];
    trustees?: string[];
    agents?: string[];
    healthcarePreferences?: string[];
  };
}

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const generateDocument = async (request: DocumentRequest): Promise<AIResponse> => {
  try {
    const response = await api.post<AIResponse>('/ai/generate-document', request);
    return response.data;
  } catch (error) {
    console.error('Error generating document:', error);
    throw error;
  }
};

export const getStateLaws = async (state: string, documentType: string): Promise<string[]> => {
  try {
    const response = await api.get<StateLawsResponse>(`/ai/state-laws/${state}/${documentType}`);
    return response.data.laws;
  } catch (error) {
    console.error('Error fetching state laws:', error);
    throw error;
  }
};

export const getSuggestions = async (
  documentType: string,
  personalInfo: any,
  currentContent: string
): Promise<string[]> => {
  try {
    const response = await api.post<SuggestionsResponse>('/ai/suggestions', {
      documentType,
      personalInfo,
      currentContent
    });
    return response.data.suggestions;
  } catch (error) {
    console.error('Error getting suggestions:', error);
    throw error;
  }
}; 