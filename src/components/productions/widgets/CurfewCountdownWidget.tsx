'use client';

import type { ComponentProps } from 'react';
import { CurfewCountdown } from '@/components/production/curfew-countdown';

export type CurfewCountdownWidgetProps = ComponentProps<typeof CurfewCountdown>;

export function CurfewCountdownWidget({
  curfewTime,
  warningMinutes = 30,
  criticalMinutes = 10,
  label = 'Venue Curfew',
  className,
  onWarning,
  onCritical,
  onExpired,
}: CurfewCountdownWidgetProps) {
  return (
    <CurfewCountdown
      curfewTime={curfewTime}
      warningMinutes={warningMinutes}
      criticalMinutes={criticalMinutes}
      label={label}
      className={className ?? 'h-full'}
      onWarning={onWarning}
      onCritical={onCritical}
      onExpired={onExpired}
    />
  );
}
