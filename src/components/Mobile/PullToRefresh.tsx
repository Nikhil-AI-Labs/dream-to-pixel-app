import { useState, useRef, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  threshold?: number;
}

const PullToRefresh = ({
  onRefresh,
  children,
  className,
  disabled = false,
  threshold = 80,
}: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || refreshing) return;
    
    // Only activate if scrolled to top
    const container = containerRef.current;
    if (container && container.scrollTop > 0) return;

    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || refreshing || startY.current === 0) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    // Only allow pulling down
    if (diff < 0) {
      setPullDistance(0);
      return;
    }

    // Apply resistance
    const resistance = 0.4;
    const newDistance = Math.min(diff * resistance, threshold * 1.5);
    setPullDistance(newDistance);
  };

  const handleTouchEnd = async () => {
    if (disabled || refreshing) return;

    if (pullDistance >= threshold) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }

    setPullDistance(0);
    startY.current = 0;
  };

  const progress = Math.min(pullDistance / threshold, 1);
  const shouldTrigger = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          'absolute left-0 right-0 flex items-center justify-center transition-all duration-200 pointer-events-none z-10',
          (pullDistance > 0 || refreshing) ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          top: -40 + (refreshing ? threshold * 0.5 : pullDistance),
          height: 40,
        }}
      >
        <div
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
            shouldTrigger || refreshing
              ? 'bg-primary/20 border-primary text-primary'
              : 'bg-muted border-muted-foreground/30 text-muted-foreground'
          )}
        >
          <RefreshCw
            className={cn(
              'w-5 h-5 transition-transform',
              refreshing && 'animate-spin'
            )}
            style={{
              transform: refreshing
                ? undefined
                : `rotate(${progress * 180}deg)`,
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${refreshing ? threshold * 0.5 : pullDistance}px)`,
          transition: pullDistance === 0 && !refreshing ? 'transform 0.2s ease-out' : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
