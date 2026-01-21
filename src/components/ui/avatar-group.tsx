import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

interface AvatarGroupItem {
  src?: string;
  alt?: string;
  fallback: string;
}

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  items: AvatarGroupItem[];
  max?: number;
  size?: "sm" | "default" | "lg";
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  default: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

const overlapClasses = {
  sm: "-ml-2",
  default: "-ml-3",
  lg: "-ml-4",
};

export function AvatarGroup({
  items,
  max = 4,
  size = "default",
  className,
  ...props
}: AvatarGroupProps) {
  const visibleItems = items.slice(0, max);
  const remainingCount = items.length - max;

  return (
    <div
      className={cn("flex items-center", className)}
      {...props}
    >
      {visibleItems.map((item, index) => (
        <Avatar
          key={index}
          className={cn(
            sizeClasses[size],
            "border-2 border-background",
            index > 0 && overlapClasses[size]
          )}
        >
          {item.src && <AvatarImage src={item.src} alt={item.alt} />}
          <AvatarFallback className={sizeClasses[size]}>
            {item.fallback}
          </AvatarFallback>
        </Avatar>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full border-2 border-background bg-muted font-medium text-muted-foreground",
            sizeClasses[size],
            overlapClasses[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
