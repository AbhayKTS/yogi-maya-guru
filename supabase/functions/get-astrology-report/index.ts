import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Your secret credentials stored as environment variables in Supabase
const CLIENT_ID = Deno.env.get('PROKERALA_CLIENT_ID');
const CLIENT_SECRET = Deno.env.get('PROKERALA_CLIENT_SECRET');
const API_BASE_URL = 'https://api.prokerala.com';

interface BirthData {
  datetime: string; // ISO format: "1990-01-25T10:30:00+05:30"
  coordinates: string; // "latitude,longitude" format: "28.6139,77.2090"
}

interface ReportRequest {
  birth_data: BirthData;
  report_type: string;
  location?: string;
}

serve(async (req) => {
  // Handle preflight CORS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('API credentials not configured');
    }

    // Get user request data
    const { birth_data, report_type, location }: ReportRequest = await req.json();

    console.log(`Processing astrology request: ${report_type}`);
    console.log('Birth data:', birth_data);

    // Prepare the request to the Prokerala API
    let apiEndpoint = `${API_BASE_URL}/v2/astrology/${report_type}`;
    let requestBody: any = {
      ...birth_data
    };

    // Add location for panchang requests
    if (report_type === 'panchang' && location) {
      requestBody.coordinates = birth_data.coordinates;
    }

    // Special handling for different report types
    if (report_type.includes('prediction/')) {
      // For prediction endpoints, we might need different data structure
      requestBody = {
        datetime: birth_data.datetime,
        coordinates: birth_data.coordinates
      };
    }

    console.log('Making request to:', apiEndpoint);
    console.log('Request body:', requestBody);

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLIENT_ID}:${CLIENT_SECRET}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('API Response status:', response.status);
    console.log('API Response:', responseText);

    if (!response.ok) {
      throw new Error(`Prokerala API error: ${response.status} - ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse API response:', parseError);
      throw new Error('Invalid API response format');
    }

    // Transform the data based on report type for consistent frontend usage
    let transformedData = data;

    if (report_type === 'kundali') {
      // Transform kundali data to match our frontend interface
      transformedData = transformKundaliData(data);
    } else if (report_type === 'panchang') {
      // Transform panchang data
      transformedData = transformPanchangData(data);
    } else if (report_type.includes('prediction/')) {
      // Transform prediction data
      transformedData = transformPredictionData(data, report_type);
    }

    return new Response(JSON.stringify(transformedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error in get-astrology-report:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

function transformKundaliData(data: any) {
  try {
    // Transform Prokerala kundali response to match our frontend interface
    const planets = data.planets?.map((planet: any) => ({
      name: planet.name,
      sign: planet.sign,
      house: planet.house,
      degree: planet.degree,
      retrograde: planet.is_retrograde || false
    })) || [];

    const houses = data.houses?.map((house: any, index: number) => ({
      number: index + 1,
      sign: house.sign,
      lord: house.lord
    })) || [];

    const dasha = {
      current: data.current_dasha?.name || 'Unknown Dasha',
      remaining: data.current_dasha?.remaining || 'Unknown'
    };

    const yogas = data.yogas?.map((yoga: any) => yoga.name) || [];

    const predictions = {
      general: data.predictions?.general || 'Detailed analysis based on your birth chart.',
      career: data.predictions?.career || 'Career insights will be available soon.',
      health: data.predictions?.health || 'Health guidance based on planetary positions.',
      relationships: data.predictions?.relationships || 'Relationship compatibility and timing insights.'
    };

    return {
      planets,
      houses,
      dasha,
      yogas,
      predictions,
      raw_data: data // Keep original data for debugging
    };
  } catch (error) {
    console.error('Error transforming kundali data:', error);
    return data; // Return original data if transformation fails
  }
}

function transformPanchangData(data: any) {
  try {
    // Transform Prokerala panchang response
    const today = new Date();
    
    return {
      date: today.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      sunrise: data.sun_rise || '06:00 AM',
      sunset: data.sun_set || '06:00 PM',
      moonrise: data.moon_rise || '08:00 PM',
      moonset: data.moon_set || '06:00 AM',
      tithi: {
        name: data.tithi?.name || 'Unknown',
        endTime: data.tithi?.end_time || 'Unknown'
      },
      nakshatra: {
        name: data.nakshatra?.name || 'Unknown',
        lord: data.nakshatra?.lord || 'Unknown',
        endTime: data.nakshatra?.end_time || 'Unknown'
      },
      yoga: {
        name: data.yoga?.name || 'Unknown',
        endTime: data.yoga?.end_time || 'Unknown'
      },
      karana: {
        name: data.karana?.name || 'Unknown',
        endTime: data.karana?.end_time || 'Unknown'
      },
      auspiciousTimes: {
        abhijitMuhurta: data.muhurta?.abhijit || '11:48 AM - 12:36 PM',
        brahmaMuhurta: data.muhurta?.brahma || '04:30 AM - 05:18 AM',
        godhuliBela: data.muhurta?.godhuli || '06:00 PM - 06:24 PM'
      },
      inauspiciousTimes: {
        rahukaal: data.inauspicious?.rahu_kaal || '02:00 PM - 03:30 PM',
        yamaghanta: data.inauspicious?.yama_ghanta || '08:00 AM - 09:30 AM',
        gulikai: data.inauspicious?.gulikai || '10:30 AM - 12:00 PM'
      },
      recommendations: data.recommendations || [
        'Favorable day for spiritual practices',
        'Good time for new beginnings',
        'Avoid important decisions during inauspicious times'
      ],
      raw_data: data
    };
  } catch (error) {
    console.error('Error transforming panchang data:', error);
    return data;
  }
}

function transformPredictionData(data: any, reportType: string) {
  try {
    const predictionType = reportType.split('/')[1]; // Extract 'career', 'love', etc.
    
    return {
      type: predictionType,
      prediction: data.prediction || `${predictionType} insights based on your birth chart.`,
      summary: data.summary || 'Detailed analysis available.',
      recommendations: data.recommendations || [],
      favorable_periods: data.favorable_periods || [],
      challenges: data.challenges || [],
      raw_data: data
    };
  } catch (error) {
    console.error('Error transforming prediction data:', error);
    return data;
  }
}