export interface SevaReport {
  id: string;
  ngoId: string;
  ngoName: string;
  reportTitle: string;
  reportDate: string;
  mealsServed: number;
  beneficiariesCount: number;
  location: string;
  volunteerCount: number;
  highlights: string;
  foodType: string;
  imageUrl?: string;
  submittedBy: string;
  createdAt: string;
}

export interface NgoPartner {
  id: string;
  name: string;
  tagline: string;
  description: string;
  contact: string;
  email: string;
  serviceArea: string;
  verificationStatus: "verified" | "pending" | "rejected";
  establishedYear: number;
  stats: {
    totalMealsServed: number;
    foodDrives: number;
    surplusPortionsCollected: number;
    activeVolunteers: number;
  };
  sampleReports: SevaReport[];
}

const STORAGE_REPORTS_KEY = "smart_canteen_ngo_reports_v2";
const STORAGE_NGOS_KEY = "smart_canteen_ngos_v2";

export const INITIAL_NGOS: NgoPartner[] = [
  {
    id: "332a18ed-e0de-4a87-9fd4-65fc75c3cb72", // Demo NGO ID
    name: "Annapurna Seva Trust (Demo)",
    tagline: "Feeding hungry souls with dignity and warm meals",
    description: "Registered trust active in campus surroundings and laborer settlements, operating mobile food distribution carts daily.",
    contact: "+91 98201 12345",
    email: "demo.ngo@smartcanteen.app",
    serviceArea: "Campus Surroundings & Labor Colony (5 km radius)",
    verificationStatus: "verified",
    establishedYear: 2018,
    stats: {
      totalMealsServed: 24850,
      foodDrives: 142,
      surplusPortionsCollected: 3820,
      activeVolunteers: 35,
    },
    sampleReports: [
      {
        id: "rep-1",
        ngoId: "332a18ed-e0de-4a87-9fd4-65fc75c3cb72",
        ngoName: "Annapurna Seva Trust (Demo)",
        reportTitle: "Weekly Seva Report: Campus Slum Cluster Distribution",
        reportDate: "2026-10-19",
        mealsServed: 420,
        beneficiariesCount: 380,
        location: "East Bypass Slum Cluster",
        volunteerCount: 8,
        foodType: "Surplus Dal Rice & Khichdi + Fresh Vegetable Curries",
        highlights: "Collected 85 portions of surplus afternoon meal from College Canteen. Augmented with hot khichdi and fed 380 daily wage families without any wastage.",
        imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80",
        submittedBy: "Meera Patel (Volunteer Lead)",
        createdAt: "2026-10-19T14:30:00Z",
      },
      {
        id: "rep-2",
        ngoId: "332a18ed-e0de-4a87-9fd4-65fc75c3cb72",
        ngoName: "Annapurna Seva Trust (Demo)",
        reportTitle: "Mid-Term Examination Night Drive",
        reportDate: "2026-10-12",
        mealsServed: 650,
        beneficiariesCount: 590,
        location: "Railway Station Subways & Shelter Homes",
        volunteerCount: 14,
        foodType: "Warm Thali Packages & Fresh Chapatis",
        highlights: "Midnight relief drive. Handed over hygienic meal boxes to homeless elders and night workers. Canteen leftover dry snacks also distributed.",
        imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
        submittedBy: "Rajesh Joshi (Field Coordinator)",
        createdAt: "2026-10-12T23:45:00Z",
      },
    ],
  },
  {
    id: "ngo-roti-bank",
    name: "Roti Bank Campus Youth Network",
    tagline: "Student-driven community food bridge",
    description: "Run by university alumni and student volunteers collecting surplus bread, rotis, and prepared lunch for underprivileged children.",
    contact: "+91 98450 78901",
    email: "contact@rotibankcampus.org",
    serviceArea: "North Campus, Metro Station Underpass & Shanti Nagar",
    verificationStatus: "verified",
    establishedYear: 2020,
    stats: {
      totalMealsServed: 18200,
      foodDrives: 96,
      surplusPortionsCollected: 2640,
      activeVolunteers: 45,
    },
    sampleReports: [
      {
        id: "rep-3",
        ngoId: "ngo-roti-bank",
        ngoName: "Roti Bank Campus Youth Network",
        reportTitle: "Bhojan Seva Drive #96: Metro Pillar Shelter",
        reportDate: "2026-10-18",
        mealsServed: 310,
        beneficiariesCount: 290,
        location: "Metro Station Pillar 42-50",
        volunteerCount: 9,
        foodType: "Fresh Roti Subzi & Rajma Rice",
        highlights: "Claimed 40 portions of surplus Rajma Rice from Smart Canteen. Served fresh hot food in eco-friendly leaf plates.",
        imageUrl: "https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?auto=format&fit=crop&w=800&q=80",
        submittedBy: "Aman Verma",
        createdAt: "2026-10-18T16:20:00Z",
      },
    ],
  },
  {
    id: "ngo-robin-hood",
    name: "Robin Hood Army - Green Chapter",
    tagline: "Zero Funds, Zero Waste, 100% Volunteer Seva",
    description: "Global volunteer movement dedicated to redistributing surplus food from university institutions and cafeterias to local communities.",
    contact: "+91 97110 34567",
    email: "green.chapter@robinhoodarmy.com",
    serviceArea: "City District, Orphanages & Old Age Homes (12 km)",
    verificationStatus: "verified",
    establishedYear: 2016,
    stats: {
      totalMealsServed: 41500,
      foodDrives: 210,
      surplusPortionsCollected: 5900,
      activeVolunteers: 60,
    },
    sampleReports: [
      {
        id: "rep-4",
        ngoId: "ngo-robin-hood",
        ngoName: "Robin Hood Army - Green Chapter",
        reportTitle: "Weekend Mega Seva: Orphanage & Elder Care Support",
        reportDate: "2026-10-17",
        mealsServed: 840,
        beneficiariesCount: 780,
        location: "Bal Ashray & Mother Teresa Home",
        volunteerCount: 18,
        foodType: "Complete Veg Meal (Paneer, Dal Tadka, Rice, Roti, Kheer)",
        highlights: "Coordinated with Smart Canteen for bulk weekend leftover redistribution. 110 kg prepared meals saved from disposal and joyfully relished by children.",
        imageUrl: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=800&q=80",
        submittedBy: "Pooja Hegde (Robins Captain)",
        createdAt: "2026-10-17T18:00:00Z",
      },
    ],
  },
  {
    id: "ngo-feeding-india",
    name: "Feeding India Mission Trust",
    tagline: "Fighting hunger with organized logistics",
    description: "Non-profit food rescue agency with insulated transport vans to collect and deliver hot canteen surplus safely within 90 minutes.",
    contact: "+91 99001 55667",
    email: "rescue@feedingindiamission.in",
    serviceArea: "Industrial Belt, Construction Sites & Brick Kilns",
    verificationStatus: "verified",
    establishedYear: 2019,
    stats: {
      totalMealsServed: 32400,
      foodDrives: 165,
      surplusPortionsCollected: 4950,
      activeVolunteers: 28,
    },
    sampleReports: [
      {
        id: "rep-5",
        ngoId: "ngo-feeding-india",
        ngoName: "Feeding India Mission Trust",
        reportTitle: "Industrial Worker Lunch Relief Mission",
        reportDate: "2026-10-16",
        mealsServed: 520,
        beneficiariesCount: 510,
        location: "Phase 2 Industrial Sheds",
        volunteerCount: 6,
        foodType: "Nutritious Veg Thali Portions",
        highlights: "Temperature-monitored surplus dispatch from Smart Canteen. Food safety certified and served warm within 40 minutes of collection.",
        imageUrl: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80",
        submittedBy: "Sunil Shenoy",
        createdAt: "2026-10-16T15:10:00Z",
      },
    ],
  },
  {
    id: "ngo-akshaya-patra",
    name: "Akshaya Seva Community Foundation",
    tagline: "Ensuring no child in our neighborhood sleeps hungry",
    description: "Community welfare association supporting rural primary school children and migrant laborers' families near campus.",
    contact: "+91 98860 99881",
    email: "akshaya.community@seva.org",
    serviceArea: "Gram Panchayat Perimeter & Primary School Clusters",
    verificationStatus: "verified",
    establishedYear: 2017,
    stats: {
      totalMealsServed: 29800,
      foodDrives: 130,
      surplusPortionsCollected: 3400,
      activeVolunteers: 32,
    },
    sampleReports: [
      {
        id: "rep-6",
        ngoId: "ngo-akshaya-patra",
        ngoName: "Akshaya Seva Community Foundation",
        reportTitle: "Evening Nutrition Drive for Anganwadi Families",
        reportDate: "2026-10-15",
        mealsServed: 360,
        beneficiariesCount: 340,
        location: "Kalyan Nagar Community Hall",
        volunteerCount: 7,
        foodType: "Sambar Rice & Boiled Pulses",
        highlights: "Distributed 60 portions received from college afternoon service, complemented with fresh fruit for toddlers.",
        imageUrl: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80",
        submittedBy: "Kavita Rao",
        createdAt: "2026-10-15T17:40:00Z",
      },
    ],
  },
  {
    id: "ngo-sanjivani",
    name: "Sanjivani Welfare Society",
    tagline: "Healthcare, food, and emotional support",
    description: "Dedicated to patients' attendants outside government district hospitals who wait for days without affordable meal options.",
    contact: "+91 94480 33221",
    email: "sanjivani.society@rediffmail.com",
    serviceArea: "District Civil Hospital Campus & Night OPD Sheds",
    verificationStatus: "verified",
    establishedYear: 2019,
    stats: {
      totalMealsServed: 21500,
      foodDrives: 115,
      surplusPortionsCollected: 2900,
      activeVolunteers: 22,
    },
    sampleReports: [
      {
        id: "rep-7",
        ngoId: "ngo-sanjivani",
        ngoName: "Sanjivani Welfare Society",
        reportTitle: "Hospital Attendant Evening Seva #115",
        reportDate: "2026-10-14",
        mealsServed: 400,
        beneficiariesCount: 390,
        location: "Civil Hospital Corridor & Wait Shelter",
        volunteerCount: 8,
        foodType: "Hygienic Chapati, Sabzi & Dal",
        highlights: "Free dinner provided to attendants of ICU patients who cannot leave bedside. Canteen donations were a lifesaver.",
        imageUrl: "https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=800&q=80",
        submittedBy: "Dr. Arvind Kulkarni",
        createdAt: "2026-10-14T20:15:00Z",
      },
    ],
  },
  {
    id: "ngo-care-share",
    name: "Care & Share Food Rescue Collective",
    tagline: "Every grain counts, every person matters",
    description: "Grassroots youth group monitoring food surplus from college events, hostel canteens, and local festivals.",
    contact: "+91 97312 44556",
    email: "careshare.collective@gmail.com",
    serviceArea: "Transit Camps, Ring Road Pavements & Riverbank settlements",
    verificationStatus: "verified",
    establishedYear: 2021,
    stats: {
      totalMealsServed: 14600,
      foodDrives: 78,
      surplusPortionsCollected: 2100,
      activeVolunteers: 26,
    },
    sampleReports: [
      {
        id: "rep-8",
        ngoId: "ngo-care-share",
        ngoName: "Care & Share Food Rescue Collective",
        reportTitle: "Riverbed Settlement Flood Relief Food Drive",
        reportDate: "2026-10-11",
        mealsServed: 480,
        beneficiariesCount: 450,
        location: "Yamuna Pushta Riverbank Colony",
        volunteerCount: 11,
        foodType: "Rice Meal Packs with Pickles & Bananas",
        highlights: "Temporary waterlogging relief. Prompt mobilization of 70 portions from college canteen avoided waste and gave warm sustenance.",
        imageUrl: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80",
        submittedBy: "Nikhil Chawla",
        createdAt: "2026-10-11T13:00:00Z",
      },
    ],
  },
  {
    id: "ngo-umeed",
    name: "Umeed Jan Kalyan Samiti",
    tagline: "Hope through warm nourishment",
    description: "Community welfare association running evening tuition centers where every child receives a complete nutritious meal.",
    contact: "+91 99160 88772",
    email: "umeed.jankalyan@ngo.in",
    serviceArea: "Nehru Nagar Basti & Local Brick Kiln settlements",
    verificationStatus: "verified",
    establishedYear: 2020,
    stats: {
      totalMealsServed: 16900,
      foodDrives: 84,
      surplusPortionsCollected: 2450,
      activeVolunteers: 20,
    },
    sampleReports: [
      {
        id: "rep-9",
        ngoId: "ngo-umeed",
        ngoName: "Umeed Jan Kalyan Samiti",
        reportTitle: "After-School Nutrition Seva for 180 Kids",
        reportDate: "2026-10-10",
        mealsServed: 220,
        beneficiariesCount: 200,
        location: "Umeed Pathshala, Basti Block A",
        volunteerCount: 5,
        foodType: "Puri Bhaji & Sweet Halwa",
        highlights: "Combined canteen surplus breakfast items with our hot dal rice. High school volunteer mentors served meals before classes.",
        imageUrl: "https://images.unsplash.com/photo-1594708767771-a7502209ff51?auto=format&fit=crop&w=800&q=80",
        submittedBy: "Shanti Devi (President)",
        createdAt: "2026-10-10T17:15:00Z",
      },
    ],
  },
  {
    id: "ngo-bhojan-daan",
    name: "Bhojan Daan Seva Samiti",
    tagline: "Dedicated to hunger-free mornings and nights",
    description: "Volunteer group operating free food stalls for migrant workers, daily wage laborers, and auto drivers.",
    contact: "+91 98441 22334",
    email: "bhojandaan.samiti@gmail.com",
    serviceArea: "Labor Naka, Auto Stand Clusters & Market Yard",
    verificationStatus: "verified",
    establishedYear: 2019,
    stats: {
      totalMealsServed: 19400,
      foodDrives: 102,
      surplusPortionsCollected: 2750,
      activeVolunteers: 18,
    },
    sampleReports: [
      {
        id: "rep-10",
        ngoId: "ngo-bhojan-daan",
        ngoName: "Bhojan Daan Seva Samiti",
        reportTitle: "Morning Labor Naka Seva Drive",
        reportDate: "2026-10-08",
        mealsServed: 350,
        beneficiariesCount: 330,
        location: "APMC Market Yard Gate 1",
        volunteerCount: 6,
        foodType: "Idli Sambar & Upma",
        highlights: "Collected excess breakfast batch from canteen at 10 AM. Served laborers searching for daily work.",
        imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80",
        submittedBy: "Gopal Krishna",
        createdAt: "2026-10-08T11:00:00Z",
      },
    ],
  },
  {
    id: "ngo-helping-hands",
    name: "Helping Hands Relief Foundation",
    tagline: "Immediate hunger relief in distress hours",
    description: "Disaster response and destitute feeding initiative active in old age shelters, train stations, and flood-prone bastis.",
    contact: "+91 97400 66778",
    email: "support@helpinghandsrelief.org",
    serviceArea: "City Outskirts, Old Age Ashrams & Temporary Camps",
    verificationStatus: "verified",
    establishedYear: 2022,
    stats: {
      totalMealsServed: 11200,
      foodDrives: 62,
      surplusPortionsCollected: 1680,
      activeVolunteers: 24,
    },
    sampleReports: [
      {
        id: "rep-11",
        ngoId: "ngo-helping-hands",
        ngoName: "Helping Hands Relief Foundation",
        reportTitle: "Elderly Care Shelter Hot Meal Distribution",
        reportDate: "2026-10-05",
        mealsServed: 280,
        beneficiariesCount: 260,
        location: "Sneha Sadan Elders Home",
        volunteerCount: 7,
        foodType: "Soft Khichdi, Kadhi & Steamed Vegetables",
        highlights: "Senior-friendly nutritious meals served with love. Special hygiene protocols maintained throughout handling.",
        imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
        submittedBy: "Tanya Sen (Trustee)",
        createdAt: "2026-10-05T19:30:00Z",
      },
    ],
  },
];

// Helper to get stored NGOs
export function getNgoPartners(): NgoPartner[] {
  if (typeof window === "undefined") return INITIAL_NGOS;
  try {
    const raw = localStorage.getItem(STORAGE_NGOS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_NGOS_KEY, JSON.stringify(INITIAL_NGOS));
      return INITIAL_NGOS;
    }
    const parsed = JSON.parse(raw) as NgoPartner[];
    // Ensure all 10 are present
    if (parsed.length < INITIAL_NGOS.length) {
      localStorage.setItem(STORAGE_NGOS_KEY, JSON.stringify(INITIAL_NGOS));
      return INITIAL_NGOS;
    }
    return parsed;
  } catch {
    return INITIAL_NGOS;
  }
}

// Helper to get all reports (both sample and newly submitted by NGOs)
export function getAllSevaReports(): SevaReport[] {
  if (typeof window === "undefined") {
    return INITIAL_NGOS.flatMap((n) => n.sampleReports);
  }
  try {
    const custom = JSON.parse(localStorage.getItem(STORAGE_REPORTS_KEY) || "[]") as SevaReport[];
    const ngos = getNgoPartners();
    const defaults = ngos.flatMap((n) => n.sampleReports);
    // Combine custom (most recent first) and defaults, avoiding duplicates
    const seen = new Set<string>();
    const all: SevaReport[] = [];
    for (const r of [...custom, ...defaults]) {
      if (!seen.has(r.id)) {
        seen.add(r.id);
        all.push(r);
      }
    }
    return all.sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
  } catch {
    return INITIAL_NGOS.flatMap((n) => n.sampleReports);
  }
}

// Helper to get reports for a specific NGO
export function getNgoSevaReports(ngoId: string): SevaReport[] {
  return getAllSevaReports().filter((r) => r.ngoId === ngoId);
}

// Add a new Seva Report submitted by an NGO
export function addSevaReport(report: Omit<SevaReport, "id" | "createdAt">): SevaReport {
  const newReport: SevaReport = {
    ...report,
    id: "rep-" + Date.now(),
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_REPORTS_KEY) || "[]") as SevaReport[];
      const updated = [newReport, ...existing];
      localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(updated));

      // Also update NGO stats in stored NGOs
      const ngos = getNgoPartners();
      const target = ngos.find((n) => n.id === report.ngoId);
      if (target) {
        target.stats.totalMealsServed += report.mealsServed;
        target.stats.foodDrives += 1;
        target.stats.activeVolunteers = Math.max(target.stats.activeVolunteers, report.volunteerCount);
        localStorage.setItem(STORAGE_NGOS_KEY, JSON.stringify(ngos));
      }

      window.dispatchEvent(new Event("smart_canteen_reports_updated"));
    } catch (e) {
      console.error("Failed to store report locally:", e);
    }
  }

  return newReport;
}

// Update verification status (from Admin dashboard)
export function updateNgoVerification(ngoId: string, status: "verified" | "pending" | "rejected"): void {
  if (typeof window === "undefined") return;
  try {
    const ngos = getNgoPartners();
    const target = ngos.find((n) => n.id === ngoId);
    if (target) {
      target.verificationStatus = status;
      localStorage.setItem(STORAGE_NGOS_KEY, JSON.stringify(ngos));
      window.dispatchEvent(new Event("smart_canteen_reports_updated"));
    }
  } catch (e) {
    console.error("Failed to update verification status:", e);
  }
}
