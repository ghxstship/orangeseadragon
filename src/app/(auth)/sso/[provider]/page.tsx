'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthTemplate } from '@/components/templates/AuthTemplate';
import Link from 'next/link';

export default function SSOCallbackPage() {
  const params = useParams();
  const router = useRouter();
  const provider = params.provider as string;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // TODO: Implement actual SSO callback handling
        await new Promise((resolve) => setTimeout(resolve, 2000));
        router.push('/core/dashboard');
      } catch {
        setError('Authentication failed. Please try again.');
      }
    };

    handleCallback();
  }, [router]);

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
