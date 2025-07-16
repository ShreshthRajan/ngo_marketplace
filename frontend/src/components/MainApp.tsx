import React, { useState, useEffect } from 'react';
import { Organization, MatchResponse, SearchResponse, FilterOptions, SearchFilters } from '../types';
import { matchingApi, searchApi } from '../services/api';

interface MainAppProps {
  currentUser: Organization;
  userType: 'nonprofit' | 'forprofit';
  onLogout: () => void;
}

const MainApp: React.FC<MainAppProps> = ({ currentUser, userType, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'matches' | 'search'>('matches');
  const [matches, setMatches] = useState<Organization[]>([]);
  const [searchResults, setSearchResults] = useState<Organization[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search state
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load matches on mount
  useEffect(() => {
    loadMatches();
    loadFilterOptions();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    setError('');
    try {
      const response: MatchResponse = await matchingApi.getMatches(userType, currentUser.name);
      setMatches(response.matches);
    } catch (err) {
      setError('Failed to load matches');
      console.error('Matches error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const targetType = userType === 'nonprofit' ? 'forprofit' : 'nonprofit';
      const options = await searchApi.getFilters(targetType);
      setFilterOptions(options);
    } catch (err) {
      console.error('Filter options error:', err);
    }
  };

  const handleSearch = async (page: number = 1) => {
    setLoading(true);
    setError('');
    setCurrentPage(page);
    
    try {
      const targetType = userType === 'nonprofit' ? 'forprofit' : 'nonprofit';
      const response: SearchResponse = await searchApi.search(targetType, searchFilters, page, 20);
      setSearchResults(response.organizations);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError('Search failed');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  const OrganizationCard: React.FC<{ org: Organization; showMatchScore?: boolean }> = ({ 
    org, 
    showMatchScore = false 
  }) => (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '25px',
      marginBottom: '20px',
      background: 'white',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '20px', fontWeight: '800' }}>{org.name}</h3>
        {showMatchScore && org.matchScore && (
          <div style={{
            background: org.matchScore >= 70 ? '#3b82f6' : org.matchScore >= 50 ? '#6366f1' : '#64748b',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {Math.round(org.matchScore)}% match
          </div>
        )}
      </div>
      
      <div style={{ color: '#64748b', marginBottom: '12px', fontWeight: '400' }}>
        <strong>Issue Area:</strong> {org.issueArea}
      </div>
      
      <div style={{ color: '#64748b', marginBottom: '12px', fontWeight: '400' }}>
        <strong>Headquarters:</strong> {org.headquarters}
      </div>
      
      {org.workLocations && org.workLocations.length > 0 && (
        <div style={{ color: '#64748b', marginBottom: '12px', fontWeight: '400' }}>
          <strong>Work Locations:</strong> {org.workLocations.join(', ')}
        </div>
      )}
      
      <div style={{ color: '#64748b', marginBottom: '18px', fontWeight: '400' }}>
        <strong>Mission:</strong> {org.mission && org.mission.length > 150 ? `${org.mission.substring(0, 150)}...` : (org.mission || 'No mission statement available')}
      </div>
      
      <div style={{ color: '#64748b', marginBottom: '18px', fontWeight: '400' }}>
        <strong>Values:</strong> {org.values || 'Not specified'}
      </div>
      
      {org.revenue && org.revenue > 0 && (
        <div style={{ color: '#64748b', marginBottom: '18px', fontWeight: '400' }}>
          <strong>Revenue:</strong> {formatCurrency(org.revenue)}
        </div>
      )}
      
      {showMatchScore && org.matchReason && (
        <div style={{
          background: '#f1f5f9',
          padding: '12px',
          borderRadius: '10px',
          fontSize: '14px',
          color: '#475569',
          marginTop: '15px',
          fontWeight: '400'
        }}>
          <strong style={{ fontWeight: '600' }}>Why this match:</strong> {org.matchReason}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8f9fa',
      fontFamily: '"Inter", sans-serif',
      color: '#1e293b'
    }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#1e293b', fontSize: '24px', fontWeight: '800' }}>NGO Marketplace</h1>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px', fontWeight: '400' }}>
            Welcome, {currentUser.name} ({userType === 'nonprofit' ? 'Nonprofit' : 'For-Profit'})
          </p>
        </div>
        <button
          onClick={onLogout}
          style={{
            padding: '8px 16px',
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px 30px'
      }}>
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '40px',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '30px'
        }}>
          <button
            onClick={() => setActiveTab('matches')}
            style={{
              padding: '15px 0',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'matches' ? '3px solid #3b82f6' : '3px solid transparent',
              color: activeTab === 'matches' ? '#3b82f6' : '#64748b',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'color 0.3s'
            }}
          >
            Recommended Matches
          </button>
          <button
            onClick={() => setActiveTab('search')}
            style={{
              padding: '15px 0',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'search' ? '3px solid #3b82f6' : '3px solid transparent',
              color: activeTab === 'search' ? '#3b82f6' : '#64748b',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'color 0.3s'
            }}
          >
            Search & Browse
          </button>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#dc2626'
          }}>
            {error}
          </div>
        )}

        {activeTab === 'matches' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ margin: 0, color: '#1e293b', fontSize: '20px', fontWeight: '800' }}>Your Top Matches</h2>
              <button
                onClick={loadMatches}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontWeight: '400' }}>
                Loading matches...
              </div>
            ) : matches.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontWeight: '400' }}>
                No matches found. Try again later.
              </div>
            ) : (
              <div>
                {matches.map((org, index) => (
                  <OrganizationCard key={`${org.name}-${index}`} org={org} showMatchScore={true} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div>
            <h2 style={{ marginBottom: '20px', color: '#1e293b', fontSize: '20px', fontWeight: '800' }}>
              Search {userType === 'nonprofit' ? 'For-Profits' : 'Nonprofits'}
            </h2>
            
            {/* Search Filters */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Search keywords..."
                  value={searchFilters.keyword || ''}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, keyword: e.target.value }))}
                  style={{
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '400'
                  }}
                />
                
                {filterOptions && (
                  <>
                    <select
                      value={searchFilters.issueArea || ''}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, issueArea: e.target.value }))}
                      style={{
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '400'
                      }}
                    >
                      <option value="">All Issue Areas</option>
                      {filterOptions.issueAreas.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                    
                    <select
                      value={searchFilters.region || ''}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, region: e.target.value }))}
                      style={{
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '400'
                      }}
                    >
                      <option value="">All Regions</option>
                      {filterOptions.regions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                    
                    <select
                      value={searchFilters.workLocation || ''}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, workLocation: e.target.value }))}
                      style={{
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '400'
                      }}
                    >
                      <option value="">All Work Locations</option>
                      {filterOptions.workLocations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                onClick={() => handleSearch(currentPage)}
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Search
                </button>
                <button
                  onClick={() => {
                    setSearchFilters({});
                    setSearchResults([]);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Results */}
            {searchResults.length > 0 && (
              <div>
                <div style={{ marginBottom: '20px', color: '#64748b', fontWeight: '400' }}>
                  Showing {searchResults.length} results (Page {currentPage} of {totalPages})
                </div>
                
                <div>
                  {searchResults.map((org, index) => (
                    <OrganizationCard key={`${org.name}-${index}`} org={org} showMatchScore={false} />
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                     <button
                       onClick={() => handleSearch(currentPage - 1)}
                       disabled={currentPage === 1}
                       style={{
                         padding: '8px 16px',
                         background: currentPage === 1 ? '#e5e7eb' : '#3b82f6',
                         color: currentPage === 1 ? '#9ca3af' : 'white',
                         border: 'none',
                         borderRadius: '8px',
                         cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                         fontSize: '14px',
                         fontWeight: '600'
                       }}
                     >
                       Previous
                     </button>
                     <span style={{ padding: '8px 16px', color: '#64748b', fontWeight: '400' }}>
                       {currentPage} / {totalPages}
                     </span>
                     <button
                       onClick={() => handleSearch(currentPage + 1)}
                       disabled={currentPage === totalPages}
                       style={{
                         padding: '8px 16px',
                         background: currentPage === totalPages ? '#e5e7eb' : '#3b82f6',
                         color: currentPage === totalPages ? '#9ca3af' : 'white',
                         border: 'none',
                         borderRadius: '8px',
                         cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                         fontSize: '14px',
                         fontWeight: '600'
                       }}
                     >
                       Next
                     </button>
                  </div>
                )}
              </div>
            )}
            
            {searchResults.length === 0 && !loading && Object.keys(searchFilters).some(key => searchFilters[key as keyof SearchFilters]) && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontWeight: '400' }}>
                No results found. Try adjusting your search criteria.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default MainApp; 