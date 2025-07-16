export interface Organization {
  ein?: number;
  name: string;
  issueArea: string;
  region: string;
  city?: string;
  headquarters: string;
  serviceLocations?: string[];
  workLocations: string[];
  mission: string;
  values: string;
  programs?: string[];
  revenue?: number;
  isGlobal?: boolean;
  matchScore?: number;
  matchReason?: string;
}

export interface AuthResponse {
  success: boolean;
  orgFound: boolean;
  organization?: Organization;
  orgType: 'nonprofit' | 'forprofit';
  orgName?: string;
}

export interface MatchResponse {
  requestingOrg: Organization;
  matches: Organization[];
}

export interface SearchResponse {
  organizations: Organization[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterOptions {
  issueAreas: string[];
  regions: string[];
  workLocations: string[];
}

export interface SearchFilters {
  keyword?: string;
  issueArea?: string;
  region?: string;
  workLocation?: string;
  minRevenue?: number;
  maxRevenue?: number;
} 