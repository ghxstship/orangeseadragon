import { FieldRenderProps } from './index';
import { Input } from '@/components/ui/input';

export function DateField({ field, fieldKey, value, onChange, error, disabled }: FieldRenderProps) {
  // Handle daterange mode
  const isRange = field.type === 'daterange';

  if (isRange) {
    const [startDate, endDate] = Array.isArray(value) ? value : [value, null];

    return (
      <div className="flex space-x-2">
        <Input
          type="date"
          value={startDate || ''}
          onChange={(e) => {
            const newStart = e.target.value;
            onChange([newStart, endDate]);
          }}
          disabled={disabled}
          className={`flex-1 ${error ? 'border-destructive' : ''}`}
          placeholder={field.placeholder}
        />
        <span className="text-muted-foreground self-center">to</span>
        <Input
          type="date"
          value={endDate || ''}
          onChange={(e) => {
            const newEnd = e.target.value;
            onChange([startDate, newEnd]);
          }}
          disabled={disabled}
          className={`flex-1 ${error ? 'border-destructive' : ''}`}
        />
      </div>
    );
  }

  // Single date mode
  return (
    <Input
      type="date"
      id={fieldKey}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={error ? 'border-destructive' : ''}
      placeholder={field.placeholder}
    />
  );
}
