'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { UserPlus, Loader2, CheckCircle, XCircle, User, Lock } from 'lucide-react';
import { AuthTemplate, AuthField } from '@/components/templates/AuthTemplate';
import { throwApiErrorResponse } from '@/lib/api/error-message';

interface InviteData {
  organizationName: string;
  inviterName: string;
  email: string;
  role: string;
}

const inviteFields: AuthField[] = [
  { key: 'name', label: 'Your name', type: 'text', placeholder: 'John Doe', icon: User, required: true },
  { key: 'password', label: 'Create password', type: 'password', placeholder: '••••••••', icon: Lock, required: true, minLength: 8, helperText: 'Must be at least 8 characters' },
];

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [isLoading, setIsLoading] = React.useState(true);
  const [inviteData, setInviteData] = React.useState<InviteData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const validateInvite = async () => {
      try {
        const response = await fetch(`/api/invitations/${token}`);
        if (!response.ok) throw new Error('Invalid or expired invitation');
        const result = await response.json();
        const inv = result.data ?? result;
        setInviteData({
          organizationName: inv.organization_name ?? inv.organizationName ?? 'Organization',
          inviterName: inv.inviter_name ?? inv.inviterName ?? 'A team member',
          email: inv.email ?? '',
          role: inv.role ?? 'Team Member',
        });
      } catch {
        setError('This invitation link is invalid or has expired.');
      } finally {
        setIsLoading(false);
      }
    };
    validateInvite();
  }, [token]);

  const handleSubmit = async (formData: Record<string, string | boolean>) => {
    const response = await fetch(`/api/invitations/${token}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        password: formData.password,
      }),
    });
    if (!response.ok) {
      await throwApiErrorResponse(response, 'Failed to accept invitation');
    }
    router.push('/core/dashboard');
  };

  if (isLoading) {
    return (
      <div className="space-y-6 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Validating invitation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Invalid invitation</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <Link href="/login" className="text-primary hover:underline">Go to sign in</Link>
      </div>
    );
  }

  return (
    <AuthTemplate
      variant="invite"
      title={`Join ${inviteData?.organizationName}`}
      subtitle={`${inviteData?.inviterName} invited you to join as a ${inviteData?.role}`}
      fields={inviteFields}
      submitLabel="Accept invitation"
      submitIcon={CheckCircle}
      loadingLabel="Joining..."
      socialProviders={[]}
      footerLink={{ text: 'Already have an account?', label: 'Sign in instead', href: '/login' }}
      onSubmit={handleSubmit}
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
        <UserPlus className="h-8 w-8 text-primary" />
      </div>
    </AuthTemplate>
  );
}
