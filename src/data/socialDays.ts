export interface SocialDay {
  date: string; // MM-DD format
  name: string;
  emoji: string;
  description: string;
  category: "awareness" | "celebration" | "rights" | "environment" | "health" | "education";
  relevantTo?: string; // ANUVATI sector relevance
}

// Comprehensive list of social/awareness days relevant to an NGO
export const socialDays: SocialDay[] = [
  // January
  { date: "01-01", name: "New Year's Day", emoji: "🎉", description: "Wishing everyone a year filled with hope, progress, and collective impact.", category: "celebration" },
  { date: "01-09", name: "Pravasi Bharatiya Divas", emoji: "🇮🇳", description: "Celebrating the contribution of the Indian diaspora to development worldwide.", category: "celebration" },
  { date: "01-12", name: "National Youth Day", emoji: "🧑‍🤝‍🧑", description: "Celebrating the power of youth in shaping our nation — a day close to ANUVATI's mission.", category: "celebration", relevantTo: "Youth Empowerment" },
  { date: "01-15", name: "Army Day", emoji: "🎖️", description: "Saluting the bravery and sacrifice of our armed forces.", category: "celebration" },
  { date: "01-24", name: "National Girl Child Day", emoji: "👧", description: "Advocating for the rights, education, and empowerment of every girl child.", category: "rights", relevantTo: "Gender Inclusion" },
  { date: "01-25", name: "National Voters' Day", emoji: "🗳️", description: "Strengthening democracy by encouraging civic participation among youth.", category: "awareness" },
  { date: "01-26", name: "Republic Day", emoji: "🇮🇳", description: "Celebrating the spirit of our Constitution and the values of justice, liberty, and equality.", category: "celebration" },
  { date: "01-30", name: "Martyrs' Day", emoji: "🕊️", description: "Remembering the sacrifices of those who gave their lives for our freedom.", category: "awareness" },

  // February
  { date: "02-02", name: "World Wetlands Day", emoji: "🌊", description: "Protecting wetlands for people and nature — essential ecosystems for our future.", category: "environment", relevantTo: "Environment" },
  { date: "02-04", name: "World Cancer Day", emoji: "🎗️", description: "Raising awareness about cancer prevention and access to healthcare for all.", category: "health", relevantTo: "Healthcare" },
  { date: "02-06", name: "International Day of Zero Tolerance to FGM", emoji: "✊", description: "Standing against harmful practices — protecting the rights and dignity of women and girls.", category: "rights", relevantTo: "Gender Inclusion" },
  { date: "02-11", name: "International Day of Women and Girls in Science", emoji: "🔬", description: "Promoting equal access to science education for women and girls.", category: "education", relevantTo: "Education" },
  { date: "02-12", name: "Darwin Day", emoji: "🧬", description: "Celebrating science, reason, and the pursuit of knowledge.", category: "education" },
  { date: "02-20", name: "World Day of Social Justice", emoji: "⚖️", description: "Advocating for fairness, equality, and opportunity for all communities.", category: "rights", relevantTo: "Legal Aid" },
  { date: "02-21", name: "International Mother Language Day", emoji: "🗣️", description: "Celebrating linguistic diversity and multilingual education.", category: "education", relevantTo: "Education" },
  { date: "02-28", name: "National Science Day", emoji: "🔬", description: "Inspiring scientific temper and innovation among youth.", category: "education", relevantTo: "Education" },

  // March
  { date: "03-01", name: "Zero Discrimination Day", emoji: "🌈", description: "Promoting inclusion, respect, and dignity for every individual.", category: "rights", relevantTo: "Gender Inclusion" },
  { date: "03-03", name: "World Wildlife Day", emoji: "🐅", description: "Protecting wildlife and biodiversity for a sustainable planet.", category: "environment", relevantTo: "Environment" },
  { date: "03-08", name: "International Women's Day", emoji: "💜", description: "Celebrating women's achievements and accelerating gender equality across communities.", category: "rights", relevantTo: "Gender Inclusion" },
  { date: "03-20", name: "International Day of Happiness", emoji: "😊", description: "Happiness is a fundamental human goal — let's build communities where everyone can thrive.", category: "celebration" },
  { date: "03-21", name: "World Down Syndrome Day", emoji: "💛", description: "Championing inclusion and equal opportunities for persons with Down syndrome.", category: "rights", relevantTo: "Disability Inclusion" },
  { date: "03-22", name: "World Water Day", emoji: "💧", description: "Clean water is a right, not a privilege. Advocating for WASH access in every community.", category: "environment", relevantTo: "WASH" },
  { date: "03-24", name: "World Tuberculosis Day", emoji: "🫁", description: "Ending TB through awareness, prevention, and accessible healthcare.", category: "health", relevantTo: "Healthcare" },

  // April
  { date: "04-02", name: "World Autism Awareness Day", emoji: "💙", description: "Understanding, accepting, and supporting individuals on the autism spectrum.", category: "awareness", relevantTo: "Disability Inclusion" },
  { date: "04-07", name: "World Health Day", emoji: "🏥", description: "Health for all — advocating for universal, equitable healthcare access.", category: "health", relevantTo: "Healthcare" },
  { date: "04-14", name: "Ambedkar Jayanti", emoji: "📘", description: "Honoring Dr. B.R. Ambedkar's vision of social justice and equality.", category: "rights" },
  { date: "04-22", name: "Earth Day", emoji: "🌍", description: "Our planet needs action. Join us in building climate-resilient communities.", category: "environment", relevantTo: "Climate Resilience" },
  { date: "04-24", name: "National Panchayati Raj Day", emoji: "🏛️", description: "Strengthening grassroots governance and community-led development.", category: "awareness", relevantTo: "Rural Development" },

  // May
  { date: "05-01", name: "International Workers' Day", emoji: "✊", description: "Honoring workers' rights and advocating for fair, dignified livelihoods.", category: "rights", relevantTo: "Livelihood" },
  { date: "05-03", name: "World Press Freedom Day", emoji: "📰", description: "Defending free expression and the role of media in democracy.", category: "awareness" },
  { date: "05-08", name: "World Red Cross Day", emoji: "❤️", description: "Celebrating humanitarian action and the spirit of volunteering.", category: "awareness" },
  { date: "05-11", name: "Mother's Day", emoji: "💐", description: "Celebrating the unconditional love, strength, and sacrifice of mothers everywhere.", category: "celebration" },
  { date: "05-15", name: "International Day of Families", emoji: "👨‍👩‍👧‍👦", description: "Strong families build strong communities — advocating for family welfare.", category: "celebration" },
  { date: "05-21", name: "Anti-Terrorism Day", emoji: "🕊️", description: "Standing united against violence and promoting peace and harmony.", category: "awareness", relevantTo: "Peacebuilding" },
  { date: "05-22", name: "International Day for Biological Diversity", emoji: "🌿", description: "Protecting biodiversity for a sustainable and resilient future.", category: "environment", relevantTo: "Environment" },
  { date: "05-31", name: "World No Tobacco Day", emoji: "🚭", description: "Raising awareness about the health impacts of tobacco use.", category: "health", relevantTo: "Anti-Substance Abuse" },

  // June
  { date: "06-01", name: "Global Day of Parents", emoji: "👨‍👩‍👧", description: "Appreciating the vital role parents play in nurturing future generations.", category: "celebration" },
  { date: "06-05", name: "World Environment Day", emoji: "🌱", description: "Time for nature — taking action for environmental protection and sustainability.", category: "environment", relevantTo: "Environment" },
  { date: "06-08", name: "World Oceans Day", emoji: "🌊", description: "Protecting our oceans for a healthier planet.", category: "environment", relevantTo: "Environment" },
  { date: "06-12", name: "World Day Against Child Labour", emoji: "🧒", description: "Every child deserves a childhood. End child labour through education and protection.", category: "rights", relevantTo: "Child Protection" },
  { date: "06-14", name: "World Blood Donor Day", emoji: "🩸", description: "Donate blood, save lives — a simple act of kindness that makes a huge difference.", category: "health", relevantTo: "Healthcare" },
  { date: "06-15", name: "Father's Day", emoji: "👔", description: "Celebrating fathers and their role in building strong, caring families.", category: "celebration" },
  { date: "06-20", name: "World Refugee Day", emoji: "🏠", description: "Standing in solidarity with refugees and displaced communities worldwide.", category: "rights" },
  { date: "06-21", name: "International Day of Yoga", emoji: "🧘", description: "Promoting holistic health and well-being through yoga and mindfulness.", category: "health", relevantTo: "Mental Health" },
  { date: "06-26", name: "International Day Against Drug Abuse", emoji: "🚫", description: "Building drug-free communities through awareness and support.", category: "health", relevantTo: "Anti-Substance Abuse" },

  // July
  { date: "07-01", name: "Doctors' Day", emoji: "🩺", description: "Honoring the tireless service of doctors in keeping our communities healthy.", category: "health", relevantTo: "Healthcare" },
  { date: "07-11", name: "World Population Day", emoji: "🌐", description: "Addressing population challenges through education, health, and empowerment.", category: "awareness" },
  { date: "07-15", name: "World Youth Skills Day", emoji: "🛠️", description: "Equipping youth with skills for employment, entrepreneurship, and impact.", category: "education", relevantTo: "Skill Development" },
  { date: "07-18", name: "Nelson Mandela International Day", emoji: "✊", description: "Inspired by Mandela's legacy — taking action for justice, equality, and peace.", category: "rights", relevantTo: "Peacebuilding" },
  { date: "07-28", name: "World Hepatitis Day", emoji: "💛", description: "Raising awareness for hepatitis prevention and accessible treatment.", category: "health", relevantTo: "Healthcare" },
  { date: "07-30", name: "International Day of Friendship", emoji: "🤝", description: "Friendship bridges divides and builds stronger, more peaceful communities.", category: "celebration" },

  // August
  { date: "08-07", name: "National Handloom Day", emoji: "🧵", description: "Celebrating India's rich handloom heritage and supporting artisan livelihoods.", category: "celebration", relevantTo: "Livelihood" },
  { date: "08-09", name: "International Day of the World's Indigenous Peoples", emoji: "🌍", description: "Respecting and preserving the rights and cultures of indigenous communities.", category: "rights" },
  { date: "08-12", name: "International Youth Day", emoji: "🌟", description: "Youth are not just the future — they are the present. Empowering young changemakers today.", category: "celebration", relevantTo: "Youth Empowerment" },
  { date: "08-15", name: "Independence Day", emoji: "🇮🇳", description: "Celebrating India's freedom and recommitting to nation-building through development.", category: "celebration" },
  { date: "08-19", name: "World Humanitarian Day", emoji: "❤️", description: "Honoring humanitarian workers and the spirit of service to communities in need.", category: "awareness" },
  { date: "08-29", name: "National Sports Day", emoji: "⚽", description: "Promoting sports and physical well-being for youth development.", category: "celebration", relevantTo: "Sports & Youth" },

  // September
  { date: "09-05", name: "Teachers' Day", emoji: "📚", description: "Honoring teachers who shape minds and build the foundation of our nation.", category: "education", relevantTo: "Education" },
  { date: "09-08", name: "International Literacy Day", emoji: "📖", description: "Literacy is liberation — ensuring every person can read, write, and learn.", category: "education", relevantTo: "Education" },
  { date: "09-10", name: "World Suicide Prevention Day", emoji: "💚", description: "Creating hope through action — mental health support saves lives.", category: "health", relevantTo: "Mental Health" },
  { date: "09-15", name: "International Day of Democracy", emoji: "🗳️", description: "Strengthening democratic values and civic participation.", category: "awareness" },
  { date: "09-21", name: "International Day of Peace", emoji: "☮️", description: "Building a culture of peace, tolerance, and mutual respect.", category: "awareness", relevantTo: "Peacebuilding" },
  { date: "09-27", name: "World Tourism Day", emoji: "✈️", description: "Promoting sustainable tourism that benefits communities and preserves culture.", category: "awareness" },

  // October
  { date: "10-01", name: "International Day of Older Persons", emoji: "👴", description: "Respecting and caring for our elders — they built the world we live in.", category: "rights", relevantTo: "Elder Care" },
  { date: "10-02", name: "Gandhi Jayanti", emoji: "🕊️", description: "Following the path of truth, non-violence, and service to humanity.", category: "celebration" },
  { date: "10-05", name: "World Teachers' Day", emoji: "👩‍🏫", description: "Celebrating educators who inspire and transform communities.", category: "education", relevantTo: "Education" },
  { date: "10-10", name: "World Mental Health Day", emoji: "🧠", description: "Mental health is health. Breaking stigma and building support systems.", category: "health", relevantTo: "Mental Health" },
  { date: "10-11", name: "International Day of the Girl Child", emoji: "👧", description: "Empowering girls with education, skills, and equal opportunities.", category: "rights", relevantTo: "Gender Inclusion" },
  { date: "10-15", name: "Global Handwashing Day", emoji: "🧼", description: "Clean hands save lives — promoting hygiene for healthier communities.", category: "health", relevantTo: "WASH" },
  { date: "10-16", name: "World Food Day", emoji: "🍽️", description: "Everyone deserves nutritious food. Fighting hunger and malnutrition.", category: "health", relevantTo: "Nutrition" },
  { date: "10-17", name: "International Day for the Eradication of Poverty", emoji: "💪", description: "Ending poverty requires collective action and inclusive development.", category: "rights", relevantTo: "Livelihood" },
  { date: "10-24", name: "United Nations Day", emoji: "🇺🇳", description: "Working towards the Sustainable Development Goals for a better world.", category: "awareness" },
  { date: "10-31", name: "National Unity Day", emoji: "🤝", description: "Unity in diversity — the strength of our nation.", category: "celebration" },

  // November
  { date: "11-07", name: "National Cancer Awareness Day", emoji: "🎗️", description: "Early detection saves lives — spreading awareness about cancer prevention.", category: "health", relevantTo: "Healthcare" },
  { date: "11-09", name: "Legal Services Day", emoji: "⚖️", description: "Ensuring access to justice and legal aid for marginalized communities.", category: "rights", relevantTo: "Legal Aid" },
  { date: "11-14", name: "Children's Day", emoji: "🧒", description: "Every child deserves love, protection, and the opportunity to dream big.", category: "celebration", relevantTo: "Child Protection" },
  { date: "11-16", name: "International Day for Tolerance", emoji: "🤗", description: "Building bridges of understanding in diverse communities.", category: "awareness", relevantTo: "Peacebuilding" },
  { date: "11-19", name: "World Toilet Day", emoji: "🚽", description: "Sanitation is dignity — advocating for WASH access for all.", category: "health", relevantTo: "WASH" },
  { date: "11-20", name: "Universal Children's Day", emoji: "👶", description: "Protecting children's rights and building a world fit for every child.", category: "rights", relevantTo: "Child Protection" },
  { date: "11-25", name: "International Day for the Elimination of Violence Against Women", emoji: "🟠", description: "No more violence — creating safe, equitable spaces for women and girls.", category: "rights", relevantTo: "Gender Inclusion" },
  { date: "11-26", name: "Constitution Day", emoji: "📜", description: "Upholding the values enshrined in our Constitution — justice, liberty, equality, and fraternity.", category: "celebration" },

  // December
  { date: "12-01", name: "World AIDS Day", emoji: "🎗️", description: "Ending stigma, promoting prevention, and ensuring access to treatment for all.", category: "health", relevantTo: "Healthcare" },
  { date: "12-02", name: "International Day for the Abolition of Slavery", emoji: "⛓️", description: "Freedom is a fundamental right — fighting modern slavery and exploitation.", category: "rights" },
  { date: "12-03", name: "International Day of Persons with Disabilities", emoji: "♿", description: "Inclusion means everyone. Building accessible, barrier-free communities.", category: "rights", relevantTo: "Disability Inclusion" },
  { date: "12-05", name: "International Volunteer Day", emoji: "🙋", description: "Volunteers are the backbone of change. Thank you for making a difference.", category: "celebration" },
  { date: "12-10", name: "Human Rights Day", emoji: "✊", description: "Every person is born free and equal in dignity and rights.", category: "rights" },
  { date: "12-20", name: "International Human Solidarity Day", emoji: "🤝", description: "Solidarity drives progress — standing together for a just and equitable world.", category: "rights" },
  { date: "12-25", name: "Christmas Day", emoji: "🎄", description: "Spreading joy, compassion, and the spirit of giving this festive season.", category: "celebration" },
];

// Helper: Get today's date in MM-DD format
export const getTodayKey = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${month}-${day}`;
};

// Get today's social day(s), if any
export const getTodaySocialDays = (): SocialDay[] => {
  const key = getTodayKey();
  return socialDays.filter((d) => d.date === key);
};

// Get upcoming social days (next N days)
export const getUpcomingSocialDays = (count: number = 10): SocialDay[] => {
  const now = new Date();
  const currentYear = now.getFullYear();

  const withDates = socialDays.map((d) => {
    const [mm, dd] = d.date.split("-").map(Number);
    let date = new Date(currentYear, mm - 1, dd);
    // If the date has already passed this year, use next year
    if (date < now && !(date.getMonth() === now.getMonth() && date.getDate() === now.getDate())) {
      date = new Date(currentYear + 1, mm - 1, dd);
    }
    return { ...d, actualDate: date };
  });

  withDates.sort((a, b) => a.actualDate.getTime() - b.actualDate.getTime());

  // Filter out today's days from upcoming
  const todayKey = getTodayKey();
  return withDates.filter((d) => d.date !== todayKey).slice(0, count);
};

// Get category color
export const getCategoryColor = (category: SocialDay["category"]): string => {
  const map: Record<string, string> = {
    awareness: "hsl(220, 60%, 50%)",
    celebration: "hsl(28, 85%, 55%)",
    rights: "hsl(350, 65%, 42%)",
    environment: "hsl(150, 55%, 40%)",
    health: "hsl(340, 60%, 50%)",
    education: "hsl(280, 45%, 35%)",
  };
  return map[category] || "hsl(220, 50%, 50%)";
};
