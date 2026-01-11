import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentStatus } from '@/types/agent';

interface ScreenshotViewerProps {
  screenshotUrl?: string | null;
  agentStatus: AgentStatus;
  onRefresh?: () => void;
  className?: string;
}

const ScreenshotViewer = ({
  screenshotUrl,
  agentStatus,
  onRefresh,
  className,
}: ScreenshotViewerProps) => {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const isRunning = agentStatus === 'RUNNING' || agentStatus === 'SWITCHING_ACCOUNTS';
  const showPlaceholder = !screenshotUrl || agentStatus === 'IDLE';

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));

  return (
    <Card className={cn('border-border bg-card overflow-hidden', className)}>
      <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-mono font-medium text-primary flex items-center gap-2">
          <Monitor className="w-4 h-4" />
          Live View
          {isRunning && (
            <span className="flex items-center gap-1 text-xs text-neon">
              <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
              LIVE
            </span>
          )}
        </CardTitle>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs font-mono text-muted-foreground w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsFullscreen(true)}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onRefresh}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div
          className={cn(
            'relative aspect-video bg-charcoal-900 overflow-hidden',
            'flex items-center justify-center'
          )}
        >
          {showPlaceholder ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground gap-3 p-4">
              <Monitor className="w-12 h-12 opacity-30" />
              <p className="text-sm text-center">
                {agentStatus === 'IDLE'
                  ? 'Start automation to view live screenshot'
                  : 'Waiting for screenshot...'}
              </p>
            </div>
          ) : (
            <div
              className="w-full h-full overflow-auto"
              style={{ touchAction: 'pan-x pan-y' }}
            >
              <img
                src={screenshotUrl}
                alt="Colab Screenshot"
                className="transition-transform duration-200"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
              />
            </div>
          )}

          {/* Scan line overlay for running state */}
          {isRunning && !showPlaceholder && (
            <div className="absolute inset-0 pointer-events-none scanlines" />
          )}
        </div>
      </CardContent>

      {/* Fullscreen Modal - simplified for now */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white"
            onClick={() => setIsFullscreen(false)}
          >
            ✕
          </Button>
          {screenshotUrl && (
            <img
              src={screenshotUrl}
              alt="Colab Screenshot Fullscreen"
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>
      )}
    </Card>
  );
};

export default ScreenshotViewer;
