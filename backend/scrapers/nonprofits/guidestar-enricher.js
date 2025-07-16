// const puppeteer = require('puppeteer');

// class GuideStarEnricher {
//   constructor() {
//     this.username = process.env.GUIDESTAR_USERNAME;
//     this.password = process.env.GUIDESTAR_PASSWORD;
//     this.baseUrl = 'https://www.guidestar.org';
//   }

//   async init() {
//     this.browser = await puppeteer.launch({ 
//       headless: false, // Set to true after testing
//       args: ['--no-sandbox', '--disable-setuid-sandbox']
//     });
    
//     this.page = await this.browser.newPage();
//     await this.page.setViewport({ width: 1920, height: 1080 });
//   }

//   async login() {
//     try {
//       console.log('Navigating to login page...');
//       await this.page.goto('https://www.guidestar.org/Account/Login');
      
//       // GuideStar login uses these exact IDs
//       await this.page.waitForSelector('#Username');
//       await this.page.type('#Username', this.username);
//       await this.page.type('#Password', this.password);
      
//       // Click login button
//       await Promise.all([
//         this.page.waitForNavigation(),
//         this.page.click('#LoginButton, button[type="submit"]')
//       ]);
      
//       console.log('✓ Logged into GuideStar');
//       return true;
//     } catch (error) {
//       console.error('Login error:', error.message);
//       return false;
//     }
//   }

//   async searchByEIN(ein) {
//     try {
//       // Direct profile URL
//       await this.page.goto(`https://www.guidestar.org/profile/${ein}`);
//       await this.page.waitForTimeout(2000);
      
//       // Extract data focusing on values/mission/region
//       const data = await this.page.evaluate(() => {
//         const getText = (selector) => {
//           const el = document.querySelector(selector);
//           return el ? el.textContent.trim() : null;
//         };
        
//         return {
//           mission: getText('.mission-statement, .profile-mission, [itemprop="description"]'),
//           programs: Array.from(document.querySelectorAll('.program-name, .programs li')).map(el => el.textContent.trim()).slice(0, 3),
//           location: getText('.profile-address, .org-location, [itemprop="address"]')
//         };
//       });
      
//       return data;
//     } catch (error) {
//       return null;
//     }
//   }

//   async enrichWithMissions(nonprofits) {
//     await this.init();
    
//     const loggedIn = await this.login();
//     if (!loggedIn) {
//       await this.close();
//       return nonprofits;
//     }
    
//     const enriched = [];
    
//     // Only do first 20 for MVP demo
//     const subset = nonprofits.slice(0, 20);
    
//     for (let i = 0; i < subset.length; i++) {
//       const nonprofit = subset[i];
//       console.log(`Enriching ${i + 1}/${subset.length}: ${nonprofit.name}`);
      
//       const data = await this.searchByEIN(nonprofit.ein);
      
//       enriched.push({
//         ...nonprofit,
//         mission: data?.mission || nonprofit.mission,
//         programs: data?.programs || nonprofit.programs,
//         location: data?.location || nonprofit.address
//       });
      
//       await this.page.waitForTimeout(3000);
//     }
    
//     // Add the rest without enrichment
//     enriched.push(...nonprofits.slice(20));
    
//     await this.close();
//     return enriched;
//   }

//   async close() {
//     if (this.browser) {
//       await this.browser.close();
//     }
//   }
// }

// module.exports = GuideStarEnricher;