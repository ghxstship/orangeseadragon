"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, Volume2 } from "lucide-react";

interface CurfewCountdownProps {
  curfewTime: Date | string;
  warningMinutes?: number;
  criticalMinutes?: number;
  label?: string;
  className?: string;
  onWarning?: () => void;
  onCritical?: () => void;
  onExpired?: () => void;
}

type CurfewStatus = "safe" | "warning" | "critical" | "expired";

function parseCurfew(curfew: Date | string): Date {
  if (curfew instanceof Date) return curfew;
  const today = new Date();
  const [hours, minutes] = curfew.split(":").map(Number);
  today.setHours(hours, minutes, 0, 0);
  if (today < new Date()) today.setDate(today.getDate() + 1);
  return today;
}

export function CurfewCountdown({
  curfewTime,
  warningMinutes = 30,
  criticalMinutes = 10,
  label = "Venue Curfew",
  className,
  onWarning,
  onCritical,
  onExpired,
}: CurfewCountdownProps) {
  const [now, setNow] = React.useState(new Date());
  const [hasTriggeredWarning, setHasTriggeredWarning] = React.useState(false);
  const [hasTriggeredCritical, setHasTriggeredCritical] = React.useState(false);
  const [hasTriggeredExpired, setHasTriggeredExpired] = React.useState(false);

  const curfew = React.useMemo(() => parseCurfew(curfewTime), [curfewTime]);

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diffMs = curfew.getTime() - now.getTime();
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const diffMinutes = Math.floor(diffSeconds / 60);

  const hours = Math.floor(diffSeconds / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;

  const status: CurfewStatus = React.useMemo(() => {
    if (diffMs <= 0) return "expired";
    if (diffMinutes <= criticalMinutes) return "critical";
    if (diffMinutes <= warningMinutes) return "warning";
    return "safe";
  }, [diffMs, diffMinutes, criticalMinutes, warningMinutes]);

  // Trigger callbacks
  React.useEffect(() => {
    if (status === "warning" && !hasTriggeredWarning) {
      setHasTriggeredWarning(true);
      onWarning?.();
    }
    if (status === "critical" && !hasTriggeredCritical) {
      setHasTriggeredCritical(true);
      onCritical?.();
    }
    if (status === "expired" && !hasTriggeredExpired) {
      setHasTriggeredExpired(true);
      onExpired?.();
    }
  }, [status, hasTriggeredWarning, hasTriggeredCritical, hasTriggeredExpired, onWarning, onCritical, onExpired]);

  const statusConfig = {
    safe: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      glow: "",
      badge: "bg-emerald-500/20 text-emerald-400",
    },
    warning: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-400",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",
      badge: "bg-amber-500/20 text-amber-400",
    },
    critical: {
      bg: "bg-red-500/10",
      border: "border-red-500/40",
      text: "text-red-400",
      glow: "shadow-[0_0_30px_rgba(239,68,68,0.2)]",
      badge: "bg-red-500/20 text-red-400",
    },
    expired: {
      bg: "bg-red-500/20",
      border: "border-red-500/60",
      text: "text-red-300",
      glow: "shadow-[0_0_40px_rgba(239,68,68,0.3)]",
      badge: "bg-red-500/30 text-red-300",
    },
  };

  const config = statusConfig[status];
  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <Card
      className={cn(
        "border overflow-hidden transition-all duration-500",
        config.bg,
        config.border,
        config.glow,
        status === "critical" && "animate-pulse",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {status === "expired" ? (
              <AlertTriangle className={cn("h-4 w-4", config.text)} />
            ) : status === "critical" ? (
              <Volume2 className={cn("h-4 w-4", config.text)} />
            ) : (
              <Clock className={cn("h-4 w-4", config.text)} />
            )}
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
              {label}
            </span>
          </div>
          <Badge className={cn("text-[9px] font-black uppercase tracking-widest", config.badge)}>
            {status === "expired" ? "OVERTIME" : status}
          </Badge>
        </div>

        <div className="flex items-baseline gap-1 justify-center">
          {status === "expired" ? (
            <span className={cn("text-3xl font-black tracking-tight tabular-nums", config.text)}>
              CURFEW EXCEEDED
            </span>
          ) : (
            <>
              <span className={cn("text-4xl font-black tracking-tight tabular-nums", config.text)}>
                {pad(hours)}
              </span>
              <span className={cn("text-2xl font-bold opacity-50", config.text)}>:</span>
              <span className={cn("text-4xl font-black tracking-tight tabular-nums", config.text)}>
                {pad(minutes)}
              </span>
              <span className={cn("text-2xl font-bold opacity-50", config.text)}>:</span>
              <span className={cn("text-4xl font-black tracking-tight tabular-nums", config.text)}>
                {pad(seconds)}
              </span>
            </>
          )}
        </div>

        <div className="text-center mt-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Curfew at {curfew.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
