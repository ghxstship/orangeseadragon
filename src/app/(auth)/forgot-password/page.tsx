'use client';

import { Mail } from 'lucide-react';
import { AuthTemplate, AuthField } from '@/components/templates/AuthTemplate';

const forgotPasswordFields: AuthField[] = [
  { key: 'email', label: 'Email', type: 'email', placeholder: 'name@company.com', icon: Mail, required: true },
];

export default function ForgotPasswordPage() {
  const handleSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
