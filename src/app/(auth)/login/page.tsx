'use client';

import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { AuthTemplate, AuthField } from '@/components/templates/AuthTemplate';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const loginFields: AuthField[] = [
  { key: 'email', label: 'Email', type: 'email', placeholder: 'name@company.com', icon: Mail, required: true },
  { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••', icon: Lock, required: true },
  { key: 'rememberMe', label: 'Remember me for 30 days', type: 'checkbox' },
];

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const handleSubmit = async (data: Record<string, string | boolean>) => {
    const email = data.email as string;
    const password = data.password as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Success",
      description: "Signed in successfully",
    });
    router.refresh();
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
    >
      <Link href="/magic-link" className="block">
        <Button variant="outline" className="w-full">
          <Sparkles className="mr-2 h-4 w-4" />
          Email me a login link
        </Button>
      </Link>
    </AuthTemplate>
  );
}
