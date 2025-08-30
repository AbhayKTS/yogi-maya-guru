export type DoshaType = 'vata' | 'pitta' | 'kapha';

export type RankType = 
  | 'padatik' 
  | 'ashvarohi' 
  | 'gaja' 
  | 'ardharathi' 
  | 'rathi' 
  | 'ati_rathi' 
  | 'maharathi' 
  | 'maha_maharathi';

export interface UserProfile {
  id: string;
  user_id: string;
  username?: string;
  dominant_dosha?: DoshaType;
  secondary_dosha?: DoshaType;
  sadhana_points: number;
  current_rank: RankType;
  login_streak: number;
  last_login_date?: string;
  birth_date?: string;
  birth_time?: string;
  birth_place?: string;
  created_at: string;
  updated_at: string;
}

export interface Shlok {
  id: string;
  source: string;
  sanskrit_text: string;
  transliteration: string;
  translation: string;
  audio_url?: string;
  chapter_context?: string;
  created_at: string;
}

export interface YogaSession {
  id: string;
  user_id: string;
  session_type: string;
  duration_minutes: number;
  accuracy_score?: number;
  sadhana_points_earned: number;
  completed_at: string;
}

export interface DoshaAssessmentQuestion {
  id: number;
  question: string;
  options: {
    a: { text: string; dosha: DoshaType };
    b: { text: string; dosha: DoshaType };
    c: { text: string; dosha: DoshaType };
  };
}

export const RANK_INFO: Record<RankType, {
  sanskrit: string;
  title: string;
  pointsRequired: number;
  description: string;
  unlocks: string;
}> = {
  padatik: {
    sanskrit: "पदातति",
    title: "Padatik",
    pointsRequired: 0,
    description: "An infantry soldier on foot",
    unlocks: "Basic access to all features"
  },
  ashvarohi: {
    sanskrit: "अश्वारोही", 
    title: "Ashvarohi",
    pointsRequired: 250,
    description: "A horseman or cavalry soldier",
    unlocks: "New background music for sessions"
  },
  gaja: {
    sanskrit: "गजा",
    title: "Gaja", 
    pointsRequired: 1000,
    description: "A soldier mounted on an elephant",
    unlocks: "Endurance yoga program"
  },
  ardharathi: {
    sanskrit: "अर्ध्रथी",
    title: "Ardharathi",
    pointsRequired: 3500,
    description: "A warrior on a chariot",
    unlocks: "Advanced Pranayama techniques"
  },
  rathi: {
    sanskrit: "रथी",
    title: "Rathi",
    pointsRequired: 7000,
    description: "An elite chariot warrior",
    unlocks: "Masterclass yoga flows"
  },
  ati_rathi: {
    sanskrit: "अतिरथी",
    title: "Ati-Rathi", 
    pointsRequired: 15000,
    description: "An elite warrior, equal to 12 Rathis",
    unlocks: "Customize yoga sessions"
  },
  maharathi: {
    sanskrit: "महारथी",
    title: "Maharathi",
    pointsRequired: 40000,
    description: "The highest rank warrior",
    unlocks: "Golden app theme"
  },
  maha_maharathi: {
    sanskrit: "महा-महारथी",
    title: "Mahā-Mahārathi",
    pointsRequired: 100000,
    description: "The ultimate rank warrior",
    unlocks: "Personal congratulatory note from the Guru"
  }
};

export const DOSHA_INFO: Record<DoshaType, {
  sanskrit: string;
  element: string;
  qualities: string[];
  color: string;
  description: string;
}> = {
  vata: {
    sanskrit: "वात",
    element: "Air & Space",
    qualities: ["Light", "Dry", "Cold", "Rough", "Subtle", "Mobile"],
    color: "text-wisdom",
    description: "The principle of movement and communication"
  },
  pitta: {
    sanskrit: "पित्त", 
    element: "Fire & Water",
    qualities: ["Hot", "Sharp", "Light", "Oily", "Liquid", "Mobile"],
    color: "text-primary",
    description: "The principle of digestion and transformation"
  },
  kapha: {
    sanskrit: "कफ",
    element: "Earth & Water", 
    qualities: ["Heavy", "Slow", "Cool", "Oily", "Smooth", "Dense"],
    color: "text-healing",
    description: "The principle of structure and lubrication"
  }
};