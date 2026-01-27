'use client';

import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock } from 'lucide-react';
import { AuthTemplate, AuthField } from '@/components/templates/AuthTemplate';

const loginFields: AuthField[] = [
  { key: 'email', label: 'Email', type: 'email', placeholder: 'name@company.com', icon: Mail, required: true },
  { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••', icon: Lock, required: true },
  { key: 'rememberMe', label: 'Remember me for 30 days', type: 'checkbox' },
];

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push('/core/dashboard');
  };

  return (
    <AuthTemplate
      variant="login"
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      fields={loginFields}
      submitLabel="Sign in"
      submitIcon={LogIn}
      loadingLabel="Signing in..."
      secondaryLink={{ label: 'Forgot password?', href: '/forgot-password' }}
      footerLink={{ text: "Don't have an account?", label: 'Create one', href: '/register' }}
      onSubmit={handleSubmit}
    />
  );
}
