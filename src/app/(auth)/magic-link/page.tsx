'use client';

import { useState, useEffect } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

const RESEND_COOLDOWN = 60;

export default function MagicLinkPage() {
  const supabase = createClient();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter your email address",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error sending magic link",
          description: error.message,
        });
        return;
      }

      setIsSent(true);
      setCooldown(RESEND_COOLDOWN);
      toast({
        title: "Magic link sent!",
        description: "Check your email for the login link",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    await handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  if (isSent) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-semantic-success/15 dark:bg-semantic-success/25">
            <CheckCircle className="h-8 w-8 text-semantic-success" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
          <p className="text-muted-foreground">
            We sent a magic link to <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Click the link in the email to sign in. The link expires in 15 minutes.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Didn&apos;t receive it?</span>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={handleResend}
              disabled={cooldown > 0 || isLoading}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setIsSent(false);
              setEmail('');
            }}
          >
            Try a different email
          </Button>
          <Link href="/login" className="block">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Sign in with email</h1>
        <p className="text-muted-foreground">
          We&apos;ll send you a magic link to sign in without a password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="email"
              autoFocus
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending magic link...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Send magic link
            </>
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <Link href="/login" className="block">
        <Button variant="outline" className="w-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Sign in with password
        </Button>
      </Link>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
