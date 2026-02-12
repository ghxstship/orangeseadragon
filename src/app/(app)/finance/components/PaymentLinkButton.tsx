'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Copy, Check, ExternalLink, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_LOCALE } from '@/lib/config';

interface PaymentLinkButtonProps {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  currency?: string;
  customerEmail?: string;
  existingPaymentLink?: string;
  onPaymentLinkCreated?: (url: string) => void;
}

export function PaymentLinkButton({
  invoiceId,
  invoiceNumber,
  amount,
  currency = 'USD',
  customerEmail,
  existingPaymentLink,
  onPaymentLinkCreated,
}: PaymentLinkButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState(existingPaymentLink || '');
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState(customerEmail || '');

  const createPaymentLink = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/create-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          amount,
          currency,
          customerEmail: email,
          description: `Payment for Invoice ${invoiceNumber}`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment link');
      }

      const data = await response.json();
      setPaymentLink(data.paymentLink.url);
      onPaymentLinkCreated?.(data.paymentLink.url);
      toast.success('Payment link created successfully');
    } catch (error) {
      console.error('Error creating payment link:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create payment link');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
      setCopied(true);
      toast.success('Payment link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const sendViaEmail = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/send-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          email,
          paymentLink,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      toast.success(`Payment link sent to ${email}`);
      setIsOpen(false);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send payment link email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <CreditCard className="h-4 w-4" />
        {existingPaymentLink ? 'View Payment Link' : 'Create Payment Link'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Link
            </DialogTitle>
            <DialogDescription>
              {paymentLink
                ? 'Share this link with your customer to collect payment'
                : 'Create a secure payment link for this invoice'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Invoice {invoiceNumber}</p>
                <p className="text-sm text-muted-foreground">
                  {currency} {amount.toLocaleString(DEFAULT_LOCALE, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Badge variant="secondary">Stripe</Badge>
            </div>

            {!paymentLink ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="email">Customer Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="customer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Pre-fill the customer&apos;s email on the payment page
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={paymentLink}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(paymentLink, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sendEmail">Send via Email</Label>
                  <div className="flex gap-2">
                    <Input
                      id="sendEmail"
                      type="email"
                      placeholder="customer@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button
                      variant="secondary"
                      onClick={sendViaEmail}
                      disabled={isLoading || !email}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {!paymentLink ? (
              <>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createPaymentLink} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Payment Link'
                  )}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
