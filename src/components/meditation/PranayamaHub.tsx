import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Wind, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Timer,
  Flame,
  Mountain,
  Moon,
  Sun,
  Heart
} from 'lucide-react';
import { DOSHA_INFO } from '@/types';

const PRANAYAMA_TECHNIQUES = {
  vata: [
    {
      name: 'Nadi Shodhana',
      sanskrit: 'नाडी शोधन',
      duration: 300, // 5 minutes
      description: 'Alternate nostril breathing to balance the nervous system',
      benefits: ['Calms anxiety', 'Balances nervous system', 'Improves focus'],
      instructions: [
        'Sit comfortably with spine straight',
        'Use right thumb to close right nostril',
        'Inhale through left nostril for 4 counts',
        'Close left nostril with ring finger',
        'Release thumb and exhale right for 4 counts',
        'Inhale right for 4 counts',
        'Close right nostril, release left',
        'Exhale left for 4 counts'
      ],
      icon: Wind,
      color: 'text-primary'
    },
    {
      name: 'Ujjayi Pranayama',
      sanskrit: 'उज्जायी प्राणायाम',
      duration: 480, // 8 minutes
      description: 'Ocean breath for deep relaxation and grounding',
      benefits: ['Reduces stress', 'Calms mind', 'Generates internal heat'],
      instructions: [
        'Sit or lie down comfortably',
        'Breathe through nose only',
        'Constrict throat slightly',
        'Create soft "ocean" sound',
        'Inhale for 4-6 counts',
        'Exhale for 4-6 counts',
        'Maintain steady rhythm'
      ],
      icon: Moon,
      color: 'text-healing'
    }
  ],
  pitta: [
    {
      name: 'Sheetali Pranayama',
      sanskrit: 'शीतली प्राणायाम',
      duration: 360, // 6 minutes
      description: 'Cooling breath to reduce internal heat and anger',
      benefits: ['Cools body and mind', 'Reduces anger', 'Calms pitta dosha'],
      instructions: [
        'Sit comfortably with eyes closed',
        'Curl tongue into tube shape',
        'Inhale slowly through curled tongue',
        'Close mouth and retain breath briefly',
        'Exhale slowly through nose',
        'Feel cooling sensation throughout body'
      ],
      icon: Wind,
      color: 'text-spiritual'
    },
    {
      name: 'Chandra Bhedana',
      sanskrit: 'चन्द्र भेदन',
      duration: 420, // 7 minutes
      description: 'Left nostril breathing for lunar cooling energy',
      benefits: ['Activates parasympathetic nervous system', 'Cools body', 'Promotes rest'],
      instructions: [
        'Use right thumb to close right nostril',
        'Breathe only through left nostril',
        'Inhale for 4 counts through left',
        'Close both nostrils briefly',
        'Exhale through left for 6-8 counts',
        'Continue this pattern rhythmically'
      ],
      icon: Moon,
      color: 'text-primary'
    }
  ],
  kapha: [
    {
      name: 'Bhastrika Pranayama',
      sanskrit: 'भस्त्रिका प्राणायाम',
      duration: 300, // 5 minutes
      description: 'Bellows breath to generate heat and energy',
      benefits: ['Increases metabolism', 'Energizes body', 'Clears congestion'],
      instructions: [
        'Sit with straight spine',
        'Take 5 normal breaths first',
        'Inhale forcefully through nose',
        'Exhale forcefully through nose',
        'Continue rapid breathing for 10 breaths',
        'Take normal breath and rest',
        'Repeat 3-5 cycles'
      ],
      icon: Flame,
      color: 'text-gold'
    },
    {
      name: 'Surya Bhedana',
      sanskrit: 'सूर्य भेदन',
      duration: 360, // 6 minutes
      description: 'Right nostril breathing for solar energizing',
      benefits: ['Increases body heat', 'Boosts energy', 'Activates sympathetic nervous system'],
      instructions: [
        'Close left nostril with ring finger',
        'Breathe only through right nostril',
        'Inhale through right for 4 counts',
        'Close both nostrils briefly',
        'Exhale through right for 6 counts',
        'Feel warming energy throughout body'
      ],
      icon: Sun,
      color: 'text-healing'
    }
  ]
};

const MEDITATION_SESSIONS = [
  {
    name: 'Loving Kindness',
    duration: 600, // 10 minutes
    description: 'Cultivate compassion and love for self and others',
    icon: Heart,
    color: 'text-healing'
  },
  {
    name: 'Body Scan',
    duration: 900, // 15 minutes
    description: 'Progressive relaxation through body awareness',
    icon: Wind,
    color: 'text-spiritual'
  },
  {
    name: 'Mantra Meditation',
    duration: 1200, // 20 minutes
    description: 'Focus the mind using sacred sound vibrations',
    icon: Sun,
    color: 'text-gold'
  }
];

export const PranayamaHub = () => {
  const { profile } = useAuth();
  const [activeSession, setActiveSession] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionType, setSessionType] = useState<'pranayama' | 'meditation'>('pranayama');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const dominantDosha = profile?.dominant_dosha || 'vata';
  const doshaInfo = DOSHA_INFO[dominantDosha];
  const techniques = PRANAYAMA_TECHNIQUES[dominantDosha];

  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            setCurrentRound(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, timeRemaining]);

  const startSession = (technique: any, type: 'pranayama' | 'meditation' = 'pranayama') => {
    setActiveSession(technique);
    setSessionType(type);
    setTimeRemaining(technique.duration);
    setCurrentRound(0);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const resetSession = () => {
    setIsPlaying(false);
    if (activeSession) {
      setTimeRemaining(activeSession.duration);
    }
    setCurrentRound(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!activeSession) return 0;
    return ((activeSession.duration - timeRemaining) / activeSession.duration) * 100;
  };

  if (activeSession) {
    const IconComponent = activeSession.icon;
    
    return (
      <div className="space-y-6">
        <Card className="card-sacred">
          <CardHeader className="text-center">
            <div className={`mx-auto mb-4 p-6 rounded-full bg-primary/10`}>
              <IconComponent className={`w-12 h-12 ${activeSession.color}`} />
            </div>
            <CardTitle className="text-2xl text-sacred">
              {activeSession.name}
            </CardTitle>
            <p className="text-muted-foreground">
              {sessionType === 'pranayama' ? activeSession.sanskrit : activeSession.description}
            </p>
          </CardHeader>
        </Card>

        {/* Timer Display */}
        <Card className="card-golden">
          <CardContent className="p-8 text-center text-secondary-foreground">
            <div className="text-6xl font-mono mb-4">
              {formatTime(timeRemaining)}
            </div>
            <Progress 
              value={getProgressPercentage()} 
              className="mb-6 h-2"
            />
            <div className="flex justify-center gap-4 mb-6">
              <Button
                onClick={togglePlayPause}
                size="lg"
                className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/30 text-secondary-foreground"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
              <Button
                onClick={resetSession}
                size="lg"
                variant="outline"
                className="rounded-full w-16 h-16 bg-white/10 border-white/20 text-secondary-foreground hover:bg-white/20"
              >
                <RotateCcw className="w-6 h-6" />
              </Button>
              <Button
                onClick={() => setIsMuted(!isMuted)}
                size="lg"
                variant="outline"
                className="rounded-full w-16 h-16 bg-white/10 border-white/20 text-secondary-foreground hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        {sessionType === 'pranayama' && (
          <Card className="card-sacred">
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeSession.instructions.map((instruction: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-primary">{index + 1}</span>
                    </div>
                    <p className="text-sm">{instruction}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => setActiveSession(null)}
            className="flex-1"
          >
            ← Back to Hub
          </Button>
          <Button 
            className="flex-1 btn-hero"
            onClick={() => {
              // Could integrate with progress tracking
              setActiveSession(null);
            }}
          >
            Complete Session
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className={`p-3 rounded-full ${doshaInfo.color}`}>
            <Wind className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-sacred">
            Pranayama & Meditation Hub
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Breathwork and meditation practices tailored for your {dominantDosha} constitution
        </p>
      </div>

      {/* Tabs for Pranayama and Meditation */}
      <div className="flex gap-4 justify-center">
        <Button
          variant={sessionType === 'pranayama' ? 'default' : 'outline'}
          onClick={() => setSessionType('pranayama')}
          className="flex items-center gap-2"
        >
          <Wind className="w-4 h-4" />
          Pranayama
        </Button>
        <Button
          variant={sessionType === 'meditation' ? 'default' : 'outline'}
          onClick={() => setSessionType('meditation')}
          className="flex items-center gap-2"
        >
          <Moon className="w-4 h-4" />
          Meditation
        </Button>
      </div>

      {/* Techniques Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessionType === 'pranayama' 
          ? techniques.map((technique, index) => {
              const IconComponent = technique.icon;
              return (
                <Card 
                  key={index} 
                  className="card-sacred cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                  onClick={() => startSession(technique, 'pranayama')}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4`}>
                      <IconComponent className={`w-6 h-6 ${technique.color}`} />
                    </div>
                    <CardTitle className="flex items-center justify-between">
                      {technique.name}
                      <Badge variant="outline" className="text-xs">
                        <Timer className="w-3 h-3 mr-1" />
                        {Math.round(technique.duration / 60)}min
                      </Badge>
                    </CardTitle>
                    <p className="text-sm font-devanagari text-spiritual">
                      {technique.sanskrit}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {technique.description}
                    </p>
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Benefits:</h5>
                      <div className="flex flex-wrap gap-1">
                        {technique.benefits.map((benefit, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          : MEDITATION_SESSIONS.map((session, index) => {
              const IconComponent = session.icon;
              return (
                <Card 
                  key={index} 
                  className="card-sacred cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                  onClick={() => startSession(session, 'meditation')}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4`}>
                      <IconComponent className={`w-6 h-6 ${session.color}`} />
                    </div>
                    <CardTitle className="flex items-center justify-between">
                      {session.name}
                      <Badge variant="outline" className="text-xs">
                        <Timer className="w-3 h-3 mr-1" />
                        {Math.round(session.duration / 60)}min
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {session.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })
        }
      </div>

      {/* Daily Recommendation */}
      <Card className="card-golden">
        <CardContent className="p-6 text-secondary-foreground">
          <h3 className="text-lg font-semibold mb-2">
            Today's Recommendation for {doshaInfo.sanskrit}
          </h3>
          <p className="text-secondary-foreground/80 mb-4">
            {dominantDosha === 'vata' 
              ? 'Focus on calming and grounding breathwork to balance your naturally active energy.'
              : dominantDosha === 'pitta'
              ? 'Practice cooling pranayama to reduce internal heat and maintain mental clarity.'
              : 'Energizing breathwork will help stimulate your metabolism and clear any stagnation.'
            }
          </p>
          <Button 
            variant="outline" 
            className="bg-white/10 border-white/20 text-secondary-foreground hover:bg-white/20"
            onClick={() => startSession(techniques[0], 'pranayama')}
          >
            Start Recommended Practice
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};