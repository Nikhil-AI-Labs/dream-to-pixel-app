import { useEffect, useRef, useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import LogFilter from '@/components/Logs/LogFilter';
import VirtualLogList from '@/components/Logs/VirtualLogList';
import LogExport from '@/components/Logs/LogExport';
import { useLogs } from '@/hooks/useLogs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

const Logs = () => {
  const {
    logs,
    loading,
    activeFilters,
    searchTerm,
    autoScroll,
    setSearchTerm,
    setAutoScroll,
    toggleFilter,
    clearFilters,
    clearLogs,
    filteredCount,
    totalCount,
  } = useLogs();

  const containerRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(400);

  // Calculate available height for the list
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Subtract header (64) + filter (~120) + footer (~64) + padding
        const availableHeight = window.innerHeight - rect.top - 64 - 16;
        setListHeight(Math.max(300, availableHeight));
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center space-y-4">
            <Terminal className="w-12 h-12 text-primary mx-auto animate-pulse" />
            <p className="text-muted-foreground font-mono">Loading logs...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-full animate-fade-in" ref={containerRef}>
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-border">
          <h1 className="text-xl font-mono font-bold text-primary">Logs</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">
              {filteredCount} / {totalCount}
            </span>
          </div>
        </div>

        {/* Filters */}
        <LogFilter
          activeFilters={activeFilters}
          searchTerm={searchTerm}
          onFilterChange={toggleFilter}
          onSearchChange={setSearchTerm}
          onClear={clearFilters}
        />

        {/* Log List */}
        <div className="flex-1 overflow-hidden">
          <VirtualLogList
            logs={logs}
            height={listHeight}
            autoScroll={autoScroll}
            compact={false}
          />
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-card border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="auto-scroll"
                  checked={autoScroll}
                  onCheckedChange={setAutoScroll}
                />
                <Label htmlFor="auto-scroll" className="text-sm text-muted-foreground">
                  Auto-scroll
                </Label>
              </div>
              <span className="text-sm text-muted-foreground font-mono">
                {filteredCount} entries
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearLogs}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
              <LogExport logs={logs} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Logs;
