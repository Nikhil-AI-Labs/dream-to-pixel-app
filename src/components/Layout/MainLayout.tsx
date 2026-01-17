import { ReactNode } from 'react';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import type { AgentStatus } from '@/types/agent';

interface MainLayoutProps {
  children: ReactNode;
  agentStatus?: AgentStatus;
  onEmergencyStop?: () => void;
}

const MainLayout = ({ children, agentStatus = 'IDLE', onEmergencyStop }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        agentStatus={agentStatus}
        onEmergencyStop={onEmergencyStop}
      />
      
      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
