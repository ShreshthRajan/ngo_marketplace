require('dotenv').config({ path: '../../.env' });
const ProPublicaScraper = require('./nonprofits/propublica');
const IRS990Scraper = require('./nonprofits/irs990');
const BCorpScraper = require('./forprofits/bcorp');
const fs = require('fs-extra');
const path = require('path');

async function main() {
  console.log('Starting data collection...\n');
  
  // Step 1: Get nonprofit data with issue areas from ProPublica
  const propublica = new ProPublicaScraper();
  await propublica.init();
  
  console.log('Fetching nonprofit data from ProPublica API...');
  const nonprofits = await propublica.collectNonprofitData();
  console.log(`✓ Collected ${nonprofits.length} nonprofits\n`);
  
  // Step 2: Use IRS 990 data for mission statements (public data, no login needed)
  const irs = new IRS990Scraper();
  console.log('Enriching with IRS 990 mission data...');
  const enrichedNonprofits = await irs.enrichWithMissions(nonprofits);
  console.log(`✓ Enriched ${enrichedNonprofits.filter(n => n.mission).length} nonprofits\n`);
  
  // Step 3: Scrape B Corps from directory
  const bcorp = new BCorpScraper();
  const forProfits = await bcorp.scrapeDirectory();
  console.log(`✓ Collected ${forProfits.length} B Corps`);
  
  // Save all data
  const outputDir = path.join(__dirname, '../../data/processed');
  await fs.ensureDir(outputDir);
  
  await fs.writeJson(
    path.join(outputDir, 'nonprofits.json'),
    enrichedNonprofits,
    { spaces: 2 }
  );
  
  await fs.writeJson(
    path.join(outputDir, 'forprofits.json'),
    forProfits,
    { spaces: 2 }
  );
  
  console.log('✅ Data collection complete!');
  console.log(`📁 Saved ${enrichedNonprofits.length} nonprofits and ${forProfits.length} B Corps`);
  console.log(`📍 Data includes: values, issue areas, and regions`);
}

main().catch(console.error);