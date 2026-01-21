"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  GripVertical,
  Plus,
  Trash2,
  Copy,
  Settings,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  List,
  FileText,
  Mail,
  Phone,
  Link,
  Upload,
  ToggleLeft,
  AlignLeft,
} from "lucide-react";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "phone"
  | "url"
  | "date"
  | "datetime"
  | "select"
  | "multiselect"
  | "checkbox"
  | "radio"
  | "toggle"
  | "file"
  | "heading"
  | "paragraph";

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldCondition {
  fieldId: string;
  operator: "equals" | "not_equals" | "contains" | "is_empty" | "is_not_empty";
  value?: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: FormFieldOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  conditions?: FormFieldCondition[];
  defaultValue?: string | number | boolean;
  width?: "full" | "half" | "third";
}

export interface FormBuilderProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
  title?: string;
  description?: string;
  className?: string;
  readOnly?: boolean;
}

const fieldTypeIcons: Record<FieldType, React.ReactNode> = {
  text: <Type className="h-4 w-4" />,
  textarea: <AlignLeft className="h-4 w-4" />,
  number: <Hash className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  phone: <Phone className="h-4 w-4" />,
  url: <Link className="h-4 w-4" />,
  date: <Calendar className="h-4 w-4" />,
  datetime: <Calendar className="h-4 w-4" />,
  select: <List className="h-4 w-4" />,
  multiselect: <List className="h-4 w-4" />,
  checkbox: <CheckSquare className="h-4 w-4" />,
  radio: <CheckSquare className="h-4 w-4" />,
  toggle: <ToggleLeft className="h-4 w-4" />,
  file: <Upload className="h-4 w-4" />,
  heading: <Type className="h-4 w-4" />,
  paragraph: <FileText className="h-4 w-4" />,
};

const fieldTypeLabels: Record<FieldType, string> = {
  text: "Text Input",
  textarea: "Text Area",
  number: "Number",
  email: "Email",
  phone: "Phone",
  url: "URL",
  date: "Date",
  datetime: "Date & Time",
  select: "Dropdown",
  multiselect: "Multi-Select",
  checkbox: "Checkbox",
  radio: "Radio Buttons",
  toggle: "Toggle",
  file: "File Upload",
  heading: "Heading",
  paragraph: "Paragraph",
};

export function FormBuilder({
  fields,
  onChange,
  title = "Form Builder",
  description,
  className,
  readOnly = false,
}: FormBuilderProps) {
  const [selectedFieldId, setSelectedFieldId] = React.useState<string | null>(null);
  const [draggedFieldId, setDraggedFieldId] = React.useState<string | null>(null);

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: fieldTypeLabels[type],
      required: false,
      width: "full",
    };

    if (type === "select" || type === "multiselect" || type === "radio") {
      newField.options = [
        { label: "Option 1", value: "option_1" },
        { label: "Option 2", value: "option_2" },
      ];
    }

    onChange([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const deleteField = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
    if (selectedFieldId === id) {
      setSelectedFieldId(null);
    }
  };

  const duplicateField = (id: string) => {
    const field = fields.find((f) => f.id === id);
    if (field) {
      const newField = { ...field, id: `field_${Date.now()}`, label: `${field.label} (Copy)` };
      const index = fields.findIndex((f) => f.id === id);
      const newFields = [...fields];
      newFields.splice(index + 1, 0, newField);
      onChange(newFields);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedFieldId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedFieldId && draggedFieldId !== targetId) {
      const draggedIndex = fields.findIndex((f) => f.id === draggedFieldId);
      const targetIndex = fields.findIndex((f) => f.id === targetId);
      const newFields = [...fields];
      const [removed] = newFields.splice(draggedIndex, 1);
      newFields.splice(targetIndex, 0, removed);
      onChange(newFields);
    }
  };

  const handleDragEnd = () => {
    setDraggedFieldId(null);
  };

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6", className)}>
      {/* Field Palette */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Add Fields</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(fieldTypeLabels) as FieldType[]).map((type) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                className="justify-start h-auto py-2 px-3"
                onClick={() => addField(type)}
                disabled={readOnly}
              >
                <span className="mr-2">{fieldTypeIcons[type]}</span>
                <span className="text-xs">{fieldTypeLabels[type]}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Preview */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{title}</CardTitle>
          {description && <CardDescription className="text-xs">{description}</CardDescription>}
        </CardHeader>
        <CardContent className="p-3">
          {fields.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <p className="text-sm">Add fields from the palette</p>
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field) => (
                <div
                  key={field.id}
                  draggable={!readOnly}
                  onDragStart={(e) => handleDragStart(e, field.id)}
                  onDragOver={(e) => handleDragOver(e, field.id)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "group relative p-3 border rounded-lg cursor-pointer transition-all",
                    selectedFieldId === field.id
                      ? "border-primary ring-1 ring-primary"
                      : "hover:border-primary/50",
                    draggedFieldId === field.id && "opacity-50",
                    field.width === "half" && "w-1/2 inline-block",
                    field.width === "third" && "w-1/3 inline-block"
                  )}
                  onClick={() => setSelectedFieldId(field.id)}
                >
                  {!readOnly && (
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-muted-foreground">{fieldTypeIcons[field.type]}</span>
                    <Label className="text-sm">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                  </div>

                  {field.type === "heading" ? (
                    <h3 className="text-lg font-semibold">{field.label}</h3>
                  ) : field.type === "paragraph" ? (
                    <p className="text-sm text-muted-foreground">{field.description || "Paragraph text"}</p>
                  ) : field.type === "textarea" ? (
                    <Textarea placeholder={field.placeholder} disabled className="h-16 text-xs" />
                  ) : field.type === "select" || field.type === "multiselect" ? (
                    <Select disabled>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder={field.placeholder || "Select..."} />
                      </SelectTrigger>
                    </Select>
                  ) : field.type === "checkbox" || field.type === "radio" ? (
                    <div className="space-y-1">
                      {field.options?.slice(0, 2).map((opt) => (
                        <div key={opt.value} className="flex items-center gap-2">
                          <Checkbox disabled />
                          <span className="text-xs">{opt.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : field.type === "toggle" ? (
                    <Switch disabled />
                  ) : field.type === "file" ? (
                    <div className="border-2 border-dashed rounded p-2 text-center text-xs text-muted-foreground">
                      Drop files here
                    </div>
                  ) : (
                    <Input
                      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                      placeholder={field.placeholder}
                      disabled
                      className="h-8 text-xs"
                    />
                  )}

                  {!readOnly && (
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateField(field.id);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteField(field.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Field Settings */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Field Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          {selectedField ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Label</Label>
                <Input
                  value={selectedField.label}
                  onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                  disabled={readOnly}
                  className="h-8 text-sm"
                />
              </div>

              {selectedField.type !== "heading" && selectedField.type !== "paragraph" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs">Placeholder</Label>
                    <Input
                      value={selectedField.placeholder || ""}
                      onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                      disabled={readOnly}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      value={selectedField.description || ""}
                      onChange={(e) => updateField(selectedField.id, { description: e.target.value })}
                      disabled={readOnly}
                      className="h-16 text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Required</Label>
                    <Switch
                      checked={selectedField.required}
                      onCheckedChange={(checked) => updateField(selectedField.id, { required: checked })}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Width</Label>
                    <Select
                      value={selectedField.width || "full"}
                      onValueChange={(v) => updateField(selectedField.id, { width: v as FormField["width"] })}
                      disabled={readOnly}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Width</SelectItem>
                        <SelectItem value="half">Half Width</SelectItem>
                        <SelectItem value="third">Third Width</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {(selectedField.type === "select" ||
                selectedField.type === "multiselect" ||
                selectedField.type === "radio" ||
                selectedField.type === "checkbox") && (
                <div className="space-y-2">
                  <Label className="text-xs">Options</Label>
                  <div className="space-y-2">
                    {selectedField.options?.map((opt, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          value={opt.label}
                          onChange={(e) => {
                            const newOptions = [...(selectedField.options || [])];
                            newOptions[i] = { ...opt, label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, "_") };
                            updateField(selectedField.id, { options: newOptions });
                          }}
                          disabled={readOnly}
                          className="h-8 text-sm"
                        />
                        {!readOnly && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={() => {
                              const newOptions = selectedField.options?.filter((_, idx) => idx !== i);
                              updateField(selectedField.id, { options: newOptions });
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {!readOnly && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          const newOptions = [
                            ...(selectedField.options || []),
                            { label: `Option ${(selectedField.options?.length || 0) + 1}`, value: `option_${(selectedField.options?.length || 0) + 1}` },
                          ];
                          updateField(selectedField.id, { options: newOptions });
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Option
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Badge variant="secondary" className="text-xs">
                  {fieldTypeLabels[selectedField.type]}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Select a field to edit</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export interface FormRendererProps {
  fields: FormField[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  onSubmit?: (values: Record<string, unknown>) => void;
  errors?: Record<string, string>;
  className?: string;
}

export function FormRenderer({
  fields,
  values,
  onChange,
  onSubmit,
  errors = {},
  className,
}: FormRendererProps) {
  const updateValue = (fieldId: string, value: unknown) => {
    onChange({ ...values, [fieldId]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(values);
  };

  const isFieldVisible = (field: FormField): boolean => {
    if (!field.conditions || field.conditions.length === 0) return true;

    return field.conditions.every((condition) => {
      const fieldValue = values[condition.fieldId];

      switch (condition.operator) {
        case "equals":
          return fieldValue === condition.value;
        case "not_equals":
          return fieldValue !== condition.value;
        case "contains":
          return String(fieldValue || "").includes(condition.value || "");
        case "is_empty":
          return !fieldValue;
        case "is_not_empty":
          return !!fieldValue;
        default:
          return true;
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      {fields.filter(isFieldVisible).map((field) => (
        <div
          key={field.id}
          className={cn(
            field.width === "half" && "w-1/2 inline-block pr-2",
            field.width === "third" && "w-1/3 inline-block pr-2"
          )}
        >
          {field.type === "heading" ? (
            <h3 className="text-lg font-semibold mt-4">{field.label}</h3>
          ) : field.type === "paragraph" ? (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          ) : (
            <div className="space-y-2">
              <Label htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>

              {field.type === "textarea" ? (
                <Textarea
                  id={field.id}
                  value={(values[field.id] as string) || ""}
                  onChange={(e) => updateValue(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              ) : field.type === "select" ? (
                <Select
                  value={(values[field.id] as string) || ""}
                  onValueChange={(v) => updateValue(field.id, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder || "Select..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === "checkbox" ? (
                <div className="space-y-2">
                  {field.options?.map((opt) => (
                    <div key={opt.value} className="flex items-center gap-2">
                      <Checkbox
                        id={`${field.id}_${opt.value}`}
                        checked={((values[field.id] as string[]) || []).includes(opt.value)}
                        onCheckedChange={(checked) => {
                          const current = (values[field.id] as string[]) || [];
                          const updated = checked
                            ? [...current, opt.value]
                            : current.filter((v) => v !== opt.value);
                          updateValue(field.id, updated);
                        }}
                      />
                      <Label htmlFor={`${field.id}_${opt.value}`}>{opt.label}</Label>
                    </div>
                  ))}
                </div>
              ) : field.type === "toggle" ? (
                <Switch
                  id={field.id}
                  checked={(values[field.id] as boolean) || false}
                  onCheckedChange={(checked) => updateValue(field.id, checked)}
                />
              ) : (
                <Input
                  id={field.id}
                  type={
                    field.type === "number"
                      ? "number"
                      : field.type === "email"
                      ? "email"
                      : field.type === "date"
                      ? "date"
                      : field.type === "datetime"
                      ? "datetime-local"
                      : "text"
                  }
                  value={(values[field.id] as string) || ""}
                  onChange={(e) => updateValue(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              )}

              {field.description && (
                <p className="text-xs text-muted-foreground">{field.description}</p>
              )}

              {errors[field.id] && (
                <p className="text-xs text-red-500">{errors[field.id]}</p>
              )}
            </div>
          )}
        </div>
      ))}

      {onSubmit && (
        <Button type="submit" className="w-full">
          Submit
        </Button>
      )}
    </form>
  );
}
