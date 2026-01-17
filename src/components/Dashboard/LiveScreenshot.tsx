import { useState } from 'react';
import { useLiveScreenshots } from '@/hooks/useRealtime';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Wifi, WifiOff, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveScreenshotProps {
  sessionId: string | null;
  className?: string;
}

const LiveScreenshot = ({ sessionId, className }: LiveScreenshotProps) => {
  const { currentScreenshot, isConnected, isLoading } = useLiveScreenshots(sessionId);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!sessionId) {
    return (
      <Card className={cn('border-border bg-card', className)}>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Image className="w-12 h-12 opacity-50" />
            <p>No active session</p>
            <p className="text-xs">Start an automation session to view live screenshots</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={cn('border-border bg-card', className)}>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p>Loading screenshot...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'border-border bg-card overflow-hidden',
      isFullscreen && 'fixed inset-4 z-50',
      className
    )}>
      <CardHeader className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              isConnected ? 'bg-neon animate-pulse' : 'bg-destructive'
            )} />
            <CardTitle className="text-sm font-mono text-primary">
              Live Feed
            </CardTitle>
            {isConnected ? (
              <Wifi className="w-3.5 h-3.5 text-neon" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-destructive" />
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[50px] text-center font-mono">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setZoom(Math.min(3, zoom + 0.25))}
              disabled={zoom >= 3}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {currentScreenshot ? (
          <>
            <div className={cn(
              'overflow-auto bg-background/50',
              isFullscreen ? 'max-h-[calc(100vh-12rem)]' : 'max-h-96'
            )}>
              <img
                src={currentScreenshot.url}
                alt="Live screenshot"
                style={{ 
                  transform: `scale(${zoom})`, 
                  transformOrigin: 'top left',
                  maxWidth: zoom > 1 ? 'none' : '100%'
                }}
                className="w-full h-auto"
                onError={(e) => {
                  console.error('Failed to load screenshot');
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
            <div className="p-2 border-t border-border text-xs text-muted-foreground font-mono">
              Updated: {new Date(currentScreenshot.created_at).toLocaleTimeString()}
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Image className="w-12 h-12 opacity-50" />
              <p>Waiting for first screenshot...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveScreenshot;
