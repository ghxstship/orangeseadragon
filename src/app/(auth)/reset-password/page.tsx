'use client';

import { Lock } from 'lucide-react';
import { AuthTemplate, AuthField } from '@/components/templates/AuthTemplate';
import { createClient } from '@/lib/supabase/client';

const resetPasswordFields: AuthField[] = [
  { key: 'password', label: 'New password', type: 'password', placeholder: '••••••••', icon: Lock, required: true, minLength: 8, showPasswordStrength: true },
  { key: 'confirmPassword', label: 'Confirm password', type: 'password', placeholder: '••••••••', icon: Lock, required: true },
];

export default function ResetPasswordPage() {
  const handleSubmit = async (formData: Record<string, string | boolean>) => {
    const password = String(formData.password);
    const confirmPassword = String(formData.confirmPassword);

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
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
