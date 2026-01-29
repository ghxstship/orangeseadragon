'use client';

import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { AuthTemplate, AuthField } from '@/components/templates/AuthTemplate';

const registerFields: AuthField[] = [
  { key: 'name', label: 'Full name', type: 'text', placeholder: 'John Doe', icon: User, required: true },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'name@company.com', icon: Mail, required: true },
  { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••', icon: Lock, required: true, minLength: 8, helperText: 'Must be at least 8 characters' },
  { key: 'acceptTerms', label: 'I agree to the Terms of Service and Privacy Policy', type: 'checkbox' },
];

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const handleSubmit = async (data: Record<string, string | boolean>) => {
    const email = data.email as string;
    const password = data.password as string;
    const name = data.name as string;
    const acceptTerms = data.acceptTerms as boolean;

    if (!acceptTerms) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must accept the terms and conditions",
      });
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error creating account",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Success",
      description: "Account created! Please check your email.",
    });
    router.push('/verify-email');
  };

  return (
    <AuthTemplate
      variant="register"
      title="Create an account"
      subtitle="Get started with your free account"
      fields={registerFields}
      submitLabel="Create account"
      submitIcon={UserPlus}
      loadingLabel="Creating account..."
      footerLink={{ text: 'Already have an account?', label: 'Sign in', href: '/login' }}
      onSubmit={handleSubmit}
    />
  );
}
