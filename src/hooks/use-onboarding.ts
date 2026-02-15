'use client';

import { useState, useEffect, useCallback } from 'react';

interface OnboardingStepStatus {
  id: string;
  slug: string;
  name: string;
  description?: string;
  position: number;
  isRequired: boolean;
  isSkippable: boolean;
  estimatedMinutes: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completedAt?: string;
}

interface OnboardingSummary {
  initialized: boolean;
  accountType?: string;
  currentStep?: string;
  isCompleted?: boolean;
  isDismissed?: boolean;
  totalSteps?: number;
  completedSteps?: number;
  percentComplete?: number;
  steps?: OnboardingStepStatus[];
}

export function useOnboarding() {
  const [summary, setSummary] = useState<OnboardingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/onboarding/state');
      if (res.ok) {
        const json = await res.json();
        setSummary(json.data);
      }
    } catch {
      // Silently fail — onboarding is non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const completeStep = useCallback(async (stepSlug: string, data?: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/onboarding/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepSlug, action: 'complete', data }),
      });
      if (res.ok) {
        await fetchState();
        return true;
      }
    } catch {
      // Silently fail
    }
    return false;
  }, [fetchState]);

  const skipStep = useCallback(async (stepSlug: string) => {
    try {
      const res = await fetch('/api/onboarding/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepSlug, action: 'skip' }),
      });
      if (res.ok) {
        await fetchState();
        return true;
      }
    } catch {
      // Silently fail
    }
    return false;
  }, [fetchState]);

  const completeOnboarding = useCallback(async () => {
    try {
      const res = await fetch('/api/onboarding/complete', { method: 'POST' });
      if (res.ok) {
        await fetchState();
        return true;
      }
    } catch {
      // Silently fail
    }
    return false;
  }, [fetchState]);

  return {
    summary,
    loading,
    isComplete: summary?.isCompleted ?? false,
    currentStep: summary?.currentStep,
    percentComplete: summary?.percentComplete ?? 0,
    steps: summary?.steps ?? [],
    completeStep,
    skipStep,
    completeOnboarding,
    refetch: fetchState,
  };
}
