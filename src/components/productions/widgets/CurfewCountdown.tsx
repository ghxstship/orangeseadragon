"use client";

/**
 * Curfew Countdown Timer
 * Live countdown overlay for venue noise curfews, permit windows, and set times.
 * Displays time remaining with color-coded urgency levels.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, Volume2, VolumeX, Bell, ChevronDown, ChevronUp } from "lucide-react";

interface CurfewTimer {
  id: string;
  label: string;
  deadline: Date;
  type: "noise_curfew" | "permit_window" | "set_time" | "load_in" | "load_out" | "doors" | "custom";
  warningMinutes?: number;
  criticalMinutes?: number;
}

interface CurfewCountdownProps {
  timers: CurfewTimer[];
  className?: string;
  compact?: boolean;
}

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
}

function getTimeRemaining(deadline: Date): TimeRemaining {
  const total = deadline.getTime() - Date.now();
  if (total <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isExpired: true };
  }
  const totalSeconds = Math.floor(total / 1000);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    totalSeconds,
    isExpired: false,
  };
}

function getUrgencyLevel(remaining: TimeRemaining, warningMin: number, criticalMin: number): "normal" | "warning" | "critical" | "expired" {
  if (remaining.isExpired) return "expired";
  const totalMinutes = remaining.totalSeconds / 60;
  if (totalMinutes <= criticalMin) return "critical";
  if (totalMinutes <= warningMin) return "warning";
  return "normal";
}

const URGENCY_STYLES = {
  normal: {
    bg: "bg-card",
    border: "border-border",
    text: "text-foreground",
    badge: "bg-muted text-muted-foreground",
    pulse: false,
  },
  warning: {
    bg: "bg-semantic-warning/5",
    border: "border-semantic-warning/30",
    text: "text-semantic-warning",
    badge: "bg-semantic-warning/20 text-semantic-warning",
    pulse: false,
  },
  critical: {
    bg: "bg-destructive/5",
    border: "border-destructive/30",
    text: "text-destructive",
    badge: "bg-destructive/20 text-destructive",
    pulse: true,
  },
  expired: {
    bg: "bg-destructive/10",
    border: "border-destructive/50",
    text: "text-destructive",
    badge: "bg-destructive text-white",
    pulse: true,
  },
};

const TYPE_ICONS: Record<CurfewTimer["type"], React.ElementType> = {
  noise_curfew: VolumeX,
  permit_window: Clock,
  set_time: Volume2,
  load_in: Clock,
  load_out: Clock,
  doors: Bell,
  custom: Clock,
};

const TYPE_LABELS: Record<CurfewTimer["type"], string> = {
  noise_curfew: "Noise Curfew",
  permit_window: "Permit Window",
  set_time: "Set Time",
  load_in: "Load In",
  load_out: "Load Out",
  doors: "Doors",
  custom: "Timer",
};

function SingleTimer({ timer, compact }: { timer: CurfewTimer; compact?: boolean }) {
  const [remaining, setRemaining] = React.useState<TimeRemaining>(() => getTimeRemaining(timer.deadline));

  React.useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getTimeRemaining(timer.deadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer.deadline]);

  const urgency = getUrgencyLevel(
    remaining,
    timer.warningMinutes ?? 30,
    timer.criticalMinutes ?? 10
  );
  const styles = URGENCY_STYLES[urgency];
  const Icon = TYPE_ICONS[timer.type];

  const pad = (n: number) => String(n).padStart(2, "0");

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border", styles.bg, styles.border)}>
        <Icon className={cn("h-3.5 w-3.5", styles.text)} />
        <span className="text-[10px] font-medium text-muted-foreground">{timer.label}</span>
        <span className={cn("text-sm font-mono font-bold tabular-nums", styles.text, styles.pulse && "animate-pulse")}>
          {remaining.isExpired ? "EXPIRED" : `${pad(remaining.hours)}:${pad(remaining.minutes)}:${pad(remaining.seconds)}`}
        </span>
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden transition-all", styles.bg, styles.border, styles.pulse && "animate-pulse")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-lg", styles.badge)}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold">{timer.label}</p>
              <p className="text-[10px] text-muted-foreground">{TYPE_LABELS[timer.type]}</p>
            </div>
          </div>
          {urgency === "critical" && (
            <Badge variant="destructive" className="text-[9px] gap-1">
              <AlertTriangle className="h-3 w-3" />
              Critical
            </Badge>
          )}
          {urgency === "warning" && (
            <Badge className="text-[9px] bg-semantic-warning/20 text-semantic-warning border-semantic-warning/30">
              Warning
            </Badge>
          )}
          {urgency === "expired" && (
            <Badge variant="destructive" className="text-[9px]">
              Expired
            </Badge>
          )}
        </div>

        <div className="flex items-baseline gap-1">
          {remaining.isExpired ? (
            <span className="text-3xl font-mono font-black text-destructive">EXPIRED</span>
          ) : (
            <>
              <span className={cn("text-3xl font-mono font-black tabular-nums", styles.text)}>
                {pad(remaining.hours)}
              </span>
              <span className={cn("text-lg font-mono", styles.text, "opacity-50")}>:</span>
              <span className={cn("text-3xl font-mono font-black tabular-nums", styles.text)}>
                {pad(remaining.minutes)}
              </span>
              <span className={cn("text-lg font-mono", styles.text, "opacity-50")}>:</span>
              <span className={cn("text-3xl font-mono font-black tabular-nums", styles.text)}>
                {pad(remaining.seconds)}
              </span>
            </>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground mt-2">
          {timer.deadline.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {" — "}
          {timer.deadline.toLocaleDateString([], { month: "short", day: "numeric" })}
        </p>
      </CardContent>
    </Card>
  );
}

export function CurfewCountdown({ timers, className, compact }: CurfewCountdownProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  if (timers.length === 0) return null;

  // Sort by deadline (soonest first)
  const sorted = [...timers].sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

  if (compact) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {sorted.map((timer) => (
          <SingleTimer key={timer.id} timer={timer} compact />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">
            Live Timers
          </p>
          <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
            {timers.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {!isCollapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sorted.map((timer) => (
            <SingleTimer key={timer.id} timer={timer} />
          ))}
        </div>
      )}
    </div>
  );
}
