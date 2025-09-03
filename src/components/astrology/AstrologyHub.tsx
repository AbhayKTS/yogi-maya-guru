import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KundaliChart } from './KundaliChart';
import { DailyPanchang } from './DailyPanchang';
import { AstrologicalProfile } from '../onboarding/AstrologicalProfile';
import { Sparkles, Calendar, User, Star } from 'lucide-react';

export const AstrologyHub = () => {
  const { profile } = useAuth();
  const [showProfileForm, setShowProfileForm] = useState(false);

  const hasAstroProfile = profile?.birth_date && profile?.birth_time && profile?.birth_place;

  if (showProfileForm) {
    return (
      <AstrologicalProfile 
        onComplete={() => setShowProfileForm(false)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="card-spiritual">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 p-6 rounded-full bg-white/20">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Vedic Astrology Hub
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto mb-6">
            Discover cosmic insights through the ancient wisdom of Vedic astrology. 
            Generate your personalized kundali and receive daily guidance.
          </p>
          
          {!hasAstroProfile && (
            <Button
              onClick={() => setShowProfileForm(true)}
              className="btn-hero"
            >
              <User className="mr-2 h-4 w-4" />
              Complete Astrological Profile
            </Button>
          )}
        </CardContent>
      </Card>

      {hasAstroProfile ? (
        <Tabs defaultValue="kundali" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="kundali" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Birth Chart
            </TabsTrigger>
            <TabsTrigger value="panchang" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Daily Panchang
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="kundali" className="mt-6">
            <KundaliChart />
          </TabsContent>
          
          <TabsContent value="panchang" className="mt-6">
            <DailyPanchang />
          </TabsContent>
          
          <TabsContent value="profile" className="mt-6">
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle>Your Astrological Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Date of Birth
                    </label>
                    <p className="text-lg font-semibold">{profile?.birth_date}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Time of Birth
                    </label>
                    <p className="text-lg font-semibold">{profile?.birth_time}</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Place of Birth
                    </label>
                    <p className="text-lg font-semibold">{profile?.birth_place}</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button
                    onClick={() => setShowProfileForm(true)}
                    variant="outline"
                  >
                    Update Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="card-sacred">
          <CardContent className="p-8 text-center">
            <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">Complete Your Profile</h3>
            <p className="text-muted-foreground mb-6">
              Add your birth details to unlock personalized Vedic astrology insights, 
              including your kundali chart, daily panchang, and cosmic guidance.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-muted/20 rounded-lg">
                <h4 className="font-semibold mb-2">Birth Chart Generation</h4>
                <p className="text-sm text-muted-foreground">
                  Generate your complete Vedic kundali with planetary positions and yogas
                </p>
              </div>
              <div className="p-4 bg-muted/20 rounded-lg">
                <h4 className="font-semibold mb-2">Daily Panchang</h4>
                <p className="text-sm text-muted-foreground">
                  Get daily auspicious timings and cosmic influences
                </p>
              </div>
              <div className="p-4 bg-muted/20 rounded-lg">
                <h4 className="font-semibold mb-2">Personalized Insights</h4>
                <p className="text-sm text-muted-foreground">
                  Receive predictions based on your unique birth chart
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};