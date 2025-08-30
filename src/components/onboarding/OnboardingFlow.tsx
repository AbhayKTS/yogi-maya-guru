import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DoshaAssessment } from './DoshaAssessment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { DoshaType } from '@/types';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import heroTemple from '@/assets/hero-temple.jpg';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'dosha' | 'complete'>('welcome');
  const [doshaResults, setDoshaResults] = useState<{ dominant: DoshaType; secondary: DoshaType } | null>(null);
  const { profile } = useAuth();

  const handleDoshaComplete = (dominant: DoshaType, secondary: DoshaType) => {
    setDoshaResults({ dominant, secondary });
    setCurrentStep('complete');
  };

  const handleOnboardingComplete = () => {
    onComplete();
  };

  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-healing-soft/30">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl">
            {/* Left side - Content */}
            <div className="text-center lg:text-left space-y-8">
              <Logo size="lg" />
              
              <div className="space-y-6">
                <h1 className="text-5xl font-bold text-sacred leading-tight">
                  Welcome to Your
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold">
                    Sacred Journey
                  </span>
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Discover your unique Ayurvedic constitution and unlock personalized wellness guidance 
                  powered by ancient wisdom and modern AI.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-healing mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sacred">Dosha Assessment</h4>
                      <p className="text-sm text-muted-foreground">Discover your unique constitution</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-healing mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sacred">AI Yoga Guide</h4>
                      <p className="text-sm text-muted-foreground">Real-time pose correction</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-healing mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sacred">Daily Wisdom</h4>
                      <p className="text-sm text-muted-foreground">Sacred Sanskrit teachings</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-healing mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sacred">Maharathi Progress</h4>
                      <p className="text-sm text-muted-foreground">Gamified spiritual growth</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setCurrentStep('dosha')}
                  className="btn-hero text-lg px-8 py-6"
                >
                  Begin Your Assessment
                  <Sparkles className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Right side - Hero Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-[var(--shadow-golden)] animate-gentle-float">
              <img 
                src={heroTemple} 
                alt="Sacred temple at sunrise" 
                className="w-full h-96 lg:h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-gold/20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'dosha') {
    return <DoshaAssessment onComplete={handleDoshaComplete} />;
  }

  if (currentStep === 'complete' && doshaResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-healing-soft/30 flex items-center justify-center p-4">
        <Card className="card-sacred max-w-2xl w-full">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 p-6 rounded-full bg-gradient-to-r from-primary to-gold animate-sacred-glow">
              <Sparkles className="w-12 h-12 text-white mx-auto" />
            </div>
            <CardTitle className="text-3xl font-bold text-sacred mb-2">
              Welcome to Your Journey!
            </CardTitle>
            <p className="text-muted-foreground">
              Your personalized Ayur.AI Guru experience is ready
            </p>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <div className="bg-card/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-wisdom mb-2">
                Your Constitution: {doshaResults.dominant.charAt(0).toUpperCase() + doshaResults.dominant.slice(1)}
              </h3>
              <p className="text-muted-foreground">
                With {doshaResults.secondary.charAt(0).toUpperCase() + doshaResults.secondary.slice(1)} influence
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-sacred">What's Next?</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-muted/20 rounded-lg p-4">
                  <h5 className="font-medium text-primary mb-1">Daily Recommendations</h5>
                  <p className="text-muted-foreground">Personalized yoga, diet, and pranayama</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-4">
                  <h5 className="font-medium text-spiritual mb-1">AI Yoga Studio</h5>
                  <p className="text-muted-foreground">Real-time pose detection and feedback</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-4">
                  <h5 className="font-medium text-healing mb-1">Sacred Wisdom</h5>
                  <p className="text-muted-foreground">Daily Sanskrit teachings and insights</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-4">
                  <h5 className="font-medium text-gold mb-1">Maharathi Path</h5>
                  <p className="text-muted-foreground">Track your spiritual progress</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleOnboardingComplete}
              className="w-full btn-hero py-6"
            >
              Enter Your Dashboard
              <Sparkles className="ml-2 w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};