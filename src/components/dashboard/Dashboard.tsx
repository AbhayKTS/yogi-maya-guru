import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardHeader } from './DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Flame, 
  Wind, 
  Mountain, 
  Sparkles, 
  BookOpen, 
  Dumbbell,
  Heart,
  Sunrise,
  Moon,
  TrendingUp,
  Stars
} from 'lucide-react';
import { DOSHA_INFO, RANK_INFO } from '@/types';
import { DailyWisdomPage } from '@/components/wisdom/DailyWisdomPage';
import { NutritionGuide } from '@/components/nutrition/NutritionGuide';
import { PranayamaHub } from '@/components/meditation/PranayamaHub';
import { YogaStudio } from '@/components/yoga/YogaStudio';
import { TodayInsights } from '@/components/insights/TodayInsights';
import { AstrologyHub } from '@/components/astrology/AstrologyHub';
import heroTemple from '@/assets/hero-temple.jpg';

type DashboardView = 'home' | 'wisdom' | 'yoga' | 'nutrition' | 'pranayama' | 'insights' | 'ranks' | 'astrology';

export const Dashboard = () => {
  const { profile } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('home');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Handle different view states
  const renderViewContent = () => {
    const backButton = (
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => setCurrentView('home')}
          variant="outline"
          className="bg-card/80 backdrop-blur-sm"
        >
          ← Back to Dashboard
        </Button>
      </div>
    );

    switch (currentView) {
      case 'wisdom':
        return (
          <div>
            <DashboardHeader />
            <DailyWisdomPage />
            {backButton}
          </div>
        );
      case 'yoga':
        return (
          <div>
            <DashboardHeader />
            <main className="container mx-auto px-4 py-8">
              <YogaStudio />
            </main>
            {backButton}
          </div>
        );
      case 'nutrition':
        return (
          <div>
            <DashboardHeader />
            <main className="container mx-auto px-4 py-8">
              <NutritionGuide />
            </main>
            {backButton}
          </div>
        );
      case 'pranayama':
        return (
          <div>
            <DashboardHeader />
            <main className="container mx-auto px-4 py-8">
              <PranayamaHub />
            </main>
            {backButton}
          </div>
        );
      case 'insights':
        return (
          <div>
            <DashboardHeader />
            <main className="container mx-auto px-4 py-8">
              <TodayInsights />
            </main>
            {backButton}
          </div>
        );
      case 'ranks':
        return (
          <div>
            <DashboardHeader />
            <main className="container mx-auto px-4 py-8">
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h1 className="text-3xl font-bold text-sacred">
                    Spiritual Rank System
                  </h1>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Progress through sacred ranks by earning Sadhana Points through dedicated practice
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(RANK_INFO).map(([key, rank]) => (
                    <Card 
                      key={key} 
                      className={`card-sacred ${profile?.current_rank === key ? 'ring-2 ring-primary' : ''}`}
                    >
                      <CardContent className="p-6 text-center space-y-4">
                        <div className="text-3xl font-devanagari text-primary">
                          {rank.sanskrit}
                        </div>
                        <div className="text-xl font-bold text-sacred">
                          {rank.title}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {rank.description}
                        </p>
                        <div className="text-sm">
                          <span className="font-semibold">Required: </span>
                          <span className="text-primary">{rank.pointsRequired} SP</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {rank.unlocks}
                        </p>
                        {profile?.current_rank === key && (
                          <Badge className="bg-primary text-primary-foreground">
                            Current Rank
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </main>
            {backButton}
          </div>
        );
      case 'astrology':
        return (
          <div>
            <DashboardHeader />
            <main className="container mx-auto px-4 py-8">
              <AstrologyHub />
            </main>
            {backButton}
          </div>
        );
      default:
        return null;
    }
  };

  if (currentView !== 'home') {
    return renderViewContent();
  }

  const dominantDosha = profile?.dominant_dosha;
  const doshaInfo = dominantDosha ? DOSHA_INFO[dominantDosha] : null;
  const currentRank = profile?.current_rank || 'padatik';
  const rankInfo = RANK_INFO[currentRank];
  
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getDoshaIcon = (dosha: string) => {
    switch (dosha) {
      case 'vata': return <Wind className="w-6 h-6" />;
      case 'pitta': return <Flame className="w-6 h-6" />;
      case 'kapha': return <Mountain className="w-6 h-6" />;
      default: return <Sparkles className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-healing-soft/20">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative mb-8 rounded-3xl overflow-hidden">
          <img 
            src={heroTemple} 
            alt="Sacred Temple" 
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-start p-8">
            <div className="text-white">
              <h1 className="text-4xl font-bold mb-2">
                {getGreeting()}, {profile?.username || 'Seeker'}
              </h1>
              <p className="text-xl opacity-90 mb-4">
                Welcome to your sacred wellness journey
              </p>
              {dominantDosha && doshaInfo && (
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 w-fit">
                  <div className={doshaInfo.color}>
                    {getDoshaIcon(dominantDosha)}
                  </div>
                  <span className="font-semibold">
                    Your constitution: {doshaInfo.sanskrit} ({dominantDosha.charAt(0).toUpperCase() + dominantDosha.slice(1)})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-sacred">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sadhana Points</p>
                  <p className="text-2xl font-bold text-sacred">{profile?.sadhana_points || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-sacred">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-gold/10">
                  <Flame className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Login Streak</p>
                  <p className="text-2xl font-bold text-sacred">{profile?.login_streak || 0} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-sacred">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-spiritual/10">
                  <Sparkles className="w-6 h-6 text-spiritual" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Rank</p>
                  <p className="text-lg font-bold text-wisdom">{rankInfo.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-sacred">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-healing/10">
                  <Heart className="w-6 h-6 text-healing" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wellness Score</p>
                  <p className="text-2xl font-bold text-healing">85%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Insights Preview */}
        <Card 
          className="card-spiritual cursor-pointer hover:shadow-lg transition-all mb-8"
          onClick={() => setCurrentView('insights')}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-white/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-white">
                  Today's Sacred Insights
                </h3>
                <p className="text-white/90 mb-4">
                  {dominantDosha 
                    ? `Personalized guidance based on your ${dominantDosha} constitution and cosmic influences`
                    : 'Discover personalized wellness guidance based on your unique constitution and cosmic influences'
                  }
                </p>
                <Button 
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                >
                  View All Insights →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Today's Recommendations */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sunrise className="w-5 h-5 text-primary" />
                  Today's Personalized Routine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dominantDosha && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-semibold text-wisdom mb-2">
                      Balancing Your {doshaInfo?.sanskrit} Constitution
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {doshaInfo?.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {doshaInfo?.qualities.map((quality, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {quality}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2"
                    onClick={() => setCurrentView('yoga')}
                  >
                    <Dumbbell className="w-5 h-5 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">AI Yoga Studio</div>
                      <div className="text-xs text-muted-foreground">Pose detection</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2"
                    onClick={() => setCurrentView('pranayama')}
                  >
                    <Wind className="w-5 h-5 text-spiritual" />
                    <div className="text-left">
                      <div className="font-semibold">Pranayama</div>
                      <div className="text-xs text-muted-foreground">10 min breathing</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2"
                    onClick={() => setCurrentView('nutrition')}
                  >
                    <Heart className="w-5 h-5 text-healing" />
                    <div className="text-left">
                      <div className="font-semibold">Nutrition</div>
                      <div className="text-xs text-muted-foreground">Dosha diet plan</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2"
                    onClick={() => setCurrentView('astrology')}
                  >
                    <Stars className="w-5 h-5 text-wisdom" />
                    <div className="text-left">
                      <div className="font-semibold">Astrology</div>
                      <div className="text-xs text-muted-foreground">Vedic insights</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Daily Wisdom Preview */}
            <Card className="card-golden cursor-pointer hover:shadow-[var(--shadow-golden)] transition-[var(--transition-sacred)]"
                  onClick={() => setCurrentView('wisdom')}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/20">
                    <BookOpen className="w-8 h-8 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Today's Sacred Wisdom
                    </h3>
                    <p className="text-foreground/80 mb-4">
                      "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions..."
                    </p>
                    <Button variant="outline" className="bg-primary/10 border-primary/20 text-foreground hover:bg-primary/20">
                      Read Full Wisdom →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Progress & Quick Actions */}
          <div className="space-y-6">
            {/* Rank Progress */}
            <Card 
              className="card-sacred cursor-pointer hover:shadow-lg transition-all"
              onClick={() => setCurrentView('ranks')}
            >
              <CardHeader>
                <CardTitle className="text-center">Your Spiritual Rank</CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-center space-y-4">
                <div className="text-4xl font-devanagari text-primary">
                  {rankInfo.sanskrit}
                </div>
                <div className="text-xl font-bold text-sacred">
                  {rankInfo.title}
                </div>
                <div className="text-sm text-muted-foreground">
                  {rankInfo.description}
                </div>
                
                {/* Progress to next rank */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to next rank</span>
                    <span>{profile?.sadhana_points || 0} / 1000 SP</span>
                  </div>
                  <Progress value={((profile?.sadhana_points || 0) / 1000) * 100} />
                </div>
                
                <p className="text-xs text-muted-foreground mt-2">
                  Click to view all ranks →
                </p>
              </CardContent>
            </Card>

            {/* Quick Meditation */}
            <Card className="card-spiritual">
              <CardContent className="p-6 text-center">
                <Moon className="w-12 h-12 mx-auto mb-4 text-white" />
                <h3 className="text-lg font-semibold mb-2 text-white">Quick Meditation</h3>
                <p className="text-sm text-white/90 mb-4">
                  Take 5 minutes to center yourself
                </p>
                <Button 
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                  onClick={() => setCurrentView('pranayama')}
                >
                  Start Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};