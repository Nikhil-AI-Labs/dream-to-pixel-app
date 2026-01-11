import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';

const Accounts = () => {
  return (
    <MainLayout>
      <div className="p-4 space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-mono font-bold text-primary">Accounts</h1>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Account
          </Button>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium text-foreground mb-2">No Accounts Yet</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Add your Google accounts to start automating Colab notebooks.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Accounts;
