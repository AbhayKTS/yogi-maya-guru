import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Target, 
  Clock, 
  Zap, 
  Heart, 
  Shield, 
  Calendar,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from 'lucide-react';

interface YogaQuestionnaireProps {
  onComplete: (profile: YogaProfile) => void;
}

export interface YogaProfile {
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  primary_goals: string[];
  available_time: '15' | '30' | '45' | '60';
  preferred_intensity: 'gentle' | 'moderate' | 'vigorous';
  physical_limitations: string[];
  preferred_styles: string[];
  practice_frequency: 'daily' | '4-6-times' | '2-3-times' | 'weekly';
  flexibility_level: 'low' | 'moderate' | 'high';
  strength_level: 'low' | 'moderate' | 'high';
  stress_level: 'low' | 'moderate' | 'high';
}

const QUESTIONS = [
  {
    id: 'experience',
    title: 'What is your yoga experience level?',
    icon: User,
    type: 'radio',
    options: [
      { value: 'beginner', label: 'Beginner', description: 'New to yoga or less than 6 months' },
      { value: 'intermediate', label: 'Intermediate', description: '6 months to 2 years of practice' },
      { value: 'advanced', label: 'Advanced', description: '2+ years of regular practice' }
    ]
  },
  {
    id: 'goals',
    title: 'What are your primary yoga goals?',
    icon: Target,
    type: 'checkbox',
    options: [
      { value: 'flexibility', label: 'Improve Flexibility', description: 'Increase range of motion' },
      { value: 'strength', label: 'Build Strength', description: 'Develop muscle tone and power' },
      { value: 'stress_relief', label: 'Stress Relief', description: 'Reduce anxiety and tension' },
      { value: 'balance', label: 'Better Balance', description: 'Improve stability and coordination' },
      { value: 'mindfulness', label: 'Mindfulness', description: 'Develop present-moment awareness' },
      { value: 'weight_loss', label: 'Weight Management', description: 'Support healthy weight goals' }
    ]
  },
  {
    id: 'time',
    title: 'How much time can you dedicate per session?',
    icon: Clock,
    type: 'radio',
    options: [
      { value: '15', label: '15 minutes', description: 'Quick daily practice' },
      { value: '30', label: '30 minutes', description: 'Balanced session' },
      { value: '45', label: '45 minutes', description: 'Comprehensive practice' },
      { value: '60', label: '60+ minutes', description: 'Deep, immersive sessions' }
    ]
  },
  {
    id: 'intensity',
    title: 'What intensity level do you prefer?',
    icon: Zap,
    type: 'radio',
    options: [
      { value: 'gentle', label: 'Gentle', description: 'Slow, restorative movements' },
      { value: 'moderate', label: 'Moderate', description: 'Balanced flow with some challenge' },
      { value: 'vigorous', label: 'Vigorous', description: 'Dynamic, energizing practice' }
    ]
  },
  {
    id: 'limitations',
    title: 'Do you have any physical limitations? (Optional)',
    icon: Shield,
    type: 'checkbox',
    options: [
      { value: 'back_issues', label: 'Back Issues', description: 'Lower or upper back concerns' },
      { value: 'knee_problems', label: 'Knee Problems', description: 'Knee pain or instability' },
      { value: 'neck_issues', label: 'Neck Issues', description: 'Neck pain or stiffness' },
      { value: 'wrist_pain', label: 'Wrist Pain', description: 'Wrist or carpal tunnel issues' },
      { value: 'shoulder_issues', label: 'Shoulder Issues', description: 'Shoulder pain or limited mobility' },
      { value: 'hip_tightness', label: 'Hip Tightness', description: 'Tight or inflexible hips' }
    ]
  },
  {
    id: 'styles',
    title: 'Which yoga styles interest you most?',
    icon: Heart,
    type: 'checkbox',
    options: [
      { value: 'hatha', label: 'Hatha Yoga', description: 'Slow-paced, static poses' },
      { value: 'vinyasa', label: 'Vinyasa Flow', description: 'Dynamic, flowing sequences' },
      { value: 'yin', label: 'Yin Yoga', description: 'Long-held, passive poses' },
      { value: 'restorative', label: 'Restorative', description: 'Deeply relaxing, supported poses' },
      { value: 'power', label: 'Power Yoga', description: 'Strong, athletic practice' },
      { value: 'kundalini', label: 'Kundalini', description: 'Spiritual practice with breathwork' }
    ]
  },
  {
    id: 'frequency',
    title: 'How often would you like to practice?',
    icon: Calendar,
    type: 'radio',
    options: [
      { value: 'daily', label: 'Daily', description: 'Every day commitment' },
      { value: '4-6-times', label: '4-6 times per week', description: 'Regular practice' },
      { value: '2-3-times', label: '2-3 times per week', description: 'Moderate commitment' },
      { value: 'weekly', label: 'Weekly', description: 'Once per week' }
    ]
  },
  {
    id: 'flexibility',
    title: 'How would you rate your current flexibility?',
    icon: Target,
    type: 'radio',
    options: [
      { value: 'low', label: 'Low', description: 'Tight muscles, limited range of motion' },
      { value: 'moderate', label: 'Moderate', description: 'Average flexibility' },
      { value: 'high', label: 'High', description: 'Very flexible, can touch toes easily' }
    ]
  },
  {
    id: 'strength',
    title: 'How would you rate your current strength?',
    icon: Zap,
    type: 'radio',
    options: [
      { value: 'low', label: 'Low', description: 'Difficulty with push-ups or planks' },
      { value: 'moderate', label: 'Moderate', description: 'Can do basic strength poses' },
      { value: 'high', label: 'High', description: 'Strong core and upper body' }
    ]
  },
  {
    id: 'stress',
    title: 'What is your current stress level?',
    icon: Heart,
    type: 'radio',
    options: [
      { value: 'low', label: 'Low', description: 'Generally calm and relaxed' },
      { value: 'moderate', label: 'Moderate', description: 'Some daily stress and tension' },
      { value: 'high', label: 'High', description: 'High stress, anxiety, or overwhelm' }
    ]
  }
];

export const YogaQuestionnaire = ({ onComplete }: YogaQuestionnaireProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const question = QUESTIONS[currentQuestion];
  const IconComponent = question.icon;

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    const currentAnswer = answers[question.id];
    
    // Validate required questions
    if (!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)) {
      toast({
        title: "Please select an answer",
        description: "This question is required to continue.",
        variant: "destructive"
      });
      return;
    }

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Create yoga profile from answers
      const yogaProfile: YogaProfile = {
        experience_level: answers.experience,
        primary_goals: answers.goals || [],
        available_time: answers.time,
        preferred_intensity: answers.intensity,
        physical_limitations: answers.limitations || [],
        preferred_styles: answers.styles || [],
        practice_frequency: answers.frequency,
        flexibility_level: answers.flexibility,
        strength_level: answers.strength,
        stress_level: answers.stress
      };

      // Save to database (you can create a yoga_profiles table)
      if (user) {
        await supabase.from('profiles').update({
          yoga_profile: yogaProfile as any,
          updated_at: new Date().toISOString()
        }).eq('user_id', user.id);
      }

      toast({
        title: "Assessment Complete!",
        description: "Your personalized yoga courses are ready.",
      });

      onComplete(yogaProfile);
      
    } catch (error: any) {
      console.error('Error saving yoga profile:', error);
      toast({
        title: "Error",
        description: "Failed to save your assessment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentAnswer = answers[question.id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-healing-soft/20 flex items-center justify-center p-4">
      <Card className="card-sacred max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <IconComponent className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{question.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {QUESTIONS.length}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="font-mono">
              {Math.round(progress)}%
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="space-y-6">
          {question.type === 'radio' ? (
            <RadioGroup
              value={currentAnswer || ''}
              onValueChange={(value) => handleAnswer(question.id, value)}
            >
              <div className="space-y-3">
                {question.options.map((option) => (
                  <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          ) : (
            <div className="space-y-3">
              {question.options.map((option) => (
                <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={option.value}
                    checked={currentAnswer?.includes(option.value) || false}
                    onCheckedChange={(checked) => {
                      const currentValues = currentAnswer || [];
                      if (checked) {
                        handleAnswer(question.id, [...currentValues, option.value]);
                      } else {
                        handleAnswer(question.id, currentValues.filter((v: string) => v !== option.value));
                      }
                    }}
                    className="mt-1"
                  />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </Label>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4 pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex-1 btn-hero"
            >
              {currentQuestion === QUESTIONS.length - 1 ? (
                <>
                  {isSubmitting ? 'Processing...' : 'Complete Assessment'}
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};