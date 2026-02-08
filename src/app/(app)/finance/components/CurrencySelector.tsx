'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface CurrencySelectorProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const DEFAULT_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
];

export function CurrencySelector({
  value,
  onChange,
  disabled = false,
  placeholder = 'Select currency...',
}: CurrencySelectorProps) {
  const [open, setOpen] = useState(false);
  const [currencies, setCurrencies] = useState<Currency[]>(DEFAULT_CURRENCIES);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchCurrencies() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/currencies?active=true');
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setCurrencies(data);
          }
        }
      } catch (error) {
        console.error('Error fetching currencies:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCurrencies();
  }, []);

  const selectedCurrency = currencies.find((c) => c.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : selectedCurrency ? (
            <span className="flex items-center gap-2">
              <span className="font-mono">{selectedCurrency.symbol}</span>
              <span>{selectedCurrency.code}</span>
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search currency..." />
          <CommandList>
            <CommandEmpty>No currency found.</CommandEmpty>
            <CommandGroup>
              {currencies.map((currency) => (
                <CommandItem
                  key={currency.code}
                  value={currency.code}
                  onSelect={(currentValue) => {
                    onChange(currentValue.toUpperCase());
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === currency.code ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="mr-2 font-mono text-muted-foreground">
                    {currency.symbol}
                  </span>
                  <span>{currency.code}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {currency.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
