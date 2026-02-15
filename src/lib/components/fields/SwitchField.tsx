import { FieldRenderProps } from './index';
import { Switch } from '@/components/ui/switch';

export function SwitchField({ field, fieldKey, value, onChange, error, disabled }: FieldRenderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <label htmlFor={fieldKey} className="text-sm font-medium text-foreground">
          {field.label}
        </label>
        {field.helpText && (
          <p className="text-xs text-muted-foreground">{field.helpText}</p>
        )}
      </div>
      <Switch
        id={fieldKey}
        checked={Boolean(value)}
        onCheckedChange={(checked) => onChange(checked)}
        disabled={disabled}
      />
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}
