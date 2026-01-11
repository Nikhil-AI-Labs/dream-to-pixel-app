import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Key, Bell, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to Forger',
    icon: Rocket,
    description: 'Your AI-powered Colab automation command center.',
  },
  {
    id: 'api-keys',
    title: 'Configure API Keys',
    icon: Key,
    description: 'Set up your OpenRouter and Gemini API keys.',
  },
  {
    id: 'notifications',
    title: 'Enable Notifications',
    icon: Bell,
    description: 'Stay updated with push notifications.',
  },
];

const Setup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                'w-3 h-3 rounded-full transition-all',
                index === currentStep
                  ? 'bg-primary glow-electric scale-125'
                  : index < currentStep
                  ? 'bg-neon'
                  : 'bg-secondary'
              )}
            />
          ))}
        </div>

        {/* Step Card */}
        <Card className="border-border bg-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/20 border border-primary/50 flex items-center justify-center glow-electric">
              <CurrentIcon className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl font-mono text-primary">
              {steps[currentStep].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground">
              {steps[currentStep].description}
            </p>

            {currentStep === 0 && (
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Check className="w-5 h-5 text-neon" />
                  <span className="text-sm">Manage multiple Google accounts</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Check className="w-5 h-5 text-neon" />
                  <span className="text-sm">Automate notebook execution</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Check className="w-5 h-5 text-neon" />
                  <span className="text-sm">Monitor training progress in real-time</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSkip}
                className="flex-1"
              >
                Skip for now
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Setup;
