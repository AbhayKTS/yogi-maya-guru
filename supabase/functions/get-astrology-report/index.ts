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
  console.log('Requesting OAuth2 token from Prokerala...');
  console.log('CLIENT_ID available:', !!CLIENT_ID);
  console.log('CLIENT_SECRET available:', !!CLIENT_SECRET);
  
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

  console.log('Token response status:', tokenResponse.status);
  const responseText = await tokenResponse.text();
  console.log('Token response body:', responseText);

  if (!tokenResponse.ok) {
    console.error('Token request failed:', tokenResponse.status, responseText);
    throw new Error(`Failed to get access token: ${tokenResponse.status} - ${responseText}`);
  }

  let tokenData;
  try {
    tokenData = JSON.parse(responseText);
  } catch (parseError) {
    console.error('Failed to parse token response:', parseError);
    throw new Error('Invalid token response format');
  }

  if (!tokenData.access_token) {
    console.error('No access token in response:', tokenData);
    throw new Error('No access token received from API');
  }

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

    // Build query parameters
    const params = new URLSearchParams({
      ayanamsa: '1', // Lahiri ayanamsa
      coordinates: birth_data.coordinates,
      datetime: birth_data.datetime
    });

    // Special handling for comprehensive kundali reports
    if (report_type === 'kundali') {
      console.log('Fetching comprehensive kundali data from multiple endpoints...');
      
      // Call multiple endpoints for complete birth chart data
      const endpoints = [
        { type: 'detailed-kundli', url: 'https://api.prokerala.com/v2/astrology/detailed-kundli' },
        { type: 'planet-position', url: 'https://api.prokerala.com/v2/astrology/planet-position' },
        { type: 'dasha-periods', url: 'https://api.prokerala.com/v2/astrology/dasha-periods' }
      ];

      const combinedData: any = {
        detailed_kundli: null,
        planet_position: null,
        dasha_periods: null
      };

      // Fetch data from all endpoints
      for (const endpoint of endpoints) {
        try {
          const url = `${endpoint.url}?${params.toString()}`;
          console.log(`Making request to ${endpoint.type}:`, url);
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          console.log(`${endpoint.type} response status:`, response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`${endpoint.type} response:`, JSON.stringify(data, null, 2));
            combinedData[endpoint.type.replace('-', '_')] = data;
          } else {
            const errorText = await response.text();
            console.warn(`${endpoint.type} request failed:`, response.status, errorText);
          }
        } catch (error) {
          console.warn(`Error fetching ${endpoint.type}:`, error);
        }
      }

      // Transform the combined data
      const transformedData = transformComprehensiveKundaliData(combinedData);
      
      return new Response(JSON.stringify({
        success: true,
        data: transformedData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle other report types with single endpoint calls
    let apiEndpoint = `${API_BASE_URL}/v2/astrology/${report_type}`;
    
    // Convert report_type to correct endpoint names
    if (report_type === 'panchang') {
      apiEndpoint = `${API_BASE_URL}/v2/astrology/panchang`;
    }

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

    if (report_type === 'panchang') {
      // Transform panchang data
      transformedData = transformPanchangData(data);
    } else if (report_type.includes('prediction/')) {
      // Transform prediction data
      transformedData = transformPredictionData(data, report_type);
    }

    return new Response(JSON.stringify({
      success: true,
      data: transformedData
    }), {
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

// Transform comprehensive Kundali data from multiple endpoints
function transformComprehensiveKundaliData(combinedData: any) {
  console.log('Combined API data:', JSON.stringify(combinedData, null, 2));
  
  try {
    const result = {
      planets: {},
      houses: {},
      dasha: {},
      yogas: [],
      predictions: {},
      chart: null
    };

    // Process detailed kundli data
    if (combinedData.detailed_kundli?.data) {
      const detailedData = combinedData.detailed_kundli.data;
      
      if (detailedData.nakshatra_details) {
        result.predictions.nakshatra = {
          name: detailedData.nakshatra_details.nakshatra?.name || 'Unknown',
          lord: detailedData.nakshatra_details.nakshatra?.lord?.name || 'Unknown',
          pada: detailedData.nakshatra_details.nakshatra?.pada || 0,
          deity: detailedData.nakshatra_details.additional_info?.deity || 'Unknown',
          symbol: detailedData.nakshatra_details.additional_info?.symbol || 'Unknown',
          animal_sign: detailedData.nakshatra_details.additional_info?.animal_sign || 'Unknown'
        };
        
        result.predictions.rasi = {
          chandra: detailedData.nakshatra_details.chandra_rasi?.name || 'Unknown',
          soorya: detailedData.nakshatra_details.soorya_rasi?.name || 'Unknown',
          zodiac: detailedData.nakshatra_details.zodiac?.name || 'Unknown'
        };
      }

      if (detailedData.mangal_dosha) {
        result.predictions.mangal_dosha = {
          has_dosha: detailedData.mangal_dosha.has_dosha || false,
          description: detailedData.mangal_dosha.description || 'No information available'
        };
      }

      if (detailedData.yoga_details && Array.isArray(detailedData.yoga_details)) {
        result.yogas = detailedData.yoga_details.map((yoga: any) => ({
          name: yoga.name || 'Unknown Yoga',
          description: yoga.description || 'No description available'
        }));
      }
    }

    // Process planet position data
    if (combinedData.planet_position?.data) {
      const planetData = combinedData.planet_position.data;
      
      if (planetData.planets && Array.isArray(planetData.planets)) {
        const planetPositions: any = {};
        planetData.planets.forEach((planet: any) => {
          planetPositions[planet.name] = {
            name: planet.name,
            position: planet.position || 0,
            degree: planet.degree || 0,
            sign: planet.sign?.name || 'Unknown',
            house: planet.house || 1,
            retrograde: planet.is_retrograde || false,
            nakshatra: planet.nakshatra?.name || 'Unknown'
          };
        });
        result.planets = planetPositions;
      }
    }

    // Process dasha periods data
    if (combinedData.dasha_periods?.data) {
      const dashaData = combinedData.dasha_periods.data;
      
      if (dashaData.current_dasha) {
        result.dasha = {
          current: {
            planet: dashaData.current_dasha.planet?.name || 'Unknown',
            start: dashaData.current_dasha.start || null,
            end: dashaData.current_dasha.end || null,
            duration: dashaData.current_dasha.duration || 'Unknown'
          },
          upcoming: dashaData.upcoming_dasha ? {
            planet: dashaData.upcoming_dasha.planet?.name || 'Unknown',
            start: dashaData.upcoming_dasha.start || null,
            end: dashaData.upcoming_dasha.end || null,
            duration: dashaData.upcoming_dasha.duration || 'Unknown'
          } : null
        };
      }
    }

    // Generate comprehensive predictions based on available data
    result.predictions.general = generateGeneralPrediction(result);
    result.predictions.career = generateCareerPrediction(result);
    result.predictions.health = generateHealthPrediction(result);
    result.predictions.relationships = generateRelationshipPrediction(result);

    return result;
  } catch (error) {
    console.error('Error transforming comprehensive Kundali data:', error);
    return {
      planets: {},
      houses: {},
      dasha: {},
      yogas: [],
      predictions: {
        general: 'Unable to generate analysis at this time.',
        career: 'Career insights will be available soon.',
        health: 'Health guidance based on your birth details.',
        relationships: 'Relationship compatibility insights available.'
      },
      chart: null,
      error: 'Failed to transform comprehensive data'
    };
  }
}

// Helper functions to generate predictions based on available data
function generateGeneralPrediction(data: any): string {
  const nakshatra = data.predictions?.nakshatra?.name || 'your birth nakshatra';
  const currentDasha = data.dasha?.current?.planet || 'current planetary period';
  
  return `Based on your birth in ${nakshatra} nakshatra and current ${currentDasha} dasha period, this is a time of significant personal development and spiritual growth.`;
}

function generateCareerPrediction(data: any): string {
  const yogas = data.yogas?.length || 0;
  const currentDasha = data.dasha?.current?.planet || 'current period';
  
  return `With ${yogas} beneficial yogas in your chart and the current ${currentDasha} influencing your career sector, focus on professional development and new opportunities.`;
}

function generateHealthPrediction(data: any): string {
  const mangalDosha = data.predictions?.mangal_dosha?.has_dosha ? 'Mars influence' : 'balanced planetary influence';
  
  return `Your health profile shows ${mangalDosha} in your birth chart. Maintain regular exercise and follow a balanced lifestyle for optimal well-being.`;
}

function generateRelationshipPrediction(data: any): string {
  const mangalDosha = data.predictions?.mangal_dosha?.has_dosha;
  const rasi = data.predictions?.rasi?.chandra || 'moon sign';
  
  return `With your moon in ${rasi} ${mangalDosha ? 'and Mars influence to consider' : 'and harmonious planetary positions'}, relationships require patience and understanding.`;
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