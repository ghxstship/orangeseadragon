import { FieldRenderProps } from './index';

export function CheckboxField({ field, fieldKey, value, onChange, error, disabled }: FieldRenderProps) {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id={fieldKey}
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="h-4 w-4 text-primary border-input rounded focus:ring-ring"
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
