"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OnboardingCompleteProps {
  user?: { user_metadata?: Record<string, unknown> } | null;
  accountType?: string;
  onComplete?: () => void;
}

export function OnboardingComplete({ user, accountType, onComplete }: OnboardingCompleteProps) {
  const router = useRouter();

  const handleGetStarted = () => {
    if (onComplete) {
      onComplete();
    } else {
      router.push('/dashboard');
    }
  };

  const getWelcomeMessage = () => {
    const name = user?.user_metadata?.full_name || user?.user_metadata?.first_name || 'there';
    return `Welcome aboard, ${name}!`;
  };

  const getNextSteps = () => {
    switch (accountType) {
      case 'admin':
        return [
          'Set up your organization settings',
          'Invite team members',
          'Configure billing and subscriptions',
          'Review system settings'
        ];
      case 'producer':
        return [
          'Create your first event',
          'Set up production workflows',
          'Configure crew assignments',
          'Review event templates'
        ];
      case 'manager':
        return [
          'Review team structure',
          'Set up project workflows',
          'Configure approval processes',
          'Review reporting dashboards'
        ];
      default:
        return [
          'Explore the dashboard',
          'Set up your preferences',
          'Start with a sample project',
          'Join available events'
        ];
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-20 h-20 bg-semantic-success/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-12 h-12 text-semantic-success" />
        </div>
        <CardTitle className="text-3xl mb-2">Setup Complete!</CardTitle>
        <p className="text-xl text-muted-foreground">{getWelcomeMessage()}</p>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-6 rounded-lg">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-purple-600 mr-2" />
            <span className="text-lg font-semibold text-purple-900 dark:text-purple-100">
              You&apos;re all set as a {accountType || 'team member'}!
            </span>
          </div>
          <p className="text-muted-foreground">
            Your account has been configured with the appropriate permissions and settings.
            You can now start using ATLVS to manage your events and projects.
          </p>
        </div>

        <div className="text-left">
          <h3 className="font-semibold mb-4 text-center">What&apos;s Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {getNextSteps().map((step, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <span className="text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-semantic-warning/10 p-4 rounded-lg">
          <p className="text-sm text-semantic-warning">
            <strong>Need help?</strong> Visit our help center or contact support if you have any questions.
            We&apos;re here to ensure you have a great experience with ATLVS.
          </p>
        </div>

        <Button onClick={handleGetStarted} size="lg" className="w-full md:w-auto">
          Get Started
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
