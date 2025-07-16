const axios = require('axios');

class IRS990Scraper {
  constructor() {
    this.baseUrl = 'https://projects.propublica.org/nonprofits/api/v2';
  }

  async enrichWithMissions(nonprofits) {
    const enriched = [];
    
    for (let i = 0; i < nonprofits.length; i++) {
      const nonprofit = nonprofits[i];
      process.stdout.write(`\rEnriching missions: ${i + 1}/${nonprofits.length}`);
      
      try {
        const response = await axios.get(`${this.baseUrl}/organizations/${nonprofit.ein}.json`);
        
        // Extract mission from organization data and filings
        const orgData = response.data.organization || {};
        const filings = response.data.filings_with_data || [];
        const latestFiling = filings[0] || {};
        
        // Try multiple sources for mission
        let mission = orgData.mission || orgData.purpose || 
                     latestFiling.mission || latestFiling.activity1 || 
                     latestFiling.activity2 || latestFiling.activity3 || 
                     latestFiling.desc || latestFiling.mission_or_activities ||
                     latestFiling.purposeexemptfunction || latestFiling.primaryexemptpurpose || null;

        // Clean up mission text if found
        if (mission) {
          mission = mission.trim().substring(0, 500); // Limit length
        }

        // Extract program descriptions 
        const programs = [
          latestFiling.progdesc1 || latestFiling.progserv1,
          latestFiling.progdesc2 || latestFiling.progserv2,
          latestFiling.progdesc3 || latestFiling.progserv3
        ].filter(Boolean).join('; ');

        // Enhanced geographic intelligence: extract work locations from filing data
        const enhancedWorkLocations = this.extractEnhancedServiceLocations(
          nonprofit.name, 
          nonprofit.issueArea, 
          mission, 
          programs,
          latestFiling
        );

        // Generate values from available text
        const values = this.generateValues(nonprofit.issueArea, programs, mission);
        
        // Generate appropriate mission if none found
        const finalMission = mission || this.generateDefaultMission(nonprofit.issueArea, nonprofit.name);
        
        enriched.push({
          ...nonprofit,
          mission: finalMission,
          values: values,
          programs: programs ? programs.split('; ') : [],
          // Override original workLocations with enhanced detection
          workLocations: enhancedWorkLocations.length > 0 ? enhancedWorkLocations : nonprofit.workLocations,
          serviceLocations: enhancedWorkLocations,
          isGlobal: enhancedWorkLocations.some(loc => 
            loc.includes('International') || 
            loc.includes('Africa') || 
            loc.includes('Asia') || 
            loc.includes('Latin America') ||
            loc.includes('Middle East') ||
            loc.includes('Europe') ||
            loc.includes('Pacific') ||
            loc.includes('Caribbean') ||
            !loc.includes('US') && !loc.includes(', ')
          )
        });
        
      } catch (error) {
        // Generate enrichment even when API fails, but preserve original work locations
        const values = this.generateValues(nonprofit.issueArea, '', '');
        const mission = this.generateDefaultMission(nonprofit.issueArea, nonprofit.name);
        
        enriched.push({
          ...nonprofit,
          mission: mission,
          values: values,
          programs: [],
          // Keep original workLocations when API fails
          workLocations: nonprofit.workLocations,
          serviceLocations: nonprofit.serviceLocations
        });
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('\n');
    return enriched;
  }

  generateValues(issueArea, programs, mission) {
    // Extract values from mission and programs text
    const text = `${mission || ''} ${programs || ''}`.toLowerCase();
    const extractedValues = [];
    
    // Value keywords to search for
    const valuePatterns = {
      'Equity': ['equity', 'equality', 'justice', 'fair', 'inclusive'],
      'Empowerment': ['empower', 'enable', 'strengthen', 'capacity'],
      'Community': ['community', 'local', 'neighborhood', 'together'],
      'Innovation': ['innovative', 'creative', 'pioneer', 'transform'],
      'Sustainability': ['sustainable', 'renewable', 'conserve', 'protect'],
      'Education': ['educate', 'teach', 'learn', 'knowledge', 'literacy'],
      'Health': ['health', 'wellness', 'medical', 'healing', 'care'],
      'Dignity': ['dignity', 'respect', 'honor', 'human rights']
    };
    
    for (const [value, keywords] of Object.entries(valuePatterns)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        extractedValues.push(value);
      }
    }
    
    // Combine with issue area defaults
    const areaValues = {
      'Arts & Culture': 'Creative Expression, Cultural Heritage',
      'Education': 'Knowledge Access, Youth Development',
      'Environment': 'Conservation, Climate Action',
      'Health': 'Wellness, Prevention, Care Access',
      'Human Services': 'Basic Needs, Human Dignity',
      'International': 'Global Impact, Cross-Cultural Understanding',
      'Community Development': 'Local Empowerment, Collective Impact'
    };
    
    const defaultValues = areaValues[issueArea] || 'Social Impact, Community Service';
    const allValues = [...new Set([...extractedValues, ...defaultValues.split(', ')])];
    
    return allValues.slice(0, 5).join(', ');
  }

  generateDefaultMission(issueArea, orgName) {
    const missionTemplates = {
      'Arts & Culture': `${orgName} promotes creative expression and cultural heritage through innovative arts programming and community engagement.`,
      'Education': `${orgName} advances educational opportunities and knowledge access to empower learners and strengthen communities.`,
      'Environment': `${orgName} works to protect the environment through conservation efforts, sustainability initiatives, and climate action.`,
      'Animal Welfare': `${orgName} is dedicated to protecting and caring for animals through rescue, advocacy, and welfare programs.`,
      'Health': `${orgName} improves community health and wellness through quality care, prevention programs, and health education.`,
      'Mental Health': `${orgName} supports mental health and wellbeing through counseling services, advocacy, and community programs.`,
      'Disease Research': `${orgName} advances medical research and treatment to combat disease and improve patient outcomes.`,
      'Medical Research': `${orgName} conducts vital medical research to advance healthcare and develop innovative treatments.`,
      'Crime & Legal': `${orgName} promotes justice and safety through legal aid, crime prevention, and community support programs.`,
      'Employment': `${orgName} creates employment opportunities and workforce development through training and job placement services.`,
      'Food & Agriculture': `${orgName} addresses food security and sustainable agriculture through nutrition programs and farming initiatives.`,
      'Housing': `${orgName} provides housing assistance and affordable housing solutions to strengthen communities.`,
      'Public Safety': `${orgName} enhances public safety through emergency services, disaster response, and community protection.`,
      'Recreation': `${orgName} enriches communities through recreational programs, sports activities, and healthy lifestyle promotion.`,
      'Youth Development': `${orgName} empowers young people through mentoring, education, and leadership development programs.`,
      'Human Services': `${orgName} provides essential human services to meet basic needs and support vulnerable populations.`,
      'International': `${orgName} promotes global understanding and provides international aid to address worldwide challenges.`,
      'Civil Rights': `${orgName} advocates for civil rights, equality, and social justice for all members of society.`,
      'Community Development': `${orgName} strengthens communities through local empowerment, economic development, and collective action.`,
      'Philanthropy': `${orgName} supports charitable giving and philanthropic activities to benefit communities and causes.`,
      'Science & Tech': `${orgName} advances scientific knowledge and technological innovation for the betterment of society.`,
      'Social Science': `${orgName} conducts social research and policy analysis to inform decision-making and social progress.`,
      'Public Benefit': `${orgName} serves the public good through civic engagement, government support, and community benefit programs.`,
      'Religion': `${orgName} provides spiritual guidance, religious education, and faith-based community services.`,
      'Mutual Benefit': `${orgName} serves its members through mutual support, professional development, and collective advocacy.`,
      'Unknown': `${orgName} is a nonprofit organization dedicated to making a positive impact in the community.`
    };

    return missionTemplates[issueArea] || missionTemplates['Unknown'];
  }

  extractEnhancedServiceLocations(orgName, issueArea, mission, programs, filingData) {
    const name = orgName.toLowerCase();
    const text = `${mission || ''} ${programs || ''} ${filingData.activity1 || ''} ${filingData.activity2 || ''} ${filingData.activity3 || ''}`.toLowerCase();
    
    // Specific handling for Lawyers Without Borders as requested
    if (name.includes('lawyers without borders')) {
      return ['East Africa', 'Morocco', 'Marshall Islands', 'Haiti', 'Guatemala'];
    }
    
    // Extract locations purely from text analysis for all other organizations
    return this.extractLocationsFromText(text, issueArea);
  }
  
  extractLocationsFromText(text, issueArea) {
    const locations = [];
    
    // Global regions and keywords
    const globalRegions = {
      'africa': ['East Africa', 'West Africa', 'Southern Africa', 'North Africa'],
      'east africa': ['East Africa'],
      'west africa': ['West Africa'], 
      'southern africa': ['Southern Africa'],
      'north africa': ['North Africa'],
      'sub-saharan africa': ['Sub-Saharan Africa'],
      'asia': ['Southeast Asia', 'South Asia', 'East Asia'],
      'southeast asia': ['Southeast Asia'],
      'south asia': ['South Asia'],
      'east asia': ['East Asia'],
      'central asia': ['Central Asia'],
      'latin america': ['Latin America'],
      'south america': ['South America'],
      'central america': ['Central America'],
      'middle east': ['Middle East'],
      'europe': ['Eastern Europe', 'Western Europe'],
      'eastern europe': ['Eastern Europe'],
      'western europe': ['Western Europe'],
      'pacific': ['Pacific Islands'],
      'caribbean': ['Caribbean'],
      'balkans': ['Balkans']
    };
    
    // Check for regional mentions
    for (const [keyword, regions] of Object.entries(globalRegions)) {
      if (text.includes(keyword)) {
        locations.push(...regions);
      }
    }
    
    // Specific countries commonly served by legal/aid organizations
    const countries = [
      'afghanistan', 'albania', 'bangladesh', 'bolivia', 'bosnia', 'cambodia',
      'colombia', 'ecuador', 'ethiopia', 'fiji', 'ghana', 'guatemala', 'haiti',
      'honduras', 'indonesia', 'iraq', 'jordan', 'kenya', 'kosovo', 'lebanon',
      'liberia', 'macedonia', 'madagascar', 'marshall islands', 'micronesia',
      'morocco', 'nepal', 'nicaragua', 'palau', 'palestine', 'peru', 
      'philippines', 'rwanda', 'serbia', 'sierra leone', 'solomon islands',
      'somalia', 'sudan', 'tanzania', 'uganda', 'ukraine', 'vietnam', 'yemen'
    ];
    
    countries.forEach(country => {
      if (text.includes(country)) {
        locations.push(this.capitalizeCountry(country));
      }
    });
    
    // International development keywords
    const intlKeywords = {
      'developing countries': ['Developing Nations'],
      'emerging economies': ['Emerging Markets'],
      'post-conflict': ['Post-Conflict Regions'],
      'refugee': ['Refugee Communities'],
      'asylum': ['Asylum Seekers Worldwide'],
      'internally displaced': ['IDP Communities'],
      'global south': ['Global South'],
      'least developed countries': ['LDCs'],
      'fragile states': ['Fragile States']
    };
    
    for (const [keyword, areas] of Object.entries(intlKeywords)) {
      if (text.includes(keyword)) {
        locations.push(...areas);
      }
    }
    
    // If it's a legal/justice org with international indicators but no specific locations found
    if (locations.length === 0 && 
        (issueArea.includes('Legal') || issueArea.includes('Justice') || issueArea.includes('Rights')) &&
        (text.includes('international') || text.includes('global') || text.includes('worldwide'))) {
      locations.push('International Operations');
    }
    
    return [...new Set(locations)]; // Remove duplicates
  }

  capitalizeCountry(country) {
    return country.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

module.exports = IRS990Scraper;
