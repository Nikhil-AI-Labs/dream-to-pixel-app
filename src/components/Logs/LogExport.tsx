import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileJson, FileText, Cloud, Loader2 } from 'lucide-react';
import { LogEntry } from '@/types/agent';
import { toast } from 'sonner';
import { useStorage } from '@/hooks/useStorage';

interface LogExportProps {
  logs: LogEntry[];
}

const LogExport = ({ logs }: LogExportProps) => {
  const { exportLogs } = useStorage();
  const [isExporting, setIsExporting] = useState(false);

  const exportAsJSON = () => {
    const exportData = logs.map((log) => ({
      timestamp: log.timestamp.toISOString(),
      level: log.level,
      message: log.message,
      source: log.source,
      metadata: log.metadata,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    downloadFile(blob, 'forger-logs.json');
    toast.success('Logs exported as JSON');
  };

  const exportAsText = () => {
    const lines = logs.map((log) => {
      const timestamp = log.timestamp.toISOString();
      const source = log.source ? `[${log.source}]` : '';
      return `${timestamp} [${log.level}] ${source} ${log.message}`;
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    downloadFile(blob, 'forger-logs.txt');
    toast.success('Logs exported as text');
  };

  const exportToCloud = async () => {
    setIsExporting(true);
    try {
      const exportData = logs.map((log) => ({
        timestamp: log.timestamp.toISOString(),
        level: log.level,
        message: log.message,
        source: log.source,
        metadata: log.metadata,
      }));

      const downloadUrl = await exportLogs(exportData);
      
      // Open download URL in new tab
      window.open(downloadUrl, '_blank');
      toast.success('Logs exported to cloud storage');
    } catch (error) {
      console.error('Cloud export failed:', error);
      toast.error('Failed to export logs to cloud');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.split('.')[0]}-${new Date().toISOString().split('T')[0]}.${filename.split('.')[1]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAsJSON} className="gap-2 cursor-pointer">
          <FileJson className="h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsText} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4" />
          Export as Text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCloud} className="gap-2 cursor-pointer" disabled={isExporting}>
          <Cloud className="h-4 w-4" />
          Export to Cloud
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LogExport;
