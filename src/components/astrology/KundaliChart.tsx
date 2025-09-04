import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Star, Moon, Sun, RefreshCw } from 'lucide-react';
import { AstrologyAPI } from '@/utils/astrologyApi';

interface KundaliData {
  planets: {
    [planetName: string]: {
      name: string;
      sign: string;
      house: number;
      degree: number;
      retrograde: boolean;
      nakshatra?: string;
      position?: number;
    }
  } | Array<{
    name: string;
    sign: string;
    house: number;
    degree: number;
    retrograde: boolean;
  }>;
  houses: {
    [houseNumber: string]: {
      number: number;
      sign: string;
      lord: string;
    }
  } | Array<{
    number: number;
    sign: string;
    lord: string;
  }>;
  dasha: {
    current: {
      planet?: string;
      start?: string;
      end?: string;
      duration?: string;
    } | string;
    remaining?: string;
    upcoming?: {
      planet?: string;
      start?: string;
      end?: string;
      duration?: string;
    };
    periods?: Array<{
      planet: string;
      start?: string;
      end?: string;
      duration?: string;
    }>;
  };
  yogas: Array<{
    name: string;
    description?: string;
  }> | string[];
  birth_details?: {
    nakshatra: {
      name: string;
      lord: string;
      pada: number;
    };
    chandra_rasi: {
      name: string;
      lord: string;
    };
    soorya_rasi: {
      name: string;
      lord: string;
    };
    zodiac: string;
    additional_info?: {
      deity?: string;
      symbol?: string;
      animal_sign?: string;
      [key: string]: any;
    };
  };
  mangal_dosha?: {
    has_dosha: boolean;
    description: string;
  };
  predictions: {
    general: string;
    career: string;
    health: string;
    relationships: string;
    nakshatra?: {
      name: string;
      lord: string;
      pada: number;
      deity: string;
      symbol: string;
      animal_sign: string;
    };
    rasi?: {
      chandra: string;
      soorya: string;
      zodiac: string;
    };
    mangal_dosha?: {
      has_dosha: boolean;
      description: string;
    };
  };
  chart?: any;
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

    console.log('=== FRONTEND: GENERATING KUNDALI ===');
    setIsLoading(true);
    setError('');

    try {
      console.log('Generating kundali with details:', {
        date: profile.birth_date,
        time: profile.birth_time,
        place: profile.birth_place
      });

      // Use real Prokerala API for kundali generation
      const result = await AstrologyAPI.getKundali(
        profile.birth_date,
        profile.birth_time,
        profile.birth_place
      );

      console.log('=== KUNDALI API RESPONSE RECEIVED ===');
      console.log('Success status:', result.success);
      console.log('Has data:', !!result.data);

      if (!result.success) {
        console.error('Kundali API returned failure:', result.error);
        throw new Error(result.error || 'Failed to generate kundali');
      }

      if (!result.data) {
        console.error('Kundali API success but no data returned');
        throw new Error('No kundali data received from server');
      }

      // COMPREHENSIVE KUNDALI DATA VALIDATION
      const data = result.data;
      console.log('=== VALIDATING KUNDALI DATA ===');
      console.log('Data keys present:', Object.keys(data));
      console.log('Has planets:', !!data.planets, 'Type:', typeof data.planets);
      console.log('Has birth_details:', !!data.birth_details);
      console.log('Has mangal_dosha:', !!data.mangal_dosha);
      console.log('Has yogas:', !!data.yogas, 'Length:', Array.isArray(data.yogas) ? data.yogas.length : 'Not array');
      console.log('Has predictions:', !!data.predictions);

      // Check for critical kundali data
      const criticalKundaliFields = [
        { key: 'birth_details.nakshatra.name', value: data.birth_details?.nakshatra?.name },
        { key: 'birth_details.chandra_rasi.name', value: data.birth_details?.chandra_rasi?.name },
        { key: 'mangal_dosha.has_dosha', value: data.mangal_dosha?.has_dosha !== undefined },
        { key: 'predictions.general', value: data.predictions?.general }
      ];

      const missingKundaliData = criticalKundaliFields.filter(field => {
        if (field.key === 'mangal_dosha.has_dosha') {
          return !field.value; // Boolean check
        }
        return !field.value || field.value === 'Unknown' || field.value === 'N/A';
      });

      if (missingKundaliData.length > 0) {
        console.warn('=== SOME KUNDALI DATA MISSING ===');
        missingKundaliData.forEach(field => {
          console.warn(`Missing: ${field.key}`);
        });
        setError('Some kundali details may be incomplete.');
      } else {
        console.log('=== ALL CRITICAL KUNDALI DATA PRESENT ===');
      }

      // Use the transformed data from the API
      setKundaliData(data);
      console.log('=== KUNDALI DATA STORED SUCCESSFULLY ===');
      
      toast({
        title: "Kundali Generated Successfully",
        description: missingKundaliData.length > 0 
          ? "Your Vedic birth chart has been created with available data."
          : "Your Vedic birth chart has been created with complete planetary positions.",
      });

    } catch (error: any) {
      console.error('=== KUNDALI GENERATION ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      
      const errorMessage = error.message || 'Failed to generate kundali';
      setError(`Unable to generate kundali: ${errorMessage}`);
      
      toast({
        title: "Unable to Generate Kundali",
        description: "Please check your internet connection and try again. If the problem persists, the astrology service may be temporarily unavailable.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      console.log('=== KUNDALI GENERATION COMPLETE ===');
    }
  };

  const getPlanetIcon = (planetName: string) => {
    switch (planetName) {
      case 'Sun': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'Moon': return <Moon className="w-4 h-4 text-blue-400" />;
      default: return <Star className="w-4 h-4 text-purple-400" />;
    }
  };

  // Helper function to normalize planet data
  const getPlanetsArray = (planets: any) => {
    if (!planets) return [];
    
    if (Array.isArray(planets)) {
      return planets.filter(planet => planet && typeof planet === 'object');
    } else if (typeof planets === 'object' && planets !== null) {
      return Object.entries(planets).map(([name, data]: [string, any]) => ({
        name,
        ...data
      })).filter(planet => planet && typeof planet === 'object');
    }
    return [];
  };

  // Helper function to normalize yoga data
  const getYogasArray = (yogas: any) => {
    if (!yogas) return [];
    
    if (Array.isArray(yogas)) {
      return yogas.map(yoga => 
        typeof yoga === 'string' ? { name: yoga, description: '' } : yoga
      );
    }
    return [];
  };

  // Helper function to get current dasha information
  const getCurrentDasha = (dasha: any) => {
    if (!dasha) return { planet: 'Unknown', remaining: 'Unknown' };
    
    if (typeof dasha?.current === 'object' && dasha.current) {
      return {
        planet: dasha.current.planet || 'Unknown',
        remaining: dasha.current.duration || 'Unknown'
      };
    }
    return {
      planet: dasha?.current || 'Unknown Dasha',
      remaining: dasha?.remaining || 'Unknown'
    };
  };

  // Helper function to safely get nested values
  const safeGet = (obj: any, path: string, defaultValue: any = 'Unknown') => {
    try {
      return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
    } catch {
      return defaultValue;
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
                {getPlanetsArray(kundaliData.planets).map((planet: any, index: number) => {
                  if (!planet || typeof planet !== 'object') return null;
                  
                  return (
                    <div
                      key={planet.name || index}
                      className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        {getPlanetIcon(planet.name || 'Unknown')}
                        <span className="font-medium">{planet.name || 'Unknown Planet'}</span>
                        {(planet.retrograde || planet.is_retrograde) && (
                          <Badge variant="outline" className="text-xs">R</Badge>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium text-primary">
                          {planet.sign || planet.rasi?.name || safeGet(planet, 'rasi_lord', 'Unknown Sign')}
                        </div>
                        <div className="text-muted-foreground">
                          House {planet.house || planet.position || 1} • {
                            typeof planet.degree === 'number' 
                              ? planet.degree.toFixed(1) 
                              : (parseFloat(planet.degree || '0') || 0).toFixed(1)
                          }°
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {safeGet(planet, 'longitude', 0) ? `Long: ${parseFloat(safeGet(planet, 'longitude', 0)).toFixed(1)}°` : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {getPlanetsArray(kundaliData.planets).length === 0 && (
                  <div className="col-span-full text-center text-muted-foreground">
                    <p>No planetary positions available. Try regenerating your kundali.</p>
                  </div>
                )}
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
                  {getCurrentDasha(kundaliData.dasha).planet} Dasha
                </div>
                <div className="text-muted-foreground">
                  Duration: {getCurrentDasha(kundaliData.dasha).remaining}
                </div>
                {kundaliData.dasha?.periods && kundaliData.dasha.periods.length > 0 && (
                  <div className="mt-4 text-sm">
                    <h4 className="font-semibold mb-2">Upcoming Periods:</h4>
                    <div className="space-y-1">
                      {kundaliData.dasha.periods.slice(1, 3).map((period: any, index: number) => (
                        <div key={index} className="text-muted-foreground">
                          {period.planet}: {period.duration}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Birth Details */}
          {kundaliData.birth_details?.nakshatra && (
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle>Birth Star Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-wisdom mb-2">Nakshatra</h4>
                    <p className="text-sm">
                      <span className="font-medium">{kundaliData.birth_details.nakshatra.name || 'Unknown'}</span>
                      {kundaliData.birth_details.nakshatra.pada && (
                        <>
                          {' (Pada '}
                          {kundaliData.birth_details.nakshatra.pada}
                          {')'}
                        </>
                      )}
                    </p>
                    {kundaliData.birth_details.nakshatra.lord && (
                      <p className="text-xs text-muted-foreground">
                        Lord: {kundaliData.birth_details.nakshatra.lord}
                      </p>
                    )}
                    {kundaliData.birth_details.additional_info?.deity && (
                      <p className="text-xs text-muted-foreground">
                        Deity: {kundaliData.birth_details.additional_info.deity}
                      </p>
                    )}
                    {kundaliData.birth_details.additional_info?.symbol && (
                      <p className="text-xs text-muted-foreground">
                        Symbol: {kundaliData.birth_details.additional_info.symbol}
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-wisdom mb-2">Rasi Details</h4>
                    {kundaliData.birth_details.chandra_rasi && (
                      <p className="text-sm">
                        Chandra Rasi: <span className="font-medium">{kundaliData.birth_details.chandra_rasi.name}</span>
                        {kundaliData.birth_details.chandra_rasi.lord && (
                          <span className="text-xs text-muted-foreground block">
                            Lord: {kundaliData.birth_details.chandra_rasi.lord}
                          </span>
                        )}
                      </p>
                    )}
                    {kundaliData.birth_details.soorya_rasi && (
                      <p className="text-sm mt-2">
                        Soorya Rasi: <span className="font-medium">{kundaliData.birth_details.soorya_rasi.name}</span>
                        {kundaliData.birth_details.soorya_rasi.lord && (
                          <span className="text-xs text-muted-foreground block">
                            Lord: {kundaliData.birth_details.soorya_rasi.lord}
                          </span>
                        )}
                      </p>
                    )}
                    {kundaliData.birth_details.zodiac && (
                      <p className="text-sm mt-2">
                        Zodiac: <span className="font-medium">{kundaliData.birth_details.zodiac}</span>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mangal Dosha */}
          {kundaliData.mangal_dosha && (
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle>Mangal Dosha Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    variant={kundaliData.mangal_dosha.has_dosha ? "destructive" : "outline"}
                  >
                    {kundaliData.mangal_dosha.has_dosha ? "Has Mangal Dosha" : "No Mangal Dosha"}
                  </Badge>
                </div>
                {kundaliData.mangal_dosha.description && (
                  <p className="text-sm text-muted-foreground">
                    {kundaliData.mangal_dosha.description}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Yogas */}
          <Card className="card-sacred">
            <CardHeader>
              <CardTitle>Beneficial Yogas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getYogasArray(kundaliData.yogas).map((yoga: any, index: number) => (
                  <div key={index} className="border-l-4 border-spiritual pl-4">
                    <div className="font-medium text-spiritual">
                      {yoga.name || yoga}
                    </div>
                    {yoga.description && (
                      <div className="text-sm text-muted-foreground">
                        {yoga.description}
                      </div>
                    )}
                  </div>
                ))}
                {getYogasArray(kundaliData.yogas).length === 0 && (
                  <p className="text-muted-foreground text-sm">No specific yogas found in current analysis.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Predictions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {kundaliData.predictions && Object.entries(kundaliData.predictions)
              .filter(([category, prediction]) => 
                typeof prediction === 'string' && 
                prediction && 
                ['general', 'career', 'health', 'relationships'].includes(category)
              )
              .map(([category, prediction]) => (
                <Card key={category} className="card-sacred">
                  <CardHeader>
                    <CardTitle className="capitalize text-wisdom">
                      {category === 'general' ? 'General' : category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{prediction as string}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </>
      )}
    </div>
  );
};