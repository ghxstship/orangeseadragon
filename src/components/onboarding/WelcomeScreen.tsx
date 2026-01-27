import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  user?: { user_metadata?: Record<string, unknown> } | null;
  onNext?: () => void;
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Welcome to ATLVS!</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <p className="text-lg text-muted-foreground">
          We&apos;re excited to have you join our platform. Let&apos;s get your account set up so you can start managing your events and projects.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">🎯 Account Setup</h3>
            <p className="text-sm text-muted-foreground">
              Configure your account type and preferences
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">👥 Team Management</h3>
            <p className="text-sm text-muted-foreground">
              Set up your organization and invite team members
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">🚀 Get Started</h3>
            <p className="text-sm text-muted-foreground">
              Begin using ATLVS for your event management needs
            </p>
          </div>
        </div>

        <Button onClick={onNext} size="lg" className="w-full md:w-auto">
          Let's Get Started
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
