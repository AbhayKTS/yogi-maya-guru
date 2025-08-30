import { DoshaType } from '@/types';

export interface YogaAsana {
  id: string;
  name: string;
  sanskrit_name: string;
  balances_dosha: DoshaType[];
  benefits: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_seconds: number;
  image_url?: string;
  video_url?: string;
  instructions: string[];
  pose_keypoints: {
    // Define key angles and positions for MediaPipe validation
    [bodyPart: string]: {
      angle_range: [number, number]; // min, max acceptable angle
      description: string;
    };
  };
}

export const YOGA_ASANAS: YogaAsana[] = [
  {
    id: 'mountain_pose',
    name: 'Mountain Pose',
    sanskrit_name: 'Tadasana',
    balances_dosha: ['vata', 'pitta', 'kapha'],
    benefits: ['grounding', 'posture', 'awareness'],
    difficulty: 'beginner',
    duration_seconds: 30,
    instructions: [
      'Stand tall with feet hip-width apart',
      'Ground down through all four corners of feet',
      'Engage leg muscles and lift kneecaps',
      'Lengthen spine and crown of head toward ceiling',
      'Relax shoulders away from ears',
      'Breathe deeply and hold the pose'
    ],
    pose_keypoints: {
      spine_alignment: {
        angle_range: [170, 190],
        description: 'Spine should be straight and aligned'
      },
      shoulder_level: {
        angle_range: [175, 185],
        description: 'Shoulders should be level and relaxed'
      }
    }
  },
  {
    id: 'child_pose',
    name: "Child's Pose",
    sanskrit_name: 'Balasana',
    balances_dosha: ['vata', 'pitta'],
    benefits: ['calming', 'stress_relief', 'stretches_back'],
    difficulty: 'beginner',
    duration_seconds: 45,
    instructions: [
      'Kneel on the floor with big toes touching',
      'Sit back on your heels',
      'Separate knees about hip-width apart',
      'Fold forward, extending arms in front or alongside body',
      'Rest forehead on the mat',
      'Breathe deeply and relax'
    ],
    pose_keypoints: {
      hip_knee_angle: {
        angle_range: [45, 90],
        description: 'Knees should be comfortably bent'
      },
      spine_curve: {
        angle_range: [120, 150],
        description: 'Natural curve in spine as you fold forward'
      }
    }
  },
  {
    id: 'warrior_ii',
    name: 'Warrior II',
    sanskrit_name: 'Virabhadrasana II',
    balances_dosha: ['kapha'],
    benefits: ['strengthening', 'stamina', 'focus'],
    difficulty: 'intermediate',
    duration_seconds: 30,
    instructions: [
      'Step left foot back about 4 feet',
      'Turn left foot out 90 degrees, right foot slightly in',
      'Bend right knee directly over ankle',
      'Extend arms parallel to floor',
      'Gaze over right fingertips',
      'Keep torso upright and breathe steadily'
    ],
    pose_keypoints: {
      front_knee_angle: {
        angle_range: [80, 100],
        description: 'Front knee should be at 90 degrees over ankle'
      },
      arm_extension: {
        angle_range: [170, 190],
        description: 'Arms should be parallel to floor'
      },
      back_leg_straight: {
        angle_range: [160, 180],
        description: 'Back leg should be straight and strong'
      }
    }
  },
  {
    id: 'downward_dog',
    name: 'Downward Facing Dog',
    sanskrit_name: 'Adho Mukha Svanasana',
    balances_dosha: ['kapha', 'vata'],
    benefits: ['strengthening', 'stretching', 'energizing'],
    difficulty: 'beginner',
    duration_seconds: 45,
    instructions: [
      'Start on hands and knees',
      'Tuck toes under and lift hips up and back',
      'Straighten legs as much as comfortable',
      'Press hands firmly into mat',
      'Create inverted V shape with body',
      'Breathe deeply and hold'
    ],
    pose_keypoints: {
      hip_angle: {
        angle_range: [90, 120],
        description: 'Hips should create peak of inverted V'
      },
      shoulder_alignment: {
        angle_range: [160, 180],
        description: 'Shoulders should be aligned over wrists'
      }
    }
  },
  {
    id: 'tree_pose',
    name: 'Tree Pose',
    sanskrit_name: 'Vrikshasana',
    balances_dosha: ['vata'],
    benefits: ['balance', 'focus', 'grounding'],
    difficulty: 'intermediate',
    duration_seconds: 30,
    instructions: [
      'Stand in Mountain Pose',
      'Shift weight to left foot',
      'Place right foot on inner left thigh or calf (avoid knee)',
      'Press foot into leg and leg into foot',
      'Bring palms together at heart center or overhead',
      'Find a focal point and breathe steadily'
    ],
    pose_keypoints: {
      standing_leg_straight: {
        angle_range: [170, 180],
        description: 'Standing leg should be straight and strong'
      },
      lifted_leg_angle: {
        angle_range: [60, 120],
        description: 'Lifted leg should be positioned comfortably'
      }
    }
  },
  {
    id: 'cobra_pose',
    name: 'Cobra Pose',
    sanskrit_name: 'Bhujangasana',
    balances_dosha: ['kapha', 'vata'],
    benefits: ['back_strengthening', 'heart_opening', 'energizing'],
    difficulty: 'beginner',
    duration_seconds: 20,
    instructions: [
      'Lie face down with forehead on mat',
      'Place palms under shoulders',
      'Press pubic bone down and engage legs',
      'Press hands down and lift chest',
      'Keep shoulders away from ears',
      'Breathe deeply and hold'
    ],
    pose_keypoints: {
      back_extension: {
        angle_range: [15, 45],
        description: 'Gentle backbend, not too deep'
      },
      shoulder_position: {
        angle_range: [45, 90],
        description: 'Shoulders should be away from ears'
      }
    }
  }
];

export const getRecommendedAsanas = (
  dominantDosha: DoshaType, 
  goal: 'energy' | 'calm' | 'strength' | 'flexibility' = 'energy',
  difficulty: 'all' | 'beginner' | 'intermediate' | 'advanced' = 'all'
) => {
  let filtered = YOGA_ASANAS.filter(asana => 
    asana.balances_dosha.includes(dominantDosha)
  );

  if (difficulty !== 'all') {
    filtered = filtered.filter(asana => asana.difficulty === difficulty);
  }

  // Further filter by goal
  if (goal === 'calm') {
    filtered = filtered.filter(asana => 
      asana.benefits.some(benefit => 
        ['calming', 'stress_relief', 'grounding'].includes(benefit)
      )
    );
  } else if (goal === 'energy') {
    filtered = filtered.filter(asana => 
      asana.benefits.some(benefit => 
        ['energizing', 'strengthening', 'stamina'].includes(benefit)
      )
    );
  } else if (goal === 'strength') {
    filtered = filtered.filter(asana => 
      asana.benefits.some(benefit => 
        ['strengthening', 'back_strengthening'].includes(benefit)
      )
    );
  } else if (goal === 'flexibility') {
    filtered = filtered.filter(asana => 
      asana.benefits.some(benefit => 
        ['stretching', 'stretches_back'].includes(benefit)
      )
    );
  }

  return filtered.slice(0, 5); // Return top 5 recommendations
};