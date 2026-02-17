'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthTemplate } from '@/components/templates/AuthTemplate';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { captureError } from '@/lib/observability';

const SUPPORTED_PROVIDERS = new Set<string>(['google', 'github', 'azure', 'okta']);

export default function SSOCallbackPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const provider = params.provider as string;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient();

        // If we have a code/token in the URL, Supabase handles the exchange automatically
        // via its auth listener. Check if we already have a session.
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push('/core/dashboard');
          return;
        }

        // If no session yet and no code param, initiate the OAuth flow
        const code = searchParams.get('code');
        if (!code) {
          if (!SUPPORTED_PROVIDERS.has(provider)) {
            setError(`Unsupported provider: ${provider}`);
            return;
          }

          const { error: oauthError } = await supabase.auth.signInWithOAuth({
            provider: provider as 'google' | 'github' | 'azure',
            options: {
              redirectTo: `${window.location.origin}/sso/${provider}`,
            },
          });
          if (oauthError) throw new Error(oauthError.message);
          return;
        }

        // Code is present — Supabase client should exchange it automatically.
        // Wait briefly for the auth state to update.
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const { data: { session: refreshedSession } } = await supabase.auth.getSession();
        if (refreshedSession) {
          router.push('/core/dashboard');
        } else {
          setError('Authentication failed. Please try again.');
        }
      } catch (err) {
        captureError(err, 'sso.callback');
        setError('Authentication failed. Please try again.');
      }
    };

    handleCallback();
  }, [router, provider, searchParams]);

  if (error) {
    return (
      <AuthTemplate
        variant="verify-email"
        title="Authentication failed"
        subtitle={error}
        submitLabel="Try again"
        onSubmit={async () => router.push('/login')}
      >
        <Link href="/login" className="text-primary hover:underline text-sm">
          Return to sign in
        </Link>
      </AuthTemplate>
    );
  }

  return (
    <AuthTemplate
      variant="verify-mfa"
      title={`Signing in with ${provider}`}
      subtitle="Please wait while we complete your sign in..."
      submitLabel="Continue"
      onSubmit={async () => {}}
    />
  );
}
