// Local storage utilities for replacing Supabase functionality

export interface LocalWisdomEntry {
  id: string;
  user_id: string;
  content: string;
  category: string;
  is_favorite: boolean;
  created_at: string;
}

export interface LocalYogaSession {
  id: string;
  user_id: string;
  duration: number;
  poses_completed: number;
  created_at: string;
}

export interface LocalDoshaResponse {
  id: string;
  user_id: string;
  question_id: number;
  answer: string;
  created_at: string;
}

// Wisdom entries management
export const getWisdomEntries = (userId: string): LocalWisdomEntry[] => {
  const entries = localStorage.getItem('wisdomEntries');
  if (!entries) return [];
  
  const allEntries: LocalWisdomEntry[] = JSON.parse(entries);
  return allEntries.filter(entry => entry.user_id === userId);
};

export const saveWisdomEntry = (entry: Omit<LocalWisdomEntry, 'id' | 'created_at'>): LocalWisdomEntry => {
  const entries = localStorage.getItem('wisdomEntries');
  const allEntries: LocalWisdomEntry[] = entries ? JSON.parse(entries) : [];
  
  const newEntry: LocalWisdomEntry = {
    ...entry,
    id: `wisdom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString()
  };
  
  allEntries.push(newEntry);
  localStorage.setItem('wisdomEntries', JSON.stringify(allEntries));
  
  return newEntry;
};

export const updateWisdomEntry = (id: string, updates: Partial<LocalWisdomEntry>) => {
  const entries = localStorage.getItem('wisdomEntries');
  if (!entries) return;
  
  const allEntries: LocalWisdomEntry[] = JSON.parse(entries);
  const index = allEntries.findIndex(entry => entry.id === id);
  
  if (index !== -1) {
    allEntries[index] = { ...allEntries[index], ...updates };
    localStorage.setItem('wisdomEntries', JSON.stringify(allEntries));
  }
};

export const deleteWisdomEntry = (id: string) => {
  const entries = localStorage.getItem('wisdomEntries');
  if (!entries) return;
  
  const allEntries: LocalWisdomEntry[] = JSON.parse(entries);
  const filteredEntries = allEntries.filter(entry => entry.id !== id);
  localStorage.setItem('wisdomEntries', JSON.stringify(filteredEntries));
};

// Yoga sessions management
export const saveYogaSession = (session: Omit<LocalYogaSession, 'id' | 'created_at'>): LocalYogaSession => {
  const sessions = localStorage.getItem('yogaSessions');
  const allSessions: LocalYogaSession[] = sessions ? JSON.parse(sessions) : [];
  
  const newSession: LocalYogaSession = {
    ...session,
    id: `yoga_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString()
  };
  
  allSessions.push(newSession);
  localStorage.setItem('yogaSessions', JSON.stringify(allSessions));
  
  return newSession;
};

// Dosha assessment management
export const saveDoshaResponse = (response: Omit<LocalDoshaResponse, 'id' | 'created_at'>): LocalDoshaResponse => {
  const responses = localStorage.getItem('doshaResponses');
  const allResponses: LocalDoshaResponse[] = responses ? JSON.parse(responses) : [];
  
  const newResponse: LocalDoshaResponse = {
    ...response,
    id: `dosha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString()
  };
  
  allResponses.push(newResponse);
  localStorage.setItem('doshaResponses', JSON.stringify(allResponses));
  
  return newResponse;
};

// Mock astrology data
export const getMockKundaliData = () => ({
  success: true,
  data: {
    birth_details: {
      birth_date: "1995-08-15",
      birth_time: "14:30:00",
      birth_place: "New Delhi, India",
      sunrise: "05:52:00",
      sunset: "19:08:00"
    },
    planetary_positions: {
      sun: { sign: "Leo", degree: 22.5 },
      moon: { sign: "Scorpio", degree: 15.3 },
      mars: { sign: "Virgo", degree: 8.7 },
      mercury: { sign: "Leo", degree: 5.2 },
      jupiter: { sign: "Sagittarius", degree: 28.1 },
      venus: { sign: "Cancer", degree: 12.9 },
      saturn: { sign: "Pisces", degree: 20.4 }
    },
    mangal_dosha: {
      has_mangal_dosha: false,
      description: "No Mangal Dosha found in this chart"
    },
    benefic_yogas: [
      "Raj Yoga - Indicates royal status and prosperity",
      "Dhana Yoga - Indicates wealth and financial success"
    ]
  }
});

export const getMockPanchangData = () => ({
  success: true,
  data: {
    date: new Date().toISOString().split('T')[0],
    sunrise: "06:15:00",
    sunset: "18:45:00",
    tithi: "Panchami",
    nakshatra: "Rohini",
    yoga: "Siddha",
    karana: "Bava",
    auspicious_times: [
      { name: "Brahma Muhurta", start: "04:30:00", end: "06:00:00" },
      { name: "Abhijit Muhurta", start: "11:47:00", end: "12:35:00" }
    ],
    inauspicious_times: [
      { name: "Rahu Kaal", start: "13:30:00", end: "15:00:00" }
    ]
  }
});

export const getMockPredictionData = (type: string) => ({
  success: true,
  data: {
    prediction_type: type,
    general_prediction: `Your ${type} prediction shows positive influences from beneficial planets. This is a favorable time for new beginnings and growth.`,
    specific_insights: [
      "Jupiter's favorable position brings opportunities",
      "Mercury enhances communication skills",
      "Venus brings harmony and balance"
    ],
    recommendations: [
      "Focus on your goals with determination",
      "Maintain positive relationships",
      "Practice meditation for inner peace"
    ]
  }
});

export const getMockDoshaAnalysis = (doshaType: string) => ({
  success: true,
  data: {
    dosha_type: doshaType,
    has_dosha: Math.random() > 0.5,
    severity: "Mild",
    description: `Analysis of ${doshaType} in your birth chart shows manageable influences that can be addressed through proper remedies.`,
    remedies: [
      "Regular meditation and yoga practice",
      "Chanting specific mantras",
      "Wearing appropriate gemstones",
      "Performing charitable activities"
    ],
    effects: [
      "May cause minor delays in certain life areas",
      "Can be mitigated through spiritual practices",
      "Overall impact is minimal with proper care"
    ]
  }
});