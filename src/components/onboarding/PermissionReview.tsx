"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface PermissionReviewProps {
  user?: { user_metadata?: Record<string, unknown> } | null;
  accountType?: string;
  onNext?: (data: { permissions: string[] }) => void;
}

export function PermissionReview({ accountType, onNext }: PermissionReviewProps) {
  const [acceptedPermissions, setAcceptedPermissions] = useState<string[]>([]);

  // Default permissions based on account type
  const defaultPermissions = React.useMemo(() => {
    const basePermissions = ['user'];

    switch (accountType) {
      case 'admin':
        return [...basePermissions, 'manage_users', 'manage_billing', 'view_all'];
      case 'manager':
        return [...basePermissions, 'manage_team', 'view_reports', 'approve_requests'];
      case 'producer':
        return [...basePermissions, 'manage_events', 'manage_production', 'coordinate_crew'];
      case 'coordinator':
        return [...basePermissions, 'coordinate', 'manage_schedules', 'track_assets'];
      case 'crew':
        return [...basePermissions, 'check_in_out', 'view_assignments', 'submit_timesheets'];
      default:
        return basePermissions;
    }
  }, [accountType]);

  const handlePermissionToggle = (permission: string, checked: boolean) => {
    setAcceptedPermissions(prev =>
      checked
        ? [...prev, permission]
        : prev.filter(p => p !== permission)
    );
  };

  const handleContinue = () => {
    if (onNext) {
      onNext({ permissions: acceptedPermissions });
    }
  };

  const permissionDescriptions: Record<string, string> = {
    user: 'Basic user access to the platform',
    manage_users: 'Create and manage user accounts',
    manage_billing: 'Handle billing and subscriptions',
    view_all: 'View all data across the organization',
    manage_team: 'Manage team members and assignments',
    view_reports: 'Access analytics and reports',
    approve_requests: 'Approve requests and expenses',
    manage_events: 'Create and manage events',
    manage_production: 'Oversee production workflows',
    coordinate_crew: 'Coordinate crew schedules',
    coordinate: 'Coordinate tasks and resources',
    manage_schedules: 'Create and modify schedules',
    track_assets: 'Track equipment and assets',
    check_in_out: 'Check in/out equipment',
    view_assignments: 'View assigned tasks',
    submit_timesheets: 'Submit time tracking',
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Review Permissions</CardTitle>
        <p className="text-muted-foreground">
          These are the permissions you&apos;ll have based on your {accountType} account type.
          Please review and confirm.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Assigned Permissions:</h3>
          <div className="space-y-3">
            {defaultPermissions.map((permission) => (
              <div key={permission} className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id={permission}
                  checked={acceptedPermissions.includes(permission)}
                  onCheckedChange={(checked) =>
                    handlePermissionToggle(permission, checked as boolean)
                  }
                />
                <div className="flex-1">
                  <Label htmlFor={permission} className="flex items-center space-x-2 cursor-pointer">
                    <Badge variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                    <span className="font-medium capitalize">
                      {permission.replace('_', ' ')}
                    </span>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {permissionDescriptions[permission] || 'Permission description'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Important Notes:
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• You can request additional permissions from an administrator</li>
            <li>• Permissions can be modified by organization admins</li>
            <li>• All actions are logged for security and compliance</li>
          </ul>
        </div>

        <Button
          onClick={handleContinue}
          disabled={acceptedPermissions.length !== defaultPermissions.length}
          className="w-full"
          size="lg"
        >
          Accept Permissions & Continue
        </Button>

        {acceptedPermissions.length !== defaultPermissions.length && (
          <p className="text-sm text-muted-foreground text-center">
            Please accept all permissions to continue
          </p>
        )}
      </CardContent>
    </Card>
  );
}
