'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface PaymentDetails {
  invoiceNumber: string;
  amount: number;
  currency: string;
  clientName: string;
  paidAt: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('invoice');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPaymentDetails() {
      if (!invoiceId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/invoices/${invoiceId}/payment-status`);
        if (response.ok) {
          const data = await response.json();
          setPaymentDetails(data);
        }
      } catch (error) {
        console.error('Error fetching payment details:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPaymentDetails();
  }, [invoiceId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white p-4 dark:from-green-950/20 dark:to-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for your payment. A confirmation has been sent to your email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {paymentDetails && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Invoice</dt>
                  <dd className="font-medium">{paymentDetails.invoiceNumber}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Amount Paid</dt>
                  <dd className="font-medium">
                    {paymentDetails.currency} {paymentDetails.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Client</dt>
                  <dd className="font-medium">{paymentDetails.clientName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Date</dt>
                  <dd className="font-medium">
                    {new Date(paymentDetails.paidAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {invoiceId && (
              <Button variant="outline" className="w-full" asChild>
                <a href={`/api/invoices/${invoiceId}/receipt`} download>
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </a>
              </Button>
            )}
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
