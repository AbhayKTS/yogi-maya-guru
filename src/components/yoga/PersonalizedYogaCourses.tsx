import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { YogaProfile } from './YogaQuestionnaire';
import { YogaStudio } from './YogaStudio';
import { 
  Play, 
  Clock, 
  Target, 
  Star, 
  Users, 
  Trophy,
  Calendar,
  BookOpen,
  Heart,
  Zap,
  Shield,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface PersonalizedYogaCoursesProps {
  yogaProfile: YogaProfile;
  onStartPractice: () => void;
}

interface YogaCourse {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  sessions_per_week: number;
  total_sessions: number;
  estimated_time_per_session: number;
  focus_areas: string[];
  benefits: string[];
  suitable_for: string[];
  not_suitable_for: string[];
  sessions: YogaSession[];
  is_recommended: boolean;
  popularity_score: number;
}

interface YogaSession {
  id: string;
  title: string;
  duration_minutes: number;
  focus: string;
  intensity: 'gentle' | 'moderate' | 'vigorous';
  prerequisites?: string[];
  unlocked: boolean;
}

const generatePersonalizedCourses = (profile: YogaProfile): YogaCourse[] => {
  const baseCoursesData = [
    {
      id: 'beginners-foundation',
      title: 'Yoga Foundation for Beginners',
      description: 'Build a strong foundation with basic poses, breathing techniques, and alignment principles',
      level: 'beginner' as const,
      duration_weeks: 4,
      sessions_per_week: 3,
      focus_areas: ['Basic Poses', 'Breathing', 'Alignment', 'Flexibility'],
      benefits: ['Improved flexibility', 'Stress reduction', 'Better posture', 'Mind-body connection'],
      suitable_for: ['flexibility', 'stress_relief', 'mindfulness'],
      not_suitable_for: [],
      sessions: Array.from({ length: 12 }, (_, i) => ({
        id: `bf-session-${i + 1}`,
        title: `Foundation Session ${i + 1}`,
        duration_minutes: parseInt(profile.available_time),
        focus: i < 4 ? 'Basic Poses' : i < 8 ? 'Breathing & Flow' : 'Integration',
        intensity: 'gentle' as const,
        unlocked: i === 0
      }))
    },
    {
      id: 'strength-power-flow',
      title: 'Strength & Power Flow',
      description: 'Dynamic sequences to build core strength, muscle tone, and physical power',
      level: profile.experience_level === 'beginner' ? 'intermediate' as const : 'advanced' as const,
      duration_weeks: 6,
      sessions_per_week: 4,
      focus_areas: ['Core Strength', 'Upper Body', 'Balance', 'Power Flow'],
      benefits: ['Increased strength', 'Better balance', 'Muscle definition', 'Confidence'],
      suitable_for: ['strength', 'balance', 'weight_loss'],
      not_suitable_for: ['back_issues', 'wrist_pain'],
      sessions: Array.from({ length: 24 }, (_, i) => ({
        id: `spf-session-${i + 1}`,
        title: `Power Session ${i + 1}`,
        duration_minutes: parseInt(profile.available_time),
        focus: i < 6 ? 'Foundation' : i < 12 ? 'Core Power' : i < 18 ? 'Upper Body' : 'Integration',
        intensity: 'vigorous' as const,
        unlocked: i === 0
      }))
    },
    {
      id: 'stress-relief-restoration',
      title: 'Stress Relief & Deep Restoration',
      description: 'Gentle, restorative practices focused on relaxation, stress reduction, and inner peace',
      level: 'beginner' as const,
      duration_weeks: 5,
      sessions_per_week: 3,
      focus_areas: ['Stress Relief', 'Restorative Poses', 'Meditation', 'Breathwork'],
      benefits: ['Reduced anxiety', 'Better sleep', 'Mental clarity', 'Emotional balance'],
      suitable_for: ['stress_relief', 'mindfulness'],
      not_suitable_for: [],
      sessions: Array.from({ length: 15 }, (_, i) => ({
        id: `srr-session-${i + 1}`,
        title: `Restoration Session ${i + 1}`,
        duration_minutes: parseInt(profile.available_time),
        focus: i < 5 ? 'Basic Relaxation' : i < 10 ? 'Deep Restoration' : 'Advanced Mindfulness',
        intensity: 'gentle' as const,
        unlocked: i === 0
      }))
    },
    {
      id: 'flexibility-mobility',
      title: 'Deep Flexibility & Mobility',
      description: 'Comprehensive stretching and mobility work to increase range of motion and release tension',
      level: profile.experience_level,
      duration_weeks: 6,
      sessions_per_week: 3,
      focus_areas: ['Hip Opening', 'Spinal Mobility', 'Shoulder Release', 'Deep Stretching'],
      benefits: ['Increased flexibility', 'Pain relief', 'Better movement', 'Tension release'],
      suitable_for: ['flexibility', 'stress_relief'],
      not_suitable_for: [],
      sessions: Array.from({ length: 18 }, (_, i) => ({
        id: `fm-session-${i + 1}`,
        title: `Flexibility Session ${i + 1}`,
        duration_minutes: parseInt(profile.available_time),
        focus: i < 6 ? 'Hip Opening' : i < 12 ? 'Spinal Mobility' : 'Full Body Integration',
        intensity: profile.preferred_intensity,
        unlocked: i === 0
      }))
    },
    {
      id: 'mindful-flow',
      title: 'Mindful Vinyasa Flow',
      description: 'Flowing sequences that combine movement, breath, and mindfulness for complete wellness',
      level: profile.experience_level === 'beginner' ? 'intermediate' as const : profile.experience_level,
      duration_weeks: 8,
      sessions_per_week: 3,
      focus_areas: ['Vinyasa Flow', 'Breath Awareness', 'Mindfulness', 'Transitions'],
      benefits: ['Improved coordination', 'Mental focus', 'Cardiovascular health', 'Stress reduction'],
      suitable_for: ['mindfulness', 'stress_relief', 'flexibility', 'strength'],
      not_suitable_for: [],
      sessions: Array.from({ length: 24 }, (_, i) => ({
        id: `mf-session-${i + 1}`,
        title: `Flow Session ${i + 1}`,
        duration_minutes: parseInt(profile.available_time),
        focus: i < 8 ? 'Basic Flow' : i < 16 ? 'Intermediate Flow' : 'Advanced Flow',
        intensity: profile.preferred_intensity,
        unlocked: i === 0
      }))
    }
  ];

  // Calculate recommendations based on profile
  return baseCoursesData.map(course => {
    let score = 0;
    
    // Experience level match
    if (course.level === profile.experience_level) score += 30;
    else if (Math.abs(['beginner', 'intermediate', 'advanced'].indexOf(course.level) - 
                     ['beginner', 'intermediate', 'advanced'].indexOf(profile.experience_level)) === 1) score += 15;
    
    // Goals alignment
    const goalMatches = profile.primary_goals.filter(goal => course.suitable_for.includes(goal)).length;
    score += goalMatches * 20;
    
    // Limitations check
    const hasLimitations = profile.physical_limitations.some(limitation => 
      course.not_suitable_for.includes(limitation)
    );
    if (hasLimitations) score -= 40;
    
    // Intensity preference
    const avgIntensity = course.sessions.reduce((acc, session) => {
      const intensityScore = { gentle: 1, moderate: 2, vigorous: 3 }[session.intensity];
      return acc + intensityScore;
    }, 0) / course.sessions.length;
    
    const preferredIntensityScore = { gentle: 1, moderate: 2, vigorous: 3 }[profile.preferred_intensity];
    if (Math.abs(avgIntensity - preferredIntensityScore) <= 0.5) score += 20;
    
    // Time commitment match
    const sessionTime = course.sessions[0]?.duration_minutes || 30;
    if (sessionTime <= parseInt(profile.available_time)) score += 15;
    
    return {
      ...course,
      total_sessions: course.sessions.length,
      estimated_time_per_session: parseInt(profile.available_time),
      is_recommended: score >= 50,
      popularity_score: score
    };
  }).sort((a, b) => b.popularity_score - a.popularity_score);
};

export const PersonalizedYogaCourses = ({ yogaProfile, onStartPractice }: PersonalizedYogaCoursesProps) => {
  const [courses, setCourses] = useState<YogaCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<YogaCourse | null>(null);
  const [activeTab, setActiveTab] = useState('recommended');

  useEffect(() => {
    const personalizedCourses = generatePersonalizedCourses(yogaProfile);
    setCourses(personalizedCourses);
  }, [yogaProfile]);

  const recommendedCourses = courses.filter(c => c.is_recommended);
  const allCourses = courses;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-healing/10 text-healing border-healing/20';
      case 'intermediate': return 'bg-primary/10 text-primary border-primary/20';
      case 'advanced': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  const getIntensityIcon = (intensity: string) => {
    switch (intensity) {
      case 'gentle': return <Heart className="w-4 h-4" />;
      case 'moderate': return <Target className="w-4 h-4" />;
      case 'vigorous': return <Zap className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  if (selectedCourse) {
    return (
      <div className="space-y-6">
        {/* Course Header */}
        <Card className="card-sacred">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge className={getLevelColor(selectedCourse.level)}>
                    {selectedCourse.level}
                  </Badge>
                  {selectedCourse.is_recommended && (
                    <Badge className="bg-gold/10 text-gold border-gold/20">
                      <Star className="w-3 h-3 mr-1" />
                      Recommended
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl text-sacred">
                  {selectedCourse.title}
                </CardTitle>
                <p className="text-muted-foreground">
                  {selectedCourse.description}
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setSelectedCourse(null)}
              >
                ← Back to Courses
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="card-sacred">
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-lg font-semibold">{selectedCourse.duration_weeks} weeks</div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </CardContent>
          </Card>
          
          <Card className="card-sacred">
            <CardContent className="p-4 text-center">
              <BookOpen className="w-8 h-8 text-spiritual mx-auto mb-2" />
              <div className="text-lg font-semibold">{selectedCourse.total_sessions}</div>
              <div className="text-sm text-muted-foreground">Total Sessions</div>
            </CardContent>
          </Card>
          
          <Card className="card-sacred">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-healing mx-auto mb-2" />
              <div className="text-lg font-semibold">{selectedCourse.estimated_time_per_session}min</div>
              <div className="text-sm text-muted-foreground">Per Session</div>
            </CardContent>
          </Card>
          
          <Card className="card-sacred">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-gold mx-auto mb-2" />
              <div className="text-lg font-semibold">{selectedCourse.sessions_per_week}x/week</div>
              <div className="text-sm text-muted-foreground">Frequency</div>
            </CardContent>
          </Card>
        </div>

        {/* Course Progress & Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Course Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedCourse.sessions.map((session, index) => (
                    <div key={session.id} 
                         className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                           session.unlocked 
                             ? 'bg-card hover:bg-muted/50 cursor-pointer' 
                             : 'bg-muted/20 opacity-60'
                         }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          session.unlocked 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {session.unlocked ? (
                            <Play className="w-4 h-4" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{session.title}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {session.duration_minutes}min
                            </span>
                            <span className="flex items-center gap-1">
                              {getIntensityIcon(session.intensity)}
                              {session.intensity}
                            </span>
                            <span>{session.focus}</span>
                          </div>
                        </div>
                      </div>
                      
                      {session.unlocked && (
                        <Button onClick={onStartPractice} className="btn-hero">
                          Start Session
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Course Benefits */}
            <Card className="card-golden">
              <CardHeader>
                <CardTitle className="text-secondary-foreground">
                  Course Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="text-secondary-foreground">
                <div className="space-y-2">
                  {selectedCourse.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Focus Areas */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle>Focus Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedCourse.focus_areas.map((area, index) => (
                    <Badge key={index} variant="outline">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Limitations */}
            {selectedCourse.not_suitable_for.length > 0 && (
              <Card className="card-sacred border-destructive/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Shield className="w-5 h-5" />
                    Important Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    This course may not be suitable if you have:
                  </p>
                  <div className="space-y-1">
                    {selectedCourse.not_suitable_for.map((limitation, index) => (
                      <div key={index} className="text-sm text-destructive">
                        • {limitation.replace('_', ' ')}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-sacred">Your Personalized Yoga Courses</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Based on your assessment, we've curated courses that match your goals, experience level, and preferences.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recommended">
            Recommended for You ({recommendedCourses.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Courses ({allCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="space-y-6">
          {recommendedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendedCourses.map((course) => (
                <Card key={course.id} className="card-sacred hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedCourse(course)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Badge className={getLevelColor(course.level)}>
                            {course.level}
                          </Badge>
                          <Badge className="bg-gold/10 text-gold border-gold/20">
                            <Star className="w-3 h-3 mr-1" />
                            Recommended
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                      </div>
                      <Trophy className="w-6 h-6 text-gold" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {course.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{course.duration_weeks} weeks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{course.estimated_time_per_session}min/session</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span>{course.total_sessions} sessions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{course.sessions_per_week}x/week</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium mb-2">Focus Areas:</h5>
                        <div className="flex flex-wrap gap-1">
                          {course.focus_areas.slice(0, 3).map((area, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                          {course.focus_areas.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{course.focus_areas.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Button className="w-full btn-hero">
                        Start Course
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="card-sacred">
              <CardContent className="p-8 text-center">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Recommended Courses</h3>
                <p className="text-muted-foreground">
                  We couldn't find courses perfectly matching your criteria. Check out all available courses below.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCourses.map((course) => (
              <Card key={course.id} className="card-sacred hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedCourse(course)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Badge className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                    </div>
                    {course.is_recommended && (
                      <Star className="w-5 h-5 text-gold" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {course.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{course.duration_weeks}w</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{course.estimated_time_per_session}min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>{course.total_sessions} sessions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{course.sessions_per_week}x/week</span>
                    </div>
                  </div>

                  <Button className="w-full" variant={course.is_recommended ? "default" : "outline"}>
                    View Course
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};