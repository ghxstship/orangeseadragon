import { FieldRenderProps } from './index';

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
      <button
        type="button"
        role="switch"
        aria-checked={Boolean(value)}
        onClick={() => onChange(!value)}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${Boolean(value) ? 'bg-primary' : 'bg-muted'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${Boolean(value) ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}
