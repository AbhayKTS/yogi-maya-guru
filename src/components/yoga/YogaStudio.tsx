import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { useToast } from '@/hooks/use-toast';
import { YOGA_ASANAS, getRecommendedAsanas, YogaAsana } from '@/data/yogaAsanas';
import { saveYogaSession } from '@/utils/localStorage';
import { YogaQuestionnaire, YogaProfile } from './YogaQuestionnaire';
import { PersonalizedYogaCourses } from './PersonalizedYogaCourses';
import { 
  Play, 
  Pause, 
  Camera, 
  CameraOff, 
  RotateCcw, 
  Trophy,
  Timer,
  Target,
  CheckCircle2,
  Sparkles,
  User
} from 'lucide-react';
import { PoseDetector } from './PoseDetector';

type SessionGoal = 'energy' | 'calm' | 'strength' | 'flexibility';
type YogaMode = 'welcome' | 'questionnaire' | 'courses' | 'practice';

export const YogaStudio = () => {
  const [mode, setMode] = useState<YogaMode>('welcome');
  const [yogaProfile, setYogaProfile] = useState<YogaProfile | null>(null);
  const [selectedAsana, setSelectedAsana] = useState<YogaAsana | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionGoal, setSessionGoal] = useState<SessionGoal>('energy');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [showCamera, setShowCamera] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [accuracyScore, setAccuracyScore] = useState(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  
  const { profile, updateProfile, user } = useLocalAuth();
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user has completed yoga questionnaire
  useEffect(() => {
    if (profile && (profile as any).yoga_profile) {
      setYogaProfile((profile as any).yoga_profile);
      setMode('courses');
    }
  }, [profile]);

  const handleQuestionnaireComplete = (completedProfile: YogaProfile) => {
    setYogaProfile(completedProfile);
    setMode('courses');
  };

  const handleStartPractice = () => {
    setMode('practice');
  };

  const dominantDosha = (profile?.dominant_dosha || 'vata') as 'vata' | 'pitta' | 'kapha';
  const recommendedAsanas = getRecommendedAsanas(dominantDosha, sessionGoal, difficulty);

  useEffect(() => {
    if (isSessionActive && selectedAsana) {
      timerRef.current = setInterval(() => {
        setSessionTimer(prev => {
          const newTime = prev + 1;
          if (newTime >= selectedAsana.duration_seconds) {
            endSession();
            return selectedAsana.duration_seconds;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isSessionActive, selectedAsana]);

  const startSession = (asana: YogaAsana) => {
    setSelectedAsana(asana);
    setIsSessionActive(true);
    setSessionTimer(0);
    setAccuracyScore(0);
    setFeedback('');
    setIsSessionComplete(false);
    setShowCamera(true);
    
    toast({
      title: "Session Started",
      description: `Beginning ${asana.name} practice`
    });
  };

  const endSession = async () => {
    if (!selectedAsana) return;
    
    setIsSessionActive(false);
    setIsSessionComplete(true);
    
    // Calculate Sadhana Points based on duration and accuracy
    const basePoints = Math.floor(sessionTimer / 60) * 10; // 10 points per minute
    const accuracyBonus = accuracyScore > 80 ? 20 : accuracyScore > 60 ? 10 : 0;
    const totalPoints = basePoints + accuracyBonus;

    try {
      // Save yoga session locally
      if (user && profile) {
        saveYogaSession({
          user_id: user.id,
          duration: sessionTimer,
          poses_completed: 1
        });

        // Update user's total sadhana points locally
        const newTotalPoints = (profile.sadhana_points || 0) + totalPoints;
        await updateProfile({ sadhana_points: newTotalPoints });
      }

      toast({
        title: "Session Complete!",
        description: `Earned ${totalPoints} Sadhana Points`,
      });

    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const resetSession = () => {
    setSelectedAsana(null);
    setIsSessionActive(false);
    setSessionTimer(0);
    setAccuracyScore(0);
    setFeedback('');
    setIsSessionComplete(false);
    setShowCamera(false);
  };

  const handlePoseDetection = (accuracy: number, feedbackMessage: string) => {
    setAccuracyScore(accuracy);
    setFeedback(feedbackMessage);
  };

  const goalIcons = {
    energy: <Trophy className="w-4 h-4" />,
    calm: <Timer className="w-4 h-4" />,
    strength: <Target className="w-4 h-4" />,
    flexibility: <CheckCircle2 className="w-4 h-4" />
  };

  const difficultyColors = {
    beginner: 'bg-healing/10 text-healing',
    intermediate: 'bg-primary/10 text-primary',
    advanced: 'bg-destructive/10 text-destructive'
  };

  // Welcome Screen
  if (mode === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-healing-soft/20 flex items-center justify-center p-4">
        <Card className="card-sacred max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-6 p-6 rounded-full bg-gradient-to-r from-primary to-healing animate-sacred-glow">
              <User className="w-12 h-12 text-white mx-auto" />
            </div>
            <CardTitle className="text-3xl font-bold text-sacred mb-4">
              Welcome to Your AI Yoga Studio
            </CardTitle>
            <p className="text-muted-foreground leading-relaxed">
              Get personalized yoga courses tailored to your experience, goals, and physical needs. 
              Our AI will create a custom practice just for you.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/20">
                <Target className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sacred">Personalized Assessment</h4>
                  <p className="text-sm text-muted-foreground">
                    Answer questions about your experience, goals, and limitations
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/20">
                <Trophy className="w-6 h-6 text-gold mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sacred">Custom Courses</h4>
                  <p className="text-sm text-muted-foreground">
                    Get courses designed specifically for your needs and schedule
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/20">
                <Camera className="w-6 h-6 text-spiritual mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sacred">AI Pose Detection</h4>
                  <p className="text-sm text-muted-foreground">
                    Real-time feedback to perfect your alignment and form
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/20">
                <CheckCircle2 className="w-6 h-6 text-healing mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sacred">Progress Tracking</h4>
                  <p className="text-sm text-muted-foreground">
                    Earn Sadhana Points and track your spiritual journey
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <Button 
                onClick={() => setMode('questionnaire')}
                className="btn-hero text-lg px-8 py-6 w-full md:w-auto"
              >
                Start Your Assessment
                <Sparkles className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-sm text-muted-foreground">
                Takes 3-5 minutes • Create your personalized yoga journey
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Questionnaire
  if (mode === 'questionnaire') {
    return <YogaQuestionnaire onComplete={handleQuestionnaireComplete} />;
  }

  // Personalized Courses
  if (mode === 'courses' && yogaProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-healing-soft/20 p-4">
        <div className="container mx-auto max-w-6xl">
          <PersonalizedYogaCourses 
            yogaProfile={yogaProfile} 
            onStartPractice={handleStartPractice}
          />
        </div>
      </div>
    );
  }

  // Practice Mode (existing yoga studio functionality)
  if (mode === 'practice') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-healing-soft/20 p-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-sacred mb-2 font-devanagari">
              योग स्टूडियो
            </h1>
            <h2 className="text-2xl font-semibold text-wisdom mb-4">
              AI Yoga Studio
            </h2>
            <p className="text-muted-foreground">
              Personalized yoga practice with real-time AI feedback
            </p>
          </div>

          {!selectedAsana ? (
            <div className="space-y-8">
              {/* Goal and Difficulty Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="card-sacred">
                  <CardHeader>
                    <CardTitle className="text-lg">Choose Your Goal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {(['energy', 'calm', 'strength', 'flexibility'] as SessionGoal[]).map((goal) => (
                        <Button
                          key={goal}
                          variant={sessionGoal === goal ? "default" : "outline"}
                          onClick={() => setSessionGoal(goal)}
                          className="flex items-center gap-2 h-auto p-3"
                        >
                          {goalIcons[goal]}
                          <span className="capitalize">{goal}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-sacred">
                  <CardHeader>
                    <CardTitle className="text-lg">Difficulty Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                        <Button
                          key={level}
                          variant={difficulty === level ? "default" : "outline"}
                          onClick={() => setDifficulty(level)}
                          className="w-full justify-start"
                        >
                          <Badge 
                            variant="outline" 
                            className={`mr-2 ${difficultyColors[level]}`}
                          >
                            {level}
                          </Badge>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommended Asanas */}
              <div>
                <h3 className="text-xl font-semibold text-sacred mb-4">
                  Recommended for Your {dominantDosha.charAt(0).toUpperCase() + dominantDosha.slice(1)} Constitution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedAsanas.map((asana) => (
                    <Card key={asana.id} className="card-sacred hover:shadow-[var(--shadow-warm)] transition-[var(--transition-gentle)] cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant="outline" 
                            className={difficultyColors[asana.difficulty]}
                          >
                            {asana.difficulty}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {asana.duration_seconds}s
                          </span>
                        </div>
                        <CardTitle className="text-lg">{asana.name}</CardTitle>
                        <p className="text-sm text-transliteration">{asana.sanskrit_name}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-1">
                            {asana.benefits.slice(0, 3).map((benefit, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {benefit.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            <p>Instructions:</p>
                            <ul className="mt-1 space-y-1">
                              {asana.instructions.slice(0, 2).map((instruction, index) => (
                                <li key={index} className="text-xs">• {instruction}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <Button 
                            onClick={() => startSession(asana)}
                            className="w-full btn-sacred"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start Practice
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Active Session View
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Camera/Pose Detection */}
              <div className="lg:col-span-2">
                <Card className="card-sacred">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {showCamera ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                        {selectedAsana.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCamera(!showCamera)}
                        >
                          {showCamera ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetSession}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {showCamera ? (
                      <PoseDetector
                        targetAsana={selectedAsana}
                        onPoseDetected={handlePoseDetection}
                        isActive={isSessionActive}
                      />
                    ) : (
                      <div className="aspect-video bg-muted/20 rounded-lg flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <CameraOff className="w-12 h-12 text-muted-foreground mx-auto" />
                          <p className="text-muted-foreground">Camera disabled</p>
                          <Button onClick={() => setShowCamera(true)}>
                            Enable Camera for AI Feedback
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Session Info & Stats */}
              <div className="space-y-6">
                {/* Timer & Progress */}
                <Card className="card-sacred">
                  <CardHeader>
                    <CardTitle className="text-lg">Session Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {Math.floor(sessionTimer / 60)}:{(sessionTimer % 60).toString().padStart(2, '0')}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedAsana.duration_seconds - sessionTimer}s remaining
                      </p>
                    </div>
                    
                    <Progress 
                      value={(sessionTimer / selectedAsana.duration_seconds) * 100} 
                      className="h-2" 
                    />
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-healing">
                          {accuracyScore.toFixed(0)}%
                        </div>
                        <p className="text-xs text-muted-foreground">Accuracy</p>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gold">
                          {Math.floor(sessionTimer / 60) * 10}
                        </div>
                        <p className="text-xs text-muted-foreground">Points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Real-time Feedback */}
                <Card className="card-sacred">
                  <CardHeader>
                    <CardTitle className="text-lg">AI Feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/20 rounded-lg p-4 min-h-20">
                      {feedback ? (
                        <p className="text-sm leading-relaxed">{feedback}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Enable camera to receive real-time pose feedback
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Instructions */}
                <Card className="card-sacred">
                  <CardHeader>
                    <CardTitle className="text-lg">Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {selectedAsana.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary font-medium">{index + 1}.</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {!isSessionActive && !isSessionComplete && (
                    <Button 
                      onClick={() => setIsSessionActive(true)}
                      className="w-full btn-sacred"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Session
                    </Button>
                  )}
                  
                  {isSessionActive && (
                    <Button 
                      onClick={() => setIsSessionActive(false)}
                      variant="outline"
                      className="w-full"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Session
                    </Button>
                  )}
                  
                  {isSessionComplete && (
                    <div className="text-center space-y-3">
                      <div className="text-lg font-semibold text-sacred">
                        Session Complete! 🎉
                      </div>
                      <Button 
                        onClick={resetSession}
                        className="w-full btn-hero"
                      >
                        Choose Another Pose
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-healing-soft/20 flex items-center justify-center p-4">
      <Card className="card-sacred">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Loading Your Yoga Studio</h3>
          <Button onClick={() => setMode('welcome')}>
            Return to Welcome
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};