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

    // Special handling for comprehensive kundali reports using the main kundli endpoint
    if (report_type === 'kundali') {
      console.log('Fetching comprehensive kundali data from main kundli endpoint...');
      
      try {
        // Use the main kundli endpoint as specified in the Prokerala documentation
        const kundliUrl = `https://api.prokerala.com/v2/astrology/kundli?${params.toString()}`;
        console.log('Making request to kundli endpoint:', kundliUrl);
        
        const kundliResponse = await fetch(kundliUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Kundli response status:', kundliResponse.status);
        
        if (kundliResponse.ok) {
          const kundliData = await kundliResponse.json();
          console.log('Kundli response:', JSON.stringify(kundliData, null, 2));
          
          // Transform the kundli data
          const transformedData = transformKundliData(kundliData);
          
          return new Response(JSON.stringify({
            success: true,
            data: transformedData
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          const errorText = await kundliResponse.text();
          console.error('Kundli request failed:', kundliResponse.status, errorText);
          
          // Fallback to individual endpoints if main kundli fails
          return await fetchKundaliFromMultipleEndpoints(accessToken, params);
        }
      } catch (error) {
        console.error('Error with main kundli endpoint:', error);
        // Fallback to individual endpoints
        return await fetchKundaliFromMultipleEndpoints(accessToken, params);
      }
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

// Fallback function to fetch from multiple endpoints
async function fetchKundaliFromMultipleEndpoints(accessToken: string, params: URLSearchParams) {
  console.log('Using fallback: fetching from multiple endpoints...');
  
  const endpoints = [
    { type: 'planet-position', url: 'https://api.prokerala.com/v2/astrology/planet-position' },
    { type: 'dasha-periods', url: 'https://api.prokerala.com/v2/astrology/dasha-periods' },
    { type: 'birth-details', url: 'https://api.prokerala.com/v2/astrology/birth-details' }
  ];

  const combinedData: any = {};

  // Fetch data from all endpoints with retry logic
  for (const endpoint of endpoints) {
    let retries = 2;
    while (retries > 0) {
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
          break; // Success, exit retry loop
        } else {
          const errorText = await response.text();
          console.warn(`${endpoint.type} request failed:`, response.status, errorText);
          retries--;
          if (retries > 0) {
            console.log(`Retrying ${endpoint.type} in 1 second...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (error) {
        console.warn(`Error fetching ${endpoint.type}:`, error);
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  }

  // Transform the combined data
  const transformedData = transformMultiEndpointKundaliData(combinedData);
  
  return new Response(JSON.stringify({
    success: true,
    data: transformedData
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Transform data from main kundli endpoint
function transformKundliData(data: any) {
  console.log('Transforming main kundli data:', JSON.stringify(data, null, 2));
  
  try {
    const result: any = {
      planets: {},
      houses: {},
      dasha: {},
      yogas: [],
      predictions: {},
      chart: null
    };

    // Extract data from main kundli response
    const kundliData = data.data;
    
    // Handle planet positions from kundli response
    if (kundliData?.planets || kundliData?.planet_position) {
      const planetData = kundliData.planets || kundliData.planet_position;
      const planetPositions: any = {};
      
      if (Array.isArray(planetData)) {
        planetData.forEach((planet: any) => {
          planetPositions[planet.name] = {
            name: planet.name,
            longitude: planet.longitude || 0,
            degree: planet.degree || 0,
            position: planet.position || planet.house || 1,
            sign: planet.rasi?.name || planet.sign || 'Unknown',
            house: planet.position || planet.house || 1,
            retrograde: planet.is_retrograde || planet.retrograde || false,
            rasi_id: planet.rasi?.id || 0,
            rasi_lord: planet.rasi?.lord?.name || 'Unknown'
          };
        });
      } else if (typeof planetData === 'object') {
        Object.entries(planetData).forEach(([name, planet]: [string, any]) => {
          planetPositions[name] = {
            name,
            longitude: planet.longitude || 0,
            degree: planet.degree || 0,
            position: planet.position || planet.house || 1,
            sign: planet.rasi?.name || planet.sign || 'Unknown',
            house: planet.position || planet.house || 1,
            retrograde: planet.is_retrograde || planet.retrograde || false,
            rasi_id: planet.rasi?.id || 0,
            rasi_lord: planet.rasi?.lord?.name || 'Unknown'
          };
        });
      }
      result.planets = planetPositions;
    }

    // Handle dasha periods
    if (kundliData?.dasha_periods || kundliData?.dasha) {
      const dashaData = kundliData.dasha_periods || kundliData.dasha;
      if (Array.isArray(dashaData) && dashaData.length > 0) {
        const currentDasha = dashaData[0];
        result.dasha = {
          current: {
            planet: currentDasha.name || 'Unknown',
            start: currentDasha.start || null,
            end: currentDasha.end || null,
            duration: calculateDuration(currentDasha.start, currentDasha.end)
          },
          periods: dashaData.slice(0, 5).map((period: any) => ({
            planet: period.name,
            start: period.start,
            end: period.end,
            duration: calculateDuration(period.start, period.end)
          }))
        };
      }
    }

    // Handle yogas
    if (kundliData?.yogas) {
      result.yogas = Array.isArray(kundliData.yogas) 
        ? kundliData.yogas.map((yoga: any) => ({
            name: yoga.name || yoga,
            description: yoga.description || ''
          }))
        : [];
    }

    // Generate predictions
    result.predictions = {
      general: generateGeneralPrediction(result),
      career: generateCareerPrediction(result),
      health: generateHealthPrediction(result),
      relationships: generateRelationshipPrediction(result)
    };

    // Handle birth details
    if (kundliData?.birth_details) {
      const birthDetails = kundliData.birth_details;
      result.predictions.nakshatra = {
        name: birthDetails.nakshatra?.name || 'Unknown',
        lord: birthDetails.nakshatra?.lord?.name || 'Unknown',
        pada: birthDetails.nakshatra?.pada || 0,
        rasi: birthDetails.rasi?.name || 'Unknown'
      };
    }

    return result;
  } catch (error) {
    console.error('Error transforming kundli data:', error);
    return getDefaultKundaliData();
  }
}

// Transform comprehensive Kundali data from multiple endpoints (fallback)
function transformMultiEndpointKundaliData(combinedData: any) {
  console.log('Combined API data:', JSON.stringify(combinedData, null, 2));
  
  try {
    const result: any = {
      planets: {},
      houses: {},
      dasha: {},
      yogas: [],
      predictions: {},
      chart: null
    };

    // Process planet position data (actual API structure)
    if (combinedData.planet_position?.data?.planet_position) {
      const planetPositions: any = {};
      const planetData = combinedData.planet_position.data.planet_position;
      
      planetData.forEach((planet: any) => {
        planetPositions[planet.name] = {
          name: planet.name,
          longitude: planet.longitude || 0,
          degree: planet.degree || 0,
          position: planet.position || 1,
          sign: planet.rasi?.name || 'Unknown',
          house: planet.position || 1,
          retrograde: planet.is_retrograde || false,
          rasi_id: planet.rasi?.id || 0,
          rasi_lord: planet.rasi?.lord?.name || 'Unknown'
        };
      });
      result.planets = planetPositions;
      
      // Extract nakshatra info from Moon position if available
      const moonData = planetData.find((p: any) => p.name === 'Moon');
      if (moonData) {
        result.predictions.nakshatra = {
          name: moonData.nakshatra?.name || 'Unknown',
          lord: moonData.nakshatra?.lord?.name || 'Unknown',
          pada: moonData.pada || 0,
          rasi: moonData.rasi?.name || 'Unknown'
        };
      }
    }

    // Process dasha periods data (actual API structure)
    if (combinedData.dasha_periods?.data?.dasha_periods) {
      const dashaData = combinedData.dasha_periods.data.dasha_periods;
      
      if (dashaData.length > 0) {
        const currentDasha = dashaData[0]; // First is usually current
        result.dasha = {
          current: {
            planet: currentDasha.name || 'Unknown',
            start: currentDasha.start || null,
            end: currentDasha.end || null,
            duration: calculateDuration(currentDasha.start, currentDasha.end)
          },
          periods: dashaData.slice(0, 5).map((period: any) => ({
            planet: period.name,
            start: period.start,
            end: period.end,
            duration: calculateDuration(period.start, period.end)
          }))
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
    console.error('Error transforming multi-endpoint Kundali data:', error);
    return getDefaultKundaliData();
  }
}

// Default kundali data for error cases
function getDefaultKundaliData() {
  return {
    planets: {},
    houses: {},
    dasha: {
      current: {
        planet: 'Unknown',
        duration: 'Unknown'
      },
      periods: []
    },
    yogas: [],
    predictions: {
      general: 'Your birth chart analysis will be available once we can fetch the data from our astrology service.',
      career: 'Career insights based on planetary positions will be shown here.',
      health: 'Health guidance from your birth chart will be displayed here.',
      relationships: 'Relationship compatibility analysis will be available soon.'
    },
    chart: null,
    error: 'Unable to fetch complete birth chart data at this time'
  };
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
    // Transform Prokerala panchang response (actual API structure)
    const apiData = data.data;
    
    const today = new Date();
    
    // Format times from API response
    const formatTime = (dateString: string) => {
      if (!dateString) return 'Unknown';
      try {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
        });
      } catch {
        return 'Unknown';
      }
    };
    
    // Get current tithi
    const currentTithi = apiData?.tithi?.[0] || {};
    const currentNakshatra = apiData?.nakshatra?.[0] || {};
    const currentYoga = apiData?.yoga?.[0] || {};
    const currentKarana = apiData?.karana?.[0] || {};
    
    return {
      date: today.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      sunrise: formatTime(apiData?.sunrise),
      sunset: formatTime(apiData?.sunset),
      moonrise: formatTime(apiData?.moonrise),
      moonset: formatTime(apiData?.moonset),
      tithi: {
        name: currentTithi.name || 'Unknown',
        paksha: currentTithi.paksha || 'Unknown',
        endTime: formatTime(currentTithi.end)
      },
      nakshatra: {
        name: currentNakshatra.name || 'Unknown',
        lord: currentNakshatra.lord?.name || 'Unknown',
        endTime: formatTime(currentNakshatra.end)
      },
      yoga: {
        name: currentYoga.name || 'Unknown',
        endTime: formatTime(currentYoga.end)
      },
      karana: {
        name: currentKarana.name || 'Unknown',
        endTime: formatTime(currentKarana.end)
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
        `Today's tithi is ${currentTithi.name || 'auspicious'} - good for spiritual practices`,
        `Current nakshatra ${currentNakshatra.name || 'is favorable'} - suitable for new beginnings`,
        'Avoid important decisions during inauspicious times'
      ],
      raw_data: data
    };
  } catch (error) {
    console.error('Error transforming panchang data:', error);
    return {
      date: new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      sunrise: '06:00 AM',
      sunset: '06:00 PM',
      moonrise: '08:00 PM',
      moonset: '06:00 AM',
      tithi: { name: 'Unknown', paksha: 'Unknown', endTime: 'Unknown' },
      nakshatra: { name: 'Unknown', lord: 'Unknown', endTime: 'Unknown' },
      yoga: { name: 'Unknown', endTime: 'Unknown' },
      karana: { name: 'Unknown', endTime: 'Unknown' },
      auspiciousTimes: {
        abhijitMuhurta: '11:48 AM - 12:36 PM',
        brahmaMuhurta: '04:30 AM - 05:18 AM',
        godhuliBela: '06:00 PM - 06:24 PM'
      },
      inauspiciousTimes: {
        rahukaal: '02:00 PM - 03:30 PM',
        yamaghanta: '08:00 AM - 09:30 PM',
        gulikai: '10:30 AM - 12:00 PM'
      },
      recommendations: [
        'Favorable day for spiritual practices',
        'Good time for new beginnings',
        'Avoid important decisions during inauspicious times'
      ],
      raw_data: data
    };
  }
}

// Helper function to calculate duration between dates
function calculateDuration(start: string, end: string): string {
  if (!start || !end) return 'Unknown';
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffYears = endDate.getFullYear() - startDate.getFullYear();
    const diffMonths = endDate.getMonth() - startDate.getMonth();
    
    if (diffYears > 0) {
      return `${diffYears} years, ${Math.abs(diffMonths)} months`;
    } else {
      return `${Math.abs(diffMonths)} months`;
    }
  } catch {
    return 'Unknown';
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