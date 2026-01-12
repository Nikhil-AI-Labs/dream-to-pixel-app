import { useState, useEffect, useCallback, useMemo } from 'react';
import { LogEntry, LogLevel } from '@/types/agent';

// Mock log data for development
const generateMockLogs = (): LogEntry[] => {
  const levels: LogLevel[] = ['ACTIONS', 'VISION', 'ALERTS', 'ERROR', 'INFO'];
  const messages = {
    ACTIONS: [
      'Clicking "Run all" button',
      'Navigating to notebook URL',
      'Scrolling to cell #5',
      'Executing cell block',
      'Starting automation sequence',
      'Mouse moved to (450, 320)',
    ],
    VISION: [
      'Screenshot captured and encoded',
      'Dialog detected: Drive permission request',
      'GPU status meter visible',
      'Cell output analyzed',
      'UI state verified',
    ],
    ALERTS: [
      'GPU quota at 80%',
      'Session active for 45 minutes',
      'Drive mount successful',
      'Account rotation scheduled',
    ],
    ERROR: [
      'Connection timeout after 30s',
      'Element not found: #run-button',
      'Authentication popup failed to load',
      'Cell execution error detected',
    ],
    INFO: [
      'Agent initialized for account_01',
      'Heartbeat #42 sent',
      'Keep-alive activity simulated',
      'Runtime status: Connected',
    ],
  };

  const logs: LogEntry[] = [];
  const now = new Date();

  for (let i = 0; i < 100; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)];
    const levelMessages = messages[level];
    const message = levelMessages[Math.floor(Math.random() * levelMessages.length)];
    
    logs.push({
      id: `log-${i}`,
      timestamp: new Date(now.getTime() - i * 30000), // 30 seconds apart
      level,
      message: `${message} (attempt ${Math.floor(Math.random() * 5) + 1})`,
      source: ['ColabAgent', 'VisionModule', 'AuthHandler', 'GPUMonitor'][Math.floor(Math.random() * 4)],
      metadata: Math.random() > 0.7 ? { duration: Math.floor(Math.random() * 1000), retries: Math.floor(Math.random() * 3) } : undefined,
    });
  }

  return logs;
};

export const useLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeFilters, setActiveFilters] = useState<LogLevel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load initial logs
  useEffect(() => {
    setLoading(true);
    // Simulate async load
    setTimeout(() => {
      setLogs(generateMockLogs());
      setLoading(false);
    }, 500);
  }, []);

  // Filter logs based on active filters and search term
  const filteredLogs = useMemo(() => {
    let result = [...logs];

    // Apply level filters
    if (activeFilters.length > 0) {
      result = result.filter(log => activeFilters.includes(log.level));
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(log =>
        log.message.toLowerCase().includes(term) ||
        log.source?.toLowerCase().includes(term) ||
        log.level.toLowerCase().includes(term)
      );
    }

    return result;
  }, [logs, activeFilters, searchTerm]);

  const toggleFilter = useCallback((level: LogLevel) => {
    setActiveFilters(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters([]);
    setSearchTerm('');
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const addLog = useCallback((log: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    setLogs(prev => [newLog, ...prev]);
  }, []);

  const exportLogs = useCallback(() => {
    const exportData = filteredLogs.map(log => ({
      timestamp: log.timestamp.toISOString(),
      level: log.level,
      message: log.message,
      source: log.source,
      metadata: log.metadata,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forger-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filteredLogs]);

  return {
    logs: filteredLogs,
    allLogs: logs,
    loading,
    activeFilters,
    searchTerm,
    autoScroll,
    setSearchTerm,
    setAutoScroll,
    toggleFilter,
    clearFilters,
    clearLogs,
    addLog,
    exportLogs,
    totalCount: logs.length,
    filteredCount: filteredLogs.length,
  };
};
