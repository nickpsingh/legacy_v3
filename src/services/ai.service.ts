import axios from 'axios';

interface AIResponse {
  content: string;
  suggestions: string[];
}

interface DocumentRequest {
  type: 'will' | 'trust' | 'power-of-attorney' | 'living-will';
  userProfile: {
    name: string;
    state: string;
    assets: Array<{ type: string; value: number; description: string }>;
    liabilities: Array<{ type: string; amount: number; description: string }>;
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
    'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
  }
});

export const generateDocument = async (request: DocumentRequest): Promise<AIResponse> => {
  try {
    const response = await api.post('/ai/generate-document', request);
    return response.data;
  } catch (error) {
    console.error('Error generating document:', error);
    throw error;
  }
};

export const getStateLaws = async (state: string, documentType: string): Promise<string[]> => {
  try {
    const response = await api.get(`/ai/state-laws/${state}/${documentType}`);
    return response.data.laws;
  } catch (error) {
    console.error('Error fetching state laws:', error);
    throw error;
  }
};

export const getSuggestions = async (
  documentType: string,
  userProfile: any,
  currentContent: string
): Promise<string[]> => {
  try {
    const response = await api.post('/ai/suggestions', {
      documentType,
      userProfile,
      currentContent
    });
    return response.data.suggestions;
  } catch (error) {
    console.error('Error getting suggestions:', error);
    throw error;
  }
}; 