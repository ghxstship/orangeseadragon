import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface FormFieldOption {
  value: string;
  label: string;
}

interface FormFieldProps {
  name: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date' | 'time' | 'datetime-local' | 'tel' | 'url';
  placeholder?: string;
  value?: string | number | boolean;
  onChange?: (value: string | number | boolean) => void;
  options?: FormFieldOption[];
  required?: boolean;
  disabled?: boolean;
  error?: string;
  description?: string;
  className?: string;
  rows?: number;
}

export function FormField({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error,
  description,
  className,
  rows = 3,
}: FormFieldProps) {
  const handleChange = (newValue: string | number | boolean) => {
    onChange?.(newValue);
  };

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            id={name}
            name={name}
            placeholder={placeholder}
            value={value as string}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            rows={rows}
            className={cn(error && 'border-destructive')}
          />
        );

      case 'select':
        return (
          <Select
            value={value as string}
            onValueChange={handleChange}
            disabled={disabled}
          >
            <SelectTrigger className={cn(error && 'border-destructive')}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={value as boolean}
              onCheckedChange={handleChange}
              disabled={disabled}
            />
            {label && (
              <Label htmlFor={name} className="text-sm font-normal cursor-pointer">
                {label}
              </Label>
            )}
          </div>
        );

      default:
        return (
          <Input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value as string}
            onChange={(e) => handleChange(type === 'number' ? Number(e.target.value) : e.target.value)}
            disabled={disabled}
            className={cn(error && 'border-destructive')}
          />
        );
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && type !== 'checkbox' && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {renderField()}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
