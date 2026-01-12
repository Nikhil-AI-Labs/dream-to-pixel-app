import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileJson, FileText } from 'lucide-react';
import { LogEntry } from '@/types/agent';
import { toast } from 'sonner';

interface LogExportProps {
  logs: LogEntry[];
}

const LogExport = ({ logs }: LogExportProps) => {
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
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LogExport;
