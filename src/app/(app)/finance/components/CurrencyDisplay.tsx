'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowRight } from 'lucide-react';

interface CurrencyDisplayProps {
  amount: number;
  currency: string;
  baseCurrencyAmount?: number;
  baseCurrency?: string;
  exchangeRate?: number;
  showConversion?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'A$',
  JPY: '¥',
  CHF: 'CHF',
  CNY: '¥',
  INR: '₹',
  MXN: 'MX$',
};

const CURRENCY_DECIMALS: Record<string, number> = {
  JPY: 0,
  KRW: 0,
  VND: 0,
};

export function CurrencyDisplay({
  amount,
  currency,
  baseCurrencyAmount,
  baseCurrency = 'USD',
  exchangeRate,
  showConversion = true,
  size = 'md',
  className,
}: CurrencyDisplayProps) {
  const formattedAmount = useMemo(() => {
    const decimals = CURRENCY_DECIMALS[currency] ?? 2;
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    
    return `${symbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }, [amount, currency]);

  const formattedBaseAmount = useMemo(() => {
    if (!baseCurrencyAmount || currency === baseCurrency) return null;
    
    const decimals = CURRENCY_DECIMALS[baseCurrency] ?? 2;
    const symbol = CURRENCY_SYMBOLS[baseCurrency] || baseCurrency;
    
    return `${symbol}${baseCurrencyAmount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }, [baseCurrencyAmount, baseCurrency, currency]);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold',
  };

  if (!showConversion || !formattedBaseAmount || currency === baseCurrency) {
    return (
      <span className={`${sizeClasses[size]} ${className || ''}`}>
        {formattedAmount}
        {currency !== baseCurrency && (
          <Badge variant="outline" className="ml-2 text-xs">
            {currency}
          </Badge>
        )}
      </span>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 ${sizeClasses[size]} ${className || ''}`}>
            {formattedAmount}
            <Badge variant="outline" className="text-xs">
              {currency}
            </Badge>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span>{formattedAmount}</span>
              <ArrowRight className="h-3 w-3" />
              <span className="font-medium">{formattedBaseAmount}</span>
            </div>
            {exchangeRate && (
              <div className="text-xs text-muted-foreground">
                Rate: 1 {currency} = {exchangeRate.toFixed(4)} {baseCurrency}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface MultiCurrencyTotalProps {
  items: Array<{
    amount: number;
    currency: string;
    baseCurrencyAmount?: number;
  }>;
  baseCurrency?: string;
  label?: string;
}

export function MultiCurrencyTotal({
  items,
  baseCurrency = 'USD',
  label = 'Total',
}: MultiCurrencyTotalProps) {
  const { totalsByOriginalCurrency, totalInBaseCurrency } = useMemo(() => {
    const byCurrency: Record<string, number> = {};
    let baseTotal = 0;

    for (const item of items) {
      byCurrency[item.currency] = (byCurrency[item.currency] || 0) + item.amount;
      baseTotal += item.baseCurrencyAmount ?? item.amount;
    }

    return {
      totalsByOriginalCurrency: byCurrency,
      totalInBaseCurrency: baseTotal,
    };
  }, [items]);

  const currencyCount = Object.keys(totalsByOriginalCurrency).length;
  const symbol = CURRENCY_SYMBOLS[baseCurrency] || baseCurrency;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-lg font-semibold">
          {symbol}
          {totalInBaseCurrency.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
      
      {currencyCount > 1 && (
        <div className="space-y-1 text-sm text-muted-foreground">
          {Object.entries(totalsByOriginalCurrency).map(([currency, amount]) => (
            <div key={currency} className="flex items-center justify-between">
              <span>{currency}</span>
              <span>
                {CURRENCY_SYMBOLS[currency] || currency}
                {amount.toLocaleString('en-US', {
                  minimumFractionDigits: CURRENCY_DECIMALS[currency] ?? 2,
                  maximumFractionDigits: CURRENCY_DECIMALS[currency] ?? 2,
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
