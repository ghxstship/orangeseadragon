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
import { motion, AnimatePresence } from "framer-motion";

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
    <div className={cn("grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-6", className)}>
      {/* Field Palette */}
      <Card className="lg:col-span-1 border-border glass-morphism overflow-hidden shadow-xl h-fit lg:sticky lg:top-6">
        <CardHeader className="pb-4 border-b border-border bg-background/5">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Add Fields</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
            {(Object.keys(fieldTypeLabels) as FieldType[]).map((type, idx) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start h-10 px-4 glass-morphism border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
                  onClick={() => addField(type)}
                  disabled={readOnly}
                >
                  <span className="mr-3 text-primary/60 group-hover:text-primary group-hover:scale-110 transition-all">{fieldTypeIcons[type]}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{fieldTypeLabels[type]}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Preview */}
      <Card className="lg:col-span-2 border-border glass-morphism overflow-hidden shadow-2xl">
        <CardHeader className="pb-4 border-b border-border bg-background/5">
          <CardTitle className="text-xl font-black tracking-tight uppercase opacity-80">{title}</CardTitle>
          {description && <CardDescription className="text-[10px] font-bold uppercase opacity-30 mt-1 tracking-wider">{description}</CardDescription>}
        </CardHeader>
        <CardContent className="p-6">
          {fields.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-3xl bg-muted/30"
            >
              <Plus className="h-10 w-10 mx-auto mb-4 opacity-20" />
              <p className="text-[11px] font-black uppercase tracking-widest opacity-40">Add fields from the palette</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {fields.map((field) => (
                  <motion.div
                    key={field.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    draggable={!readOnly}
                    onDragStartCapture={(e) => handleDragStart(e, field.id)}
                    onDragOverCapture={(e) => handleDragOver(e, field.id)}
                    onDragEndCapture={() => handleDragEnd()}
                    className={cn(
                      "group relative p-5 border border-border rounded-2xl cursor-pointer transition-all duration-300",
                      selectedFieldId === field.id
                        ? "bg-primary/[0.03] border-primary/30 ring-1 ring-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.05)]"
                        : "hover:border-border hover:bg-accent/30",
                      draggedFieldId === field.id && "opacity-50 scale-95",
                      field.width === "half" && "w-[calc(50%-8px)] inline-block mr-4",
                      field.width === "third" && "w-[calc(33.33%-11px)] inline-block mr-4"
                    )}
                    onClick={() => setSelectedFieldId(field.id)}
                  >
                    {!readOnly && (
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-grab p-1 hover:text-primary">
                        <GripVertical className="h-5 w-5" />
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-primary/60 group-hover:scale-110 transition-transform">{fieldTypeIcons[field.type]}</span>
                      <Label className="text-[11px] font-black uppercase tracking-wider cursor-pointer">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                    </div>

                    {field.type === "heading" ? (
                      <h3 className="text-2xl font-black tracking-tight">{field.label}</h3>
                    ) : field.type === "paragraph" ? (
                      <p className="text-sm font-medium text-muted-foreground opacity-60">{field.description || "Paragraph text"}</p>
                    ) : (
                      <div className="glass-morphism bg-muted/30 border-border rounded-xl h-10 flex items-center px-4 opacity-40">
                        <span className="text-[10px] font-bold uppercase tracking-widest italic">{field.placeholder || `Enter ${field.label.toLowerCase()}...`}</span>
                      </div>
                    )}

                    {!readOnly && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-accent rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateField(field.id);
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteField(field.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Field Settings */}
      <Card className="lg:col-span-1 border-border glass-morphism overflow-hidden shadow-xl h-fit lg:sticky lg:top-6">
        <CardHeader className="pb-4 border-b border-border bg-background/5">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 flex items-center gap-3">
            <Settings className="h-4 w-4 text-primary" />
            Field Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            {selectedField ? (
              <motion.div
                key={selectedField.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Label</Label>
                  <Input
                    value={selectedField.label}
                    onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                    disabled={readOnly}
                    className="h-9 glass-morphism border-border text-sm font-medium"
                  />
                </div>

                {selectedField.type !== "heading" && selectedField.type !== "paragraph" && (
                  <>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Placeholder</Label>
                      <Input
                        value={selectedField.placeholder || ""}
                        onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                        disabled={readOnly}
                        className="h-9 glass-morphism border-border text-sm font-medium"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Description</Label>
                      <Textarea
                        value={selectedField.description || ""}
                        onChange={(e) => updateField(selectedField.id, { description: e.target.value })}
                        disabled={readOnly}
                        className="min-h-[100px] glass-morphism border-border text-sm font-medium resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted border border-border">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 cursor-pointer">Required Field</Label>
                      <Switch
                        checked={selectedField.required}
                        onCheckedChange={(checked) => updateField(selectedField.id, { required: checked })}
                        disabled={readOnly}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Display Width</Label>
                      <Select
                        value={selectedField.width || "full"}
                        onValueChange={(v) => updateField(selectedField.id, { width: v as FormField["width"] })}
                        disabled={readOnly}
                      >
                        <SelectTrigger className="h-9 glass-morphism border-border text-sm font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-morphism border-border">
                          <SelectItem value="full" className="text-xs font-bold uppercase">Full Width (1/1)</SelectItem>
                          <SelectItem value="half" className="text-xs font-bold uppercase">Half Width (1/2)</SelectItem>
                          <SelectItem value="third" className="text-xs font-bold uppercase">Third Width (1/3)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {(selectedField.type === "select" ||
                  selectedField.type === "multiselect" ||
                  selectedField.type === "radio" ||
                  selectedField.type === "checkbox") && (
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Options</Label>
                      <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                          {selectedField.options?.map((opt, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="flex gap-2"
                            >
                              <Input
                                value={opt.label}
                                onChange={(e) => {
                                  const newOptions = [...(selectedField.options || [])];
                                  newOptions[i] = { ...opt, label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, "_") };
                                  updateField(selectedField.id, { options: newOptions });
                                }}
                                disabled={readOnly}
                                className="h-9 glass-morphism border-border text-sm font-medium"
                              />
                              {!readOnly && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 flex-shrink-0 hover:bg-destructive/10 text-destructive/80 rounded-full"
                                  onClick={() => {
                                    const newOptions = selectedField.options?.filter((_, idx) => idx !== i);
                                    updateField(selectedField.id, { options: newOptions });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {!readOnly && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full glass-morphism border-border border-dashed hover:border-primary/50 text-[10px] font-black uppercase tracking-widest py-4"
                            onClick={() => {
                              const newOptions = [
                                ...(selectedField.options || []),
                                { label: `Option ${(selectedField.options?.length || 0) + 1}`, value: `option_${(selectedField.options?.length || 0) + 1}` },
                              ];
                              updateField(selectedField.id, { options: newOptions });
                            }}
                          >
                            <Plus className="h-3 w-3 mr-2" />
                            Add Option
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                <div className="pt-4 border-t border-border">
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-3 py-1">
                    {fieldTypeLabels[selectedField.type]}
                  </Badge>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 text-muted-foreground opacity-30"
              >
                <Settings className="h-10 w-10 mx-auto mb-4 animate-[spin_10s_linear_infinite]" />
                <p className="text-[10px] font-black uppercase tracking-widest">Select a field to configure</p>
              </motion.div>
            )}
          </AnimatePresence>
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
                {field.required && <span className="text-destructive ml-1">*</span>}
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
                <p className="text-xs text-destructive">{errors[field.id]}</p>
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
