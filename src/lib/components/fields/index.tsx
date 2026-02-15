/**
 * FIELD RENDERER REGISTRY
 *
 * Maps field types to render components.
 * Add new field types here.
 */

import { FieldType, FieldDefinition } from '@/lib/schema/types';

// Import all field components
import { TextField } from './TextField';
import { TextareaField } from './TextareaField';
import { RichtextField } from './RichtextField';
import { NumberField } from './NumberField';
import { CurrencyField } from './CurrencyField';
import { SelectField } from './SelectField';
import { MultiselectField } from './MultiselectField';
import { DateField } from './DateField';
import { DatetimeField } from './DatetimeField';
import { RelationField } from './RelationField';
import { FileField } from './FileField';
import { ImageField } from './ImageField';
import { CheckboxField } from './CheckboxField';
import { SwitchField } from './SwitchField';
import { LocationField } from './LocationField';
import { ColorField } from './ColorField';
import { TagsField } from './TagsField';
// ... import all field types

export const fieldRenderers: Record<FieldType, React.ComponentType<FieldRenderProps>> = {
  text: TextField,
  textarea: TextareaField,
  richtext: RichtextField,
  code: TextareaField,      // Uses TextareaField with code formatting
  number: NumberField,
  currency: CurrencyField,
  percentage: NumberField,  // Uses NumberField with % formatting
  email: TextField,         // Uses TextField with email validation
  phone: TextField,         // Uses TextField with phone formatting
  url: TextField,           // Uses TextField with URL validation
  select: SelectField,
  multiselect: MultiselectField,
  radio: SelectField,       // Uses SelectField with radio variant
  checkbox: CheckboxField,
  switch: SwitchField,
  date: DateField,
  datetime: DatetimeField,
  time: DatetimeField,      // Uses DatetimeField with time-only mode
  daterange: DateField,     // Uses DateField with range mode
  duration: NumberField,    // Uses NumberField with duration formatting
  file: FileField,
  image: ImageField,
  avatar: ImageField,       // Uses ImageField with circular crop
  gallery: ImageField,      // Uses ImageField with multi-upload
  relation: RelationField,
  location: LocationField,
  address: LocationField,   // Uses LocationField with address mode
  color: ColorField,
  rating: NumberField,      // Uses NumberField with star display
  tags: TagsField,
  json: TextareaField,      // Uses TextareaField with JSON formatting
  signature: ImageField,    // Uses ImageField with signature pad
  computed: () => null,     // Computed fields are read-only, rendered by display logic
  custom: () => null,       // Handled by schema.renderField
};

export interface FieldRenderProps {
  field: FieldDefinition;
  fieldKey: string;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
  mode: 'create' | 'edit' | 'table' | 'detail' | 'filter';
  record?: Record<string, unknown>;
}

/**
 * DYNAMIC FIELD RENDERER
 *
 * Renders the appropriate field component based on field type.
 */
export function FieldRenderer(props: FieldRenderProps) {
  const { field, ...rest } = props;

  // Use custom renderer if provided
  if (field.renderField) {
    return field.renderField(props);
  }

  // Get renderer for field type
  const Renderer = fieldRenderers[field.type];

  if (!Renderer) {
    console.warn(`No renderer for field type: ${field.type}`);
    return null;
  }

  return <Renderer field={field} {...rest} />;
}
