import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Sun, Moon, Star, Clock, RefreshCw } from 'lucide-react';
import { AstrologyAPI } from '@/utils/astrologyApi';
import { useToast } from '@/hooks/use-toast';

interface PanchangData {
  date: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  tithi: {
    name: string;
    paksha?: string;
    endTime: string;
  };
  nakshatra: {
    name: string;
    lord: string;
    endTime: string;
  };
  yoga: {
    name: string;
    endTime: string;
  };
  karana: {
    name: string;
    endTime: string;
  };
  auspiciousTimes: {
    abhijitMuhurta: string;
    brahmaMuhurta: string;
    godhuliBela: string;
  };
  inauspiciousTimes: {
    rahukaal: string;
    yamaghanta: string;
    gulikai: string;
  };
  recommendations: string[];
  data_status?: 'COMPLETE' | 'INCOMPLETE';
}

export const DailyPanchang = () => {
  const [panchangData, setPanchangData] = useState<PanchangData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  const fetchPanchangData = async () => {
    console.log('=== FRONTEND: FETCHING PANCHANG DATA ===');
    setIsLoading(true);
    setError('');

    try {
      console.log('Calling AstrologyAPI.getPanchang()...');
      const result = await AstrologyAPI.getPanchang();
      
      console.log('=== PANCHANG API RESPONSE RECEIVED ===');
      console.log('Success status:', result.success);
      console.log('Has data:', !!result.data);
      
      if (!result.success) {
        console.error('API returned failure:', result.error);
        throw new Error(result.error || 'Failed to fetch panchang data');
      }

      if (!result.data) {
        console.error('API success but no data returned');
        throw new Error('No panchang data received from server');
      }

      // COMPREHENSIVE DATA VALIDATION
      const data = result.data;
      console.log('=== VALIDATING PANCHANG DATA ===');
      console.log('Data keys present:', Object.keys(data));
      console.log('Sunrise value:', data.sunrise, 'Type:', typeof data.sunrise);
      console.log('Sunset value:', data.sunset, 'Type:', typeof data.sunset);
      console.log('Tithi name:', data.tithi?.name, 'Type:', typeof data.tithi?.name);
      console.log('Nakshatra name:', data.nakshatra?.name, 'Type:', typeof data.nakshatra?.name);
      console.log('Data status:', data.data_status);

      // Check for invalid time values
      const timeFields = ['sunrise', 'sunset', 'moonrise', 'moonset'];
      timeFields.forEach(field => {
        const value = data[field];
        if (value && (value.includes('12:34 AM') || value === 'Unknown' || value === 'undefined')) {
          console.warn(`INVALID TIME DETECTED - ${field}: ${value}`);
        }
      });

      // Check for critical missing data
      const criticalFields = [
        { key: 'sunrise', value: data.sunrise },
        { key: 'tithi.name', value: data.tithi?.name },
        { key: 'nakshatra.name', value: data.nakshatra?.name }
      ];

      const missingCritical = criticalFields.filter(field => 
        !field.value || field.value === 'N/A' || field.value === 'Unknown' || field.value === 'undefined'
      );

      if (missingCritical.length > 0) {
        console.warn('=== CRITICAL DATA MISSING ===');
        missingCritical.forEach(field => {
          console.warn(`Missing: ${field.key} = ${field.value}`);
        });
        setError('Some panchang data is incomplete or unavailable.');
      } else {
        console.log('=== ALL CRITICAL DATA PRESENT ===');
      }

      // Set the data regardless - let user see what we have
      setPanchangData(data);
      console.log('=== PANCHANG DATA STORED SUCCESSFULLY ===');
      
      toast({
        title: "Panchang Updated",
        description: data.data_status === 'INCOMPLETE' 
          ? "Partial cosmic data loaded successfully"
          : "Complete cosmic data loaded successfully",
      });

    } catch (error: any) {
      console.error('=== PANCHANG FETCH ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      
      const errorMessage = error.message || 'Unable to fetch panchang data';
      setError(`Connection issue: ${errorMessage}`);
      
      // Provide meaningful fallback data with clear indication it's fallback
      const today = new Date();
      const fallbackData: PanchangData = {
        date: today.toLocaleDateString('en-IN', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        sunrise: 'Service Unavailable',
        sunset: 'Service Unavailable',
        moonrise: 'Service Unavailable',
        moonset: 'Service Unavailable',
        tithi: {
          name: 'Service Temporarily Unavailable',
          paksha: 'Please try again',
          endTime: 'N/A'
        },
        nakshatra: {
          name: 'Service Temporarily Unavailable',
          lord: 'Please try again later',
          endTime: 'N/A'
        },
        yoga: {
          name: 'Service Temporarily Unavailable',
          endTime: 'N/A'
        },
        karana: {
          name: 'Service Temporarily Unavailable',
          endTime: 'N/A'
        },
        auspiciousTimes: {
          abhijitMuhurta: 'Service temporarily offline',
          brahmaMuhurta: 'Service temporarily offline',
          godhuliBela: 'Service temporarily offline'
        },
        inauspiciousTimes: {
          rahukaal: 'Service temporarily offline',
          yamaghanta: 'Service temporarily offline',
          gulikai: 'Service temporarily offline'
        },
        recommendations: [
          'Panchang service is temporarily unavailable due to connection issues',
          'Please check your internet connection and try refreshing',
          'Traditional panchang principles still apply - consult local sources if needed'
        ],
        data_status: 'INCOMPLETE'
      };
      
      setPanchangData(fallbackData);
      
      toast({
        title: "Panchang Service Issue",
        description: "Using cached data. Please try refreshing in a moment.",
        variant: "destructive"
      });
      
    } finally {
      setIsLoading(false);
      console.log('=== PANCHANG FETCH COMPLETE ===');
    }
  };

  useEffect(() => {
    fetchPanchangData();
  }, []);

  const refreshPanchang = () => {
    toast({
      title: "Refreshing Panchang",
      description: "Fetching latest cosmic data...",
    });
    fetchPanchangData();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="card-golden">
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
            <h3 className="text-lg font-semibold mb-2">Loading Today's Panchang</h3>
            <p className="text-muted-foreground">Fetching cosmic data from the universe...</p>
          </CardContent>
        </Card>
        
        {[1, 2, 3].map((i) => (
          <Card key={i} className="card-sacred">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Add comprehensive null checks and safe access
  if (!panchangData) {
    return (
      <div className="space-y-6">
        <Card className="card-golden">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No Panchang Data Available</h3>
            <p className="text-muted-foreground mb-4">Unable to load cosmic data at this time.</p>
            <button 
              onClick={refreshPanchang}
              className="text-primary hover:text-primary/80 flex items-center gap-1 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safe access with fallbacks
  const safeData = {
    date: panchangData?.date || new Date().toLocaleDateString(),
    sunrise: panchangData?.sunrise || 'N/A',
    sunset: panchangData?.sunset || 'N/A',
    moonrise: panchangData?.moonrise || 'N/A',
    moonset: panchangData?.moonset || 'N/A',
    tithi: {
      name: panchangData?.tithi?.name || 'N/A',
      endTime: panchangData?.tithi?.endTime || 'N/A'
    },
    nakshatra: {
      name: panchangData?.nakshatra?.name || 'N/A',
      endTime: panchangData?.nakshatra?.endTime || 'N/A'
    },
    yoga: {
      name: panchangData?.yoga?.name || 'N/A',
      endTime: panchangData?.yoga?.endTime || 'N/A'
    },
    karana: {
      name: panchangData?.karana?.name || 'N/A',
      endTime: panchangData?.karana?.endTime || 'N/A'
    },
    auspiciousTimes: {
      brahmaMuhurta: panchangData?.auspiciousTimes?.brahmaMuhurta || 'N/A',
      abhijitMuhurta: panchangData?.auspiciousTimes?.abhijitMuhurta || 'N/A',
      godhuliBela: panchangData?.auspiciousTimes?.godhuliBela || 'N/A'
    },
    inauspiciousTimes: {
      rahukaal: panchangData?.inauspiciousTimes?.rahukaal || 'N/A',
      yamaghanta: panchangData?.inauspiciousTimes?.yamaghanta || 'N/A',
      gulikai: panchangData?.inauspiciousTimes?.gulikai || 'N/A'
    },
    recommendations: panchangData?.recommendations || ['No recommendations available']
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="card-golden">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 rounded-full bg-primary/20">
            <Calendar className="w-8 h-8 text-foreground" />
          </div>
          <CardTitle className="text-2xl text-foreground">
            Today's Panchang
          </CardTitle>
          <p className="text-foreground/80 mb-2">
            {safeData.date}
          </p>
          <button 
            onClick={refreshPanchang}
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 mx-auto"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </CardHeader>
      </Card>

      {error && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-center text-amber-800">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Limited Data Available</span>
            </div>
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Sun & Moon Timings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-sacred">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-yellow-500" />
              Solar Timings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sunrise</span>
              <span className="font-semibold">{safeData.sunrise}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sunset</span>
              <span className="font-semibold">{safeData.sunset}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-sacred">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-blue-400" />
              Lunar Timings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Moonrise</span>
              <span className="font-semibold">{safeData.moonrise}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Moonset</span>
              <span className="font-semibold">{safeData.moonset}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panchang Elements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-spiritual">
          <CardContent className="p-4 text-center">
            <h3 className="font-semibold text-white mb-2">Tithi</h3>
            <p className="text-white/90 text-lg">{safeData.tithi.name}</p>
            <p className="text-white/70 text-xs mt-1">
              Until {safeData.tithi.endTime}
            </p>
          </CardContent>
        </Card>

        <Card className="card-healing">
          <CardContent className="p-4 text-center">
            <h3 className="font-semibold text-white mb-2">Nakshatra</h3>
            <p className="text-white/90 text-lg">{safeData.nakshatra.name}</p>
            <p className="text-white/70 text-xs mt-1">
              Until {safeData.nakshatra.endTime}
            </p>
          </CardContent>
        </Card>

        <Card className="card-wisdom">
          <CardContent className="p-4 text-center">
            <h3 className="font-semibold text-white mb-2">Yoga</h3>
            <p className="text-white/90 text-lg">{safeData.yoga.name}</p>
            <p className="text-white/70 text-xs mt-1">
              Until {safeData.yoga.endTime}
            </p>
          </CardContent>
        </Card>

        <Card className="card-golden">
          <CardContent className="p-4 text-center">
            <h3 className="font-semibold text-foreground mb-2">Karana</h3>
            <p className="text-foreground/90 text-lg">{safeData.karana.name}</p>
            <p className="text-foreground/70 text-xs mt-1">
              Until {safeData.karana.endTime}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Auspicious Times */}
      <Card className="card-sacred border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Star className="w-5 h-5" />
            Auspicious Times
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-100 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-1">Brahma Muhurta</h4>
              <p className="text-green-700">{safeData.auspiciousTimes.brahmaMuhurta}</p>
              <p className="text-xs text-green-600 mt-1">Best for meditation</p>
            </div>
            <div className="text-center p-3 bg-green-100 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-1">Abhijit Muhurta</h4>
              <p className="text-green-700">{safeData.auspiciousTimes.abhijitMuhurta}</p>
              <p className="text-xs text-green-600 mt-1">Victory time</p>
            </div>
            <div className="text-center p-3 bg-green-100 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-1">Godhuli Bela</h4>
              <p className="text-green-700">{safeData.auspiciousTimes.godhuliBela}</p>
              <p className="text-xs text-green-600 mt-1">Evening prayers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inauspicious Times */}
      <Card className="card-sacred border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <Clock className="w-5 h-5" />
            Times to Avoid
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-red-100 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-1">Rahu Kaal</h4>
              <p className="text-red-700">{safeData.inauspiciousTimes.rahukaal}</p>
            </div>
            <div className="text-center p-3 bg-red-100 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-1">Yama Ghanta</h4>
              <p className="text-red-700">{safeData.inauspiciousTimes.yamaghanta}</p>
            </div>
            <div className="text-center p-3 bg-red-100 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-1">Gulikai</h4>
              <p className="text-red-700">{safeData.inauspiciousTimes.gulikai}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Recommendations */}
      <Card className="card-golden">
        <CardHeader>
          <CardTitle className="text-foreground">Today's Cosmic Guidance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {safeData.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-2">
                <Star className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-foreground/80">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};