'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, RefreshCw } from 'lucide-react';
import { format, addMonths, addWeeks, addYears } from 'date-fns';
import { cn } from '@/lib/utils';

interface RecurringInvoiceSetupProps {
  onSubmit: (data: RecurringInvoiceData) => void;
  onCancel: () => void;
  initialData?: Partial<RecurringInvoiceData>;
}

interface RecurringInvoiceData {
  name: string;
  clientId: string;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  dayOfMonth?: number;
  startDate: Date;
  endDate?: Date;
  amount: number;
  currency: string;
  paymentTerms: number;
  autoSend: boolean;
  includePaymentLink: boolean;
  sendReminders: boolean;
}

export function RecurringInvoiceSetup({ onSubmit, onCancel, initialData }: RecurringInvoiceSetupProps) {
  const [formData, setFormData] = useState<Partial<RecurringInvoiceData>>({
    frequency: 'monthly',
    dayOfMonth: 1,
    startDate: new Date(),
    currency: 'USD',
    paymentTerms: 30,
    autoSend: false,
    includePaymentLink: true,
    sendReminders: true,
    ...initialData,
  });

  const getNextOccurrences = () => {
    if (!formData.startDate || !formData.frequency) return [];
    
    const occurrences: Date[] = [];
    let currentDate = new Date(formData.startDate);
    
    for (let i = 0; i < 3; i++) {
      occurrences.push(new Date(currentDate));
      switch (formData.frequency) {
        case 'weekly':
          currentDate = addWeeks(currentDate, 1);
          break;
        case 'biweekly':
          currentDate = addWeeks(currentDate, 2);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, 1);
          break;
        case 'quarterly':
          currentDate = addMonths(currentDate, 3);
          break;
        case 'yearly':
          currentDate = addYears(currentDate, 1);
          break;
      }
    }
    
    return occurrences;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.clientId && formData.startDate && formData.amount) {
      onSubmit(formData as RecurringInvoiceData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Create Recurring Invoice
          </CardTitle>
          <CardDescription>
            Set up an automated invoice schedule for regular billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Schedule Name</Label>
              <Input
                id="name"
                placeholder="e.g., Monthly Retainer - Acme Corp"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client-1">Acme Corporation</SelectItem>
                  <SelectItem value="client-2">TechStart Inc</SelectItem>
                  <SelectItem value="client-3">Global Events Ltd</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value: RecurringInvoiceData['frequency']) => 
                  setFormData({ ...formData, frequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.frequency === 'monthly' || formData.frequency === 'quarterly' || formData.frequency === 'yearly') && (
              <div className="space-y-2">
                <Label htmlFor="dayOfMonth">Day of Month</Label>
                <Select
                  value={String(formData.dayOfMonth)}
                  onValueChange={(value) => setFormData({ ...formData, dayOfMonth: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={String(day)}>
                        {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}
                      </SelectItem>
                    ))}
                    <SelectItem value="31">Last day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => date && setFormData({ ...formData, startDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-7"
                  placeholder="0.00"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Select
                value={String(formData.paymentTerms)}
                onValueChange={(value) => setFormData({ ...formData, paymentTerms: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Due on receipt</SelectItem>
                  <SelectItem value="7">Net 7</SelectItem>
                  <SelectItem value="14">Net 14</SelectItem>
                  <SelectItem value="30">Net 30</SelectItem>
                  <SelectItem value="45">Net 45</SelectItem>
                  <SelectItem value="60">Net 60</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="font-medium">Automation Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoSend">Auto-send to client</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically email invoices when generated
                  </p>
                </div>
                <Switch
                  id="autoSend"
                  checked={formData.autoSend}
                  onCheckedChange={(checked) => setFormData({ ...formData, autoSend: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="paymentLink">Include payment link</Label>
                  <p className="text-sm text-muted-foreground">
                    Add a secure payment link to invoices
                  </p>
                </div>
                <Switch
                  id="paymentLink"
                  checked={formData.includePaymentLink}
                  onCheckedChange={(checked) => setFormData({ ...formData, includePaymentLink: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reminders">Send payment reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically send reminder emails based on your templates
                  </p>
                </div>
                <Switch
                  id="reminders"
                  checked={formData.sendReminders}
                  onCheckedChange={(checked) => setFormData({ ...formData, sendReminders: checked })}
                />
              </div>
            </div>
          </div>

          {formData.startDate && formData.amount && (
            <div className="rounded-lg bg-muted p-4">
              <h4 className="mb-2 font-medium">Preview: Next 3 Invoices</h4>
              <ul className="space-y-1 text-sm">
                {getNextOccurrences().map((date, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span>{format(date, 'MMMM d, yyyy')}</span>
                    <span className="font-medium">
                      ${formData.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Schedule
        </Button>
      </div>
    </form>
  );
}
