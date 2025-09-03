import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, Heart, DollarSign, GraduationCap, Activity, RefreshCw } from 'lucide-react';
import { AstrologyAPI } from '@/utils/astrologyApi';

interface PredictionData {
  type: string;
  prediction: string;
  summary: string;
  recommendations: string[];
  favorable_periods: string[];
  challenges: string[];
}

type PredictionType = 'career' | 'love' | 'finance' | 'health' | 'marriage';

const PREDICTION_CONFIGS = {
  career: {
    icon: Briefcase,
    title: 'Career & Professional Life',
    description: 'Insights into your professional journey and career prospects',
    color: 'card-primary'
  },
  love: {
    icon: Heart,
    title: 'Love & Relationships',
    description: 'Understanding your romantic life and relationship patterns',
    color: 'card-healing'
  },
  finance: {
    icon: DollarSign,
    title: 'Wealth & Finance',
    description: 'Financial prospects and wealth accumulation insights',
    color: 'card-golden'
  },
  health: {
    icon: Activity,
    title: 'Health & Wellness',
    description: 'Physical and mental health indicators from your chart',
    color: 'card-wisdom'
  },
  marriage: {
    icon: GraduationCap,
    title: 'Marriage & Partnership',
    description: 'Marriage timing and partnership compatibility insights',
    color: 'card-spiritual'
  }
};

export const LifePredictions = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [predictions, setPredictions] = useState<Record<PredictionType, PredictionData | null>>({
    career: null,
    love: null,
    finance: null,
    health: null,
    marriage: null
  });
  const [loadingStates, setLoadingStates] = useState<Record<PredictionType, boolean>>({
    career: false,
    love: false,
    finance: false,
    health: false,
    marriage: false
  });
  const [activeTab, setActiveTab] = useState<PredictionType>('career');

  const getPrediction = async (type: PredictionType) => {
    if (!profile?.birth_date || !profile?.birth_time || !profile?.birth_place) {
      toast({
        title: "Missing Birth Details",
        description: "Please complete your astrological profile first.",
        variant: "destructive"
      });
      return;
    }

    setLoadingStates(prev => ({ ...prev, [type]: true }));

    try {
      const result = await AstrologyAPI.getPrediction(
        type,
        profile.birth_date,
        profile.birth_time,
        profile.birth_place
      );

      if (!result.success) {
        throw new Error(result.error || `Failed to get ${type} prediction`);
      }

      setPredictions(prev => ({ ...prev, [type]: result.data }));
      
      toast({
        title: "Prediction Generated",
        description: `Your ${type} insights are ready.`,
      });

    } catch (error: any) {
      console.error(`Error getting ${type} prediction:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to get ${type} prediction. Please try again.`,
        variant: "destructive"
      });

      // Set fallback data
      const fallbackData: PredictionData = {
        type,
        prediction: `Your ${type} analysis is being prepared. Please check your internet connection and try again.`,
        summary: `${type.charAt(0).toUpperCase() + type.slice(1)} insights will be available shortly.`,
        recommendations: [
          'Complete analysis requires birth chart calculation',
          'Ensure accurate birth details are provided',
          'Try refreshing in a few moments'
        ],
        favorable_periods: ['Analysis in progress'],
        challenges: ['Data connectivity required']
      };

      setPredictions(prev => ({ ...prev, [type]: fallbackData }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [type]: false }));
    }
  };

  const getAllPredictions = async () => {
    const types: PredictionType[] = ['career', 'love', 'finance', 'health', 'education'];
    
    toast({
      title: "Generating All Predictions",
      description: "This may take a few moments...",
    });

    for (const type of types) {
      await getPrediction(type);
      // Small delay between requests to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  if (!profile?.birth_date || !profile?.birth_time || !profile?.birth_place) {
    return (
      <Card className="card-sacred">
        <CardContent className="p-8 text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-bold mb-2">Complete Your Profile</h3>
          <p className="text-muted-foreground mb-6">
            Add your birth details to receive comprehensive life predictions.
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
          <CardTitle className="text-2xl text-white mb-2">
            Life Predictions
          </CardTitle>
          <p className="text-white/90 mb-4">
            Comprehensive insights into different areas of your life based on Vedic astrology
          </p>
          <Button
            onClick={getAllPredictions}
            className="btn-hero"
            disabled={Object.values(loadingStates).some(loading => loading)}
          >
            {Object.values(loadingStates).some(loading => loading) && (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            )}
            Generate All Predictions
          </Button>
        </CardHeader>
      </Card>

      {/* Predictions Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PredictionType)}>
        <TabsList className="grid w-full grid-cols-5">
          {Object.entries(PREDICTION_CONFIGS).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-1">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{config.title.split(' ')[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(PREDICTION_CONFIGS).map(([key, config]) => {
          const predictionType = key as PredictionType;
          const Icon = config.icon;
          const isLoading = loadingStates[predictionType];
          const predictionData = predictions[predictionType];

          return (
            <TabsContent key={key} value={key} className="mt-6">
              <Card className={config.color}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Icon className="w-5 h-5" />
                    {config.title}
                  </CardTitle>
                  <p className="text-white/90">{config.description}</p>
                </CardHeader>
                <CardContent>
                  {!predictionData && !isLoading && (
                    <div className="text-center py-8">
                      <Button
                        onClick={() => getPrediction(predictionType)}
                        variant="secondary"
                      >
                        Get {config.title.split(' ')[0]} Prediction
                      </Button>
                    </div>
                  )}

                  {isLoading && (
                    <div className="text-center py-8">
                      <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-white" />
                      <p className="text-white/90">Analyzing your {predictionType} prospects...</p>
                    </div>
                  )}

                  {predictionData && (
                    <div className="space-y-6">
                      {/* Main Prediction */}
                      <Card className="bg-white/10 border-white/20">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-white mb-2">Overview</h4>
                          <p className="text-white/90">{predictionData.prediction}</p>
                        </CardContent>
                      </Card>

                      {/* Summary */}
                      <Card className="bg-white/10 border-white/20">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-white mb-2">Key Insights</h4>
                          <p className="text-white/90">{predictionData.summary}</p>
                        </CardContent>
                      </Card>

                      {/* Recommendations */}
                      {predictionData.recommendations && predictionData.recommendations.length > 0 && (
                        <Card className="bg-white/10 border-white/20">
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-white mb-2">Recommendations</h4>
                            <div className="space-y-2">
                              {predictionData.recommendations.map((rec, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full mt-2 flex-shrink-0"></div>
                                  <p className="text-white/90 text-sm">{rec}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Bottom Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Favorable Periods */}
                        {predictionData.favorable_periods && predictionData.favorable_periods.length > 0 && (
                          <Card className="bg-green-900/20 border-green-400/30">
                            <CardContent className="p-4">
                              <h4 className="font-semibold text-green-100 mb-2">Favorable Periods</h4>
                              <div className="space-y-1">
                                {predictionData.favorable_periods.map((period, index) => (
                                  <Badge key={index} className="bg-green-100 text-green-800 mr-1 mb-1">
                                    {period}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Challenges */}
                        {predictionData.challenges && predictionData.challenges.length > 0 && (
                          <Card className="bg-orange-900/20 border-orange-400/30">
                            <CardContent className="p-4">
                              <h4 className="font-semibold text-orange-100 mb-2">Areas to Watch</h4>
                              <div className="space-y-1">
                                {predictionData.challenges.map((challenge, index) => (
                                  <Badge key={index} className="bg-orange-100 text-orange-800 mr-1 mb-1">
                                    {challenge}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};