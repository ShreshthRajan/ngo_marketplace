const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

class ProPublicaScraper {
  constructor() {
    this.baseUrl = 'https://projects.propublica.org/nonprofits/api/v2';
    this.outputDir = path.join(__dirname, '../../../data/raw/propublica');
  }

  async init() {
    await fs.ensureDir(this.outputDir);
  }

  async searchByCategory(category, maxPages = 5) {
    const results = [];
    
    for (let page = 0; page < maxPages; page++) {
      try {
        const response = await axios.get(`${this.baseUrl}/search.json`, {
          params: {
            q: category,
            page: page
          }
        });
        
        if (!response.data.organizations || response.data.organizations.length === 0) {
          break;
        }
        
        results.push(...response.data.organizations);
        console.log(`  - Page ${page + 1}: found ${response.data.organizations.length} orgs`);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error searching ${category}:`, error.message);
        break;
      }
    }
    
    return results;
  }

  async getOrgDetails(ein) {
    try {
      const response = await axios.get(`${this.baseUrl}/organizations/${ein}.json`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async collectNonprofitData() {
    // Categories with MASSIVELY expanded legal/rule of law focus for Lawyers Without Borders demo
    const categories = [
      // LEGAL & RULE OF LAW (3x other categories - 24 searches)
      'legal aid', 'lawyers', 'legal services', 'rule of law', 'justice', 'human rights',
      'civil rights', 'legal clinic', 'public interest law', 'pro bono', 'legal advocacy',
      'international law', 'refugee legal', 'immigration legal', 'legal assistance',
      'bar association', 'law foundation', 'legal reform', 'access to justice',
      'legal empowerment', 'constitutional rights', 'judicial reform', 'legal education',
      'legal research',
      
      // Other categories (8 searches total)
      'education', 'health', 'environment', 'arts',
      'youth', 'poverty', 'community', 'veterans'
    ];
    
    let allOrgs = [];
    
    // Search each category
    for (const category of categories) {
      console.log(`Searching category: ${category}`);
      const orgs = await this.searchByCategory(category, 3);
      allOrgs = allOrgs.concat(orgs);
    }
    
    // Remove duplicates by EIN
    const uniqueOrgs = Array.from(
      new Map(allOrgs.map(org => [org.ein, org])).values()
    );
    
    console.log(`Found ${uniqueOrgs.length} unique organizations`);
    
    // Get detailed data for each org
    const detailedOrgs = [];
    for (let i = 0; i < uniqueOrgs.length; i++) {
      const org = uniqueOrgs[i];
      process.stdout.write(`\rFetching details: ${i + 1}/${uniqueOrgs.length}`);
      
      const details = await this.getOrgDetails(org.ein);
      if (details && details.organization) {
        const processed = this.processOrgData(details);
        detailedOrgs.push(processed);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('\n');
    return detailedOrgs;
  }

  processOrgData(data) {
    const org = data.organization;
    
    // Map NTEE codes to issue areas with expanded legal/rule of law focus
    const nteeToIssueArea = {
      'A': 'Arts & Culture',
      'B': 'Education',
      'C': 'Environment',
      'D': 'Animal Welfare',
      'E': 'Health',
      'F': 'Mental Health',
      'G': 'Disease Research',
      'H': 'Medical Research',
      'I': 'Legal & Rule of Law',        // Enhanced: Crime & Legal → Legal & Rule of Law
      'J': 'Employment',
      'K': 'Food & Agriculture',
      'L': 'Housing',
      'M': 'Public Safety',
      'N': 'Recreation',
      'O': 'Youth Development',
      'P': 'Human Services',
      'Q': 'International & Global',     // Enhanced: International
      'R': 'Civil Rights & Justice',     // Enhanced: Civil Rights
      'S': 'Community Development',
      'T': 'Philanthropy',
      'U': 'Science & Tech',
      'V': 'Social Science',
      'W': 'Public Benefit & Governance', // Enhanced: Public Benefit
      'X': 'Religion',
      'Y': 'Mutual Benefit',
      'Z': 'Unknown'
    };
    
    const nteeCode = org.ntee_code || 'Z';
    const issueArea = nteeToIssueArea[nteeCode.charAt(0)] || 'Other';
    
    // Extract service locations from organization name and data for legal orgs
    const serviceLocations = this.extractServiceLocations(org.name, issueArea);
    
    return {
      // Core data your boss wants
      ein: org.ein,
      name: org.name,
      issueArea: issueArea,
      region: org.state || 'Unknown',
      city: org.city,
      
      // Enhanced geographic data - work locations vs HQ
      headquarters: `${org.city || ''}, ${org.state || ''}`.trim(),
      serviceLocations: serviceLocations,
      workLocations: serviceLocations.length > 0 ? serviceLocations : [`${org.city || ''}, ${org.state || ''}`],
      
      // Values placeholder - will be enriched
      mission: null,
      values: null,
      programs: [],
      
      // Financial context
      revenue: data.filings_with_data?.[0]?.totrevenue || 0,
      
      // For legal orgs, indicate if they work internationally
      isGlobal: this.isGlobalLegalOrg(org.name, issueArea)
    };
  }

  extractServiceLocations(orgName, issueArea) {
    const name = orgName.toLowerCase();
    const locations = [];
    
    // Legal organizations often have geographic indicators in their names
    if (issueArea.includes('Legal') || issueArea.includes('Justice') || issueArea.includes('Rights')) {
      // International/Global indicators
      if (name.includes('international') || name.includes('global') || name.includes('worldwide')) {
        locations.push('International Operations');
      }
      
      // Specific global regions mentioned in legal org names
      const globalRegions = {
        'africa': ['East Africa', 'West Africa', 'Southern Africa', 'North Africa'],
        'asia': ['Southeast Asia', 'South Asia', 'East Asia'],
        'latin america': ['Latin America', 'Central America', 'South America'],
        'middle east': ['Middle East', 'North Africa'],
        'europe': ['Eastern Europe', 'Western Europe'],
        'pacific': ['Pacific Islands', 'Oceania'],
        'caribbean': ['Caribbean'],
        'balkans': ['Balkans', 'Eastern Europe']
      };
      
      for (const [region, areas] of Object.entries(globalRegions)) {
        if (name.includes(region)) {
          locations.push(...areas);
        }
      }
      
      // Specific countries commonly served by legal aid orgs
      const countries = [
        'haiti', 'guatemala', 'kenya', 'uganda', 'tanzania', 'rwanda', 'ghana',
        'nepal', 'bangladesh', 'cambodia', 'vietnam', 'philippines', 'indonesia',
        'colombia', 'peru', 'bolivia', 'ecuador', 'nicaragua', 'honduras',
        'morocco', 'jordan', 'lebanon', 'palestine', 'afghanistan', 'iraq',
        'ukraine', 'bosnia', 'kosovo', 'serbia', 'albania', 'macedonia',
        'marshall islands', 'palau', 'micronesia', 'fiji', 'solomon islands'
      ];
      
      countries.forEach(country => {
        if (name.includes(country)) {
          locations.push(this.capitalizeCountry(country));
        }
      });
      
      // US states and territories for domestic legal aid
      const usRegions = [
        'california', 'new york', 'texas', 'florida', 'illinois', 'pennsylvania',
        'ohio', 'michigan', 'georgia', 'north carolina', 'new jersey', 'virginia',
        'washington', 'arizona', 'massachusetts', 'tennessee', 'indiana', 'maryland',
        'missouri', 'wisconsin', 'colorado', 'minnesota', 'south carolina', 'alabama',
        'louisiana', 'kentucky', 'oregon', 'oklahoma', 'connecticut', 'utah',
        'puerto rico', 'guam', 'virgin islands'
      ];
      
      usRegions.forEach(state => {
        if (name.includes(state)) {
          locations.push(this.capitalizeCountry(state));
        }
      });
    }
    
    return [...new Set(locations)]; // Remove duplicates
  }

  isGlobalLegalOrg(orgName, issueArea) {
    const name = orgName.toLowerCase();
    const isLegal = issueArea.includes('Legal') || issueArea.includes('Justice') || issueArea.includes('Rights');
    
    if (!isLegal) return false;
    
    const globalIndicators = [
      'international', 'global', 'worldwide', 'transnational', 'cross-border',
      'africa', 'asia', 'europe', 'latin america', 'middle east', 'caribbean',
      'developing countries', 'emerging economies', 'post-conflict', 'refugee',
      'asylum', 'human rights', 'rule of law', 'democracy', 'governance'
    ];
    
    return globalIndicators.some(indicator => name.includes(indicator));
  }

  capitalizeCountry(country) {
    return country.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

module.exports = ProPublicaScraper;