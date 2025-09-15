// Local replacement for astrologyApi.ts without Supabase dependency

import { 
  getMockKundaliData, 
  getMockPanchangData, 
  getMockPredictionData, 
  getMockDoshaAnalysis 
} from './localStorage';

interface BirthData {
  datetime: string;
  coordinates: string;
  timezone: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

export class LocalAstrologyAPI {
  private static formatBirthData(birthDate: string, birthTime: string, birthPlace: string): BirthData {
    const datetime = `${birthDate}T${birthTime}:00`;
    const coordinates = "28.6139,77.2090"; // Default to Delhi coordinates
    const timezone = "Asia/Kolkata";
    
    return { datetime, coordinates, timezone };
  }

  static async getKundali(birthDate: string, birthTime: string, birthPlace: string): Promise<ApiResponse<{ [key: string]: any }>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const mockData = getMockKundaliData();
      
      // Update with provided birth details
      mockData.data.birth_details = {
        ...mockData.data.birth_details,
        birth_date: birthDate,
        birth_time: birthTime,
        birth_place: birthPlace
      };
      
      return mockData;
    } catch (error) {
      return {
        success: false,
        error: "Failed to generate Kundali data"
      };
    }
  }

  static async getPanchang(birthPlace: string = 'Delhi, India'): Promise<ApiResponse<{ [key: string]: any }>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      const mockData = getMockPanchangData();
      return mockData;
    } catch (error) {
      return {
        success: false,
        error: "Failed to get Panchang data"
      };
    }
  }

  static async getPrediction(
    predictionType: 'career' | 'love' | 'health' | 'marriage' | 'finance',
    birthDate: string,
    birthTime: string,
    birthPlace: string
  ): Promise<ApiResponse<{ [key: string]: any }>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    try {
      const mockData = getMockPredictionData(predictionType);
      return mockData;
    } catch (error) {
      return {
        success: false,
        error: `Failed to get ${predictionType} prediction`
      };
    }
  }

  static async getDoshaAnalysis(
    doshaType: 'mangal-dosha' | 'kaal-sarp-dosha' | 'sadhe-sati' | 'pitra-dosha',
    birthDate: string,
    birthTime: string,
    birthPlace: string
  ): Promise<ApiResponse<{ [key: string]: any }>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const mockData = getMockDoshaAnalysis(doshaType);
      return mockData;
    } catch (error) {
      return {
        success: false,
        error: `Failed to analyze ${doshaType}`
      };
    }
  }

  static async getCoordinatesFromPlace(place: string): Promise<string> {
    // Return default coordinates for Delhi
    await new Promise(resolve => setTimeout(resolve, 300));
    return "28.6139,77.2090";
  }
}