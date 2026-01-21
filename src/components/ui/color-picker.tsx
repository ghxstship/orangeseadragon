"use client";

import * as React from "react";
import { Pipette } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#78716c", "#71717a", "#000000",
];

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  presets?: string[];
  showInput?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ColorPicker({
  value = "#3b82f6",
  onChange,
  presets = PRESET_COLORS,
  showInput = true,
  disabled = false,
  className,
}: ColorPickerProps) {
  const [color, setColor] = React.useState(value);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setColor(value);
  }, [value]);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    onChange?.(newColor);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    if (/^#[0-9A-Fa-f]{0,6}$/.test(newColor)) {
      setColor(newColor);
      if (newColor.length === 7) {
        onChange?.(newColor);
      }
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-[200px] justify-start gap-2 font-normal",
            className
          )}
        >
          <div
            className="h-4 w-4 rounded border"
            style={{ backgroundColor: color }}
          />
          <span className="flex-1 text-left">{color}</span>
          <Pipette className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-3" align="start">
        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            {presets.map((presetColor) => (
              <button
                key={presetColor}
                type="button"
                className={cn(
                  "h-8 w-8 rounded-md border-2 transition-all hover:scale-110",
                  color === presetColor
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-transparent"
                )}
                style={{ backgroundColor: presetColor }}
                onClick={() => handleColorChange(presetColor)}
              />
            ))}
          </div>

          {showInput && (
            <div className="space-y-2">
              <Label htmlFor="color-input" className="text-xs">
                Custom color
              </Label>
              <div className="flex gap-2">
                <Input
                  id="color-input"
                  type="text"
                  value={color}
                  onChange={handleInputChange}
                  placeholder="#000000"
                  className="h-8 font-mono text-sm"
                />
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded border p-0"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t">
            <div
              className="h-8 w-8 rounded border"
              style={{ backgroundColor: color }}
            />
            <div className="flex-1">
              <p className="text-xs font-medium">Selected</p>
              <p className="text-xs text-muted-foreground font-mono">{color}</p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ColorSwatchProps {
  color: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ColorSwatch({
  color,
  selected = false,
  onClick,
  className,
}: ColorSwatchProps) {
  return (
    <button
      type="button"
      className={cn(
        "h-6 w-6 rounded-md border-2 transition-all hover:scale-110",
        selected
          ? "border-primary ring-2 ring-primary ring-offset-1"
          : "border-transparent",
        className
      )}
      style={{ backgroundColor: color }}
      onClick={onClick}
    />
  );
}
