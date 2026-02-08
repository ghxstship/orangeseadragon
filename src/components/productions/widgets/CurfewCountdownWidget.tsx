'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CurfewCountdownWidgetProps {
  curfewTime: string;
  warningMinutes?: number;
  criticalMinutes?: number;
  label?: string;
}

type CurfewPhase = 'safe' | 'warning' | 'critical' | 'expired';

function parseCurfewToday(curfewTime: string): Date {
  const [hours, minutes] = curfewTime.split(':').map(Number);
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  if (target < new Date()) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

function formatCountdown(totalSeconds: number): { hours: string; minutes: string; seconds: string } {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return {
    hours: String(h).padStart(2, '0'),
    minutes: String(m).padStart(2, '0'),
    seconds: String(s).padStart(2, '0'),
  };
}

export function CurfewCountdownWidget({
  curfewTime,
  warningMinutes = 30,
  criticalMinutes = 10,
  label = 'Venue Curfew',
}: CurfewCountdownWidgetProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const curfewDate = useMemo(() => parseCurfewToday(curfewTime), [curfewTime]);

  const remainingSeconds = Math.max(0, Math.floor((curfewDate.getTime() - now.getTime()) / 1000));
  const remainingMinutes = remainingSeconds / 60;
  const { hours, minutes, seconds } = formatCountdown(remainingSeconds);

  const phase: CurfewPhase = useMemo(() => {
    if (remainingSeconds <= 0) return 'expired';
    if (remainingMinutes <= criticalMinutes) return 'critical';
    if (remainingMinutes <= warningMinutes) return 'warning';
    return 'safe';
  }, [remainingSeconds, remainingMinutes, criticalMinutes, warningMinutes]);

  const phaseConfig = {
    safe: {
      color: 'text-emerald-500',
      bg: 'bg-black',
      border: 'border-zinc-800',
      glow: '',
      badge: 'On Track',
      badgeVariant: 'outline' as const,
    },
    warning: {
      color: 'text-amber-500',
      bg: 'bg-amber-950/20',
      border: 'border-amber-900/50',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
      badge: 'Warning',
      badgeVariant: 'outline' as const,
    },
    critical: {
      color: 'text-red-500',
      bg: 'bg-red-950/20',
      border: 'border-red-900/50',
      glow: 'shadow-[0_0_30px_rgba(239,68,68,0.2)]',
      badge: 'Critical',
      badgeVariant: 'destructive' as const,
    },
    expired: {
      color: 'text-red-500',
      bg: 'bg-red-950/30',
      border: 'border-red-800',
      glow: 'shadow-[0_0_40px_rgba(239,68,68,0.3)]',
      badge: 'CURFEW EXCEEDED',
      badgeVariant: 'destructive' as const,
    },
  };

  const config = phaseConfig[phase];

  return (
    <Card
      className={cn(
        'h-full flex flex-col justify-center items-center transition-all duration-500',
        config.bg,
        config.border,
        config.glow,
        'text-zinc-100'
      )}
    >
      <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
        <div className="flex items-center gap-2 text-zinc-500 text-sm font-mono tracking-widest uppercase">
          {phase === 'critical' || phase === 'expired' ? (
            <AlertTriangle className={cn('w-4 h-4', config.color, phase === 'critical' && 'animate-pulse')} />
          ) : (
            <Timer className="w-4 h-4" />
          )}
          <span>{label}</span>
        </div>

        <div className={cn('text-5xl font-mono font-bold tracking-tighter tabular-nums', config.color)}>
          {phase === 'expired' ? (
            <span className="animate-pulse">00:00:00</span>
          ) : (
            `${hours}:${minutes}:${seconds}`
          )}
        </div>

        <div className="text-sm font-mono text-zinc-500">
          Curfew at {curfewTime}
        </div>

        <Badge variant={config.badgeVariant} className={cn('text-xs', phase === 'expired' && 'animate-pulse')}>
          {config.badge}
        </Badge>
      </CardContent>
    </Card>
  );
}
