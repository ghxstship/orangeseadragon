"use client";

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityRecord, EntitySchema, FormSectionDefinition } from '@/lib/schema/types';
import { FieldRenderer } from '../../components/fields';
import { Button } from '@/components/ui/button';
import { generateZodSchema, extractFormFieldKeys } from '@/lib/schema/generateZodSchema';
import { captureError } from '@/lib/observability';

type FormData = Record<string, unknown>;

interface DynamicFormProps {
  schema: EntitySchema;
  mode: 'create' | 'edit';
  initialData?: FormData;
  onSubmit: (data: FormData) => void | Promise<void>;
  autosave?: boolean;
}

/**
 * DYNAMIC FORM COMPONENT
 *
 * Renders a form based on schema configuration.
 * Uses react-hook-form with zodResolver for validation.
 * Falls back to schema.validate and field.validate for custom rules.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function DynamicForm({ schema, mode, initialData, onSubmit, autosave }: DynamicFormProps) {
  // Generate Zod schema from field definitions
  const zodSchema = useMemo(() => {
    const formFieldKeys = extractFormFieldKeys(
      schema.layouts.form.sections as Array<{
        fields: (string | { fields?: string[] })[];
        condition?: (data: Record<string, unknown>) => boolean;
      }>
    );
    return generateZodSchema(schema.data.fields, formFieldKeys, mode);
  }, [schema, mode]);

  const {
    watch,
    setValue,
    handleSubmit: rhfHandleSubmit,
    formState: { errors: rhfErrors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<FormData>({
    resolver: zodResolver(zodSchema),
    defaultValues: initialData || {},
    mode: 'onBlur',
  });

  const formData = watch();

  const handleFieldChange = (fieldKey: string, value: unknown) => {
    setValue(fieldKey, value, { shouldValidate: true, shouldDirty: true });
    clearErrors(fieldKey);
  };

  const onFormSubmit = async (data: Record<string, unknown>) => {
    // Run schema-level validation (backward compat)
    const validationErrors: Record<string, string> = {};
    const recordContext: EntityRecord = { id: String(data.id ?? ''), ...data };

    if (schema.validate) {
      const schemaErrors = schema.validate(data, mode);
      if (schemaErrors) {
        Object.assign(validationErrors, schemaErrors);
      }
    }

    // Run field-level validation (backward compat)
    Object.entries(schema.data.fields).forEach(([fieldKey, fieldDef]) => {
      if (fieldDef.validate) {
        const error = fieldDef.validate(data[fieldKey], {
          mode,
          record: recordContext,
          formData: data,
        });
        if (error) {
          validationErrors[fieldKey] = error;
        }
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      Object.entries(validationErrors).forEach(([key, message]) => {
        setError(key, { type: 'custom', message });
      });
      return;
    }

    try {
      await onSubmit(data);
    } catch (error) {
      captureError(error, 'crud.components.DynamicForm.error');
    }
  };

  // Get error message for a field from react-hook-form
  const getFieldError = (fieldKey: string): string | undefined => {
    const err = rhfErrors[fieldKey];
    if (!err) return undefined;
    return typeof err.message === 'string' ? err.message : undefined;
  };

  const renderSection = (section: FormSectionDefinition) => {
    // Check section-level condition
    if (section.condition && !section.condition(formData, mode)) return null;
    const formRecord: EntityRecord = { id: String(formData.id ?? ''), ...formData };

    const fields = section.fields.map((field) => {
      const fieldKey = typeof field === 'string' ? field : field.fields?.[0];
      const fieldDef = schema.data.fields[fieldKey];

      if (!fieldDef) return null;

      // Check visibility conditions
      if (fieldDef.hidden) {
        const isHidden = typeof fieldDef.hidden === 'function' 
          ? fieldDef.hidden({ mode, record: formRecord, formData })
          : fieldDef.hidden;
        if (isHidden) return null;
      }

      const isInlineLabel = fieldDef.type === 'checkbox' || fieldDef.type === 'switch';
      const fieldError = getFieldError(fieldKey);

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
            error={fieldError}
            mode={mode}
            record={formData}
          />
          {!isInlineLabel && fieldDef.helpText && (
            <p className="text-xs text-muted-foreground">{fieldDef.helpText}</p>
          )}
          {!isInlineLabel && fieldError && (
            <p className="text-xs text-destructive">{fieldError}</p>
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
    <form onSubmit={rhfHandleSubmit(onFormSubmit)} className="space-y-8">
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
