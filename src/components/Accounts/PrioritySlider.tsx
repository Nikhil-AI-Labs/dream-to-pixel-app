import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface PrioritySliderProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  disabled?: boolean;
  className?: string;
}

const PrioritySlider = ({
  value,
  onChange,
  max = 10,
  disabled,
  className,
}: PrioritySliderProps) => {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm">Priority</Label>
        <span className="text-sm font-mono text-amber">#{value}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={1}
        max={max}
        step={1}
        disabled={disabled}
        className="[&>span:first-child]:bg-secondary [&>span:first-child>span]:bg-amber"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Highest</span>
        <span>Lowest</span>
      </div>
    </div>
  );
};

export default PrioritySlider;
