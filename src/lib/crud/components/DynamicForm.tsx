"use client";

import { useState } from 'react';
import { EntitySchema } from '@/lib/schema/types';
import { FieldRenderer } from '../../components/fields';
import { Button } from '@/components/ui/button';

interface DynamicFormProps {
  schema: EntitySchema;
  mode: 'create' | 'edit';
  initialData?: any;
  onSubmit: (data: any) => void | Promise<void>;
  autosave?: boolean;
}

/**
 * DYNAMIC FORM COMPONENT
 *
 * Renders a form based on schema configuration.
 * Supports sections, conditional fields, and validation.
 */
export function DynamicForm({ schema, mode, initialData, onSubmit, autosave }: DynamicFormProps) {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (fieldKey: string, value: unknown) => {
    setFormData((prev: Record<string, unknown>) => ({ ...prev, [fieldKey]: value }));
    // Clear error when user starts typing
    if (errors[fieldKey]) {
      setErrors((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [fieldKey]: _removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors: Record<string, string> = {};

    // Run schema-level validation
    if (schema.validate) {
      const schemaErrors = schema.validate(formData, mode);
      if (schemaErrors) {
        Object.assign(validationErrors, schemaErrors);
      }
    }

    // Run field-level validation
    Object.entries(schema.data.fields).forEach(([fieldKey, fieldDef]) => {
      if (fieldDef.validate) {
        const error = fieldDef.validate(formData[fieldKey], {
          mode,
          record: formData,
          formData,
        });
        if (error) {
          validationErrors[fieldKey] = error;
        }
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSection = (section: any) => {
    const fields = section.fields.map((field: any) => {
      const fieldKey = typeof field === 'string' ? field : field.fields?.[0];
      const fieldDef = schema.data.fields[fieldKey];

      if (!fieldDef) return null;

      // Check visibility conditions
      if (fieldDef.hidden) {
        const isHidden = typeof fieldDef.hidden === 'function' 
          ? fieldDef.hidden({ mode, record: formData, formData })
          : fieldDef.hidden;
        if (isHidden) return null;
      }

      const isInlineLabel = fieldDef.type === 'checkbox' || fieldDef.type === 'switch';

      return (
        <div key={fieldKey} className="space-y-1.5">
          {!isInlineLabel && (
            <label htmlFor={fieldKey} className="block text-sm font-medium text-foreground">
              {fieldDef.label}
              {fieldDef.required && <span className="text-destructive ml-1">*</span>}
            </label>
          )}
          <FieldRenderer
            field={fieldDef}
            fieldKey={fieldKey}
            value={formData[fieldKey]}
            onChange={(value) => handleFieldChange(fieldKey, value)}
            error={errors[fieldKey]}
            mode={mode}
            record={formData}
          />
          {!isInlineLabel && fieldDef.helpText && (
            <p className="text-xs text-muted-foreground">{fieldDef.helpText}</p>
          )}
          {!isInlineLabel && errors[fieldKey] && (
            <p className="text-xs text-destructive">{errors[fieldKey]}</p>
          )}
        </div>
      );
    });

    return (
      <div key={section.key} className="space-y-4">
        {section.title && (
          <h3 className="text-lg font-medium text-foreground">{section.title}</h3>
        )}
        {section.description && (
          <p className="text-sm text-muted-foreground">{section.description}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {schema.layouts.form.sections.map(renderSection)}

      <div className="flex justify-end space-x-4 pt-6 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
        </Button>
      </div>
    </form>
  );
}
