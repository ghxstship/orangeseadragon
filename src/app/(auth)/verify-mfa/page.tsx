'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthTemplate } from '@/components/templates/AuthTemplate';
import { captureError } from '@/lib/observability';

export default function VerifyMfaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [code, setCode] = React.useState(['', '', '', '', '', '']);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newCode = [...code];
    for (let i = 0; i < pastedData.length; i++) newCode[i] = pastedData[i] ?? '';
    setCode(newCode);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleSubmit = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) return;
    setIsLoading(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const totp = factorsData?.totp?.[0];
      if (!totp) throw new Error('No TOTP factor enrolled');

      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totp.id,
      });
      if (challengeError) throw new Error(challengeError.message);

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totp.id,
        challengeId: challenge.id,
        code: fullCode,
      });
      if (verifyError) throw new Error(verifyError.message);

      router.push('/core/dashboard');
    } catch (err) {
      captureError(err, 'mfa.verify');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthTemplate
      variant="verify-mfa"
      title="Two-factor authentication"
      subtitle="Enter the 6-digit code from your authenticator app"
      fields={[]}
      submitLabel=""
      socialProviders={[]}
      footerLink={{ label: 'Back to sign in', href: '/login' }}
      onSubmit={async () => {}}
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
        <ShieldCheck className="h-8 w-8 text-primary" />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="code-0" className="sr-only">Verification code</Label>
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <Input
                key={index}
                id={`code-${index}`}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="h-12 w-12 text-center text-lg font-semibold"
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || code.join('').length !== 6}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify'
          )}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground text-center mt-4">
        Lost access to your authenticator?{' '}
        <Link href="/support" className="text-primary hover:underline">
          Use a backup code
        </Link>
      </p>
    </AuthTemplate>
  );
}
