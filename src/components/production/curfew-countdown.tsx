"use client";

import * as React from "react";
import { CurfewCountdown as CurfewCountdownTimers } from "@/components/productions/widgets/CurfewCountdown";

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
  if (curfew instanceof Date) {
    return curfew;
  }

  const parsed = new Date(curfew);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const today = new Date();
  const [hours, minutes] = curfew.split(":").map(Number);
  today.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  if (today < new Date()) today.setDate(today.getDate() + 1);
  return today;
}

function getCurfewStatus(
  now: Date,
  deadline: Date,
  warningMinutes: number,
  criticalMinutes: number
): CurfewStatus {
  const diffMs = deadline.getTime() - now.getTime();
  if (diffMs <= 0) return "expired";

  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes <= criticalMinutes) return "critical";
  if (diffMinutes <= warningMinutes) return "warning";
  return "safe";
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
  const deadline = React.useMemo(() => parseCurfew(curfewTime), [curfewTime]);
  const triggerStateRef = React.useRef({ warning: false, critical: false, expired: false });

  React.useEffect(() => {
    triggerStateRef.current = { warning: false, critical: false, expired: false };
  }, [deadline, warningMinutes, criticalMinutes]);

  React.useEffect(() => {
    const tick = () => {
      const status = getCurfewStatus(new Date(), deadline, warningMinutes, criticalMinutes);

      if (status === "warning" && !triggerStateRef.current.warning) {
        triggerStateRef.current.warning = true;
        onWarning?.();
      }

      if (status === "critical" && !triggerStateRef.current.critical) {
        triggerStateRef.current.critical = true;
        onCritical?.();
      }

      if (status === "expired" && !triggerStateRef.current.expired) {
        triggerStateRef.current.expired = true;
        onExpired?.();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadline, warningMinutes, criticalMinutes, onWarning, onCritical, onExpired]);

  return (
    <CurfewCountdownTimers
      className={className}
      timers={[
        {
          id: "legacy-curfew-countdown",
          label,
          deadline,
          type: "noise_curfew",
          warningMinutes,
          criticalMinutes,
        },
      ]}
    />
  );
}
