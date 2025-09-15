import { useState } from 'react';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, ClockIcon, MapPinIcon, Sparkles } from 'lucide-react';

interface AstrologicalProfileProps {
  onComplete: () => void;
}

export const AstrologicalProfile = ({ onComplete }: AstrologicalProfileProps) => {
  const { user, updateProfile } = useLocalAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    latitude: '',
    longitude: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.birthDate || !formData.birthTime || !formData.birthPlace) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save astrological data to profile
      const { error } = await updateProfile({
        birth_date: formData.birthDate,
        birth_time: formData.birthTime,
        birth_place: formData.birthPlace,
      });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your astrological profile has been saved successfully.",
      });

      onComplete();
    } catch (error: any) {
      console.error('Error saving astrological profile:', error);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-healing-soft/30 flex items-center justify-center p-4">
      <Card className="card-sacred max-w-2xl w-full">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 p-6 rounded-full bg-gradient-to-r from-spiritual to-primary animate-sacred-glow">
            <Sparkles className="w-12 h-12 text-white mx-auto" />
          </div>
          <CardTitle className="text-3xl font-bold text-sacred mb-2">
            Astrological Profile
          </CardTitle>
          <p className="text-muted-foreground">
            Share your birth details for personalized cosmic insights (Optional but recommended)
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Birth Date */}
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                Date of Birth
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className="w-full"
                required
              />
            </div>

            {/* Birth Time */}
            <div className="space-y-2">
              <Label htmlFor="birthTime" className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-spiritual" />
                Time of Birth
              </Label>
              <Input
                id="birthTime"
                type="time"
                value={formData.birthTime}
                onChange={(e) => handleInputChange('birthTime', e.target.value)}
                className="w-full"
                required
              />
              <p className="text-xs text-muted-foreground">
                Exact time is important for accurate predictions
              </p>
            </div>

            {/* Birth Place */}
            <div className="space-y-2">
              <Label htmlFor="birthPlace" className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-healing" />
                Place of Birth
              </Label>
              <Input
                id="birthPlace"
                type="text"
                placeholder="City, Country"
                value={formData.birthPlace}
                onChange={(e) => handleInputChange('birthPlace', e.target.value)}
                className="w-full"
                required
              />
            </div>

            {/* Optional Coordinates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude" className="text-sm">
                  Latitude (Optional)
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  placeholder="e.g., 28.6139"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude" className="text-sm">
                  Longitude (Optional)
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  placeholder="e.g., 77.2090"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', e.target.value)}
                />
              </div>
            </div>

            <div className="bg-muted/20 rounded-lg p-4">
              <h4 className="font-medium text-sacred mb-2">Why do we need this?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Generate your personalized Vedic birth chart</li>
                <li>• Daily insights based on planetary positions</li>
                <li>• Timing recommendations for practices</li>
                <li>• Your data is encrypted and secure</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onComplete}
                className="flex-1"
              >
                Skip for Now
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 btn-hero"
              >
                {isSubmitting ? 'Saving...' : 'Save Profile'}
                <Sparkles className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};