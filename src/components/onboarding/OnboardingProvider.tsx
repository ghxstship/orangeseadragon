'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { captureError } from '@/lib/observability';

// Fallback steps used when the server hasn't responded yet or for account
// types that don't have DB-seeded steps. The server-backed steps override
// these once loaded.
const DEFAULT_STEPS: OnboardingStepDef[] = [
  { path: '/onboarding', key: 'welcome', label: 'Welcome', isRequired: true, isSkippable: false },
  { path: '/onboarding/profile', key: 'profile', label: 'Profile', isRequired: true, isSkippable: false },
  { path: '/onboarding/organization', key: 'organization', label: 'Organization', isRequired: true, isSkippable: false },
  { path: '/onboarding/team', key: 'team', label: 'Team', isRequired: false, isSkippable: true },
  { path: '/onboarding/preferences', key: 'preferences', label: 'Preferences', isRequired: false, isSkippable: true },
  { path: '/onboarding/integrations', key: 'integrations', label: 'Integrations', isRequired: false, isSkippable: true },
  { path: '/onboarding/tour', key: 'tour', label: 'Tour', isRequired: false, isSkippable: true },
  { path: '/onboarding/complete', key: 'complete', label: 'Complete', isRequired: true, isSkippable: false },
];

// Map step slugs from DB to URL paths
const STEP_PATH_MAP: Record<string, string> = {
  welcome: '/onboarding',
  profile: '/onboarding/profile',
  organization_profile: '/onboarding/organization',
  organization: '/onboarding/organization',
  company_profile: '/onboarding/organization',
  billing_setup: '/onboarding/preferences',
  team_invite: '/onboarding/team',
  team: '/onboarding/team',
  permissions_overview: '/onboarding/preferences',
  workspace_setup: '/onboarding/preferences',
  project_overview: '/onboarding/tour',
  team_assignment: '/onboarding/team',
  budget_overview: '/onboarding/tour',
  approval_workflows: '/onboarding/preferences',
  skills_certifications: '/onboarding/profile',
  availability: '/onboarding/preferences',
  portfolio: '/onboarding/profile',
  rider_setup: '/onboarding/preferences',
  services_catalog: '/onboarding/profile',
  rate_cards: '/onboarding/preferences',
  documents: '/onboarding/preferences',
  project_access: '/onboarding/tour',
  communication_preferences: '/onboarding/preferences',
  training: '/onboarding/tour',
  integrations: '/onboarding/integrations',
  preferences: '/onboarding/preferences',
  tour: '/onboarding/tour',
  complete: '/onboarding/complete',
};

export interface OnboardingStepDef {
  path: string;
  key: string;
  label: string;
  isRequired: boolean;
  isSkippable: boolean;
  status?: 'pending' | 'in_progress' | 'completed' | 'skipped';
}

export interface OnboardingContextValue {
  steps: OnboardingStepDef[];
  currentStepIndex: number;
  totalSteps: number;
  progressPercent: number;
  isLoading: boolean;
  accountType: string | null;
  nextStep: () => void;
  prevStep: () => void;
  skipStep: () => void;
  completeOnboarding: () => void;
  isStepCompleted: (key: string) => boolean;
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
  const [steps, setSteps] = useState<OnboardingStepDef[]>(DEFAULT_STEPS);
  const [accountType, setAccountType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Fetch server-backed onboarding state on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/onboarding/state');
        if (!res.ok || cancelled) return;
        const json = await res.json();
        const data = json.data ?? json;

        if (data.initialized && data.steps?.length > 0) {
          setAccountType(data.accountType ?? null);

          // Deduplicate steps by path — some account-type steps map to the same page
          const seen = new Set<string>();
          const serverSteps: OnboardingStepDef[] = [];

          // Always start with welcome
          serverSteps.push({
            path: '/onboarding',
            key: 'welcome',
            label: 'Welcome',
            isRequired: true,
            isSkippable: false,
            status: data.steps.find((s: { slug: string }) => s.slug === 'welcome')?.status ?? 'pending',
          });
          seen.add('/onboarding');

          for (const step of data.steps as Array<{
            slug: string;
            name: string;
            isRequired?: boolean;
            is_required?: boolean;
            isSkippable?: boolean;
            is_skippable?: boolean;
            status?: string;
          }>) {
            if (step.slug === 'welcome') continue;
            const path = STEP_PATH_MAP[step.slug] ?? `/onboarding/${step.slug}`;
            if (seen.has(path)) continue;
            seen.add(path);

            serverSteps.push({
              path,
              key: step.slug,
              label: step.name,
              isRequired: step.isRequired ?? step.is_required ?? true,
              isSkippable: step.isSkippable ?? step.is_skippable ?? false,
              status: (step.status as OnboardingStepDef['status']) ?? 'pending',
            });
          }

          // Always end with complete
          if (!seen.has('/onboarding/complete')) {
            serverSteps.push({
              path: '/onboarding/complete',
              key: 'complete',
              label: 'Complete',
              isRequired: true,
              isSkippable: false,
            });
          }

          if (!cancelled) {
            setSteps(serverSteps);
            const done = new Set<string>();
            for (const s of serverSteps) {
              if (s.status === 'completed' || s.status === 'skipped') done.add(s.key);
            }
            setCompletedSteps(done);
          }
        }
      } catch (err) {
        captureError(err, 'onboardingProvider.fetchState');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const currentStepIndex = steps.findIndex((s) => s.path === pathname);
  const totalSteps = steps.length;
  const progressPercent = totalSteps > 0
    ? Math.round(((Math.max(0, currentStepIndex) + 1) / totalSteps) * 100)
    : 0;

  const syncStepToServer = useCallback((stepSlug: string, action: 'complete' | 'skip') => {
    fetch('/api/onboarding/step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepSlug, action }),
    }).catch((err: unknown) => captureError(err, 'onboardingProvider.syncStep'));
  }, []);

  const nextStep = useCallback(() => {
    const idx = steps.findIndex((s) => s.path === pathname);
    const currentKey = steps[idx]?.key;
    const nextIndex = idx + 1;
    if (nextIndex < steps.length && currentKey) {
      setCompletedSteps((prev) => new Set(prev).add(currentKey));
      syncStepToServer(currentKey, 'complete');
      router.push(steps[nextIndex]!.path);
    }
  }, [steps, pathname, syncStepToServer, router]);

  const prevStep = useCallback(() => {
    const idx = steps.findIndex((s) => s.path === pathname);
    const prevIndex = idx - 1;
    if (prevIndex >= 0) {
      router.push(steps[prevIndex]!.path);
    }
  }, [steps, pathname, router]);

  const skipStep = useCallback(() => {
    const idx = steps.findIndex((s) => s.path === pathname);
    const currentKey = steps[idx]?.key;
    if (currentKey) {
      syncStepToServer(currentKey, 'skip');
      setCompletedSteps((prev) => new Set(prev).add(currentKey));
    }
    const nextIndex = idx + 1;
    if (nextIndex < steps.length) {
      router.push(steps[nextIndex]!.path);
    }
  }, [steps, pathname, syncStepToServer, router]);

  const completeOnboarding = useCallback(() => {
    const idx = steps.findIndex((s) => s.path === pathname);
    const currentKey = steps[idx]?.key;
    if (currentKey) {
      syncStepToServer(currentKey, 'complete');
      setCompletedSteps((prev) => new Set(prev).add(currentKey));
    }
    router.push('/onboarding/complete');
  }, [steps, pathname, syncStepToServer, router]);

  const isStepCompleted = useCallback((key: string) => completedSteps.has(key), [completedSteps]);

  const value: OnboardingContextValue = {
    steps,
    currentStepIndex: Math.max(0, currentStepIndex),
    totalSteps,
    progressPercent,
    isLoading,
    accountType,
    nextStep,
    prevStep,
    skipStep,
    completeOnboarding,
    isStepCompleted,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}
