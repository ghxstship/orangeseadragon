import { FieldRenderProps } from './index';
import { Checkbox } from '@/components/ui/checkbox';

export function CheckboxField({ field, fieldKey, value, onChange, error, disabled }: FieldRenderProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={fieldKey}
        checked={Boolean(value)}
        onCheckedChange={(checked) => onChange(checked === true)}
        disabled={disabled}
      />
      <label htmlFor={fieldKey} className="text-sm text-foreground">
        {field.label}
      </label>
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
