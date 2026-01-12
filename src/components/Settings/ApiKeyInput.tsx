import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApiKeyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  className?: string;
}

const ApiKeyInput = ({
  label,
  value,
  onChange,
  placeholder = 'Enter API key...',
  description,
  className,
}: ApiKeyInputProps) => {
  const [showKey, setShowKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const hasValue = value.length > 0;
  const maskedValue = hasValue ? `${'•'.repeat(Math.min(value.length, 20))}${value.slice(-4)}` : '';

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm text-foreground">{label}</Label>
      
      {isEditing ? (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showKey ? 'text' : 'password'}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder={placeholder}
              className="pr-10 bg-secondary border-border font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <Button size="icon" variant="ghost" onClick={handleSave} className="text-primary hover:text-primary">
            <Check size={16} />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleCancel} className="text-muted-foreground">
            <X size={16} />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="flex-1 px-3 py-2 bg-secondary border border-border rounded-md text-sm font-mono text-muted-foreground">
            {hasValue ? maskedValue : <span className="text-muted-foreground/50">Not configured</span>}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTempValue(value);
              setIsEditing(true);
            }}
          >
            {hasValue ? 'Edit' : 'Add'}
          </Button>
        </div>
      )}

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export default ApiKeyInput;
