'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useOnboardingProgress, UseOnboardingProgressReturn } from '@/hooks/use-onboarding-progress';
import { captureError } from '@/lib/observability';

const ONBOARDING_STEPS = [
  { path: '/onboarding', key: 'welcome' },
  { path: '/onboarding/profile', key: 'profile' },
  { path: '/onboarding/organization', key: 'organization' },
  { path: '/onboarding/team', key: 'team' },
  { path: '/onboarding/preferences', key: 'preferences' },
  { path: '/onboarding/integrations', key: 'integrations' },
  { path: '/onboarding/tour', key: 'tour' },
  { path: '/onboarding/complete', key: 'complete' },
];

interface OnboardingContextValue extends UseOnboardingProgressReturn {
  steps: typeof ONBOARDING_STEPS;
  currentStepIndex: number;
  totalSteps: number;
  progressPercent: number;
  nextStep: () => void;
  prevStep: () => void;
  skipStep: () => void;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const progressHook = useOnboardingProgress();

  const currentStepIndex = ONBOARDING_STEPS.findIndex((s) => s.path === pathname);
  const currentStepKey = ONBOARDING_STEPS[currentStepIndex]?.key || 'welcome';
  const totalSteps = ONBOARDING_STEPS.length;
  const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  useEffect(() => {
    if (progressHook.isLoaded && currentStepKey !== progressHook.currentStep) {
      progressHook.goToStep(currentStepKey);
    }
  }, [pathname, progressHook.isLoaded, currentStepKey, progressHook]);

  const syncStepToServer = (stepSlug: string, action: 'complete' | 'skip') => {
    fetch('/api/onboarding/step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepSlug, action }),
    }).catch((err: unknown) => captureError(err, 'onboardingProvider.syncStep'));
  };

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < ONBOARDING_STEPS.length) {
      progressHook.completeStep(currentStepKey);
      syncStepToServer(currentStepKey, 'complete');
      router.push(ONBOARDING_STEPS[nextIndex]!.path);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      router.push(ONBOARDING_STEPS[prevIndex]!.path);
    }
  };

  const skipStep = () => {
    syncStepToServer(currentStepKey, 'skip');
    nextStep();
  };

  const completeOnboarding = () => {
    progressHook.completeStep(currentStepKey);
    syncStepToServer(currentStepKey, 'complete');
    progressHook.goToStep('complete');
    router.push('/onboarding/complete');
  };

  const value: OnboardingContextValue = {
    ...progressHook,
    steps: ONBOARDING_STEPS,
    currentStepIndex,
    totalSteps,
    progressPercent,
    nextStep,
    prevStep,
    skipStep,
    completeOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}
