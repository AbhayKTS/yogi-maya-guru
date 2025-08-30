import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  Star, 
  Flame, 
  Wind, 
  Mountain,
  Clock,
  Heart,
  Lightbulb
} from 'lucide-react';
import { DOSHA_INFO } from '@/types';

const DOSHA_DAILY_TIPS = {
  vata: [
    'Start your day with warm oil massage to ground your energy',
    'Stick to regular meal times to maintain stability',
    'Practice deep breathing when feeling scattered or anxious',
    'Choose warm, cooked foods over cold and raw options',
    'Create a calming bedtime routine for better sleep'
  ],
  pitta: [
    'Avoid intense activities during peak sun hours (10 AM - 2 PM)',
    'Stay hydrated with cool (not ice-cold) water throughout the day',
    'Take breaks from decision-making to prevent overwhelm',
    'Include cooling foods like cucumber and coconut in your diet',
    'Practice patience and compassion in challenging situations'
  ],
  kapha: [
    'Start with energizing movement to kickstart your day',
    'Eat your largest meal at lunch when digestion is strongest',
    'Incorporate warming spices like ginger and black pepper',
    'Avoid afternoon naps that can increase sluggishness',
    'Try something new or challenging to stimulate growth'
  ]
};

const LUNAR_PHASES = [
  { name: 'New Moon', influence: 'Perfect time for new beginnings and setting intentions', energy: 'Introspective and planning' },
  { name: 'Waxing Moon', influence: 'Building energy supports growth and manifestation', energy: 'Active and expanding' },
  { name: 'Full Moon', influence: 'Peak energy for completion and release of what no longer serves', energy: 'Intense and transformative' },
  { name: 'Waning Moon', influence: 'Ideal for letting go, cleansing, and inner reflection', energy: 'Releasing and purifying' }
];

const DAILY_RECOMMENDATIONS = {
  vata: {
    morning: 'Gentle yoga and warm herbal tea',
    afternoon: 'Light walk and nourishing snack', 
    evening: 'Oil massage and early bedtime'
  },
  pitta: {
    morning: 'Cooling pranayama and fresh fruit',
    afternoon: 'Shaded outdoor time and coconut water',
    evening: 'Gentle movement and cooling dinner'
  },
  kapha: {
    morning: 'Vigorous exercise and warming tea',
    afternoon: 'Stimulating activities and light lunch',
    evening: 'Active hobbies and early dinner'
  }
};

export const TodayInsights = () => {
  const { profile } = useAuth();
  const dominantDosha = profile?.dominant_dosha || 'vata';
  const doshaInfo = DOSHA_INFO[dominantDosha];
  
  // Get current time info
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Simple lunar phase calculation (approximation)
  const lunarPhaseIndex = Math.floor((now.getDate() / 7)) % 4;
  const currentLunarPhase = LUNAR_PHASES[lunarPhaseIndex];
  
  // Get time-based recommendations
  const getTimeBasedRecommendation = () => {
    const recommendations = DAILY_RECOMMENDATIONS[dominantDosha];
    if (currentHour < 12) return recommendations.morning;
    if (currentHour < 17) return recommendations.afternoon;
    return recommendations.evening;
  };

  const getTimeOfDayIcon = () => {
    if (currentHour < 12) return <Sun className="w-5 h-5 text-gold" />;
    if (currentHour < 17) return <Sun className="w-5 h-5 text-primary" />;
    return <Moon className="w-5 h-5 text-spiritual" />;
  };

  const getDoshaIcon = (dosha: string) => {
    switch (dosha) {
      case 'vata': return <Wind className="w-5 h-5" />;
      case 'pitta': return <Flame className="w-5 h-5" />;
      case 'kapha': return <Mountain className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getTodaysTip = () => {
    const tips = DOSHA_DAILY_TIPS[dominantDosha];
    const dayIndex = now.getDay();
    return tips[dayIndex % tips.length];
  };

  return (
    <div className="space-y-6">
      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dosha-Based Daily Tip */}
        <Card className="card-sacred">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className={doshaInfo.color}>
                {getDoshaIcon(dominantDosha)}
              </div>
              {doshaInfo.sanskrit} Daily Guidance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sacred mb-1">Today's Focus</h4>
                    <p className="text-sm text-muted-foreground">
                      {getTodaysTip()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-wisdom">Your Constitution Qualities</h5>
                <div className="flex flex-wrap gap-2">
                  {doshaInfo.qualities.slice(0, 3).map((quality, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {quality}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Astrological Insight */}
        <Card className="card-spiritual">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent-foreground">
              <Star className="w-5 h-5" />
              Cosmic Influence
            </CardTitle>
          </CardHeader>
          <CardContent className="text-accent-foreground">
            <div className="space-y-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Moon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium mb-1">{currentLunarPhase.name}</h4>
                    <p className="text-sm opacity-90">
                      {currentLunarPhase.influence}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Today's Energy</h5>
                <Badge variant="outline" className="border-white/20 text-accent-foreground">
                  {currentLunarPhase.energy}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time-Based Recommendations */}
      <Card className="card-golden">
        <CardContent className="p-6 text-secondary-foreground">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-white/20">
              {getTimeOfDayIcon()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Right Now Recommendation
              </h3>
              <p className="text-secondary-foreground/90 mb-4">
                {getTimeBasedRecommendation()}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-white/10 px-2 py-1 rounded">
                  {currentDay}
                </span>
                <span className="bg-white/10 px-2 py-1 rounded">
                  {currentHour < 12 ? 'Morning' : currentHour < 17 ? 'Afternoon' : 'Evening'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Focus */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-sacred">
          <CardContent className="p-4 text-center">
            <Heart className="w-8 h-8 text-healing mx-auto mb-2" />
            <h4 className="font-semibold text-sacred mb-1">Wellness Focus</h4>
            <p className="text-xs text-muted-foreground">
              {dominantDosha === 'vata' 
                ? 'Stability & Grounding'
                : dominantDosha === 'pitta'
                ? 'Cooling & Patience' 
                : 'Energy & Motivation'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="card-sacred">
          <CardContent className="p-4 text-center">
            <Wind className="w-8 h-8 text-spiritual mx-auto mb-2" />
            <h4 className="font-semibold text-sacred mb-1">Breath Focus</h4>
            <p className="text-xs text-muted-foreground">
              {dominantDosha === 'vata' 
                ? 'Deep & Calming'
                : dominantDosha === 'pitta'
                ? 'Cool & Soothing' 
                : 'Energizing & Warming'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="card-sacred">
          <CardContent className="p-4 text-center">
            <Sparkles className="w-8 h-8 text-gold mx-auto mb-2" />
            <h4 className="font-semibold text-sacred mb-1">Mindset</h4>
            <p className="text-xs text-muted-foreground">
              {dominantDosha === 'vata' 
                ? 'Present & Centered'
                : dominantDosha === 'pitta'
                ? 'Peaceful & Patient' 
                : 'Active & Engaged'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};