import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Terminal } from 'lucide-react';

const Logs = () => {
  return (
    <MainLayout>
      <div className="p-4 space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-mono font-bold text-primary">Logs</h1>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Terminal className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium text-foreground mb-2">No Logs Yet</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Start automation to see detailed logs here.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Logs;
