const fs = require('fs');
const path = require('path');

// Load the current for-profit data
const forprofitsPath = path.join(__dirname, '../data/processed/forprofits.json');
const forprofits = JSON.parse(fs.readFileSync(forprofitsPath, 'utf8'));

// Mission statement templates based on industry and values
const generateMission = (org) => {
  const { name, industry, values } = org;
  
  // Extract key themes from values
  const valuesLower = values.toLowerCase();
  
  if (industry === 'Legal Services') {
    if (valuesLower.includes('employment') || valuesLower.includes('worker')) {
      return `${name} provides comprehensive employment law services, advocating for fair workplace practices and helping organizations navigate complex labor regulations while protecting worker rights.`;
    } else if (valuesLower.includes('technology') || valuesLower.includes('startup')) {
      return `${name} specializes in technology and startup legal services, empowering innovative companies to grow while ensuring compliance with evolving regulations in the digital economy.`;
    } else if (valuesLower.includes('pro bono') || valuesLower.includes('access')) {
      return `${name} delivers high-quality legal services while maintaining a strong commitment to pro bono work and expanding access to justice for underserved communities.`;
    } else {
      return `${name} provides strategic legal counsel and advocacy services, helping clients navigate complex legal challenges while upholding the highest standards of professional excellence and integrity.`;
    }
  }
  
  if (industry === 'Legal Technology') {
    return `${name} develops innovative technology solutions that transform the legal industry, making legal information more accessible and helping legal professionals deliver better outcomes for their clients.`;
  }
  
  if (industry === 'Consulting') {
    if (valuesLower.includes('sustainability') || valuesLower.includes('environment')) {
      return `${name} provides strategic consulting services focused on sustainability and environmental impact, helping organizations build resilient, responsible business practices for long-term success.`;
    } else if (valuesLower.includes('social') || valuesLower.includes('impact')) {
      return `${name} offers consulting services that drive positive social impact, helping organizations align their business strategies with meaningful social and environmental objectives.`;
    } else {
      return `${name} delivers strategic consulting services that help organizations optimize their operations, drive innovation, and achieve sustainable growth in competitive markets.`;
    }
  }
  
  if (industry === 'Technology') {
    if (valuesLower.includes('accessibility') || valuesLower.includes('inclusion')) {
      return `${name} creates inclusive technology solutions that break down barriers and expand access to digital opportunities for people of all abilities and backgrounds.`;
    } else if (valuesLower.includes('education') || valuesLower.includes('learning')) {
      return `${name} develops educational technology that empowers learners and educators, making quality education more accessible and effective through innovative digital solutions.`;
    } else {
      return `${name} builds cutting-edge technology solutions that solve real-world problems, empowering individuals and organizations to achieve more through innovation.`;
    }
  }
  
  if (industry === 'Finance' || industry === 'Financial Services') {
    if (valuesLower.includes('microfinance') || valuesLower.includes('inclusion')) {
      return `${name} provides innovative financial services that promote economic inclusion and empower underserved communities to build financial stability and prosperity.`;
    } else if (valuesLower.includes('impact') || valuesLower.includes('sustainable')) {
      return `${name} offers sustainable financial solutions that generate positive social and environmental impact while delivering strong returns for investors and communities.`;
    } else {
      return `${name} delivers comprehensive financial services that help individuals and organizations build wealth, manage risk, and achieve their financial objectives with confidence.`;
    }
  }
  
  if (industry === 'Healthcare') {
    if (valuesLower.includes('global') || valuesLower.includes('access')) {
      return `${name} improves global health outcomes by developing innovative healthcare solutions that expand access to quality medical care in underserved communities worldwide.`;
    } else {
      return `${name} advances healthcare through innovative solutions that improve patient outcomes, enhance care delivery, and make quality healthcare more accessible and affordable.`;
    }
  }
  
  if (industry === 'Environment' || valuesLower.includes('environment') || valuesLower.includes('sustainable')) {
    return `${name} drives environmental sustainability through innovative solutions that help organizations reduce their environmental impact while building resilient, profitable business models.`;
  }
  
  if (industry === 'Education') {
    return `${name} transforms education through innovative approaches that improve learning outcomes and expand access to quality educational opportunities for learners of all ages and backgrounds.`;
  }
  
  if (industry === 'Media' || industry === 'Publishing') {
    return `${name} creates compelling content and media solutions that inform, educate, and inspire audiences while promoting transparency, accountability, and positive social change.`;
  }
  
  if (industry === 'Fashion' || industry === 'Retail') {
    if (valuesLower.includes('sustainable') || valuesLower.includes('ethical')) {
      return `${name} creates sustainable fashion and retail solutions that prioritize ethical production, environmental responsibility, and positive social impact throughout the supply chain.`;
    } else {
      return `${name} delivers innovative retail experiences and products that meet evolving consumer needs while building lasting relationships and driving positive community impact.`;
    }
  }
  
  // Default mission for other industries
  return `${name} is committed to delivering innovative solutions that create positive impact for customers, communities, and society while building a sustainable and responsible business.`;
};

// Add mission statements to all organizations
const updatedForprofits = forprofits.map(org => ({
  ...org,
  mission: generateMission(org)
}));

// Write the updated data back to the file
fs.writeFileSync(forprofitsPath, JSON.stringify(updatedForprofits, null, 2));

console.log(`Successfully added mission statements to ${updatedForprofits.length} for-profit organizations`); 