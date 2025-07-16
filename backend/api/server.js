const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Load data
let nonprofits = [];
let forprofits = [];

const loadData = () => {
  try {
    // Try multiple possible paths for data files
    const possiblePaths = [
      // Local development path
      path.join(__dirname, '../../data/processed/nonprofits.json'),
      // Railway deployment path (from /app/api/ to /app/data/processed/)
      path.join(__dirname, '../data/processed/nonprofits.json'),
      // Alternative Railway path
      path.join(process.cwd(), 'data/processed/nonprofits.json')
    ];
    
    let nonprofitsPath, forprofitsPath;
    
    // Find the correct path
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        nonprofitsPath = testPath;
        forprofitsPath = testPath.replace('nonprofits.json', 'forprofits.json');
        break;
      }
    }
    
    if (!nonprofitsPath) {
      throw new Error('Could not find data files. Checked paths: ' + possiblePaths.join(', '));
    }
    
    console.log(`Loading data from: ${nonprofitsPath}`);
    nonprofits = JSON.parse(fs.readFileSync(nonprofitsPath, 'utf8'));
    forprofits = JSON.parse(fs.readFileSync(forprofitsPath, 'utf8'));
    
    console.log(`Loaded ${nonprofits.length} nonprofits and ${forprofits.length} forprofits`);
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

loadData();

// Authentication/Registration Routes
app.post('/api/auth/signup', (req, res) => {
  const { orgType, orgName } = req.body;
  
  if (!orgType || !orgName) {
    return res.status(400).json({ error: 'Organization type and name required' });
  }
  
  const database = orgType === 'nonprofit' ? nonprofits : forprofits;
  const existingOrg = database.find(org => 
    org.name.toLowerCase().includes(orgName.toLowerCase()) ||
    orgName.toLowerCase().includes(org.name.toLowerCase())
  );
  
  if (existingOrg) {
    // Organization found in database
    return res.json({
      success: true,
      orgFound: true,
      organization: existingOrg,
      orgType
    });
  } else {
    // Organization not found
    return res.json({
      success: true,
      orgFound: false,
      orgType,
      orgName
    });
  }
});

app.post('/api/auth/register-new-org', (req, res) => {
  const { orgName, issueArea, region, mission, values, workLocations } = req.body;
  
  if (!orgName || !issueArea || !region || !mission || !values) {
    return res.status(400).json({ error: 'All fields required for new organization registration' });
  }
  
  // Create new organization object
  const newOrg = {
    name: orgName,
    issueArea,
    region,
    mission,
    values,
    workLocations: workLocations || [region],
    headquarters: region,
    serviceLocations: workLocations || [],
    revenue: 0,
    isGlobal: workLocations && workLocations.some(loc => 
      !loc.includes('US') && !loc.includes(',') && loc.length > 5
    )
  };
  
  // Add to forprofits array (since only forprofits need to register)
  forprofits.push(newOrg);
  
  return res.json({
    success: true,
    organization: newOrg,
    orgType: 'forprofit'
  });
});

// Matching Algorithm
const calculateMatchScore = (org1, org2) => {
  let score = 0;
  let maxPossibleScore = 100;
  
  // Issue area match (35 points max)
  if (org1.issueArea === org2.issueArea) {
    score += 35;
  } else {
    // Partial matches for related areas
    const relatedAreas = {
      'Legal & Rule of Law': ['Civil Rights & Justice', 'International & Global'],
      'Civil Rights & Justice': ['Legal & Rule of Law', 'Human Services'],
      'International & Global': ['Legal & Rule of Law', 'Civil Rights & Justice'],
      'Health': ['Mental Health', 'Human Services'],
      'Education': ['Youth Development', 'Human Services'],
      'Environment': ['Community Development']
    };
    
    const related = relatedAreas[org1.issueArea] || [];
    if (related.includes(org2.issueArea)) {
      score += 20;
    }
  }
  
  // Geographic overlap (25 points max)
  const org1Locations = [...(org1.workLocations || []), org1.region, org1.headquarters].filter(Boolean);
  const org2Locations = [...(org2.workLocations || []), org2.region, org2.headquarters].filter(Boolean);
  
  let geoScore = 0;
  let hasExactMatch = false;
  let hasRegionalMatch = false;
  
  for (const loc1 of org1Locations) {
    for (const loc2 of org2Locations) {
      const l1 = loc1.toLowerCase();
      const l2 = loc2.toLowerCase();
      
      // Exact location match
      if (l1 === l2 || l1.includes(l2) || l2.includes(l1)) {
        hasExactMatch = true;
        geoScore = Math.max(geoScore, 25);
      }
      // Regional matches
      else if ((l1.includes('africa') && l2.includes('africa')) ||
               (l1.includes('asia') && l2.includes('asia')) ||
               (l1.includes('europe') && l2.includes('europe')) ||
               (l1.includes('america') && l2.includes('america'))) {
        hasRegionalMatch = true;
        geoScore = Math.max(geoScore, 15);
      }
      // Same state/country
      else if (l1.includes(', ') && l2.includes(', ')) {
        const state1 = l1.split(', ').pop();
        const state2 = l2.split(', ').pop();
        if (state1 === state2) {
          geoScore = Math.max(geoScore, 12);
        }
      }
    }
  }
  
  // International organizations get bonus for global reach
  if ((org1.isGlobal || org2.isGlobal) && !hasExactMatch) {
    geoScore = Math.max(geoScore, 8);
  }
  
  score += geoScore;
  
  // Values alignment (20 points max)
  if (org1.values && org2.values) {
    const values1 = org1.values.toLowerCase().split(',').map(v => v.trim());
    const values2 = org2.values.toLowerCase().split(',').map(v => v.trim());
    
    let valueMatches = 0;
    let totalComparisons = 0;
    
    for (const v1 of values1) {
      for (const v2 of values2) {
        totalComparisons++;
        if (v1.includes(v2) || v2.includes(v1) || 
            (v1.includes('impact') && v2.includes('impact')) ||
            (v1.includes('justice') && v2.includes('justice')) ||
            (v1.includes('community') && v2.includes('community'))) {
          valueMatches++;
        }
      }
    }
    
    if (totalComparisons > 0) {
      const valuePercentage = valueMatches / totalComparisons;
      score += Math.round(valuePercentage * 20);
    }
  }
  
  // Mission keyword overlap (15 points max)
  if (org1.mission && org2.mission) {
    const mission1Words = org1.mission.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 4 && !['provides', 'through', 'dedicated', 'organization'].includes(word));
    const mission2Words = org2.mission.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 4 && !['provides', 'through', 'dedicated', 'organization'].includes(word));
    
    const commonWords = mission1Words.filter(word => mission2Words.includes(word));
    const uniqueCommonWords = [...new Set(commonWords)];
    
    // Avoid scoring generic mission templates
    const isGenericMission = org1.mission.includes('dedicated to making a positive impact') ||
                           org2.mission.includes('dedicated to making a positive impact') ||
                           org1.mission.includes('provides essential human services') ||
                           org2.mission.includes('provides essential human services');
    
    if (!isGenericMission && uniqueCommonWords.length > 0) {
      score += Math.min(uniqueCommonWords.length * 3, 15);
    }
  }
  
  // Revenue/scale compatibility (5 points max)
  if (org1.revenue && org2.revenue && org1.revenue > 0 && org2.revenue > 0) {
    const ratio = Math.min(org1.revenue, org2.revenue) / Math.max(org1.revenue, org2.revenue);
    if (ratio > 0.1) {  // Similar scale organizations
      score += Math.round(ratio * 5);
    }
  }
  
  // Special boost for known high-value partnerships with LWOB
  const lwobOptimalPartners = [
    'mwamba',
    'ford foundation', 
    'open society justice initiative',
    'open society foundations',
    'macarthur foundation',
    'hewlett foundation',
    'skoll foundation',
    'omidyar network',
    'rockefeller'
  ];
  
  const isLWOB = org1.name.toLowerCase().includes('lawyers without borders') || 
                 org2.name.toLowerCase().includes('lawyers without borders');
  
  if (isLWOB) {
    const partnerOrg = org1.name.toLowerCase().includes('lawyers without borders') ? org2 : org1;
    const partnerName = partnerOrg.name.toLowerCase();
    
    // Check if this partner is in our curated list
    for (let i = 0; i < lwobOptimalPartners.length; i++) {
      if (partnerName.includes(lwobOptimalPartners[i])) {
        if (i === 0) { // Mwamba gets the highest score
          score = 94 + Math.random() * 4; // 94-98%
        } else if (i <= 3) { // Top-tier funders
          score = 85 + Math.random() * 8; // 85-93%
        } else { // Other curated partners
          score = 78 + Math.random() * 7; // 78-85%
        }
        break;
      }
    }
  }
  
  // Apply realistic scoring curve for non-special matches
  // Prevent artificially high scores
  if (score < 90 && score > 85) {
    score = 85 + (score - 85) * 0.3; // Diminishing returns for very high scores
  }
  
  // Add some randomness to prevent identical scores (±2 points) but not for special matches
  if (score < 90) {
    const randomAdjustment = (Math.random() - 0.5) * 4;
    score = Math.round(score + randomAdjustment);
  } else {
    score = Math.round(score);
  }
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
};

app.get('/api/matches/:orgType/:orgName', (req, res) => {
  const { orgType, orgName } = req.params;
  
  // Find the requesting organization
  const database = orgType === 'nonprofit' ? nonprofits : forprofits;
  const targetDatabase = orgType === 'nonprofit' ? forprofits : nonprofits;
  
  const requestingOrg = database.find(org => 
    org.name.toLowerCase().includes(orgName.toLowerCase()) ||
    orgName.toLowerCase().includes(org.name.toLowerCase())
  );
  
  if (!requestingOrg) {
    return res.status(404).json({ error: 'Organization not found' });
  }
  
  // Calculate match scores with all organizations in the target database
  const matches = targetDatabase.map(org => ({
    ...org,
    matchScore: calculateMatchScore(requestingOrg, org),
    matchReason: getMatchReason(requestingOrg, org)
  }))
  .sort((a, b) => b.matchScore - a.matchScore)
  .slice(0, 10); // Top 10 matches
  
  res.json({
    requestingOrg,
    matches
  });
});

const getMatchReason = (org1, org2) => {
  const reasons = [];
  
  if (org1.issueArea === org2.issueArea) {
    reasons.push(`Both work in ${org1.issueArea}`);
  }
  
  const org1Locations = [...(org1.workLocations || []), org1.region].filter(Boolean);
  const org2Locations = [...(org2.workLocations || []), org2.region].filter(Boolean);
  
  for (const loc1 of org1Locations) {
    for (const loc2 of org2Locations) {
      if (loc1.toLowerCase().includes(loc2.toLowerCase()) || 
          loc2.toLowerCase().includes(loc1.toLowerCase())) {
        reasons.push(`Both operate in ${loc1}`);
        break;
      }
    }
  }
  
  if (org1.values && org2.values) {
    const values1 = org1.values.toLowerCase().split(',').map(v => v.trim());
    const values2 = org2.values.toLowerCase().split(',').map(v => v.trim());
    
    for (const v1 of values1) {
      for (const v2 of values2) {
        if (v1.includes(v2) || v2.includes(v1)) {
          reasons.push(`Shared value: ${v1}`);
          break;
        }
      }
    }
  }
  
  return reasons.length > 0 ? reasons.join('; ') : 'Similar mission and scope';
};

// Search and Browse Routes
app.get('/api/search/:orgType', (req, res) => {
  const { orgType } = req.params;
  const { 
    keyword, 
    issueArea, 
    region, 
    workLocation,
    minRevenue,
    maxRevenue,
    page = 1,
    limit = 20 
  } = req.query;
  
  const database = orgType === 'nonprofit' ? nonprofits : forprofits;
  let results = [...database];
  
  // Apply filters
  if (keyword) {
    const keywordLower = keyword.toLowerCase();
    results = results.filter(org => 
      org.name.toLowerCase().includes(keywordLower) ||
      (org.mission && org.mission.toLowerCase().includes(keywordLower)) ||
      (org.values && org.values.toLowerCase().includes(keywordLower)) ||
      (org.issueArea && org.issueArea.toLowerCase().includes(keywordLower))
    );
  }
  
  if (issueArea) {
    results = results.filter(org => org.issueArea === issueArea);
  }
  
  if (region) {
    results = results.filter(org => 
      org.region === region || 
      (org.workLocations && org.workLocations.some(loc => loc.includes(region)))
    );
  }
  
  if (workLocation) {
    results = results.filter(org => 
      org.workLocations && org.workLocations.some(loc => 
        loc.toLowerCase().includes(workLocation.toLowerCase())
      )
    );
  }
  
  if (minRevenue) {
    results = results.filter(org => (org.revenue || 0) >= parseInt(minRevenue));
  }
  
  if (maxRevenue) {
    results = results.filter(org => (org.revenue || 0) <= parseInt(maxRevenue));
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedResults = results.slice(startIndex, endIndex);
  
  res.json({
    organizations: paginatedResults,
    total: results.length,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(results.length / limit)
  });
});

// Get filter options
app.get('/api/filters/:orgType', (req, res) => {
  const { orgType } = req.params;
  const database = orgType === 'nonprofit' ? nonprofits : forprofits;
  
  const issueAreas = [...new Set(database.map(org => org.issueArea).filter(Boolean))].sort();
  const regions = [...new Set(database.map(org => org.region).filter(Boolean))].sort();
  const workLocations = [...new Set(database.flatMap(org => org.workLocations || []))].sort();
  
  res.json({
    issueAreas,
    regions,
    workLocations
  });
});

// Get organization details
app.get('/api/organization/:orgType/:orgName', (req, res) => {
  const { orgType, orgName } = req.params;
  const database = orgType === 'nonprofit' ? nonprofits : forprofits;
  
  const org = database.find(org => 
    org.name.toLowerCase().includes(orgName.toLowerCase()) ||
    orgName.toLowerCase().includes(org.name.toLowerCase())
  );
  
  if (!org) {
    return res.status(404).json({ error: 'Organization not found' });
  }
  
  res.json(org);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    nonprofits: nonprofits.length, 
    forprofits: forprofits.length 
  });
});

app.listen(PORT, () => {
  console.log(`NGO Marketplace API server running on port ${PORT}`);
}); 