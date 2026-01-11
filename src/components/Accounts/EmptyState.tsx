import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  title?: string;
  description?: string;
  showAddButton?: boolean;
}

const EmptyState = ({
  title = 'No Accounts Yet',
  description = 'Add your Google accounts to start automating Colab notebooks.',
  showAddButton = true,
}: EmptyStateProps) => {
  const navigate = useNavigate();

  return (
    <Card className="border-border bg-card border-dashed">
      <CardContent className="p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-medium text-foreground mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground max-w-xs mb-4">
          {description}
        </p>
        {showAddButton && (
          <Button onClick={() => navigate('/accounts/new')} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Account
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
