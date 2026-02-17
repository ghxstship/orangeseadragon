'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, CheckCircle2, Clock3, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ClientPortalPermissions {
  can_view_budgets: boolean;
  can_view_invoices: boolean;
  can_view_tasks: boolean;
  can_view_documents: boolean;
  can_view_reports: boolean;
  can_comment: boolean;
  can_approve: boolean;
  can_upload: boolean;
}

interface ClientPortalAccessViewProps {
  organizationName: string;
  organizationLogoUrl?: string | null;
  accessLevel: string;
  welcomeMessage?: string | null;
  expiresAt?: string | null;
  permissions: ClientPortalPermissions;
  className?: string;
}

const PERMISSION_LABELS: Array<{ key: keyof ClientPortalPermissions; label: string }> = [
  { key: 'can_view_budgets', label: 'Budgets' },
  { key: 'can_view_invoices', label: 'Invoices' },
  { key: 'can_view_tasks', label: 'Tasks' },
  { key: 'can_view_documents', label: 'Documents' },
  { key: 'can_view_reports', label: 'Reports' },
  { key: 'can_comment', label: 'Comments' },
  { key: 'can_approve', label: 'Approvals' },
  { key: 'can_upload', label: 'Uploads' },
];

function formatAccessLabel(accessLevel: string) {
  return accessLevel
    .split('_')
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(' ');
}

export function ClientPortalAccessView({
  organizationName,
  organizationLogoUrl,
  accessLevel,
  welcomeMessage,
  expiresAt,
  permissions,
  className,
}: ClientPortalAccessViewProps) {
  const enabledPermissions = PERMISSION_LABELS.filter(({ key }) => permissions[key]);

  return (
    <div className={cn('space-y-4', className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {organizationLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={organizationLogoUrl}
                alt={`${organizationName} logo`}
                className="h-10 w-10 rounded-md border object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{organizationName} Client Portal</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" />
                Access level: {formatAccessLabel(accessLevel)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        {welcomeMessage && (
          <CardContent>
            <p className="text-sm text-muted-foreground">{welcomeMessage}</p>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Enabled Permissions</CardTitle>
          <CardDescription>You can access these areas in the portal.</CardDescription>
        </CardHeader>
        <CardContent>
          {enabledPermissions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {enabledPermissions.map((permission) => (
                <Badge key={permission.key} variant="secondary" className="gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {permission.label}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No permissions are enabled for this portal access.</p>
          )}
        </CardContent>
      </Card>

      {expiresAt && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              Portal access expires on {new Date(expiresAt).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
