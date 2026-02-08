"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, Check, X, SkipForward } from "lucide-react";
import type { WizardLayoutConfig } from "./types";

/**
 * WIZARD LAYOUT
 * 
 * Multi-step process with progress indicator.
 * 2026 Best Practices:
 * - Visual progress tracking
 * - Step validation
 * - Skip optional steps
 * - Persistence support
 * - Keyboard navigation
 */

export interface WizardLayoutProps {
  config: WizardLayoutConfig;
  loading?: boolean;
  
  currentStep: number;
  onStepChange: (step: number) => void;
  
  onFinish: () => void;
  onCancel?: () => void;
  
  isStepValid?: boolean;
  isSubmitting?: boolean;
  
  children: React.ReactNode;
}

export function WizardLayout({
  config,
  loading = false,
  currentStep,
  onStepChange,
  onFinish,
  onCancel,
  isStepValid = true,
  isSubmitting = false,
  children,
}: WizardLayoutProps) {
  const totalSteps = config.steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentStepConfig = config.steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const handleNext = React.useCallback(() => {
    if (isLastStep) {
      onFinish();
    } else {
      onStepChange(currentStep + 1);
    }
  }, [isLastStep, currentStep, onStepChange, onFinish]);

  const handleBack = React.useCallback(() => {
    if (!isFirstStep && config.navigation?.allowBack !== false) {
      onStepChange(currentStep - 1);
    }
  }, [isFirstStep, currentStep, onStepChange, config.navigation?.allowBack]);

  const handleSkip = React.useCallback(() => {
    if (currentStepConfig?.optional && config.navigation?.allowSkip) {
      onStepChange(currentStep + 1);
    }
  }, [currentStepConfig?.optional, config.navigation?.allowSkip, currentStep, onStepChange]);

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && isStepValid && !isSubmitting) {
      e.preventDefault();
      handleNext();
    }
  }, [isStepValid, isSubmitting, handleNext]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="border-b p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-2 w-full" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-64 w-full max-w-2xl mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold">{config.title}</h1>
              {config.description && (
                <p className="text-sm text-muted-foreground">{config.description}</p>
              )}
            </div>
            {onCancel && (
              <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Progress */}
          {config.navigation?.showProgress !== false && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Step {currentStep + 1} of {totalSteps}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
            </div>
          )}
        </div>

        {/* Step Indicators */}
        {config.navigation?.showStepNumbers !== false && (
          <div className="px-6 pb-4">
            <div className="flex items-center justify-center gap-2">
              {config.steps.map((step, index) => (
                <React.Fragment key={step.key}>
                  <button
                    onClick={() => index < currentStep && onStepChange(index)}
                    disabled={index > currentStep}
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                      index < currentStep && "bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90",
                      index === currentStep && "bg-primary text-primary-foreground",
                      index > currentStep && "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                  </button>
                  {index < totalSteps - 1 && (
                    <div className={cn(
                      "w-12 h-0.5",
                      index < currentStep ? "bg-primary" : "bg-muted"
                    )} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Step Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">{currentStepConfig?.title}</h2>
            {currentStepConfig?.description && (
              <p className="text-muted-foreground">{currentStepConfig.description}</p>
            )}
            {currentStepConfig?.optional && (
              <span className="text-xs text-muted-foreground">(Optional)</span>
            )}
          </div>
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            {!isFirstStep && config.navigation?.allowBack !== false && (
              <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {config.actions?.back || 'Back'}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStepConfig?.optional && config.navigation?.allowSkip && (
              <Button variant="ghost" onClick={handleSkip} disabled={isSubmitting}>
                <SkipForward className="h-4 w-4 mr-2" />
                {config.actions?.skip || 'Skip'}
              </Button>
            )}
            
            <Button onClick={handleNext} disabled={!isStepValid || isSubmitting}>
              {isLastStep ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {config.actions?.finish || 'Finish'}
                </>
              ) : (
                <>
                  {config.actions?.next || 'Next'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default WizardLayout;
