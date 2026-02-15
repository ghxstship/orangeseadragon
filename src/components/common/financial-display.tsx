'use client';

import { cn } from '@/lib/utils';
import { DEFAULT_LOCALE } from '@/lib/config';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * CURRENCY DISPLAY
 *
 * Consistent currency formatting: $X,XXX.XX
 * Supports compact mode ($12.5K, $1.2M) for KPI cards.
 */
interface CurrencyDisplayProps {
  amount: number | null | undefined;
  currency?: string;
  compact?: boolean;
  showSign?: boolean;
  className?: string;
}

export function CurrencyDisplay({
  amount,
  currency = 'USD',
  compact = false,
  showSign = false,
  className,
}: CurrencyDisplayProps) {
  if (amount == null) return <span className={cn('text-muted-foreground', className)}>—</span>;

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formatted: string;
  if (compact) {
    if (absAmount >= 1_000_000) {
      formatted = `$${(absAmount / 1_000_000).toFixed(1)}M`;
    } else if (absAmount >= 1_000) {
      formatted = `$${(absAmount / 1_000).toFixed(absAmount >= 10_000 ? 0 : 1)}K`;
    } else {
      formatted = `$${absAmount.toFixed(2)}`;
    }
  } else {
    formatted = new Intl.NumberFormat(DEFAULT_LOCALE, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absAmount);
  }

  const sign = isNegative ? '-' : showSign ? '+' : '';

  return (
    <span
      className={cn(
        isNegative && 'text-destructive',
        showSign && !isNegative && amount > 0 && 'text-semantic-success',
        className,
      )}
    >
      {sign}{formatted}
    </span>
  );
}

/**
 * MARGIN INDICATOR
 *
 * Displays margin as both absolute value and percentage.
 * Color-coded: green (healthy), amber (at risk), red (negative).
 */
interface MarginIndicatorProps {
  revenue: number;
  cost: number;
  compact?: boolean;
  className?: string;
}

export function MarginIndicator({ revenue, cost, compact = false, className }: MarginIndicatorProps) {
  const margin = revenue - cost;
  const marginPct = revenue > 0 ? (margin / revenue) * 100 : 0;

  const variant = marginPct >= 20 ? 'healthy' : marginPct >= 0 ? 'warning' : 'danger';
  const colorClass = {
    healthy: 'text-semantic-success',
    warning: 'text-semantic-warning',
    danger: 'text-destructive',
  }[variant];

  if (compact) {
    return (
      <span className={cn(colorClass, 'font-medium', className)}>
        {marginPct.toFixed(1)}%
      </span>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <CurrencyDisplay amount={margin} showSign />
      <span className={cn('text-sm font-medium', colorClass)}>
        ({marginPct.toFixed(1)}%)
      </span>
    </div>
  );
}

/**
 * VARIANCE INDICATOR
 *
 * Shows estimated vs. actual with +/- and color coding.
 */
interface VarianceIndicatorProps {
  estimated: number;
  actual: number;
  format?: 'currency' | 'percentage' | 'number';
  className?: string;
}

export function VarianceIndicator({ estimated, actual, format = 'currency', className }: VarianceIndicatorProps) {
  const variance = actual - estimated;
  const variancePct = estimated > 0 ? (variance / estimated) * 100 : 0;
  const isOver = variance > 0;
  const isUnder = variance < 0;

  const Icon = isOver ? TrendingUp : isUnder ? TrendingDown : Minus;
  const colorClass = isOver
    ? 'text-destructive'
    : isUnder
      ? 'text-semantic-success'
      : 'text-muted-foreground';

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Icon className={cn('h-3.5 w-3.5', colorClass)} />
      {format === 'currency' ? (
        <CurrencyDisplay amount={variance} showSign compact />
      ) : (
        <span className={cn('text-sm font-medium', colorClass)}>
          {isOver ? '+' : ''}{variance.toFixed(format === 'percentage' ? 1 : 0)}
          {format === 'percentage' ? '%' : ''}
        </span>
      )}
      <span className={cn('text-xs', colorClass)}>
        ({variancePct >= 0 ? '+' : ''}{variancePct.toFixed(1)}%)
      </span>
    </div>
  );
}

/**
 * BUDGET HEALTH BADGE
 *
 * Semantic badge: On Track / At Risk / Over Budget
 */
interface BudgetHealthBadgeProps {
  budget: number;
  spent: number;
  className?: string;
}

export function BudgetHealthBadge({ budget, spent, className }: BudgetHealthBadgeProps) {
  if (!budget || budget <= 0) return null;

  const burnPct = (spent / budget) * 100;

  let label: string;
  let variant: 'default' | 'secondary' | 'destructive' | 'outline';
  let Icon: typeof CheckCircle2;

  if (burnPct >= 100) {
    label = 'Over Budget';
    variant = 'destructive';
    Icon = AlertTriangle;
  } else if (burnPct >= 85) {
    label = 'At Risk';
    variant = 'outline';
    Icon = AlertTriangle;
  } else {
    label = 'On Track';
    variant = 'secondary';
    Icon = CheckCircle2;
  }

  return (
    <Badge variant={variant} className={cn('gap-1', className)}>
      <Icon className="h-3 w-3" />
      {label}
      <span className="opacity-60">{burnPct.toFixed(0)}%</span>
    </Badge>
  );
}

/**
 * AGING BADGE
 *
 * Color-coded aging indicator for invoices and time-sensitive records.
 * Green: current, Yellow: 15+ days, Red: 30+ days
 */
interface AgingBadgeProps {
  dueDate: string | Date;
  className?: string;
}

export function AgingBadge({ dueDate, className }: AgingBadgeProps) {
  const due = new Date(dueDate);
  const now = new Date();
  const diffMs = now.getTime() - due.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const daysUntil = Math.abs(diffDays);
    return (
      <Badge variant="secondary" className={cn('gap-1', className)}>
        <Clock className="h-3 w-3" />
        Due in {daysUntil}d
      </Badge>
    );
  }

  if (diffDays === 0) {
    return (
      <Badge variant="outline" className={cn('gap-1 border-semantic-warning text-semantic-warning', className)}>
        <Clock className="h-3 w-3" />
        Due Today
      </Badge>
    );
  }

  if (diffDays <= 15) {
    return (
      <Badge variant="outline" className={cn('gap-1 border-semantic-warning text-semantic-warning', className)}>
        <AlertTriangle className="h-3 w-3" />
        {diffDays}d overdue
      </Badge>
    );
  }

  if (diffDays <= 30) {
    return (
      <Badge variant="outline" className={cn('gap-1 border-semantic-orange text-semantic-orange', className)}>
        <AlertTriangle className="h-3 w-3" />
        {diffDays}d overdue
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className={cn('gap-1', className)}>
      <AlertTriangle className="h-3 w-3" />
      {diffDays}d overdue
    </Badge>
  );
}

/**
 * PHASE STEPPER WIDGET
 *
 * Horizontal lifecycle stepper for production projects.
 * Shows current phase with visual progress indicator.
 */
interface PhaseStepperProps {
  phases: Array<{ key: string; label: string }>;
  currentPhase: string;
  className?: string;
}

const DEFAULT_PRODUCTION_PHASES = [
  { key: 'planning', label: 'Planning' },
  { key: 'pre-production', label: 'Pre-Production' },
  { key: 'advance', label: 'Advance' },
  { key: 'load-in', label: 'Load-In' },
  { key: 'show', label: 'Show' },
  { key: 'load-out', label: 'Load-Out' },
  { key: 'settlement', label: 'Settlement' },
  { key: 'wrap', label: 'Wrap' },
];

export function PhaseStepperWidget({
  phases = DEFAULT_PRODUCTION_PHASES,
  currentPhase,
  className,
}: PhaseStepperProps) {
  const currentIndex = phases.findIndex((p) => p.key === currentPhase);

  return (
    <div className={cn('flex items-center gap-0', className)}>
      {phases.map((phase, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;

        return (
          <div key={phase.key} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors',
                  isCompleted && 'bg-primary border-primary text-primary-foreground',
                  isCurrent && 'bg-primary/20 border-primary text-primary',
                  isUpcoming && 'bg-muted border-border text-muted-foreground',
                )}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                className={cn(
                  'text-[9px] font-medium mt-1 whitespace-nowrap',
                  isCurrent && 'text-primary font-bold',
                  isCompleted && 'text-muted-foreground',
                  isUpcoming && 'text-muted-foreground/50',
                )}
              >
                {phase.label}
              </span>
            </div>

            {/* Connector line */}
            {index < phases.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-4 mx-0.5 mt-[-12px]',
                  index < currentIndex ? 'bg-primary' : 'bg-border',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
