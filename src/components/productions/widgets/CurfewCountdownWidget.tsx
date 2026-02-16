'use client';

import { CurfewCountdown } from '@/components/production/curfew-countdown';

export interface CurfewCountdownWidgetProps {
  curfewTime: string;
  warningMinutes?: number;
  criticalMinutes?: number;
  label?: string;
}

export function CurfewCountdownWidget({
  curfewTime,
  warningMinutes = 30,
  criticalMinutes = 10,
  label = 'Venue Curfew',
}: CurfewCountdownWidgetProps) {
  return (
    <CurfewCountdown
      curfewTime={curfewTime}
      warningMinutes={warningMinutes}
      criticalMinutes={criticalMinutes}
      label={label}
      className="h-full"
    />
  );
}
