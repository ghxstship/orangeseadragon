"use client";

import * as React from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  RemoveFormatting,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Toggle } from "./toggle";
import { Separator } from "./separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import { Input } from "./input";
import { Label } from "./label";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  minHeight?: string;
  maxHeight?: string;
  className?: string;
  toolbarClassName?: string;
  editorClassName?: string;
}

interface ToolbarButtonProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const getRichTextEditorSizeStyle = (
  minHeight: string,
  maxHeight: string
): React.CSSProperties => ({
  minHeight,
  maxHeight,
});

function ToolbarButton({ icon: Icon, label, active, disabled, onClick }: ToolbarButtonProps) {
  return (
    <Toggle
      size="sm"
      pressed={active}
      onPressedChange={onClick}
      disabled={disabled}
      aria-label={label}
      className="h-8 w-8 p-0"
    >
      <Icon className="h-4 w-4" />
    </Toggle>
  );
}

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Start writing...",
  disabled = false,
  readOnly = false,
  minHeight = "200px",
  maxHeight = "500px",
  className,
  toolbarClassName,
  editorClassName,
}: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);
  const [activeFormats, setActiveFormats] = React.useState<Set<string>>(new Set());
  const [linkUrl, setLinkUrl] = React.useState("");
  const [linkPopoverOpen, setLinkPopoverOpen] = React.useState(false);

  // Update active formats based on selection
  const updateActiveFormats = React.useCallback(() => {
    const formats = new Set<string>();
    if (document.queryCommandState("bold")) formats.add("bold");
    if (document.queryCommandState("italic")) formats.add("italic");
    if (document.queryCommandState("underline")) formats.add("underline");
    if (document.queryCommandState("strikeThrough")) formats.add("strikethrough");
    if (document.queryCommandState("insertUnorderedList")) formats.add("bulletList");
    if (document.queryCommandState("insertOrderedList")) formats.add("orderedList");
    setActiveFormats(formats);
  }, []);

  // Handle content changes
  const handleChange = React.useCallback(() => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Execute formatting command
  const execCommand = React.useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateActiveFormats();
    handleChange();
  }, [updateActiveFormats, handleChange]);

  // Handle paste - strip formatting for plain text paste
  const handlePaste = React.useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    handleChange();
  }, [handleChange]);

  // Insert link
  const insertLink = React.useCallback(() => {
    if (linkUrl) {
      execCommand("createLink", linkUrl);
      setLinkUrl("");
      setLinkPopoverOpen(false);
    }
  }, [linkUrl, execCommand]);

  // Format block (headings, quote, code)
  const formatBlock = React.useCallback((tag: string) => {
    execCommand("formatBlock", tag);
  }, [execCommand]);

  // Set initial content
  React.useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Listen for selection changes
  React.useEffect(() => {
    const handleSelectionChange = () => {
      if (isFocused) {
        updateActiveFormats();
      }
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [isFocused, updateActiveFormats]);

  return (
    <div
      className={cn(
        "rounded-md border bg-background",
        isFocused && "ring-2 ring-ring ring-offset-2",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Toolbar */}
      {!readOnly && (
        <div
          className={cn(
            "flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50",
            toolbarClassName
          )}
        >
          {/* Text formatting */}
          <ToolbarButton
            icon={Bold}
            label="Bold"
            active={activeFormats.has("bold")}
            disabled={disabled}
            onClick={() => execCommand("bold")}
          />
          <ToolbarButton
            icon={Italic}
            label="Italic"
            active={activeFormats.has("italic")}
            disabled={disabled}
            onClick={() => execCommand("italic")}
          />
          <ToolbarButton
            icon={Underline}
            label="Underline"
            active={activeFormats.has("underline")}
            disabled={disabled}
            onClick={() => execCommand("underline")}
          />
          <ToolbarButton
            icon={Strikethrough}
            label="Strikethrough"
            active={activeFormats.has("strikethrough")}
            disabled={disabled}
            onClick={() => execCommand("strikeThrough")}
          />

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Headings */}
          <ToolbarButton
            icon={Heading1}
            label="Heading 1"
            disabled={disabled}
            onClick={() => formatBlock("h1")}
          />
          <ToolbarButton
            icon={Heading2}
            label="Heading 2"
            disabled={disabled}
            onClick={() => formatBlock("h2")}
          />
          <ToolbarButton
            icon={Heading3}
            label="Heading 3"
            disabled={disabled}
            onClick={() => formatBlock("h3")}
          />

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Lists */}
          <ToolbarButton
            icon={List}
            label="Bullet List"
            active={activeFormats.has("bulletList")}
            disabled={disabled}
            onClick={() => execCommand("insertUnorderedList")}
          />
          <ToolbarButton
            icon={ListOrdered}
            label="Numbered List"
            active={activeFormats.has("orderedList")}
            disabled={disabled}
            onClick={() => execCommand("insertOrderedList")}
          />

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Block formatting */}
          <ToolbarButton
            icon={Quote}
            label="Quote"
            disabled={disabled}
            onClick={() => formatBlock("blockquote")}
          />
          <ToolbarButton
            icon={Code}
            label="Code"
            disabled={disabled}
            onClick={() => formatBlock("pre")}
          />

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Alignment */}
          <ToolbarButton
            icon={AlignLeft}
            label="Align Left"
            disabled={disabled}
            onClick={() => execCommand("justifyLeft")}
          />
          <ToolbarButton
            icon={AlignCenter}
            label="Align Center"
            disabled={disabled}
            onClick={() => execCommand("justifyCenter")}
          />
          <ToolbarButton
            icon={AlignRight}
            label="Align Right"
            disabled={disabled}
            onClick={() => execCommand("justifyRight")}
          />

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Link */}
          <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
            <PopoverTrigger asChild>
              <Toggle
                size="sm"
                disabled={disabled}
                aria-label="Insert Link"
                className="h-8 w-8 p-0"
              >
                <Link className="h-4 w-4" />
              </Toggle>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="link-url">URL</Label>
                  <Input
                    id="link-url"
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        insertLink();
                      }
                    }}
                  />
                </div>
                <Button size="sm" onClick={insertLink} disabled={!linkUrl}>
                  Insert Link
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Undo/Redo */}
          <ToolbarButton
            icon={Undo}
            label="Undo"
            disabled={disabled}
            onClick={() => execCommand("undo")}
          />
          <ToolbarButton
            icon={Redo}
            label="Redo"
            disabled={disabled}
            onClick={() => execCommand("redo")}
          />
          <ToolbarButton
            icon={RemoveFormatting}
            label="Clear Formatting"
            disabled={disabled}
            onClick={() => execCommand("removeFormat")}
          />
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled && !readOnly}
        onInput={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className={cn(
          "prose prose-sm dark:prose-invert max-w-none p-4 focus:outline-none overflow-y-auto",
          "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none",
          editorClassName
        )}
        style={getRichTextEditorSizeStyle(minHeight, maxHeight)}
        suppressContentEditableWarning
      />
    </div>
  );
}

// Simple read-only HTML renderer
interface RichTextViewerProps {
  content: string;
  className?: string;
}

export function RichTextViewer({ content, className }: RichTextViewerProps) {
  return (
    <div
      className={cn("prose prose-sm dark:prose-invert max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
