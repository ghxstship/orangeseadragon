'use client';

import * as React from 'react';
import Link from 'next/link';
import { Mail, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthTemplate } from '@/components/templates/AuthTemplate';

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(0);

  const handleResend = async () => {
    setIsResending(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsResending(false);
    setResendCooldown(60);
  };

  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  return (
    <AuthTemplate
      variant="verify-email"
      title="Check your email"
      subtitle="We sent a verification link to your email address. Click the link to verify your account."
      fields={[]}
      submitLabel=""
      socialProviders={[]}
      footerLink={{ label: 'Back to sign in', href: '/login' }}
      onSubmit={async () => {}}
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
        <Mail className="h-8 w-8 text-primary" />
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleResend}
          disabled={isResending || resendCooldown > 0}
        >
          {isResending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : resendCooldown > 0 ? (
            `Resend in ${resendCooldown}s`
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Resend verification email
            </>
          )}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground text-center mt-4">
        Didn&apos;t receive the email? Check your spam folder or{' '}
        <Link href="/support" className="text-primary hover:underline">
          contact support
        </Link>
      </p>
    </AuthTemplate>
  );
}
