import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Star, Moon, Sun, RefreshCw } from 'lucide-react';
import { AstrologyAPI } from '@/utils/astrologyApi';

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
      // Use real Prokerala API for kundali generation
      const result = await AstrologyAPI.getKundali(
        profile.birth_date,
        profile.birth_time,
        profile.birth_place
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate kundali');
      }

      // Use the transformed data from the API
      setKundaliData(result.data);
      
      toast({
        title: "Kundali Generated",
        description: "Your Vedic birth chart has been created successfully.",
      });

    } catch (error: any) {
      console.error('Error generating kundali:', error);
      setError('Failed to generate kundali. Please try again.');
      toast({
        title: "Error",
        description: error.message || "Failed to generate your kundali. Please try again.",
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
                {kundaliData.planets && kundaliData.planets.map((planet, index) => (
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
                        House {planet.house} • {typeof planet.degree === 'number' ? planet.degree.toFixed(1) : planet.degree}°
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
                  {kundaliData.dasha?.current || 'Unknown Dasha'}
                </div>
                <div className="text-muted-foreground">
                  Remaining: {kundaliData.dasha?.remaining || 'Unknown'}
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
                {kundaliData.yogas && kundaliData.yogas.map((yoga, index) => (
                  <Badge key={index} className="bg-spiritual text-white">
                    {yoga}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Predictions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {kundaliData.predictions && Object.entries(kundaliData.predictions).map(([category, prediction]) => (
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