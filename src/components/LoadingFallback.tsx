import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingFallbackProps {
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

const LoadingFallback = ({ 
  message = 'Loading...', 
  className,
  fullScreen = true 
}: LoadingFallbackProps) => {
  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center bg-background',
        fullScreen ? 'min-h-screen' : 'min-h-[200px]',
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Animated Logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-xl bg-primary/20 border border-primary/50 flex items-center justify-center glow-electric animate-pulse">
            <span className="font-mono font-bold text-primary text-2xl">F</span>
          </div>
          <Loader2 className="absolute -bottom-2 -right-2 w-6 h-6 text-primary animate-spin" />
        </div>
        
        {/* Loading text */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground font-mono">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingFallback;
