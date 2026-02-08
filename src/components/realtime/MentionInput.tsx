"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string, mentions: string[]) => void;
  users: User[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minHeight?: string;
  maxHeight?: string;
  onSubmit?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function MentionInput({
  value,
  onChange,
  users,
  placeholder = "Type @ to mention someone...",
  className,
  disabled = false,
  minHeight = "80px",
  maxHeight = "200px",
  onSubmit,
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Extract mentions from content
  const extractMentions = useCallback((content: string): string[] => {
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[2]);
    }
    return mentions;
  }, []);

  // Handle text change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const position = e.target.selectionStart;
    setCursorPosition(position);

    // Check if we should show suggestions
    const textBeforeCursor = newValue.slice(0, position);
    const atIndex = textBeforeCursor.lastIndexOf("@");

    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(atIndex + 1);
      // Only show suggestions if @ is at start or after whitespace, and no space after @
      const charBeforeAt = atIndex > 0 ? textBeforeCursor[atIndex - 1] : " ";
      if ((charBeforeAt === " " || charBeforeAt === "\n" || atIndex === 0) && !textAfterAt.includes(" ")) {
        setSearchQuery(textAfterAt);
        setShowSuggestions(true);
        setSuggestionIndex(0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }

    const mentions = extractMentions(newValue);
    onChange(newValue, mentions);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && filteredUsers.length > 0) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSuggestionIndex((prev) => (prev + 1) % filteredUsers.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSuggestionIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
          break;
        case "Enter":
          if (!e.shiftKey) {
            e.preventDefault();
            selectUser(filteredUsers[suggestionIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setShowSuggestions(false);
          break;
        case "Tab":
          e.preventDefault();
          selectUser(filteredUsers[suggestionIndex]);
          break;
      }
    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  // Select a user from suggestions
  const selectUser = (user: User) => {
    if (!textareaRef.current) return;

    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);
    const atIndex = textBeforeCursor.lastIndexOf("@");

    if (atIndex !== -1) {
      const newValue =
        textBeforeCursor.slice(0, atIndex) +
        `@[${user.name}](${user.id}) ` +
        textAfterCursor;

      const mentions = extractMentions(newValue);
      onChange(newValue, mentions);
      setShowSuggestions(false);

      // Set cursor position after the mention
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = atIndex + `@[${user.name}](${user.id}) `.length;
          textareaRef.current.setSelectionRange(newPosition, newPosition);
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll selected suggestion into view
  useEffect(() => {
    if (suggestionsRef.current && showSuggestions) {
      const selectedElement = suggestionsRef.current.children[suggestionIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [suggestionIndex, showSuggestions]);

  return (
    <div className={cn("relative", className)}>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="resize-none"
        style={{ minHeight, maxHeight }}
      />

      {showSuggestions && filteredUsers.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-64 max-h-48 overflow-auto rounded-md border bg-popover p-1 shadow-md"
        >
          {filteredUsers.map((user, index) => (
            <button
              key={user.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                index === suggestionIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => selectUser(user)}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="font-medium">{user.name}</span>
                {user.email && (
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && filteredUsers.length === 0 && searchQuery && (
        <div className="absolute z-50 mt-1 w-64 rounded-md border bg-popover p-3 shadow-md">
          <p className="text-sm text-muted-foreground">No users found</p>
        </div>
      )}
    </div>
  );
}

/**
 * Render mention content with highlighted mentions
 */
export function MentionContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  // Replace mention syntax with styled spans
  const formattedContent = content.replace(
    /@\[([^\]]+)\]\(([^)]+)\)/g,
    '<span class="inline-flex items-center rounded bg-primary/10 px-1 text-primary font-medium">@$1</span>'
  );

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  );
}

/**
 * Parse plain text with @ mentions into mention format
 */
export function parseMentionsFromText(
  text: string,
  users: User[]
): { content: string; mentions: string[] } {
  const mentions: string[] = [];
  let content = text;

  // Find @username patterns and replace with mention format
  const atMentionRegex = /@(\w+)/g;
  let match;

  while ((match = atMentionRegex.exec(text)) !== null) {
    const username = match[1].toLowerCase();
    const user = users.find(
      (u) =>
        u.name.toLowerCase().replace(/\s+/g, "") === username ||
        u.name.toLowerCase().split(" ")[0] === username
    );

    if (user) {
      content = content.replace(match[0], `@[${user.name}](${user.id})`);
      mentions.push(user.id);
    }
  }

  return { content, mentions };
}
