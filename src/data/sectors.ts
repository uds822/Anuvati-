import {
  BookOpen, Monitor, Briefcase, Users, Heart, Leaf, Shield, Droplets, Brain,
  Palette, Dumbbell, Building, TreePine, Scale, UserCheck, Flame, Waves, Handshake,
  type LucideIcon
} from "lucide-react";

// Sector images
import educationImg from "@/assets/sectors/education.jpg";
import healthcareImg from "@/assets/sectors/healthcare.jpg";
import nutritionImg from "@/assets/sectors/nutrition.jpg";
import mentalHealthImg from "@/assets/sectors/mental-health.jpg";
import childProtectionImg from "@/assets/sectors/child-protection.jpg";
import elderCareImg from "@/assets/sectors/elder-care.jpg";
import disabilityImg from "@/assets/sectors/disability-inclusion.jpg";
import livelihoodImg from "@/assets/sectors/livelihood.jpg";
import skillDevImg from "@/assets/sectors/skill-development.jpg";
import digitalImg from "@/assets/sectors/digital-transformation.jpg";
import legalAidImg from "@/assets/sectors/legal-aid.jpg";
import environmentImg from "@/assets/sectors/environment.jpg";
import climateImg from "@/assets/sectors/climate-resilience.jpg";
import disasterImg from "@/assets/sectors/disaster-risk.jpg";
import washImg from "@/assets/sectors/wash.jpg";
import ruralImg from "@/assets/sectors/rural-development.jpg";
import urbanImg from "@/assets/sectors/urban-development.jpg";
import artCultureImg from "@/assets/sectors/art-culture.jpg";
import sportsImg from "@/assets/sectors/sports-youth.jpg";
import peaceImg from "@/assets/sectors/peacebuilding.jpg";
import genderImg from "@/assets/sectors/gender-inclusion.jpg";
import antiSubstanceImg from "@/assets/sectors/anti-substance.jpg";

export interface Program {
  name: string;
  location: string;
  duration: string;
  objectives: string;
  partners: string;
  outputs: string;
  status: "Active" | "Upcoming" | "Completed";
}

export interface Sector {
  slug: string;
  theme: "People" | "Prosperity" | "Planet" | "Community";
  icon: LucideIcon;
  title: string;
  image: string;
  problem: string;
  activities: string;
  beneficiaries: string;
  outcomes: string;
  description: string;
  programs: Program[];
}

export const themeColors: Record<string, string> = {
  People: "bg-primary/8 text-primary",
  Prosperity: "bg-secondary/10 text-secondary",
  Planet: "bg-green-50 text-green-600",
  Community: "bg-blue-50 text-blue-600",
};

export const themes = ["All", "People", "Prosperity", "Planet", "Community"];

export const sectors: Sector[] = [
  {
    slug: "education", theme: "People", icon: BookOpen, title: "Education", image: educationImg,
    problem: "Millions lack access to quality foundational education.",
    activities: "Literacy programs, teacher training, learning centers",
    beneficiaries: "Children, adolescents, rural communities",
    outcomes: "Improved literacy rates and school retention",
    description: "ANUVATI's education programs focus on bridging learning gaps through community-based centers, teacher empowerment, and innovative pedagogy — ensuring every child has access to quality foundational education.",
    programs: [
      { name: "Youth Leadership Academy", location: "Lucknow, UP", duration: "6 months", objectives: "Build youth leadership capacity through structured training, mentorship, and hands-on project execution.", partners: "Local schools, CSR partners", outputs: "100+ youth trained, 20 community projects launched", status: "Active" },
      { name: "Foundational Literacy Mission", location: "Barabanki, UP", duration: "12 months", objectives: "Improve reading and numeracy skills for children aged 6-14 in rural government schools.", partners: "District Education Office", outputs: "500+ children enrolled, 15 learning centers", status: "Active" },
      { name: "Teacher Training Initiative", location: "Multiple districts, UP", duration: "Ongoing", objectives: "Capacity building for primary school teachers using activity-based and child-centered pedagogy.", partners: "State Education Department", outputs: "200+ teachers trained", status: "Active" },
    ],
  },
  {
    slug: "healthcare", theme: "People", icon: Heart, title: "Healthcare", image: healthcareImg,
    problem: "Underserved communities lack basic health awareness.",
    activities: "Health camps, awareness campaigns, referral systems",
    beneficiaries: "Women, children, elderly",
    outcomes: "Improved health outcomes and awareness",
    description: "Our healthcare initiatives bring essential health services and awareness to the most underserved communities, focusing on preventive care, maternal health, and community health education.",
    programs: [
      { name: "Community Health & Nutrition", location: "Block level, UP", duration: "Ongoing", objectives: "Improve health awareness and nutrition practices through health camps and education.", partners: "Health department, NGO partners", outputs: "Health camps reaching 2000+ beneficiaries", status: "Active" },
      { name: "Maternal & Child Health Program", location: "Lucknow, UP", duration: "12 months", objectives: "Improve maternal and child health outcomes through ASHA worker training and community mobilization.", partners: "District Health Mission", outputs: "1000+ women reached", status: "Active" },
    ],
  },
  {
    slug: "nutrition-food-security", theme: "People", icon: Heart, title: "Nutrition & Food Security", image: nutritionImg,
    problem: "Malnutrition persists in vulnerable populations.",
    activities: "Nutrition education, food distribution, kitchen gardens",
    beneficiaries: "Children, pregnant women, elderly",
    outcomes: "Reduced malnutrition rates",
    description: "Addressing the root causes of malnutrition through community kitchen gardens, nutrition education for mothers, and supplementary feeding programs for vulnerable populations.",
    programs: [
      { name: "Kitchen Garden Initiative", location: "Rural UP", duration: "Ongoing", objectives: "Promote household nutrition security through kitchen gardens and nutrition education.", partners: "Agriculture department, SHGs", outputs: "300+ kitchen gardens established", status: "Active" },
    ],
  },
  {
    slug: "mental-health", theme: "People", icon: Brain, title: "Mental Health & PSS", image: mentalHealthImg,
    problem: "Mental health stigma prevents access to care.",
    activities: "Counseling, awareness workshops, peer support networks",
    beneficiaries: "Youth, women, disaster-affected communities",
    outcomes: "Increased mental health literacy",
    description: "Breaking the stigma around mental health through community-based psychosocial support, youth counseling programs, and mental health first aid training.",
    programs: [
      { name: "Youth Mental Wellness Program", location: "Lucknow, UP", duration: "6 months", objectives: "Provide safe spaces and counseling support for youth dealing with stress, anxiety, and peer pressure.", partners: "Psychology departments, counselors", outputs: "500+ youth reached", status: "Active" },
    ],
  },
  {
    slug: "child-protection", theme: "People", icon: Shield, title: "Child Protection", image: childProtectionImg,
    problem: "Children face exploitation and abuse.",
    activities: "Child protection committees, training, reporting mechanisms",
    beneficiaries: "Children and families",
    outcomes: "Safer environments for children",
    description: "Establishing robust child protection mechanisms at the community level, training frontline workers, and creating safe reporting channels for children at risk.",
    programs: [
      { name: "Safe Childhood Initiative", location: "Multiple blocks, UP", duration: "Ongoing", objectives: "Establish village-level child protection committees and reporting mechanisms.", partners: "DCPU, Childline", outputs: "20+ protection committees formed", status: "Active" },
    ],
  },
  {
    slug: "elder-care", theme: "People", icon: UserCheck, title: "Old Age & Elder Care", image: elderCareImg,
    problem: "Elderly populations face isolation and neglect.",
    activities: "Elder care programs, social engagement, health support",
    beneficiaries: "Senior citizens",
    outcomes: "Improved quality of life for elderly",
    description: "Supporting dignified aging through community elder care programs, health check-ups, social engagement activities, and intergenerational bonding initiatives.",
    programs: [
      { name: "Dignified Aging Program", location: "Lucknow, UP", duration: "Ongoing", objectives: "Provide social support, health care access, and community engagement for senior citizens.", partners: "Old age homes, health centers", outputs: "200+ elderly supported", status: "Upcoming" },
    ],
  },
  {
    slug: "disability-inclusion", theme: "People", icon: Users, title: "Disability Inclusion", image: disabilityImg,
    problem: "Persons with disabilities face systemic barriers.",
    activities: "Accessibility programs, inclusive education, advocacy",
    beneficiaries: "Persons with disabilities",
    outcomes: "Greater inclusion and accessibility",
    description: "Championing disability rights and inclusion through accessible education, livelihood support, and advocacy for barrier-free public spaces and policies.",
    programs: [
      { name: "Inclusive Education Project", location: "Lucknow, UP", duration: "12 months", objectives: "Make schools accessible and inclusive for children with disabilities.", partners: "Special education centers", outputs: "50+ children enrolled in inclusive classrooms", status: "Active" },
    ],
  },
  {
    slug: "livelihood-entrepreneurship", theme: "Prosperity", icon: Briefcase, title: "Livelihood & Entrepreneurship", image: livelihoodImg,
    problem: "Youth and women lack economic opportunities.",
    activities: "Skill training, micro-enterprise support, market linkages",
    beneficiaries: "Youth, women, rural communities",
    outcomes: "Increased income and employment",
    description: "Empowering communities through market-relevant skill training, micro-enterprise development, and connecting artisans and producers to sustainable market opportunities.",
    programs: [
      { name: "Women's Enterprise Development", location: "Multiple districts, UP", duration: "12 months", objectives: "Support women-led micro-enterprises through training, mentoring, and market access.", partners: "Microfinance institutions, SHGs", outputs: "100+ enterprises supported", status: "Active" },
    ],
  },
  {
    slug: "skill-development", theme: "Prosperity", icon: Briefcase, title: "Skill Development", image: skillDevImg,
    problem: "Workforce lacks market-relevant skills.",
    activities: "Vocational training, certification, apprenticeships",
    beneficiaries: "Youth and job seekers",
    outcomes: "Employability and job placement",
    description: "Bridging the skills gap through industry-aligned vocational training, certification programs, and apprenticeship placements for unemployed youth.",
    programs: [
      { name: "Skill India Partner Program", location: "Lucknow, UP", duration: "Ongoing", objectives: "Provide NSQF-aligned vocational training in hospitality, IT, and retail sectors.", partners: "Sector Skill Councils", outputs: "300+ youth trained and certified", status: "Active" },
    ],
  },
  {
    slug: "digital-transformation", theme: "Prosperity", icon: Monitor, title: "Digital Transformation", image: digitalImg,
    problem: "Digital divide excludes vulnerable communities.",
    activities: "Digital literacy, tech access, online platforms",
    beneficiaries: "Rural youth, women, educators",
    outcomes: "Digital inclusion and literacy",
    description: "Closing the digital divide through community digital literacy centers, device access programs, and training educators to leverage technology for learning.",
    programs: [
      { name: "Digital Literacy for Rural Women", location: "Multiple districts, UP", duration: "12 months", objectives: "Equip rural women with digital skills for livelihoods and financial independence.", partners: "Government, tech companies", outputs: "500+ women digitally empowered", status: "Active" },
    ],
  },
  {
    slug: "legal-aid", theme: "Prosperity", icon: Scale, title: "Legal Aid & Justice", image: legalAidImg,
    problem: "Marginalized groups lack legal awareness.",
    activities: "Legal aid clinics, awareness camps, paralegal training",
    beneficiaries: "Women, minorities, rural poor",
    outcomes: "Improved access to justice",
    description: "Ensuring access to justice for marginalized communities through free legal aid clinics, rights awareness campaigns, and training community paralegals.",
    programs: [
      { name: "Community Legal Aid Clinics", location: "Lucknow, UP", duration: "Ongoing", objectives: "Provide free legal aid and awareness to underserved communities.", partners: "Bar associations, law universities", outputs: "500+ individuals assisted", status: "Active" },
    ],
  },
  {
    slug: "environment-clean-energy", theme: "Planet", icon: Leaf, title: "Environment & Clean Energy", image: environmentImg,
    problem: "Environmental degradation threatens communities.",
    activities: "Tree planting, renewable energy, waste management",
    beneficiaries: "Communities and ecosystems",
    outcomes: "Cleaner environments",
    description: "Promoting environmental stewardship through community-led tree planting drives, clean energy adoption, and responsible waste management practices.",
    programs: [
      { name: "Green Campus Initiative", location: "Lucknow, UP", duration: "6 months", objectives: "Transform school campuses into green spaces through tree planting and waste segregation.", partners: "Schools, environmental groups", outputs: "20+ campuses greened", status: "Active" },
    ],
  },
  {
    slug: "climate-resilience", theme: "Planet", icon: TreePine, title: "Climate Resilience", image: climateImg,
    problem: "Communities vulnerable to climate change.",
    activities: "Adaptation planning, resilient agriculture, early warning",
    beneficiaries: "Farmers, coastal communities",
    outcomes: "Increased climate resilience",
    description: "Building community resilience to climate change impacts through adaptation planning, climate-smart agriculture, and early warning system development.",
    programs: [
      { name: "Climate-Smart Agriculture Pilot", location: "Eastern UP", duration: "12 months", objectives: "Help smallholder farmers adopt climate-resilient farming practices.", partners: "Agriculture universities", outputs: "200+ farmers trained", status: "Upcoming" },
    ],
  },
  {
    slug: "disaster-risk-reduction", theme: "Planet", icon: Waves, title: "Disaster Risk Reduction", image: disasterImg,
    problem: "Communities lack preparedness for disasters.",
    activities: "DRR training, community plans, emergency preparedness",
    beneficiaries: "Disaster-prone communities",
    outcomes: "Reduced disaster impact",
    description: "Strengthening disaster preparedness at the community level through training, planning, and building local capacity for emergency response.",
    programs: [
      { name: "Community DRR Program", location: "Flood-prone areas, UP", duration: "Ongoing", objectives: "Train communities in disaster preparedness and establish early warning systems.", partners: "NDMA, district administration", outputs: "15+ community disaster plans created", status: "Active" },
    ],
  },
  {
    slug: "wash", theme: "Planet", icon: Droplets, title: "WASH", image: washImg,
    problem: "Lack of clean water and sanitation.",
    activities: "Water systems, sanitation facilities, hygiene education",
    beneficiaries: "Rural and urban poor",
    outcomes: "Improved health and sanitation",
    description: "Ensuring access to clean water, sanitation, and hygiene through infrastructure development, community-led total sanitation, and behavior change communication.",
    programs: [
      { name: "Clean Water Access Project", location: "Rural UP", duration: "12 months", objectives: "Install community water purification systems and promote hygiene education.", partners: "Water.org, local panchayats", outputs: "10+ water systems installed", status: "Active" },
    ],
  },
  {
    slug: "rural-development", theme: "Community", icon: Building, title: "Rural Development", image: ruralImg,
    problem: "Rural areas lack infrastructure.",
    activities: "Infrastructure support, community mobilization, SHGs",
    beneficiaries: "Rural communities",
    outcomes: "Improved rural livelihoods",
    description: "Catalyzing rural transformation through infrastructure support, self-help group formation, community mobilization, and connecting villages to government schemes.",
    programs: [
      { name: "Village Transformation Program", location: "Barabanki, UP", duration: "Ongoing", objectives: "Holistic village development through SHGs, infrastructure, and government scheme linkage.", partners: "Block administration, SHGs", outputs: "10+ villages covered", status: "Active" },
    ],
  },
  {
    slug: "urban-development", theme: "Community", icon: Building, title: "Urban Development", image: urbanImg,
    problem: "Urban poor face inequality.",
    activities: "Urban planning, slum improvement, services access",
    beneficiaries: "Urban poor and migrants",
    outcomes: "Improved urban conditions",
    description: "Improving urban living conditions for the poor through slum upgradation, access to essential services, and inclusive urban planning initiatives.",
    programs: [
      { name: "Urban Slum Development Project", location: "Lucknow, UP", duration: "12 months", objectives: "Improve living conditions in urban slums through sanitation, education, and health services.", partners: "Municipal corporation, NGOs", outputs: "5 slums improved", status: "Upcoming" },
    ],
  },
  {
    slug: "art-culture", theme: "Community", icon: Palette, title: "Art & Culture", image: artCultureImg,
    problem: "Cultural heritage undervalued in development.",
    activities: "Cultural programs, art therapy, heritage preservation",
    beneficiaries: "Youth, artisans, communities",
    outcomes: "Cultural preservation",
    description: "Celebrating and preserving cultural heritage through art therapy programs, cultural festivals, heritage documentation, and supporting traditional artisans.",
    programs: [
      { name: "Art for Healing Program", location: "Lucknow, UP", duration: "6 months", objectives: "Use art therapy for psychosocial wellbeing of children and youth in underserved areas.", partners: "Art institutions, therapists", outputs: "100+ participants", status: "Active" },
    ],
  },
  {
    slug: "sports-youth", theme: "Community", icon: Dumbbell, title: "Sports & Youth Dev.", image: sportsImg,
    problem: "Youth lack constructive engagement.",
    activities: "Sports programs, youth clubs, leadership camps",
    beneficiaries: "Youth and adolescents",
    outcomes: "Youth empowerment",
    description: "Engaging youth through sports, leadership camps, and youth clubs — building confidence, teamwork, and a sense of purpose among young changemakers.",
    programs: [
      { name: "Youth Sports League", location: "Lucknow, UP", duration: "3 months", objectives: "Organize inter-community sports events to promote teamwork and healthy lifestyles.", partners: "Sports associations", outputs: "500+ youth participated", status: "Active" },
    ],
  },
  {
    slug: "peacebuilding", theme: "Community", icon: Handshake, title: "Peacebuilding", image: peaceImg,
    problem: "Conflict areas need reconciliation.",
    activities: "Dialogue facilitation, recovery programs, healing",
    beneficiaries: "Conflict-affected communities",
    outcomes: "Social cohesion",
    description: "Fostering social cohesion and peace through interfaith dialogue, community mediation, conflict resolution training, and psychosocial healing programs.",
    programs: [
      { name: "Community Dialogue Initiative", location: "Lucknow, UP", duration: "Ongoing", objectives: "Facilitate interfaith and intercommunity dialogue for social harmony.", partners: "Religious leaders, civil society", outputs: "10+ dialogue sessions conducted", status: "Active" },
    ],
  },
  {
    slug: "gender-inclusion", theme: "Community", icon: Users, title: "Gender & Inclusion", image: genderImg,
    problem: "Women face systemic barriers.",
    activities: "Leadership training, SHGs, advocacy",
    beneficiaries: "Women, girls, marginalized groups",
    outcomes: "Greater equity",
    description: "Advancing gender equity through women's leadership training, self-help groups, advocacy for policy change, and creating safe spaces for women and girls.",
    programs: [
      { name: "Women's Leadership Program", location: "Multiple districts, UP", duration: "6 months", objectives: "Build leadership capacity among women through training, mentoring, and SHG strengthening.", partners: "Women's commissions, NGOs", outputs: "200+ women leaders developed", status: "Active" },
    ],
  },
  {
    slug: "anti-substance-abuse", theme: "Community", icon: Flame, title: "Anti-Substance Abuse", image: antiSubstanceImg,
    problem: "Substance abuse destroys communities.",
    activities: "Awareness campaigns, rehab support, peer counseling",
    beneficiaries: "Youth, families",
    outcomes: "Reduced substance abuse",
    description: "Combating substance abuse through community awareness campaigns, peer counseling networks, rehabilitation support, and youth-led anti-drug movements.",
    programs: [
      { name: "Drug-Free Youth Campaign", location: "Lucknow, UP", duration: "3 months", objectives: "Youth-led awareness campaign against substance abuse in schools and colleges.", partners: "Police, educational institutions", outputs: "1000+ youth pledged", status: "Active" },
    ],
  },
];

export const getSectorBySlug = (slug: string): Sector | undefined =>
  sectors.find((s) => s.slug === slug);
