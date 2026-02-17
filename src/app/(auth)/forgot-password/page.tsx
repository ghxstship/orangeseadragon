'use client';

import { Mail } from 'lucide-react';
import { AuthTemplate, AuthField } from '@/components/templates/AuthTemplate';
import { createClient } from '@/lib/supabase/client';

const forgotPasswordFields: AuthField[] = [
  { key: 'email', label: 'Email', type: 'email', placeholder: 'name@company.com', icon: Mail, required: true },
];

export default function ForgotPasswordPage() {
  const handleSubmit = async (formData: Record<string, string | boolean>) => {
    const email = String(formData.email).trim();
    if (!email) throw new Error('Email is required');

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
  };

  return (
    <AuthTemplate
      variant="forgot-password"
      title="Forgot password?"
      subtitle="No worries, we'll send you reset instructions."
      fields={forgotPasswordFields}
      submitLabel="Reset password"
      loadingLabel="Sending..."
      socialProviders={[]}
      successMessage="Check your email for reset instructions"
      footerLink={{ label: 'Back to sign in', href: '/login' }}
      onSubmit={handleSubmit}
    />
  );
}
