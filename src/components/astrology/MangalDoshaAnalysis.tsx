import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, AlertTriangle, Heart, Shield, RefreshCw } from 'lucide-react';
import { AstrologyAPI } from '@/utils/astrologyApi';

interface MangalDoshaData {
  hasMangalDosha: boolean;
  severity: 'none' | 'low' | 'medium' | 'high';
  affectedHouses: number[];
  description: string;
  effects: {
    marriage: string;
    relationships: string;
    personality: string;
  };
  remedies: string[];
  compatibility: {
    bestMatches: string[];
    avoid: string[];
  };
}

export const MangalDoshaAnalysis = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [doshaData, setDoshaData] = useState<MangalDoshaData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const analyzeMangalDosha = async () => {
    if (!profile?.birth_date || !profile?.birth_time || !profile?.birth_place) {
      toast({
        title: "Missing Birth Details",
        description: "Please complete your astrological profile first.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await AstrologyAPI.getDoshaAnalysis(
        'mangal-dosha',
        profile.birth_date,
        profile.birth_time,
        profile.birth_place
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to analyze Mangal Dosha');
      }

      // Transform API response to our interface
      const transformedData: MangalDoshaData = {
        hasMangalDosha: result.data?.has_mangal_dosha || false,
        severity: result.data?.severity || 'none',
        affectedHouses: result.data?.affected_houses || [],
        description: result.data?.description || 'Analysis completed',
        effects: {
          marriage: result.data?.effects?.marriage || 'No significant effects on marriage timing',
          relationships: result.data?.effects?.relationships || 'Relationships may require understanding and patience',
          personality: result.data?.effects?.personality || 'May influence assertiveness and energy levels'
        },
        remedies: result.data?.remedies || [
          'Chant Hanuman Chalisa daily',
          'Wear red coral (Moonga) after consultation',
          'Fast on Tuesdays',
          'Donate red items to charity'
        ],
        compatibility: {
          bestMatches: result.data?.compatibility?.best_matches || ['Other Manglik individuals'],
          avoid: result.data?.compatibility?.avoid || ['Non-Manglik without proper matching']
        }
      };

      setDoshaData(transformedData);
      
      toast({
        title: "Analysis Complete",
        description: "Your Mangal Dosha analysis has been generated.",
      });

    } catch (error: any) {
      console.error('Error analyzing Mangal Dosha:', error);
      setError('Failed to analyze Mangal Dosha. Please try again.');
      toast({
        title: "Error",
        description: error.message || "Failed to analyze Mangal Dosha. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'none': return 'bg-green-100 text-green-800 border-green-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'none': return <Shield className="w-5 h-5 text-green-600" />;
      case 'low': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  if (!profile?.birth_date || !profile?.birth_time || !profile?.birth_place) {
    return (
      <Card className="card-sacred">
        <CardContent className="p-8 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-bold mb-2">Complete Your Profile</h3>
          <p className="text-muted-foreground mb-6">
            Add your birth details to analyze your Mangal Dosha status.
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
            Mangal Dosha Analysis
          </CardTitle>
          <p className="text-white/90">
            Understanding Mars placement and its influence on marriage and relationships
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <Button
            onClick={analyzeMangalDosha}
            disabled={isLoading}
            className="btn-hero"
          >
            {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Analyzing...' : 'Analyze Mangal Dosha'}
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

      {doshaData && (
        <>
          {/* Dosha Status */}
          <Card className={`card-sacred ${doshaData.hasMangalDosha ? 'border-orange-200' : 'border-green-200'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getSeverityIcon(doshaData.severity)}
                Mangal Dosha Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Status:</span>
                <Badge className={getSeverityColor(doshaData.severity)}>
                  {doshaData.hasMangalDosha ? `Manglik (${doshaData.severity.charAt(0).toUpperCase() + doshaData.severity.slice(1)})` : 'Non-Manglik'}
                </Badge>
              </div>
              
              {doshaData.affectedHouses.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Affected Houses:</span>
                  <div className="flex gap-1">
                    {doshaData.affectedHouses.map((house) => (
                      <Badge key={house} variant="outline">
                        {house}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-muted-foreground">{doshaData.description}</p>
            </CardContent>
          </Card>

          {/* Effects */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Heart className="w-5 h-5" />
                  Marriage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90">{doshaData.effects.marriage}</p>
              </CardContent>
            </Card>

            <Card className="card-healing">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Heart className="w-5 h-5" />
                  Relationships
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90">{doshaData.effects.relationships}</p>
              </CardContent>
            </Card>

            <Card className="card-wisdom">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Sparkles className="w-5 h-5" />
                  Personality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90">{doshaData.effects.personality}</p>
              </CardContent>
            </Card>
          </div>

          {/* Remedies */}
          {doshaData.hasMangalDosha && (
            <Card className="card-golden">
              <CardHeader>
                <CardTitle className="text-foreground">Remedial Measures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doshaData.remedies.map((remedy, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-muted/20 rounded-lg">
                      <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-foreground/80">{remedy}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compatibility */}
          <Card className="card-sacred">
            <CardHeader>
              <CardTitle>Marriage Compatibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-700 mb-2">Best Matches:</h4>
                <div className="flex flex-wrap gap-2">
                  {doshaData.compatibility.bestMatches.map((match, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800">
                      {match}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-red-700 mb-2">Consider Carefully:</h4>
                <div className="flex flex-wrap gap-2">
                  {doshaData.compatibility.avoid.map((avoid, index) => (
                    <Badge key={index} className="bg-red-100 text-red-800">
                      {avoid}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};