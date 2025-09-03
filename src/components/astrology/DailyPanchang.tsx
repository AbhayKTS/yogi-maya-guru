import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Sun, Moon, Star, Clock } from 'lucide-react';

interface PanchangData {
  date: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  tithi: {
    name: string;
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
}

export const DailyPanchang = () => {
  const [panchangData, setPanchangData] = useState<PanchangData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate mock panchang data for today
    // In production, this would fetch from a real Panchang API
    const generateTodaysPanchang = (): PanchangData => {
      const today = new Date();
      const nakshatras = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira',
        'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
        'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra',
        'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula',
        'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
        'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada',
        'Revati'
      ];
      
      const tithis = [
        'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
        'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
        'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'
      ];

      const yogas = [
        'Vishkumbha', 'Preeti', 'Ayushman', 'Saubhagya', 'Shobhana',
        'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda',
        'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
        'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva',
        'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
        'Indra', 'Vaidhriti'
      ];

      const karanas = [
        'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara',
        'Vanija', 'Vishti', 'Shakuni', 'Chatushpada',
        'Naga', 'Kimstughna'
      ];

      return {
        date: today.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        sunrise: '06:15 AM',
        sunset: '06:30 PM',
        moonrise: '08:45 PM',
        moonset: '07:20 AM',
        tithi: {
          name: tithis[Math.floor(Math.random() * tithis.length)],
          endTime: '11:30 AM'
        },
        nakshatra: {
          name: nakshatras[Math.floor(Math.random() * nakshatras.length)],
          lord: 'Mars',
          endTime: '02:15 PM'
        },
        yoga: {
          name: yogas[Math.floor(Math.random() * yogas.length)],
          endTime: '09:45 AM'
        },
        karana: {
          name: karanas[Math.floor(Math.random() * karanas.length)],
          endTime: '05:30 PM'
        },
        auspiciousTimes: {
          abhijitMuhurta: '11:48 AM - 12:36 PM',
          brahmaMuhurta: '04:30 AM - 05:18 AM',
          godhuliBela: '06:00 PM - 06:24 PM'
        },
        inauspiciousTimes: {
          rahukaal: '02:00 PM - 03:30 PM',
          yamaghanta: '08:00 AM - 09:30 AM',
          gulikai: '10:30 AM - 12:00 PM'
        },
        recommendations: [
          'Favorable for spiritual practices and meditation',
          'Good time for starting new ventures',
          'Avoid important decisions during Rahu Kaal',
          'Chant mantras during Brahma Muhurta for maximum benefit'
        ]
      };
    };

    setTimeout(() => {
      setPanchangData(generateTodaysPanchang());
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
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

  if (!panchangData) return null;

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
          <p className="text-foreground/80">
            {panchangData.date}
          </p>
        </CardHeader>
      </Card>

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
              <span className="font-semibold">{panchangData.sunrise}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sunset</span>
              <span className="font-semibold">{panchangData.sunset}</span>
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
              <span className="font-semibold">{panchangData.moonrise}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Moonset</span>
              <span className="font-semibold">{panchangData.moonset}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panchang Elements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-spiritual">
          <CardContent className="p-4 text-center">
            <h3 className="font-semibold text-white mb-2">Tithi</h3>
            <p className="text-white/90 text-lg">{panchangData.tithi.name}</p>
            <p className="text-white/70 text-xs mt-1">
              Until {panchangData.tithi.endTime}
            </p>
          </CardContent>
        </Card>

        <Card className="card-healing">
          <CardContent className="p-4 text-center">
            <h3 className="font-semibold text-white mb-2">Nakshatra</h3>
            <p className="text-white/90 text-lg">{panchangData.nakshatra.name}</p>
            <p className="text-white/70 text-xs mt-1">
              Until {panchangData.nakshatra.endTime}
            </p>
          </CardContent>
        </Card>

        <Card className="card-wisdom">
          <CardContent className="p-4 text-center">
            <h3 className="font-semibold text-white mb-2">Yoga</h3>
            <p className="text-white/90 text-lg">{panchangData.yoga.name}</p>
            <p className="text-white/70 text-xs mt-1">
              Until {panchangData.yoga.endTime}
            </p>
          </CardContent>
        </Card>

        <Card className="card-golden">
          <CardContent className="p-4 text-center">
            <h3 className="font-semibold text-foreground mb-2">Karana</h3>
            <p className="text-foreground/90 text-lg">{panchangData.karana.name}</p>
            <p className="text-foreground/70 text-xs mt-1">
              Until {panchangData.karana.endTime}
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
              <p className="text-green-700">{panchangData.auspiciousTimes.brahmaMuhurta}</p>
              <p className="text-xs text-green-600 mt-1">Best for meditation</p>
            </div>
            <div className="text-center p-3 bg-green-100 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-1">Abhijit Muhurta</h4>
              <p className="text-green-700">{panchangData.auspiciousTimes.abhijitMuhurta}</p>
              <p className="text-xs text-green-600 mt-1">Victory time</p>
            </div>
            <div className="text-center p-3 bg-green-100 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-1">Godhuli Bela</h4>
              <p className="text-green-700">{panchangData.auspiciousTimes.godhuliBela}</p>
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
              <p className="text-red-700">{panchangData.inauspiciousTimes.rahukaal}</p>
            </div>
            <div className="text-center p-3 bg-red-100 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-1">Yama Ghanta</h4>
              <p className="text-red-700">{panchangData.inauspiciousTimes.yamaghanta}</p>
            </div>
            <div className="text-center p-3 bg-red-100 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-1">Gulikai</h4>
              <p className="text-red-700">{panchangData.inauspiciousTimes.gulikai}</p>
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
            {panchangData.recommendations.map((recommendation, index) => (
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