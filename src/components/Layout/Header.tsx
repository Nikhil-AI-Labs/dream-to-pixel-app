import { Wifi, WifiOff, StopCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AgentStatus } from '@/types/agent';

interface HeaderProps {
  isOnline?: boolean;
  agentStatus?: AgentStatus;
  onEmergencyStop?: () => void;
}

const Header = ({ isOnline = true, agentStatus = 'IDLE', onEmergencyStop }: HeaderProps) => {
  const isAgentRunning = agentStatus === 'RUNNING' || agentStatus === 'SWITCHING_ACCOUNTS';

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border safe-top">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center glow-electric">
            <span className="font-mono font-bold text-primary text-sm">F</span>
          </div>
          <h1 className="font-mono font-bold text-lg text-primary text-glow-electric">
            FORGER
          </h1>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs',
              isOnline
                ? 'bg-neon/10 text-neon'
                : 'bg-destructive/10 text-destructive'
            )}
          >
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5" />
            ) : (
              <WifiOff className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {isOnline ? 'Connected' : 'Offline'}
            </span>
          </div>

          {/* Emergency Stop */}
          {isAgentRunning && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onEmergencyStop}
              className="gap-1.5 animate-pulse"
            >
              <StopCircle className="w-4 h-4" />
              <span className="hidden sm:inline">STOP</span>
            </Button>
          )}

          {/* User Menu */}
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
