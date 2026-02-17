'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { ContextualEmptyState } from '@/components/common/contextual-empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientPortalAccessView, type ClientPortalPermissions } from '@/components/business/client-portal-access-view';

type ClientPortalAccessPayload = {
  organization: {
    id: string;
    name: string;
    logo_url: string | null;
  };
  access: {
    access_level: string;
    permissions: ClientPortalPermissions;
    welcome_message: string | null;
    expires_at: string | null;
  };
};

export default function ClientPortalTokenPage() {
  const params = useParams<{ token: string }>();
  const token = useMemo(() => String(params?.token || ''), [params?.token]);

  const [data, setData] = useState<ClientPortalAccessPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setErrorMessage('Invalid client portal link.');
      setIsLoading(false);
      return;
    }

    fetch(`/api/client-portal/access?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          const message = json?.error?.message || 'Unable to validate portal access.';
          throw new Error(message);
        }
        return json;
      })
      .then((json) => {
        setData((json?.data as ClientPortalAccessPayload) || null);
      })
      .catch((err: unknown) => {
        setErrorMessage(err instanceof Error ? err.message : 'Unable to validate portal access.');
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-10">
        <Skeleton className="h-32" />
        <Skeleton className="h-40" />
        <Skeleton className="h-16" />
      </main>
    );
  }

  if (!data || errorMessage) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-12">
        <ContextualEmptyState
          type="error"
          title="Client portal access unavailable"
          description={errorMessage || 'The client portal link is invalid or expired.'}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <ClientPortalAccessView
        organizationName={data.organization.name}
        organizationLogoUrl={data.organization.logo_url}
        accessLevel={data.access.access_level}
        welcomeMessage={data.access.welcome_message}
        expiresAt={data.access.expires_at}
        permissions={data.access.permissions}
      />
    </main>
  );
}
