'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, FileText, Receipt, Check, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { DEFAULT_LOCALE } from '@/lib/config';

interface Quote {
  id: string;
  quoteNumber: string;
  title?: string;
  clientName: string;
  totalAmount: number;
  currency: string;
  status: string;
  validUntil: Date;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

interface QuoteToInvoiceConverterProps {
  quote: Quote;
  onConvert: (quoteId: string) => Promise<{ invoiceId: string; invoiceNumber: string }>;
  onCancel: () => void;
}

export function QuoteToInvoiceConverter({ quote, onConvert, onCancel }: QuoteToInvoiceConverterProps) {
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<{ invoiceId: string; invoiceNumber: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isExpired = new Date(quote.validUntil) < new Date();

  const handleConvert = async () => {
    setIsConverting(true);
    setError(null);
    
    try {
      const invoiceResult = await onConvert(quote.id);
      setResult(invoiceResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert quote');
    } finally {
      setIsConverting(false);
    }
  };

  if (result) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-semantic-success">
            <Check className="h-6 w-6" />
            <CardTitle>Quote Converted Successfully</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-4 py-6">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 font-medium">{quote.quoteNumber}</p>
              <Badge variant="secondary">Quote</Badge>
            </div>
            <ArrowRight className="h-8 w-8 text-semantic-success" />
            <div className="text-center">
              <Receipt className="mx-auto h-12 w-12 text-semantic-success" />
              <p className="mt-2 font-medium">{result.invoiceNumber}</p>
              <Badge variant="default">Invoice</Badge>
            </div>
          </div>
          <p className="text-center text-muted-foreground">
            Invoice {result.invoiceNumber} has been created and is ready to send.
          </p>
        </CardContent>
        <CardFooter className="justify-center gap-3">
          <Button variant="outline" onClick={onCancel}>
            Close
          </Button>
          <Button onClick={() => window.location.href = `/finance/invoices/${result.invoiceId}`}>
            View Invoice
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Convert Quote to Invoice
        </CardTitle>
        <CardDescription>
          Create an invoice from quote {quote.quoteNumber}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isExpired && (
          <div className="flex items-center gap-2 rounded-lg bg-semantic-warning/10 p-3 text-semantic-warning border border-semantic-warning/20">
            <AlertCircle className="h-5 w-5" />
            <span>This quote expired on {format(quote.validUntil, 'PPP')}. You can still convert it.</span>
          </div>
        )}

        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{quote.title || quote.quoteNumber}</p>
              <p className="text-sm text-muted-foreground">{quote.clientName}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {quote.currency} {quote.totalAmount.toLocaleString(DEFAULT_LOCALE, { minimumFractionDigits: 2 })}
              </p>
              <Badge variant={quote.status === 'accepted' ? 'default' : 'secondary'}>
                {quote.status}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="font-medium">Line Items to Copy</h4>
          <div className="rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-right">Qty</th>
                  <th className="p-2 text-right">Price</th>
                  <th className="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.lineItems.map((item, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="p-2">{item.description}</td>
                    <td className="p-2 text-right">{item.quantity}</td>
                    <td className="p-2 text-right">${item.unitPrice.toFixed(2)}</td>
                    <td className="p-2 text-right font-medium">${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isConverting}>
          Cancel
        </Button>
        <Button onClick={handleConvert} disabled={isConverting}>
          {isConverting ? 'Converting...' : 'Convert to Invoice'}
        </Button>
      </CardFooter>
    </Card>
  );
}
