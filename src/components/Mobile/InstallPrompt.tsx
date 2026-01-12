import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface InstallPromptProps {
  className?: string;
}

const InstallPrompt = ({ className }: InstallPromptProps) => {
  const { canInstall, install, isInstalled, isStandalone } = usePWA();
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [installing, setInstalling] = useState<boolean>(false);

  // Check if user has dismissed before (persist for 7 days)
  useEffect(() => {
    const dismissedUntil = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedUntil) {
      const until = new Date(dismissedUntil);
      if (until > new Date()) {
        setDismissed(true);
      } else {
        localStorage.removeItem('pwa-prompt-dismissed');
      }
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    // Don't show again for 7 days
    const dismissUntil = new Date();
    dismissUntil.setDate(dismissUntil.getDate() + 7);
    localStorage.setItem('pwa-prompt-dismissed', dismissUntil.toISOString());
  };

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await install();
    } finally {
      setInstalling(false);
    }
  };

  // Don't show if already installed, can't install, or dismissed
  if (isInstalled || isStandalone || !canInstall || dismissed) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-20 left-4 right-4 z-50 animate-slide-up',
        className
      )}
    >
      <div className="bg-card border border-border rounded-xl p-4 shadow-xl shadow-primary/10">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
            <Smartphone className="w-6 h-6 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-mono font-semibold text-foreground text-sm">
              Install Forger
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Add to home screen for quick access and offline support
            </p>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleInstall}
                disabled={installing}
                className="gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                {installing ? 'Installing...' : 'Install'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-muted-foreground"
              >
                Maybe later
              </Button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
