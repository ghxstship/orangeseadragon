"use client";

import * as React from "react";
import { Pipette } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COLOR_PICKER_DEFAULT_HEX,
  COLOR_PICKER_PRESET_HEX,
} from "@/lib/tokens/color-presets";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  presets?: readonly string[];
  showInput?: boolean;
  disabled?: boolean;
  className?: string;
}

const getColorBackgroundStyle = (backgroundColor: string): React.CSSProperties => ({
  backgroundColor,
});

export function ColorPicker({
  value = COLOR_PICKER_DEFAULT_HEX,
  onChange,
  presets = COLOR_PICKER_PRESET_HEX,
  showInput = true,
  disabled = false,
  className,
}: ColorPickerProps) {
  const [color, setColor] = React.useState(value);
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedColorStyle = React.useMemo(() => getColorBackgroundStyle(color), [color]);

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
            style={selectedColorStyle}
          />
          <span className="flex-1 text-left">{color}</span>
          <Pipette className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] sm:w-[240px] p-3" align="start">
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {presets.map((presetColor) => {
              const presetColorStyle = getColorBackgroundStyle(presetColor);

              return (
                <Button
                  key={presetColor}
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-md border-2 p-0 transition-all hover:scale-110",
                    color === presetColor
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "border-transparent"
                  )}
                  style={presetColorStyle}
                  onClick={() => handleColorChange(presetColor)}
                  aria-label={`Select color ${presetColor}`}
                />
              );
            })}
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
                  placeholder="Hex color"
                  className="h-8 font-mono text-sm"
                />
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded border p-0"
                  aria-label="Choose custom color"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t">
            <div
              className="h-8 w-8 rounded border"
              style={selectedColorStyle}
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
  const swatchStyle = getColorBackgroundStyle(color);

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn(
        "h-6 w-6 rounded-md border-2 p-0 transition-all hover:scale-110",
        selected
          ? "border-primary ring-2 ring-primary ring-offset-1"
          : "border-transparent",
        className
      )}
      style={swatchStyle}
      onClick={onClick}
      aria-label={`Select color ${color}`}
    />
  );
}
