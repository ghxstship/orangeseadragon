import * as React from "react";
import { cn } from "@/lib/utils";

interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative space-y-4 pl-6", className)}
      {...props}
    >
      <div className="absolute left-[7px] top-2 h-[calc(100%-16px)] w-px bg-border" />
      {children}
    </div>
  )
);
Timeline.displayName = "Timeline";

interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative flex gap-4", className)}
      {...props}
    >
      {children}
    </div>
  )
);
TimelineItem.displayName = "TimelineItem";

interface TimelineDotProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "success" | "warning" | "error";
}

const dotVariants = {
  default: "bg-primary border-primary",
  outline: "bg-background border-border",
  success: "bg-semantic-success border-semantic-success",
  warning: "bg-semantic-warning border-semantic-warning",
  error: "bg-destructive border-destructive",
};

const TimelineDot = React.forwardRef<HTMLDivElement, TimelineDotProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute -left-6 top-1 h-3 w-3 rounded-full border-2",
        dotVariants[variant],
        className
      )}
      {...props}
    />
  )
);
TimelineDot.displayName = "TimelineDot";

interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const TimelineContent = React.forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex-1 pb-4", className)}
      {...props}
    >
      {children}
    </div>
  )
);
TimelineContent.displayName = "TimelineContent";

interface TimelineHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const TimelineHeader = React.forwardRef<HTMLDivElement, TimelineHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-between gap-2", className)}
      {...props}
    >
      {children}
    </div>
  )
);
TimelineHeader.displayName = "TimelineHeader";

interface TimelineTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const TimelineTitle = React.forwardRef<HTMLHeadingElement, TimelineTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h4
      ref={ref}
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    >
      {children}
    </h4>
  )
);
TimelineTitle.displayName = "TimelineTitle";

interface TimelineTimeProps extends React.HTMLAttributes<HTMLTimeElement> {
  children: React.ReactNode;
}

const TimelineTime = React.forwardRef<HTMLTimeElement, TimelineTimeProps>(
  ({ className, children, ...props }, ref) => (
    <time
      ref={ref}
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    >
      {children}
    </time>
  )
);
TimelineTime.displayName = "TimelineTime";

interface TimelineDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const TimelineDescription = React.forwardRef<HTMLParagraphElement, TimelineDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("mt-1 text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  )
);
TimelineDescription.displayName = "TimelineDescription";

export {
  Timeline,
  TimelineItem,
  TimelineDot,
  TimelineContent,
  TimelineHeader,
  TimelineTitle,
  TimelineTime,
  TimelineDescription,
};
