'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Key, Smartphone, Monitor, LogOut, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';
import { captureError } from '@/lib/observability';

export default function SecuritySettingsPage() {
  const router = useRouter();
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [passwordForm, setPasswordForm] = React.useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = React.useState('');
  const [passwordSuccess, setPasswordSuccess] = React.useState(false);
  const [sessions, setSessions] = React.useState<Array<{
    id: string;
    device_info: Record<string, string>;
    ip_address: string;
    is_current: boolean;
    last_active_at: string;
  }>>([]);
  const [sessionsLoading, setSessionsLoading] = React.useState(true);

  // MFA state
  const [mfaStatus, setMfaStatus] = React.useState<'loading' | 'disabled' | 'enrolling' | 'verifying' | 'enabled'>('loading');
  const [mfaQrCode, setMfaQrCode] = React.useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = React.useState<string | null>(null);
  const [mfaFactorId, setMfaFactorId] = React.useState<string | null>(null);
  const [mfaVerifyCode, setMfaVerifyCode] = React.useState('');
  const [mfaError, setMfaError] = React.useState('');

  // Check existing MFA factors on mount
  React.useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) {
          setMfaStatus('disabled');
          return;
        }
        const verifiedTOTP = data.totp?.find((f) => f.status === 'verified');
        setMfaStatus(verifiedTOTP ? 'enabled' : 'disabled');
        if (verifiedTOTP) setMfaFactorId(verifiedTOTP.id);
      } catch (err) {
        captureError(err, 'security.checkMfa');
        setMfaStatus('disabled');
      }
    })();
  }, []);

  // Fetch sessions
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/account/sessions');
        if (res.ok) {
          const json = await res.json();
          setSessions(json.data ?? []);
        }
      } catch (err) {
        captureError(err, 'security.fetchSessions');
      } finally {
        setSessionsLoading(false);
      }
    })();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordForm.new.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.new,
      });
      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess(true);
        setPasswordForm({ current: '', new: '', confirm: '' });
      }
    } catch (err) {
      captureError(err, 'security.changePassword');
      setPasswordError('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await fetch(`/api/account/sessions/${sessionId}`, { method: 'DELETE' });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      captureError(err, 'security.revokeSession');
    }
  };

  const handleSignOutAll = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut({ scope: 'global' });
      router.push('/login');
    } catch (err) {
      captureError(err, 'security.signOutAll');
    }
  };

  const handleEnrollMfa = async () => {
    setMfaError('');
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App',
      });
      if (error) {
        setMfaError(error.message);
        return;
      }
      setMfaQrCode(data.totp.qr_code);
      setMfaSecret(data.totp.secret);
      setMfaFactorId(data.id);
      setMfaStatus('enrolling');
    } catch (err) {
      captureError(err, 'security.enrollMfa');
      setMfaError('Failed to start MFA enrollment');
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError('');
    if (!mfaFactorId || mfaVerifyCode.length !== 6) return;

    try {
      const supabase = createClient();
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: mfaFactorId,
      });
      if (challengeError) {
        setMfaError(challengeError.message);
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challengeData.id,
        code: mfaVerifyCode,
      });
      if (verifyError) {
        setMfaError('Invalid code. Please try again.');
        return;
      }

      setMfaStatus('enabled');
      setMfaVerifyCode('');
      setMfaQrCode(null);
      setMfaSecret(null);
    } catch (err) {
      captureError(err, 'security.verifyMfa');
      setMfaError('Verification failed');
    }
  };

  const handleUnenrollMfa = async () => {
    if (!mfaFactorId) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: mfaFactorId,
      });
      if (error) {
        setMfaError(error.message);
        return;
      }
      setMfaStatus('disabled');
      setMfaFactorId(null);
    } catch (err) {
      captureError(err, 'security.unenrollMfa');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Security</h1>
        <p className="text-muted-foreground">
          Manage your password, two-factor authentication, and active sessions
        </p>
      </div>

      <Separator />

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Change Password</CardTitle>
          </div>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                disabled={isChangingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                required
                minLength={8}
                disabled={isChangingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                required
                minLength={8}
                disabled={isChangingPassword}
              />
            </div>

            {passwordError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <p className="text-sm text-semantic-success">Password changed successfully</p>
            )}

            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          {mfaStatus === 'loading' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking MFA status...
            </div>
          )}

          {mfaStatus === 'disabled' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Use an authenticator app to generate one-time codes for additional security.
              </p>
              <Button onClick={handleEnrollMfa}>
                <Smartphone className="mr-2 h-4 w-4" />
                Enable two-factor authentication
              </Button>
            </div>
          )}

          {mfaStatus === 'enrolling' && mfaQrCode && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
              </p>
              <div className="flex justify-center rounded-lg border bg-white p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mfaQrCode} alt="MFA QR Code" className="h-48 w-48" />
              </div>
              {mfaSecret && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Or enter this code manually:</p>
                  <code className="block rounded bg-muted px-3 py-2 text-xs font-mono break-all select-all">
                    {mfaSecret}
                  </code>
                </div>
              )}
              <Button onClick={() => setMfaStatus('verifying')}>
                I&apos;ve scanned the code
              </Button>
            </div>
          )}

          {mfaStatus === 'verifying' && (
            <form onSubmit={handleVerifyMfa} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code from your authenticator app to complete setup.
              </p>
              <div className="space-y-2">
                <Label htmlFor="mfa-code">Verification code</Label>
                <Input
                  id="mfa-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="000000"
                  value={mfaVerifyCode}
                  onChange={(e) => setMfaVerifyCode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  required
                />
              </div>
              {mfaError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {mfaError}
                </div>
              )}
              <div className="flex gap-2">
                <Button type="submit" disabled={mfaVerifyCode.length !== 6}>
                  Verify and enable
                </Button>
                <Button type="button" variant="ghost" onClick={() => setMfaStatus('disabled')}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {mfaStatus === 'enabled' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-semantic-success" />
                <p className="text-sm font-medium">Two-factor authentication is enabled</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Your account is protected with an authenticator app.
              </p>
              <Button variant="outline" size="sm" onClick={handleUnenrollMfa}>
                Disable two-factor authentication
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Active Sessions</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOutAll}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out all devices
            </Button>
          </div>
          <CardDescription>
            Manage devices where you&apos;re currently signed in
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No active sessions found. Session tracking requires the sessions API to be configured.
            </p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Monitor className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {session.device_info?.browser || 'Unknown browser'}
                        {session.is_current && (
                          <span className="ml-2 rounded-full bg-semantic-success/10 px-2 py-0.5 text-xs font-medium text-semantic-success">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.ip_address || 'Unknown IP'} · Last active{' '}
                        {new Date(session.last_active_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {!session.is_current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
