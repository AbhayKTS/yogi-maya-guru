import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Star, Moon, Sun, RefreshCw } from 'lucide-react';

interface KundaliData {
  planets: Array<{
    name: string;
    sign: string;
    house: number;
    degree: number;
    retrograde: boolean;
  }>;
  houses: Array<{
    number: number;
    sign: string;
    lord: string;
  }>;
  dasha: {
    current: string;
    remaining: string;
  };
  yogas: string[];
  predictions: {
    general: string;
    career: string;
    health: string;
    relationships: string;
  };
}

export const KundaliChart = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [kundaliData, setKundaliData] = useState<KundaliData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const generateKundali = async () => {
    if (!profile?.birth_date || !profile?.birth_time || !profile?.birth_place) {
      toast({
        title: "Missing Birth Details",
        description: "Please complete your astrological profile first.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // For demo purposes, we'll generate mock data
      // In production, you would integrate with a real Vedic astrology API
      const mockKundaliData: KundaliData = {
        planets: [
          { name: 'Sun', sign: 'Leo', house: 1, degree: 15.5, retrograde: false },
          { name: 'Moon', sign: 'Cancer', house: 12, degree: 8.2, retrograde: false },
          { name: 'Mars', sign: 'Aries', house: 9, degree: 22.1, retrograde: false },
          { name: 'Mercury', sign: 'Virgo', house: 2, degree: 12.8, retrograde: true },
          { name: 'Jupiter', sign: 'Sagittarius', house: 5, degree: 18.3, retrograde: false },
          { name: 'Venus', sign: 'Libra', house: 3, degree: 25.7, retrograde: false },
          { name: 'Saturn', sign: 'Capricorn', house: 6, degree: 5.4, retrograde: true },
          { name: 'Rahu', sign: 'Gemini', house: 11, degree: 14.9, retrograde: true },
          { name: 'Ketu', sign: 'Sagittarius', house: 5, degree: 14.9, retrograde: true }
        ],
        houses: [
          { number: 1, sign: 'Leo', lord: 'Sun' },
          { number: 2, sign: 'Virgo', lord: 'Mercury' },
          { number: 3, sign: 'Libra', lord: 'Venus' },
          { number: 4, sign: 'Scorpio', lord: 'Mars' },
          { number: 5, sign: 'Sagittarius', lord: 'Jupiter' },
          { number: 6, sign: 'Capricorn', lord: 'Saturn' },
          { number: 7, sign: 'Aquarius', lord: 'Saturn' },
          { number: 8, sign: 'Pisces', lord: 'Jupiter' },
          { number: 9, sign: 'Aries', lord: 'Mars' },
          { number: 10, sign: 'Taurus', lord: 'Venus' },
          { number: 11, sign: 'Gemini', lord: 'Mercury' },
          { number: 12, sign: 'Cancer', lord: 'Moon' }
        ],
        dasha: {
          current: 'Jupiter Mahadasha',
          remaining: '3 years 2 months'
        },
        yogas: [
          'Gaja Kesari Yoga',
          'Raj Yoga',
          'Dhana Yoga'
        ],
        predictions: {
          general: 'This is a favorable period for spiritual growth and learning. Your Jupiter placement brings wisdom and good fortune.',
          career: 'Strong potential for leadership roles. Mars in 9th house indicates success in fields related to education or philosophy.',
          health: 'Generally good health, but pay attention to digestive system due to Mercury retrograde in 2nd house.',
          relationships: 'Venus in Libra brings harmony in relationships. Good time for partnerships and collaborations.'
        }
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setKundaliData(mockKundaliData);
      
      toast({
        title: "Kundali Generated",
        description: "Your Vedic birth chart has been created successfully.",
      });

    } catch (error: any) {
      console.error('Error generating kundali:', error);
      setError('Failed to generate kundali. Please try again.');
      toast({
        title: "Error",
        description: "Failed to generate your kundali. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanetIcon = (planetName: string) => {
    switch (planetName) {
      case 'Sun': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'Moon': return <Moon className="w-4 h-4 text-blue-400" />;
      default: return <Star className="w-4 h-4 text-purple-400" />;
    }
  };

  if (!profile?.birth_date || !profile?.birth_time || !profile?.birth_place) {
    return (
      <Card className="card-sacred">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-spiritual" />
          <h3 className="text-xl font-bold mb-2">Complete Your Profile</h3>
          <p className="text-muted-foreground mb-6">
            Add your birth details to generate your personalized Vedic kundali chart.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="card-spiritual">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 rounded-full bg-white/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">
            Your Vedic Kundali Chart
          </CardTitle>
          <p className="text-white/90">
            Personalized birth chart based on Vedic astrology principles
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <Button
            onClick={generateKundali}
            disabled={isLoading}
            className="btn-hero"
          >
            {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Generating Kundali...' : 'Generate New Kundali'}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-center text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {kundaliData && (
        <>
          {/* Planetary Positions */}
          <Card className="card-sacred">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Planetary Positions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kundaliData.planets.map((planet, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {getPlanetIcon(planet.name)}
                      <span className="font-medium">{planet.name}</span>
                      {planet.retrograde && (
                        <Badge variant="outline" className="text-xs">R</Badge>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium text-primary">{planet.sign}</div>
                      <div className="text-muted-foreground">
                        House {planet.house} • {planet.degree.toFixed(1)}°
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Dasha */}
          <Card className="card-golden">
            <CardHeader>
              <CardTitle className="text-foreground">Current Planetary Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-primary">
                  {kundaliData.dasha.current}
                </div>
                <div className="text-muted-foreground">
                  Remaining: {kundaliData.dasha.remaining}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Yogas */}
          <Card className="card-sacred">
            <CardHeader>
              <CardTitle>Beneficial Yogas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {kundaliData.yogas.map((yoga, index) => (
                  <Badge key={index} className="bg-spiritual text-white">
                    {yoga}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Predictions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(kundaliData.predictions).map(([category, prediction]) => (
              <Card key={category} className="card-sacred">
                <CardHeader>
                  <CardTitle className="capitalize text-wisdom">
                    {category === 'general' ? 'General' : category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{prediction}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};