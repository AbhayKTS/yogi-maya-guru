import { supabase } from '@/integrations/supabase/client';

interface BirthData {
  datetime: string; // ISO format
  coordinates: string; // "lat,lng"
}

interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  data?: T;
}

export class AstrologyAPI {
  private static formatBirthData(birthDate: string, birthTime: string, birthPlace: string): BirthData {
    // Parse birth date and time
    const date = new Date(birthDate);
    const [hours, minutes] = birthTime.split(':').map(Number);
    
    // Set the time
    date.setHours(hours, minutes, 0, 0);
    
    // Format to ISO string with timezone (assuming IST +05:30 for now)
    // In production, you'd get timezone from birth place
    const datetime = date.toISOString().replace('Z', '+05:30');
    
    // Mock coordinates for now - in production, you'd geocode the birth place
    // Default to Delhi coordinates
    const coordinates = '28.6139,77.2090';
    
    return { datetime, coordinates };
  }

  static async getKundali(birthDate: string, birthTime: string, birthPlace: string) {
    try {
      const birthData = this.formatBirthData(birthDate, birthTime, birthPlace);
      
      const { data, error } = await supabase.functions.invoke('get-astrology-report', {
        body: {
          birth_data: birthData,
          report_type: 'kundali'
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch kundali data');
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error fetching kundali:', error);
      return { success: false, error: error.message };
    }
  }

  static async getPanchang(birthPlace: string = 'Delhi, India') {
    try {
      // For panchang, we use current date and location
      const now = new Date();
      const datetime = now.toISOString().replace('Z', '+05:30');
      const coordinates = '28.6139,77.2090'; // Default to Delhi
      
      const { data, error } = await supabase.functions.invoke('get-astrology-report', {
        body: {
          birth_data: { datetime, coordinates },
          report_type: 'panchang',
          location: birthPlace
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch panchang data');
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error fetching panchang:', error);
      return { success: false, error: error.message };
    }
  }

  static async getPrediction(
    predictionType: 'career' | 'love' | 'health' | 'marriage' | 'finance',
    birthDate: string, 
    birthTime: string, 
    birthPlace: string
  ) {
    try {
      const birthData = this.formatBirthData(birthDate, birthTime, birthPlace);
      
      const { data, error } = await supabase.functions.invoke('get-astrology-report', {
        body: {
          birth_data: birthData,
          report_type: `prediction/${predictionType}`
        }
      });

      if (error) {
        throw new Error(error.message || `Failed to fetch ${predictionType} prediction`);
      }

      return { success: true, data };
    } catch (error: any) {
      console.error(`Error fetching ${predictionType} prediction:`, error);
      return { success: false, error: error.message };
    }
  }

  static async getDoshaAnalysis(
    doshaType: 'mangal-dosha' | 'kaal-sarp-dosha' | 'sadhe-sati' | 'pitra-dosha',
    birthDate: string,
    birthTime: string,
    birthPlace: string
  ) {
    try {
      const birthData = this.formatBirthData(birthDate, birthTime, birthPlace);
      
      const { data, error } = await supabase.functions.invoke('get-astrology-report', {
        body: {
          birth_data: birthData,
          report_type: doshaType
        }
      });

      if (error) {
        throw new Error(error.message || `Failed to fetch ${doshaType} analysis`);
      }

      return { success: true, data };
    } catch (error: any) {
      console.error(`Error fetching ${doshaType} analysis:`, error);
      return { success: false, error: error.message };
    }
  }

  // Utility function to get location coordinates
  static async getCoordinatesFromPlace(place: string): Promise<string> {
    try {
      // This is a simple geocoding function
      // In production, you'd use a proper geocoding service
      const geocodingResponse = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(place)}&key=YOUR_GEOCODING_KEY`
      );
      
      if (geocodingResponse.ok) {
        const data = await geocodingResponse.json();
        if (data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry;
          return `${lat},${lng}`;
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    
    // Fallback to Delhi coordinates
    return '28.6139,77.2090';
  }
}