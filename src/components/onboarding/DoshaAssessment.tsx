import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { useToast } from '@/hooks/use-toast';
import { DOSHA_QUESTIONS, calculateDoshaScores, getDominantDoshas } from '@/data/doshaQuestions';
import { DOSHA_INFO, DoshaType } from '@/types';
import { saveDoshaResponse } from '@/utils/localStorage';
import { ArrowLeft, ArrowRight, Sparkles, Wind, Flame, Mountain } from 'lucide-react';

interface DoshaAssessmentProps {
  onComplete: (dominantDosha: DoshaType, secondaryDosha: DoshaType) => void;
}

export const DoshaAssessment = ({ onComplete }: DoshaAssessmentProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<{ [questionId: number]: 'a' | 'b' | 'c' }>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{ dominant: DoshaType; secondary: DoshaType; scores: any } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, updateProfile } = useLocalAuth();
  const { toast } = useToast();

  const progress = ((currentQuestion + 1) / DOSHA_QUESTIONS.length) * 100;
  const question = DOSHA_QUESTIONS[currentQuestion];

  const handleAnswer = (answer: 'a' | 'b' | 'c') => {
    setResponses(prev => ({
      ...prev,
      [question.id]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < DOSHA_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Calculate results
      const scores = calculateDoshaScores(responses);
      const { dominant, secondary } = getDominantDoshas(scores);
      setResults({ dominant: dominant as DoshaType, secondary: secondary as DoshaType, scores });
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!results || !user) return;
    
    setIsSubmitting(true);
    
    try {
      // Save dosha assessment responses locally
      Object.entries(responses).forEach(([questionId, answer]) => {
        const question = DOSHA_QUESTIONS.find(q => q.id === parseInt(questionId));
        if (question) {
          saveDoshaResponse({
            user_id: user.id,
            question_id: parseInt(questionId),
            answer: answer
          });
        }
      });

      // Update user profile with dosha results
      await updateProfile({
        dosha_type: results.dominant
      });

      toast({
        title: "Assessment Complete!",
        description: `Your constitution: ${results.dominant.charAt(0).toUpperCase() + results.dominant.slice(1)} with ${results.secondary.charAt(0).toUpperCase() + results.secondary.slice(1)} influence`
      });

      onComplete(results.dominant, results.secondary);
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        title: "Error",
        description: "Failed to save assessment results",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDoshaIcon = (dosha: string) => {
    switch (dosha) {
      case 'vata': return <Wind className="w-8 h-8" />;
      case 'pitta': return <Flame className="w-8 h-8" />;
      case 'kapha': return <Mountain className="w-8 h-8" />;
      default: return <Sparkles className="w-8 h-8" />;
    }
  };

  if (showResults && results) {
    const dominantInfo = DOSHA_INFO[results.dominant];
    const secondaryInfo = DOSHA_INFO[results.secondary];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-healing-soft/30 flex items-center justify-center p-4">
        <Card className="card-sacred max-w-2xl w-full">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 p-6 rounded-full bg-primary/10">
              <Sparkles className="w-12 h-12 text-primary mx-auto" />
            </div>
            <CardTitle className="text-3xl font-bold text-sacred mb-2">
              Your Ayurvedic Constitution
            </CardTitle>
            <p className="text-muted-foreground">
              Based on your responses, here is your unique dosha profile
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Dominant Dosha */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className={`p-4 rounded-full bg-primary/10 ${dominantInfo.color}`}>
                  {getDoshaIcon(results.dominant)}
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold">Primary: {dominantInfo.sanskrit}</h3>
                  <p className="text-lg text-sacred">{results.dominant.charAt(0).toUpperCase() + results.dominant.slice(1)}</p>
                  <p className="text-sm text-muted-foreground">{dominantInfo.element}</p>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4 mb-4">
                <p className="text-sm leading-relaxed">
                  {dominantInfo.description}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {dominantInfo.qualities.map((quality, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {quality}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Secondary Dosha */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className={`p-3 rounded-full bg-secondary/10 ${secondaryInfo.color}`}>
                  {getDoshaIcon(results.secondary)}
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-semibold">Secondary: {secondaryInfo.sanskrit}</h4>
                  <p className="text-wisdom">{results.secondary.charAt(0).toUpperCase() + results.secondary.slice(1)} influence</p>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="bg-card/50 rounded-lg p-4">
              <h4 className="font-semibold text-center mb-4">Your Dosha Scores</h4>
              <div className="space-y-3">
                {Object.entries(results.scores).map(([dosha, score]) => (
                  <div key={dosha} className="flex items-center justify-between">
                    <span className="capitalize font-medium">{dosha}</span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={((score as number) / DOSHA_QUESTIONS.length) * 100} 
                        className="w-24 h-2" 
                      />
                      <span className="text-sm w-8">{score as number}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleComplete}
              disabled={isSubmitting}
              className="w-full btn-hero py-6"
            >
              {isSubmitting ? "Saving..." : "Complete Assessment"}
              <Sparkles className="ml-2 w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-healing-soft/30 flex items-center justify-center p-4">
      <Card className="card-sacred max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline">
              Question {currentQuestion + 1} of {DOSHA_QUESTIONS.length}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="mb-6" />
          
          <CardTitle className="text-xl leading-relaxed">
            {question.question}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <RadioGroup
            value={responses[question.id]}
            onValueChange={(value) => handleAnswer(value as 'a' | 'b' | 'c')}
            className="space-y-4"
          >
            {Object.entries(question.options).map(([key, option]) => (
              <div key={key} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                <RadioGroupItem value={key} id={`${question.id}-${key}`} className="mt-1" />
                <Label 
                  htmlFor={`${question.id}-${key}`} 
                  className="flex-1 cursor-pointer leading-relaxed"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!responses[question.id]}
              className="btn-sacred flex items-center gap-2"
            >
              {currentQuestion === DOSHA_QUESTIONS.length - 1 ? 'View Results' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};