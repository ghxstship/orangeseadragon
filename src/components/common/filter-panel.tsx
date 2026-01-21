"use client";

import * as React from "react";
import { Filter, ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export type FilterType = "select" | "multiselect" | "text" | "date" | "range";

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  placeholder?: string;
}

export interface FilterValue {
  [key: string]: string | string[] | { min?: string; max?: string } | undefined;
}

interface FilterPanelProps {
  filters: FilterConfig[];
  values: FilterValue;
  onChange: (values: FilterValue) => void;
  onReset?: () => void;
  className?: string;
}

function FilterSection({
  filter,
  value,
  onChange,
}: {
  filter: FilterConfig;
  value: string | string[] | { min?: string; max?: string } | undefined;
  onChange: (value: string | string[] | { min?: string; max?: string } | undefined) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(true);

  const hasValue = React.useMemo(() => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object" && value !== null) {
      return value.min !== undefined || value.max !== undefined;
    }
    return value !== undefined && value !== "";
  }, [value]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="flex w-full items-center justify-between p-2 hover:bg-muted"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            {filter.label}
            {hasValue && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {Array.isArray(value) ? value.length : 1}
              </Badge>
            )}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-2 pb-3">
        {filter.type === "select" && filter.options && (
          <Select
            value={value as string | undefined}
            onValueChange={(v) => onChange(v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={filter.placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex items-center justify-between w-full">
                    {option.label}
                    {option.count !== undefined && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({option.count})
                      </span>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {filter.type === "multiselect" && filter.options && (
          <div className="space-y-2">
            {filter.options.map((option) => {
              const selected = Array.isArray(value) && value.includes(option.value);
              return (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${filter.id}-${option.value}`}
                    checked={selected}
                    onCheckedChange={(checked) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (checked) {
                        onChange([...currentValues, option.value]);
                      } else {
                        onChange(currentValues.filter((v) => v !== option.value));
                      }
                    }}
                  />
                  <Label
                    htmlFor={`${filter.id}-${option.value}`}
                    className="flex-1 text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                    {option.count !== undefined && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({option.count})
                      </span>
                    )}
                  </Label>
                </div>
              );
            })}
          </div>
        )}

        {filter.type === "text" && (
          <Input
            placeholder={filter.placeholder || "Enter value..."}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value || undefined)}
          />
        )}

        {filter.type === "range" && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={(value as { min?: string; max?: string })?.min || ""}
              onChange={(e) =>
                onChange({
                  ...(value as { min?: string; max?: string }),
                  min: e.target.value || undefined,
                })
              }
              className="w-full"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={(value as { min?: string; max?: string })?.max || ""}
              onChange={(e) =>
                onChange({
                  ...(value as { min?: string; max?: string }),
                  max: e.target.value || undefined,
                })
              }
              className="w-full"
            />
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function FilterPanel({
  filters,
  values,
  onChange,
  onReset,
  className,
}: FilterPanelProps) {
  const activeFilterCount = React.useMemo(() => {
    return Object.values(values).filter((v) => {
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === "object" && v !== null) {
        return v.min !== undefined || v.max !== undefined;
      }
      return v !== undefined && v !== "";
    }).length;
  }, [values]);

  const handleFilterChange = (
    filterId: string,
    value: string | string[] | { min?: string; max?: string } | undefined
  ) => {
    onChange({
      ...values,
      [filterId]: value,
    });
  };

  const handleReset = () => {
    onChange({});
    onReset?.();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}</Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 px-2 text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>
      <Separator />
      <div className="space-y-1">
        {filters.map((filter) => (
          <FilterSection
            key={filter.id}
            filter={filter}
            value={values[filter.id]}
            onChange={(value) => handleFilterChange(filter.id, value)}
          />
        ))}
      </div>
    </div>
  );
}

interface FilterPanelSheetProps extends FilterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FilterPanelSheet({
  open,
  onOpenChange,
  filters,
  values,
  onChange,
  onReset,
}: FilterPanelSheetProps) {
  const activeFilterCount = React.useMemo(() => {
    return Object.values(values).filter((v) => {
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === "object" && v !== null) {
        return v.min !== undefined || v.max !== undefined;
      }
      return v !== undefined && v !== "";
    }).length;
  }, [values]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary">{activeFilterCount}</Badge>
              )}
            </SheetTitle>
          </div>
          <SheetDescription className="sr-only">
            Filter and refine your results
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-1">
            {filters.map((filter) => (
              <FilterSection
                key={filter.id}
                filter={filter}
                value={values[filter.id]}
                onChange={(value) =>
                  onChange({
                    ...values,
                    [filter.id]: value,
                  })
                }
              />
            ))}
          </div>
        </ScrollArea>

        <SheetFooter className="p-4 border-t">
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onChange({});
                onReset?.();
              }}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button className="flex-1" onClick={() => onOpenChange(false)}>
              Apply Filters
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
