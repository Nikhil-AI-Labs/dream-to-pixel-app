import { StopCircle, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { AgentStatus } from '@/types/agent';
import { useAuth } from '@/contexts/AuthContext';
import ConnectionStatus from '@/components/Dashboard/ConnectionStatus';

interface HeaderProps {
  agentStatus?: AgentStatus;
  onEmergencyStop?: () => void;
}

const Header = ({ agentStatus = 'IDLE', onEmergencyStop }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const isAgentRunning = agentStatus === 'RUNNING' || agentStatus === 'SWITCHING_ACCOUNTS';

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

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
          <ConnectionStatus />

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="w-5 h-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {user && (
                <>
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleSignOut} className="gap-2 cursor-pointer text-destructive">
                <LogOut className="w-4 h-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
