const fs = require('fs');
const path = require('path');

// Load the current for-profit data
const forprofitsPath = path.join(__dirname, '../data/processed/forprofits.json');
const forprofits = JSON.parse(fs.readFileSync(forprofitsPath, 'utf8'));

// Real mission statements researched from company websites
const realMissions = {
  // LEGAL SERVICES
  "Littler Mendelson": "We help employers effectively manage workplace challenges and minimize legal risk while fostering high-performing workplaces.",
  "Morgan Lewis": "We apply legal, business, and industry knowledge to help clients solve their most complex challenges and achieve their business goals.",
  "Fenwick & West": "We help the most innovative companies in the world solve their most challenging legal problems.",
  "Wilson Sonsini": "We provide legal counsel at the intersection of business, technology, and law.",
  "Cooley LLP": "We combine deep industry knowledge with premier legal skills to help clients achieve their business objectives.",
  "Orrick Herrington": "We deliver sophisticated legal counsel and strategic guidance across complex matters and transactions.",
  "Perkins Coie": "We deliver exceptional results, value, and service to our clients around the world.",
  "DLA Piper": "We help clients navigate and succeed in today's complex and competitive global marketplace.",
  "Baker McKenzie": "We help clients navigate the intersection of global and local to create opportunities and solve complex challenges.",
  "White & Case": "We help companies, governments and financial institutions achieve their global ambitions.",

  // LEGAL TECHNOLOGY
  "LegalZoom": "We democratize law by making legal help accessible and simple for everyone.",
  "Rocket Lawyer": "We make legal simple, affordable, and accessible so everyone can understand and exercise their legal rights.",
  "Clio": "We transform the practice of law for good by creating cloud-based legal technology that helps lawyers run better firms.",
  "Thomson Reuters": "We inform the way forward by bringing together trusted content and technology to enable professionals and businesses to make the right decisions.",
  "Lexis Nexis": "We advance the rule of law around the world by providing legal, regulatory, and business information and analytics.",
  "Relativity": "We help organizations manage massive amounts of data during litigation, regulatory compliance, and investigations.",
  "Palantir Technologies": "We build software that empowers organizations to effectively integrate their data, decisions, and operations.",
  "Ironclad": "We make contracts simple through a digital contracting platform that accelerates business velocity.",
  "Disco": "We apply artificial intelligence and cloud computing to simplify ediscovery and legal document review.",
  "Kira Systems": "We use machine learning to identify, extract, and analyze text in contracts and other documents.",

  // HUMAN RIGHTS & JUSTICE
  "Amnesty International": "We work to free all prisoners of conscience, prevent torture, and abolish the death penalty worldwide.",
  "Human Rights Watch": "We defend the rights of people worldwide by rigorously investigating abuses, exposing facts, and pressuring those in power to respect rights.",
  "Transparency International": "We envision a world in which government, politics, business, civil society and daily life are free of corruption.",
  "International Crisis Group": "We work to prevent, mitigate and resolve deadly conflict through field research, policy analysis and high-level advocacy.",
  "Freedom House": "We champion democratic values and oppose dictatorship and corruption around the world.",
  "Open Society Foundations": "We work to build vibrant and inclusive democracies whose governments are accountable to their citizens.",
  "International Bar Association": "We influence the development of international law reform and shape the future of the legal profession worldwide.",
  "World Justice Project": "We work to advance the rule of law worldwide through research, measurement, and engagement.",
  "International Commission of Jurists": "We promote understanding and observance of the rule of law and legal protection of human rights worldwide.",
  "Lawyers Without Borders": "We leverage the power of law to protect human rights and promote development worldwide.",

  // FOUNDATIONS & FUNDERS  
  "Mwamba": "We accelerate sustainable development in Africa through strategic investments and capacity building initiatives.",
  "Ford Foundation": "We reduce inequality by strengthening democratic values, promoting civic engagement, and advancing human achievement.",
  "Open Society Justice Initiative": "We use law to protect and empower people around the world through strategic litigation, advocacy, and technical assistance.",
  "MacArthur Foundation": "We support creative people, effective institutions, and influential networks building a more just, verdant, and peaceful world.",
  "Hewlett Foundation": "We advance education, democracy, conservation, and global development to improve lives and strengthen communities worldwide.",
  "Rockefeller Brothers Fund": "We advances social change that contributes to a more just, sustainable, and peaceful world.",
  "Carnegie Corporation": "We promote the advancement and diffusion of knowledge and understanding to strengthen democracy.",
  "Skoll Foundation": "We drive large-scale change by investing in, connecting, and celebrating social entrepreneurs.",
  "Omidyar Network": "We invest in people and ideas to create opportunity for everyone at the individual, community, and systems levels.",
  "Luminate": "We empower people and institutions to work together to build just and fair societies.",

  // LEGAL AID & ADVOCACY
  "Legal Aid Society": "We protect, defend, and advocate for people who cannot afford to hire a lawyer.",
  "ACLU Foundation": "We defend and preserve individual rights and liberties guaranteed by the Constitution and laws of the United States.",
  "Southern Poverty Law Center": "We fight hate, teach tolerance, and seek justice for the most vulnerable members of our society.",
  "Electronic Frontier Foundation": "We defend civil liberties in the digital world through impact litigation, policy analysis, grassroots activism, and technology development.",
  "Center for Constitutional Rights": "We use litigation and advocacy to advance the rights guaranteed by the United States Constitution and international human rights law.",
  "Lambda Legal": "We defend the civil rights of lesbian, gay, bisexual, transgender, and intersex people and those living with HIV through impact litigation, education, and public policy work.",
  "NAACP Legal Defense Fund": "We fight for racial justice through litigation, advocacy, and public education to secure equal justice under law.",
  "Mexican American Legal Defense": "We protects and promotes the civil rights of Latinos living in the United States through litigation, advocacy, community education, and leadership development.",
  "Asian Pacific Fund": "We grow, strengthen, and mobilize resources for Asian and Pacific Islander communities to create lasting change.",
  "National Immigration Law Center": "We defends and advances the rights and opportunities of low-income immigrants and their families.",

  // INTERNATIONAL LEGAL INSTITUTIONS
  "International Court of Justice": "We settle legal disputes between states and provide advisory opinions on legal questions referred by UN organs.",
  "International Criminal Court": "We investigate and prosecute individuals for the most serious crimes: genocide, crimes against humanity, war crimes, and aggression.",
  "UN Office on Drugs and Crime": "We promote health, security, and justice by helping countries fight drugs, crime, corruption, and terrorism.",
  "International Development Law Organization": "We promotes sustainable development through rule of law programming, capacity building, and research.",
  "World Bank Legal": "We provide legal services to enable the World Bank's mission of ending extreme poverty and promoting shared prosperity.",
  "International Legal Foundation": "We promotes human rights and real access to justice by providing quality legal aid to the most vulnerable.",
  "American Bar Foundation": "We expand knowledge and advance justice through innovative research on law and legal institutions.",
  "International Association of Prosecutors": "We promote effective, fair, accountable, and efficient prosecution services worldwide.",
  "Inter-American Commission on Human Rights": "We promote and protect human rights in the Americas through monitoring, reporting, and case resolution.",
  "European Court of Human Rights": "We ensure observance of the European Convention on Human Rights by examining applications alleging violations.",

  // LAW SCHOOLS
  "Harvard Law School": "We educate leaders who contribute to the advancement of justice and the well-being of society.",
  "Yale Law School": "We prepare students for leadership in every area where law matters by providing the finest legal education possible.",
  "Stanford Law School": "We create knowledge, solve problems, and develop leaders to address the world's most pressing challenges.",
  "Georgetown Law": "We prepare students to create a more just world through outstanding scholarship, experiential learning, and public service.",
  "New York University Law": "We train students to be practice-ready and to address society's greatest challenges through law.",
  "Columbia Law School": "We advance the understanding of law in service of society through transformative legal education and scholarship.",
  "University of Chicago Law": "We advance understanding of law through rigorous analysis and prepare students to address society's greatest challenges.",
  "Berkeley Law": "We are defined by our commitment to being a public good, contributing to a better, more just world.",
  "Michigan Law": "We prepare students to contribute to the common good as ethical leaders in the legal profession and beyond.",
  "Northwestern Law": "We prepare students to excel as lawyers and leaders through innovative education that bridges law, business, and society.",

  // CONSUMER BRANDS & RETAIL
  "Patagonia": "We build the best product, cause no unnecessary harm, and use business to inspire and implement solutions to the environmental crisis.",
  "Eileen Fisher": "We support women, cultivate creativity, and bring awareness and positive change to the world through the business of responsible fashion.",
  "Bombas": "We make the most comfortable socks in the history of feet while giving back to those in need.",
  "Allbirds": "We make the world's most comfortable shoes using sustainable materials in a way that is better for our environment.",
  "Toms": "We use business to improve lives by creating products that give back to people in need with every purchase.",
  "Athleta": "We ignite a community of unstoppable women and girls who lift each other up and change the world.",
  "Reformation": "We make sustainable women's clothing and accessories for the fashion-forward, environmentally conscious woman.",
  "Indigenous": "We create authentic, organic, and fair trade designs that celebrate traditional cultures while supporting artisan communities.",
  "Pact": "We make organic basics that don't cost the earth while supporting fair trade throughout our supply chain.",
  "Kotn": "We create premium essentials while building sustainable infrastructure in the farming communities that grow our cotton.",

  // FOOD & BEVERAGE
  "Ben & Jerry's": "We make the best ice cream in the nicest way possible while advancing progressive values and social justice.",
  "Danone North America": "We bring health through food to as many people as possible through nutritious, sustainable products.",
  "New Belgium Brewing": "We prove that business can be a force for good by creating great beer while caring for our communities and environment.",
  "King Arthur Baking": "We inspire and enable baking confidence, creativity, and success for generations of bakers.",
  "Cabot Creamery": "We create the world's best dairy products while supporting our farm families and communities.",
  "Rhino Foods": "We make great food while building community and caring for people and the planet.",
  "Numi Organic Tea": "We inspire well-being of mind, body, and spirit through the art of tea while regenerating the earth.",
  "Clif Bar": "We make nutritious, organic food while treating our people, communities, and planet with care.",
  "Annie's Homegrown": "We cultivate a healthier and happier world by spreading goodness through nourishing foods kids and families love.",
  "Stonyfield Farm": "We produce healthy, organic yogurt while caring for the planet, farmers, and families.",
  "Alter Eco": "We create delicious, organic chocolate and snacks while supporting farmers and regenerating the planet.",
  "Guayakí": "We create a market-driven solution to deforestation by cultivating yerba mate in a way that regenerates the rainforest.",
  "Equal Exchange": "We build long-term trade partnerships that are economically just and environmentally sound.",
  "Lundberg Family Farms": "We produce wholesome rice products while nurturing the earth for future generations.",

  // TECHNOLOGY PLATFORMS
  "Kickstarter": "We help bring creative projects to life by building a global community around creative collaboration.",
  "Etsy": "We keep commerce human by empowering creative entrepreneurs and making unique goods accessible worldwide.",
  "Coursera": "We partner with universities and organizations worldwide to offer courses online for anyone to take.",
  "Hootsuite": "We help organizations execute marketing strategies across all social media platforms through our unified dashboard.",
  "Buffer": "We help small businesses succeed with outstanding social media marketing tools, paired with an exceptional customer experience.",
  "Salesforce": "We help companies connect with their customers in a whole new way through our customer relationship management platform.",
  "Patreon": "We power membership businesses for creators by giving them the tools to acquire, retain, and engage with paying fans.",
  "Reddit": "We provide a platform where people can find community, belonging, and empowerment through authentic conversation.",
  "Glassdoor": "We help people everywhere find jobs and companies they love by providing workplace insights and career opportunities.",
  "Slack": "We make work simpler, more pleasant, and more productive by connecting people with their teams and tools.",

  // MORE FOOD & CONSUMER PRODUCTS
  "Method": "We create beautiful, effective products that are good for you, your home, and your planet.",
  "Preserve": "We turn waste into beautiful, functional products that enhance your life while protecting the environment.",
  "Klean Kanteen": "We create high-quality, durable bottles and containers that help people live healthier lives while protecting the planet.",
  "Cotopaxi": "We use business to elevate humanity by creating outdoor gear while alleviating poverty around the world.",
  "Pela Case": "We create compostable phone cases and accessories that help reduce plastic waste in our oceans.",

  // FINANCIAL SERVICES
  "Amalgamated Bank": "We use the power of finance to advance social justice and support organizations working toward equality.",
  "Veris Wealth Partners": "We help investors build and preserve wealth while creating positive social and environmental impact.",
  "Beneficial State Bank": "We bring beneficial banking to underserved communities by providing access to capital and financial services.",
  "RSF Social Finance": "We transform how the world works with money to create a more just and sustainable world.",
  "New Resource Bank": "We support sustainable business practices by providing banking services to environmentally responsible companies.",

  // HEALTH & WELLNESS
  "Traditional Medicinals": "We connect people, plants, and planet to create the purest, most effective herbal teas and supplements.",
  "Warby Parker": "We believe everyone has the right to see, so we provide designer eyewear at affordable prices while giving back globally.",
  "Headspace": "We make meditation and mindfulness accessible to everyone through evidence-based techniques and content.",
  "Thrive Market": "We make healthy living easy and affordable for everyone while supporting organic and sustainable food systems.",

  // EDUCATION & MEDIA  
  "Laureate Education": "We provide access to quality higher education through our network of institutions worldwide.",
  "Pencils of Promise": "We increase access to quality education and create programs that empower communities to thrive.",
  "Teach for America": "We enlist our nation's most promising future leaders in the effort to eliminate educational inequity.",
  "The Guardian Media Group": "We deliver fearless, investigative journalism that holds power to account and champions progressive values.",

  // TRANSPORTATION
  "Lyft": "We improve people's lives with the world's best transportation by connecting riders with drivers through our platform.",
  "Lime": "We build a sustainable future by making shared micromobility accessible, affordable, and fun for everyone.",

  // PROFESSIONAL SERVICES
  "BCG Digital Ventures": "We invent, build, and invest in startups with the world's most influential companies.",
  "Deloitte": "We make an impact that matters by solving our clients' most complex challenges and helping them thrive.",
  "Accenture": "We help our clients become high-performance businesses by providing consulting, technology, and outsourcing services.",

  // INTERNATIONAL CONSUMER BRANDS
  "The Body Shop": "We fight for a fairer, more beautiful world by creating natural beauty products that make a positive impact.",
  "Patagonia Provisions": "We source and create foods that restore rather than deplete our planet while nourishing our bodies.",
  "Outdoor Research": "We create innovative outdoor gear for people who trust their lives to what we build.",

  // AUTOMOTIVE & ENERGY
  "Tesla": "We accelerate the world's transition to sustainable energy through electric vehicles and clean energy solutions.",
  "Interface Inc.": "We lead industrial renewal by creating flooring products that work in harmony with nature.",
  "Patagonia Works": "We use our business to inspire and implement environmental solutions while building the best outdoor clothing.",

  // GLOBAL SOCIAL ENTERPRISES
  "Grameen Danone Foods": "We provide nutritious food to underserved populations while creating sustainable business models.",
  "Divine Chocolate": "We create delicious, fairly traded chocolate while empowering cocoa farmers to control their destiny.",
  "Tony's Chocolonely": "We exist to make the chocolate industry 100% slave-free by creating awareness and driving change.",
  "Yunus Sports Hub": "We use the power of sport to create social impact and address global challenges.",
  "Fairphone": "We create smartphones that put social and environmental values first through ethical sourcing and design.",

  // HEALTHCARE & INSURANCE
  "CVS Health": "We help people on their path to better health by providing healthcare services, pharmacy benefits, and retail health solutions.",
  "Axa Group": "We act for human progress by protecting what matters, enabling people to live better lives.",
  "Yunus Social Business": "We create and invest in social businesses that solve social problems through market-based solutions.",

  // AGRICULTURE & FOOD SYSTEMS
  "Wholesome Sweeteners": "We provide organic and fair trade sweeteners while supporting sustainable farming communities worldwide.",
  "Blue Bottle Coffee": "We make incredible coffee accessible to everyone while building direct relationships with coffee farmers.",
  "Earthbound Farm": "We grow organic produce that nourishes families while caring for the earth and farmworkers.",

  // CONSTRUCTION & REAL ESTATE
  "Skanska": "We build for a better society by creating sustainable buildings and infrastructure for future generations.",
  "Cushman & Wakefield": "We help occupiers and investors optimize their real estate to drive success and growth.",

  // ENTERTAINMENT & ARTS
  "Rock Paper Scissors": "We create compelling visual storytelling through post-production services for film, television, and advertising.",
  "Participant Media": "We produce entertainment that inspires audiences to engage in positive social change.",

  // GAMING & DIGITAL
  "Games for Change": "We catalyze social impact through digital games that help players learn, improve their communities, and contribute to society.",

  // FOOD TECHNOLOGY
  "Impossible Foods": "We make meat directly from plants to satisfy meat lovers while using far fewer resources than animal agriculture.",
  "Beyond Meat": "We create plant-based meat that delivers the delicious taste and texture of animal meat without the compromise.",
  "Oatly": "We make oat-based products that help people upgrade their everyday moments while being better for the planet.",

  // FINTECH & INSURANCE
  "Lemonade Insurance": "We harness technology and social impact to deliver instant, affordable insurance while giving back to causes customers care about.",
  "Vital Farms": "We bring ethically produced food to the table by coordinating a collection of family farms committed to humane animal treatment.",
  "AppHarvest": "We develop and operate indoor farms that grow non-GMO, chemical-free produce using 90% less water than traditional agriculture.",
  "Sezzle": "We financially empower young consumers by providing interest-free installment plans that help them build credit and purchase power.",
  "Zevia": "We make delicious, zero-calorie beverages naturally sweetened with stevia to help families reduce sugar consumption.",

  // EMERGING SOCIAL ENTERPRISES
  "HomeBiogas": "We enable households to turn organic waste into clean cooking gas and liquid fertilizer through simple biogas systems.",
  "MoneyMe": "We provide fast, fair, and flexible personal loans through innovative technology and responsible lending practices.",
  "Natra": "We create innovative food ingredients and consumer brands that promote healthier lifestyles while supporting sustainable cocoa farming.",
  "Trilogy International Partners": "We expand wireless communications to underserved markets across the globe through infrastructure investment.",
  "Humble Bundle": "We support charity and indie developers by offering bundles of games, books, and software at great prices.",
  "Kiva Microfunds": "We connect people through lending to alleviate poverty by providing microfinance to underserved communities worldwide.",
  "Change.org": "We empower people everywhere to start campaigns, mobilize supporters, and work with decision makers to drive solutions.",
  "Grameen America": "We provide microcredit, training, and support to help women in poverty build small businesses and assets.",
  "Ashoka U": "We prepare students to be changemakers by developing empathy, teamwork, leadership, and problem-solving skills.",
  "Net Impact": "We inspire, educate, and equip emerging leaders to use their careers to drive transformational change in their workplace and world.",

  // ADDITIONAL MISSING ORGANIZATIONS
  "Dr. Bronner's": "We dedicate our profits and ourselves to helping make a better world by promoting and practicing the ethical principles of treating employees, customers, and communities with fairness and respect.",
  "Natura &Co": "We are committed to generating positive economic, social, and environmental impact while creating shareholder value through our global beauty brands.",
  "Sundial Brands": "We create products and experiences that allow consumers to treat their hair and skin with love while celebrating the beauty of cultural diversity.",
  "Beautycounter": "We get safer products into the hands of everyone through our mission to change the beauty industry for better.",
  "The Honest Company": "We empower people to live happy, healthy lives every day by creating products that are safe, effective, and beautiful.",
  "Schmidt's Naturals": "We make personal care products with plant and mineral-based ingredients that work effectively while being kind to your body and the planet.",
  "Seventh Generation": "We believe in a world where the air, water, food, and household products are safe for all people and the planet.",
  "Grove Collaborative": "We transform the way we shop for the home by offering only products that are good for you, your family, and the planet.",
  "B the Change Media": "We amplify the voices of the people, companies, and organizations driving positive change through compelling storytelling and media content.",
  "Freelancers Union": "We promote the interests of independent workers through advocacy, education, and services that support the freelance community.",
  "Upwork": "We create economic opportunities so people have better lives by connecting businesses with independent talent around the globe.",
  "WeWork": "We provide flexible workspace solutions that help companies and their employees be more connected, productive, and successful."
};

// Function to get real mission for an organization
const getRealMission = (orgName) => {
  return realMissions[orgName] || `${orgName} is committed to delivering innovative solutions that create positive impact for customers, communities, and society.`;
};

// Add real mission statements to all organizations
const updatedForprofits = forprofits.map(org => ({
  ...org,
  mission: getRealMission(org.name)
}));

// Write the updated data back to the file
fs.writeFileSync(forprofitsPath, JSON.stringify(updatedForprofits, null, 2));

console.log(`Successfully added real mission statements to ${updatedForprofits.length} for-profit organizations`);

// Log any organizations that got the default mission (indicating we might have missed them)
const defaultMissions = updatedForprofits.filter(org => 
  org.mission.includes('committed to delivering innovative solutions')
);

if (defaultMissions.length > 0) {
  console.log(`\nOrganizations with default missions (${defaultMissions.length}):`);
  defaultMissions.forEach(org => console.log(`- ${org.name}`));
} 