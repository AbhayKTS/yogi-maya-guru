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

// Function to get OAuth2 access token
async function getAccessToken(): Promise<string> {
  const tokenResponse = await fetch('https://api.prokerala.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
    }).toString()
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('Token request failed:', tokenResponse.status, errorText);
    throw new Error(`Failed to get access token: ${tokenResponse.status} - ${errorText}`);
  }

  const tokenData = await tokenResponse.json();
  console.log('Token obtained successfully');
  return tokenData.access_token;
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

    // Get OAuth2 access token
    const accessToken = await getAccessToken();

    // Prepare the request to the Prokerala API
    let apiEndpoint = `${API_BASE_URL}/v2/astrology/${report_type}`;
    
    // Convert report_type to correct endpoint names
    if (report_type === 'kundali') {
      apiEndpoint = `${API_BASE_URL}/v2/astrology/kundli`;
    }

    // Build query parameters
    const params = new URLSearchParams({
      ayanamsa: '1', // Lahiri ayanamsa
      coordinates: birth_data.coordinates,
      datetime: encodeURIComponent(birth_data.datetime)
    });

    // Add location for panchang requests
    if (report_type === 'panchang' && location) {
      // For panchang, we might need additional parameters
    }

    // Add the query parameters to the endpoint
    apiEndpoint += '?' + params.toString();

    console.log('Making request to:', apiEndpoint);
    console.log('Query parameters:', params.toString());

    const response = await fetch(apiEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
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
    // The Prokerala API returns data in { status: "ok", data: {...} } format
    const responseData = data.data || data;
    
    // Extract planets from the API response
    const planets = responseData.planets?.map((planet: any) => ({
      name: planet.name || planet.planet_name,
      sign: planet.sign?.name || planet.rasi?.name || 'Unknown',
      house: planet.house || 1,
      degree: planet.degrees || planet.degree || '0°00\'',
      retrograde: planet.is_retrograde || false
    })) || [];

    // Extract houses from the API response  
    const houses = Array.from({ length: 12 }, (_, i) => ({
      number: i + 1,
      sign: responseData.houses?.[i]?.sign?.name || 'Unknown',
      lord: responseData.houses?.[i]?.lord?.name || 'Unknown'
    }));

    // Extract dasha information
    const dasha = {
      current: responseData.current_dasha?.dasha?.name || responseData.dasha_periods?.[0]?.dasha?.name || 'Unknown Dasha',
      remaining: responseData.current_dasha?.remaining || responseData.dasha_periods?.[0]?.remaining || 'Unknown'
    };

    // Extract yogas from the response
    const yogas = [];
    if (responseData.yogas) {
      responseData.yogas.forEach((yogaGroup: any) => {
        if (yogaGroup.yoga_list) {
          yogaGroup.yoga_list.forEach((yoga: any) => {
            if (yoga.has_yoga) {
              yogas.push(yoga.name);
            }
          });
        }
      });
    }

    // Create predictions based on available data
    const predictions = {
      general: responseData.predictions?.general || 'Detailed analysis based on your birth chart showing planetary positions and their effects.',
      career: responseData.predictions?.career || 'Career insights based on planetary positions in your birth chart.',
      health: responseData.predictions?.health || 'Health guidance derived from planetary influences in your horoscope.',
      relationships: responseData.predictions?.relationships || 'Relationship compatibility and timing insights from your birth chart.'
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
    return {
      planets: [],
      houses: [],
      dasha: { current: 'Unknown', remaining: 'Unknown' },
      yogas: [],
      predictions: {
        general: 'Analysis based on your birth chart.',
        career: 'Career insights will be available.',
        health: 'Health guidance based on planetary positions.',
        relationships: 'Relationship compatibility insights.'
      },
      raw_data: data
    };
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