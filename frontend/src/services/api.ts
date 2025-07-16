import axios from 'axios';
import { 
  AuthResponse, 
  MatchResponse, 
  SearchResponse, 
  FilterOptions, 
  SearchFilters,
  Organization
} from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://your-railway-url.railway.app/api'
  : 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  signup: async (orgType: 'nonprofit' | 'forprofit', orgName: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', { orgType, orgName });
    return response.data;
  },

  registerNewOrg: async (orgData: {
    orgName: string;
    issueArea: string;
    region: string;
    mission: string;
    values: string;
    workLocations?: string[];
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register-new-org', orgData);
    return response.data;
  }
};

export const matchingApi = {
  getMatches: async (orgType: 'nonprofit' | 'forprofit', orgName: string): Promise<MatchResponse> => {
    const response = await api.get(`/matches/${orgType}/${encodeURIComponent(orgName)}`);
    return response.data;
  }
};

export const searchApi = {
  search: async (
    orgType: 'nonprofit' | 'forprofit', 
    filters: SearchFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<SearchResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    });
    
    const response = await api.get(`/search/${orgType}?${params}`);
    return response.data;
  },

  getFilters: async (orgType: 'nonprofit' | 'forprofit'): Promise<FilterOptions> => {
    const response = await api.get(`/filters/${orgType}`);
    return response.data;
  }
};

export const organizationApi = {
  getDetails: async (orgType: 'nonprofit' | 'forprofit', orgName: string): Promise<Organization> => {
    const response = await api.get(`/organization/${orgType}/${encodeURIComponent(orgName)}`);
    return response.data;
  }
};

export const healthApi = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  }
}; 