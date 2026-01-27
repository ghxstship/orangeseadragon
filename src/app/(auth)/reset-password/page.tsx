'use client';

import { Lock } from 'lucide-react';
import { AuthTemplate, AuthField } from '@/components/templates/AuthTemplate';

const resetPasswordFields: AuthField[] = [
  { key: 'password', label: 'New password', type: 'password', placeholder: '••••••••', icon: Lock, required: true, minLength: 8, helperText: 'Must be at least 8 characters' },
  { key: 'confirmPassword', label: 'Confirm password', type: 'password', placeholder: '••••••••', icon: Lock, required: true },
];

export default function ResetPasswordPage() {
  const handleSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <AuthTemplate
      variant="reset-password"
      title="Set new password"
      subtitle="Your new password must be different from previously used passwords."
      fields={resetPasswordFields}
      submitLabel="Reset password"
      loadingLabel="Resetting..."
      socialProviders={[]}
      successMessage="Your password has been successfully reset"
      footerLink={{ label: 'Continue to sign in', href: '/login' }}
      onSubmit={handleSubmit}
    />
  );
}
