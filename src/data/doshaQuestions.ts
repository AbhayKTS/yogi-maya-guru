import { DoshaAssessmentQuestion } from '@/types';

export const DOSHA_QUESTIONS: DoshaAssessmentQuestion[] = [
  // Physical Traits (Prakriti)
  {
    id: 1,
    question: "How would you describe your natural body frame?",
    options: {
      a: { text: "Slender, light, I find it hard to gain weight", dosha: "vata" },
      b: { text: "Medium, athletic, good muscle definition", dosha: "pitta" },
      c: { text: "Broad, sturdy, I gain weight easily", dosha: "kapha" }
    }
  },
  {
    id: 2,
    question: "What is your skin type?",
    options: {
      a: { text: "Dry, rough, often cold to touch", dosha: "vata" },
      b: { text: "Sensitive, warm, prone to rashes or acne", dosha: "pitta" },
      c: { text: "Oily, smooth, soft and cool", dosha: "kapha" }
    }
  },
  {
    id: 3,
    question: "How would you describe your hair?",
    options: {
      a: { text: "Thin, dry, coarse, or curly", dosha: "vata" },
      b: { text: "Fine, straight, early graying or balding", dosha: "pitta" },
      c: { text: "Thick, lustrous, wavy, and oily", dosha: "kapha" }
    }
  },
  {
    id: 4,
    question: "What are your eyes like?",
    options: {
      a: { text: "Small, dry, dark, or nervous", dosha: "vata" },
      b: { text: "Medium size, penetrating, light-sensitive", dosha: "pitta" },
      c: { text: "Large, calm, attractive with thick eyelashes", dosha: "kapha" }
    }
  },
  {
    id: 5,
    question: "How is your appetite?",
    options: {
      a: { text: "Variable, I often forget to eat", dosha: "vata" },
      b: { text: "Strong, I get irritable when hungry", dosha: "pitta" },
      c: { text: "Steady but mild, I can skip meals easily", dosha: "kapha" }
    }
  },
  {
    id: 6,
    question: "What is your physical stamina like?",
    options: {
      a: { text: "Low endurance, I tire easily but recover quickly", dosha: "vata" },
      b: { text: "Moderate, good stamina but dislike heat", dosha: "pitta" },
      c: { text: "Excellent endurance, slow to start but steady", dosha: "kapha" }
    }
  },

  // Mental & Emotional Traits (Manas)
  {
    id: 7,
    question: "How would you describe your temperament?",
    options: {
      a: { text: "Anxious, worrying, enthusiastic", dosha: "vata" },
      b: { text: "Irritable, aggressive, focused", dosha: "pitta" },
      c: { text: "Calm, content, steady", dosha: "kapha" }
    }
  },
  {
    id: 8,
    question: "How is your memory?",
    options: {
      a: { text: "I learn fast but forget quickly", dosha: "vata" },
      b: { text: "Sharp, clear, good retention", dosha: "pitta" },
      c: { text: "Slow to learn but never forget", dosha: "kapha" }
    }
  },
  {
    id: 9,
    question: "How do you react to stress?",
    options: {
      a: { text: "I become anxious and worried", dosha: "vata" },
      b: { text: "I become angry and irritated", dosha: "pitta" },
      c: { text: "I withdraw and become silent", dosha: "kapha" }
    }
  },
  {
    id: 10,
    question: "What are your sleep patterns like?",
    options: {
      a: { text: "Light sleeper, toss and turn, vivid dreams", dosha: "vata" },
      b: { text: "Moderate sleep, wake up refreshed", dosha: "pitta" },
      c: { text: "Deep, long sleep, hard to wake up", dosha: "kapha" }
    }
  },
  {
    id: 11,
    question: "How do you make decisions?",
    options: {
      a: { text: "Quickly but often change my mind", dosha: "vata" },
      b: { text: "Methodical, decisive, rarely change", dosha: "pitta" },
      c: { text: "Slowly after much deliberation", dosha: "kapha" }
    }
  },
  {
    id: 12,
    question: "How is your speech pattern?",
    options: {
      a: { text: "Fast, talkative, sometimes scattered", dosha: "vata" },
      b: { text: "Sharp, articulate, persuasive", dosha: "pitta" },
      c: { text: "Slow, melodious, thoughtful", dosha: "kapha" }
    }
  },

  // Lifestyle Habits
  {
    id: 13,
    question: "What foods do you naturally crave?",
    options: {
      a: { text: "Sweet, sour, salty foods", dosha: "vata" },
      b: { text: "Sweet, bitter, astringent foods", dosha: "pitta" },
      c: { text: "Pungent, bitter, astringent foods", dosha: "kapha" }
    }
  },
  {
    id: 14,
    question: "How are your energy levels throughout the day?",
    options: {
      a: { text: "Bursts of energy, then fatigue", dosha: "vata" },
      b: { text: "Steady, high energy, especially midday", dosha: "pitta" },
      c: { text: "Slow to start, steady throughout", dosha: "kapha" }
    }
  },
  {
    id: 15,
    question: "What weather do you prefer?",
    options: {
      a: { text: "Warm, humid weather", dosha: "vata" },
      b: { text: "Cool, well-ventilated spaces", dosha: "pitta" },
      c: { text: "Warm, dry weather", dosha: "kapha" }
    }
  },
  {
    id: 16,
    question: "How do you handle routine?",
    options: {
      a: { text: "I prefer variety and change", dosha: "vata" },
      b: { text: "I like structured, organized routines", dosha: "pitta" },
      c: { text: "I thrive on steady, predictable routines", dosha: "kapha" }
    }
  },
  {
    id: 17,
    question: "What is your relationship with money?",
    options: {
      a: { text: "I spend impulsively, earn and spend quickly", dosha: "vata" },
      b: { text: "I spend on quality items, good planner", dosha: "pitta" },
      c: { text: "I save regularly, spend cautiously", dosha: "kapha" }
    }
  },
  {
    id: 18,
    question: "How do you exercise?",
    options: {
      a: { text: "I enjoy varied, creative activities", dosha: "vata" },
      b: { text: "I like competitive, challenging workouts", dosha: "pitta" },
      c: { text: "I prefer slow, steady, relaxing activities", dosha: "kapha" }
    }
  },
  {
    id: 19,
    question: "What describes your bowel movements?",
    options: {
      a: { text: "Irregular, dry, sometimes constipated", dosha: "vata" },
      b: { text: "Regular, loose, 2-3 times daily", dosha: "pitta" },
      c: { text: "Regular, heavy, once daily", dosha: "kapha" }
    }
  },
  {
    id: 20,
    question: "How do you respond to cold weather?",
    options: {
      a: { text: "I get very cold and uncomfortable", dosha: "vata" },
      b: { text: "I tolerate cold well", dosha: "pitta" },
      c: { text: "I don't mind cold but feel sluggish", dosha: "kapha" }
    }
  }
];

export const calculateDoshaScores = (responses: { [questionId: number]: 'a' | 'b' | 'c' }) => {
  const scores = { vata: 0, pitta: 0, kapha: 0 };
  
  Object.entries(responses).forEach(([questionId, answer]) => {
    const question = DOSHA_QUESTIONS.find(q => q.id === parseInt(questionId));
    if (question) {
      const dosha = question.options[answer].dosha;
      scores[dosha]++;
    }
  });
  
  return scores;
};

export const getDominantDoshas = (scores: { vata: number; pitta: number; kapha: number }) => {
  const sortedDoshas = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)
    .map(([dosha]) => dosha as keyof typeof scores);
  
  return {
    dominant: sortedDoshas[0],
    secondary: sortedDoshas[1],
    scores
  };
};