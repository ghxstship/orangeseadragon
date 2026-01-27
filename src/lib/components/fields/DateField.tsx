import { FieldRenderProps } from './index';

export function DateField({ field, fieldKey, value, onChange, error, disabled }: FieldRenderProps) {
  // Handle daterange mode
  const isRange = field.type === 'daterange';

  if (isRange) {
    const [startDate, endDate] = Array.isArray(value) ? value : [value, null];

    return (
      <div className="flex space-x-2">
        <input
          type="date"
          value={startDate || ''}
          onChange={(e) => {
            const newStart = e.target.value;
            onChange([newStart, endDate]);
          }}
          disabled={disabled}
          className={`flex-1 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring ${error ? 'border-destructive' : 'border-input'}`}
          placeholder={field.placeholder}
        />
        <span className="text-muted-foreground self-center">to</span>
        <input
          type="date"
          value={endDate || ''}
          onChange={(e) => {
            const newEnd = e.target.value;
            onChange([startDate, newEnd]);
          }}
          disabled={disabled}
          className={`flex-1 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring ${error ? 'border-destructive' : 'border-input'}`}
        />
      </div>
    );
  }

  // Single date mode
  return (
    <input
      type="date"
      id={fieldKey}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring ${error ? 'border-destructive' : 'border-input'}`}
      placeholder={field.placeholder}
    />
  );
}
