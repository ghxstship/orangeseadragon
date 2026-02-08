'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'onboarding-progress';

export interface OnboardingStepData {
  [key: string]: unknown;
}

export interface OnboardingProgress {
  currentStep: string;
  completedSteps: string[];
  stepData: Record<string, OnboardingStepData>;
  startedAt: string;
  lastActivityAt: string;
}

const DEFAULT_PROGRESS: OnboardingProgress = {
  currentStep: 'welcome',
  completedSteps: [],
  stepData: {},
  startedAt: new Date().toISOString(),
  lastActivityAt: new Date().toISOString(),
};

export interface UseOnboardingProgressReturn {
  progress: OnboardingProgress;
  isLoaded: boolean;
  currentStep: string;
  completedSteps: string[];
  getStepData: <T extends OnboardingStepData>(step: string) => T | undefined;
  setStepData: (step: string, data: OnboardingStepData) => void;
  completeStep: (step: string) => void;
  goToStep: (step: string) => void;
  isStepCompleted: (step: string) => boolean;
  reset: () => void;
  canResume: boolean;
}

export function useOnboardingProgress(): UseOnboardingProgressReturn {
  const [progress, setProgress] = useState<OnboardingProgress>(DEFAULT_PROGRESS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as OnboardingProgress;
          setProgress(parsed);
        } catch {
          setProgress(DEFAULT_PROGRESS);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  const saveProgress = useCallback((newProgress: OnboardingProgress) => {
    const updated = {
      ...newProgress,
      lastActivityAt: new Date().toISOString(),
    };
    setProgress(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  }, []);

  const getStepData = useCallback(<T extends OnboardingStepData>(step: string): T | undefined => {
    return progress.stepData[step] as T | undefined;
  }, [progress.stepData]);

  const setStepData = useCallback((step: string, data: OnboardingStepData) => {
    saveProgress({
      ...progress,
      stepData: {
        ...progress.stepData,
        [step]: { ...progress.stepData[step], ...data },
      },
    });
  }, [progress, saveProgress]);

  const completeStep = useCallback((step: string) => {
    if (progress.completedSteps.includes(step)) return;
    saveProgress({
      ...progress,
      completedSteps: [...progress.completedSteps, step],
    });
  }, [progress, saveProgress]);

  const goToStep = useCallback((step: string) => {
    saveProgress({
      ...progress,
      currentStep: step,
    });
  }, [progress, saveProgress]);

  const isStepCompleted = useCallback((step: string): boolean => {
    return progress.completedSteps.includes(step);
  }, [progress.completedSteps]);

  const reset = useCallback(() => {
    const newProgress = {
      ...DEFAULT_PROGRESS,
      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    };
    setProgress(newProgress);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const canResume = isLoaded && 
    progress.completedSteps.length > 0 && 
    progress.currentStep !== 'complete';

  return {
    progress,
    isLoaded,
    currentStep: progress.currentStep,
    completedSteps: progress.completedSteps,
    getStepData,
    setStepData,
    completeStep,
    goToStep,
    isStepCompleted,
    reset,
    canResume,
  };
}
