import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Bell, Rocket, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { notificationService } from '@/services/notifications';
import { useToast } from '@/hooks/use-toast';
import LoadingFallback from '@/components/LoadingFallback';

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to Forger',
    icon: Rocket,
    description: 'Your AI-powered Colab automation command center.',
    canSkip: false,
  },
  {
    id: 'notifications',
    title: 'Enable Notifications',
    icon: Bell,
    description: 'Stay updated with push notifications for agent status changes.',
    canSkip: true,
  },
];

const Setup = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, loading } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Show loading while checking auth
  if (loading) {
    return <LoadingFallback />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to dashboard if setup already completed
  if (profile?.setup_completed) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleEnableNotifications = async () => {
    try {
      const granted = await notificationService.requestPermission();
      if (granted) {
        setNotificationsEnabled(true);
        toast({
          title: 'Notifications Enabled',
          description: 'You will now receive push notifications.',
        });
      } else {
        toast({
          title: 'Notifications Blocked',
          description: 'You can enable them later in settings.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to enable notifications.',
        variant: 'destructive',
      });
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await updateProfile({ setup_completed: true });
      toast({
        title: 'Setup Complete!',
        description: 'Welcome to Forger. Start automating your Colab notebooks.',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete setup. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCompleting(false);
    }
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

            {/* Welcome Step Content */}
            {currentStep === 0 && (
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Check className="w-5 h-5 text-neon flex-shrink-0" />
                  <span className="text-sm">Manage multiple Google accounts</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Check className="w-5 h-5 text-neon flex-shrink-0" />
                  <span className="text-sm">Automate notebook execution</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Check className="w-5 h-5 text-neon flex-shrink-0" />
                  <span className="text-sm">Monitor training progress in real-time</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Check className="w-5 h-5 text-neon flex-shrink-0" />
                  <span className="text-sm">Automatic GPU quota management</span>
                </div>
              </div>
            )}

            {/* Notifications Step Content */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-neon flex-shrink-0" />
                    <span className="text-sm text-left">Agent status changes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-neon flex-shrink-0" />
                    <span className="text-sm text-left">GPU quota warnings</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-neon flex-shrink-0" />
                    <span className="text-sm text-left">Error alerts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-neon flex-shrink-0" />
                    <span className="text-sm text-left">Training completion notifications</span>
                  </div>
                </div>

                {!notificationsEnabled ? (
                  <Button
                    onClick={handleEnableNotifications}
                    variant="outline"
                    className="w-full"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Enable Push Notifications
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-neon">
                    <Check className="w-5 h-5" />
                    <span>Notifications Enabled</span>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              
              {steps[currentStep].canSkip && (
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="flex-1"
                >
                  Skip for now
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={isCompleting}
              >
                {isCompleting ? (
                  'Completing...'
                ) : currentStep === steps.length - 1 ? (
                  'Get Started'
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Setup;
