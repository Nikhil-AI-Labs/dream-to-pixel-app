import { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import StatusCard from '@/components/Dashboard/StatusCard';
import ActiveAccountCard from '@/components/Dashboard/ActiveAccountCard';
import ScreenshotViewer from '@/components/Dashboard/ScreenshotViewer';
import LogPreview from '@/components/Dashboard/LogPreview';
import QuickActions from '@/components/Dashboard/QuickActions';
import GPUStatusMeter from '@/components/Dashboard/GPUStatusMeter';
import type { AgentStatus, Account, LogEntry, GPUStatus } from '@/types/agent';

// Mock data for demonstration
const mockAccount: Account = {
  id: '1',
  name: 'Training Account 1',
  email: 'ml-training@example.com',
  notebookUrl: 'https://colab.research.google.com/drive/example',
  priority: 1,
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 30000),
    level: 'ACTIONS',
    message: 'Executed cell 5/12 successfully',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 60000),
    level: 'VISION',
    message: 'Detected training progress: Epoch 15/100',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 120000),
    level: 'INFO',
    message: 'Connected to Colab runtime',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 180000),
    level: 'ALERTS',
    message: 'GPU quota at 75% usage',
  },
];

const mockGPUStatus: GPUStatus = {
  used: 8,
  limit: 12,
  quotaResetAt: new Date(Date.now() + 86400000 * 3),
};

const Dashboard = () => {
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('IDLE');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [activeAccount] = useState<Account | null>(mockAccount);
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = () => {
    setIsLoading(true);
    setTimeout(() => {
      setAgentStatus('RUNNING');
      setStartTime(new Date());
      setIsLoading(false);
    }, 1000);
  };

  const handleStop = () => {
    setIsLoading(true);
    setTimeout(() => {
      setAgentStatus('IDLE');
      setStartTime(null);
      setIsLoading(false);
    }, 500);
  };

  const handlePause = () => {
    setAgentStatus('PAUSED');
  };

  const handleResume = () => {
    setAgentStatus('RUNNING');
  };

  const handleForceSwitch = () => {
    setAgentStatus('SWITCHING_ACCOUNTS');
    setTimeout(() => {
      setAgentStatus('RUNNING');
    }, 3000);
  };

  const handleEmergencyStop = () => {
    setAgentStatus('IDLE');
    setStartTime(null);
  };

  return (
    <MainLayout agentStatus={agentStatus} onEmergencyStop={handleEmergencyStop}>
      <div className="p-4 space-y-4 animate-fade-in">
        {/* Status Card */}
        <StatusCard status={agentStatus} startTime={startTime} />

        {/* Active Account */}
        <ActiveAccountCard
          account={activeAccount}
          onSwitch={handleForceSwitch}
          isLoading={agentStatus === 'SWITCHING_ACCOUNTS'}
        />

        {/* GPU Status */}
        <GPUStatusMeter gpuStatus={mockGPUStatus} />

        {/* Live Screenshot */}
        <ScreenshotViewer
          screenshotUrl={agentStatus !== 'IDLE' ? 'https://via.placeholder.com/800x450/1a1a1a/00d4ff?text=Colab+Session' : null}
          agentStatus={agentStatus}
        />

        {/* Quick Actions */}
        <QuickActions
          status={agentStatus}
          onStart={handleStart}
          onStop={handleStop}
          onPause={handlePause}
          onResume={handleResume}
          onForceSwitch={handleForceSwitch}
          isLoading={isLoading}
        />

        {/* Log Preview */}
        <LogPreview logs={agentStatus !== 'IDLE' ? mockLogs : []} />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
