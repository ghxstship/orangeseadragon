"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepWizardProps {
  steps: Step[];
  currentStep: number;
  onStepChange?: (step: number) => void;
  children: React.ReactNode;
  className?: string;
}

interface StepWizardContextValue {
  currentStep: number;
  totalSteps: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const StepWizardContext = React.createContext<StepWizardContextValue | null>(null);

export function useStepWizard() {
  const context = React.useContext(StepWizardContext);
  if (!context) {
    throw new Error("useStepWizard must be used within a StepWizard");
  }
  return context;
}

export function StepWizard({
  steps,
  currentStep,
  onStepChange,
  children,
  className,
}: StepWizardProps) {
  const goToStep = React.useCallback(
    (step: number) => {
      if (step >= 0 && step < steps.length) {
        onStepChange?.(step);
      }
    },
    [steps.length, onStepChange]
  );

  const nextStep = React.useCallback(() => {
    goToStep(currentStep + 1);
  }, [currentStep, goToStep]);

  const prevStep = React.useCallback(() => {
    goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  const contextValue: StepWizardContextValue = {
    currentStep,
    totalSteps: steps.length,
    goToStep,
    nextStep,
    prevStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
  };

  return (
    <StepWizardContext.Provider value={contextValue}>
      <div className={cn("space-y-8", className)}>
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, index) => (
              <li
                key={step.id}
                className={cn(
                  "relative",
                  index !== steps.length - 1 && "flex-1"
                )}
              >
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => index < currentStep && goToStep(index)}
                    disabled={index > currentStep}
                    className={cn(
                      "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      index < currentStep
                        ? "border-primary bg-primary text-primary-foreground cursor-pointer"
                        : index === currentStep
                        ? "border-primary bg-background text-primary"
                        : "border-muted bg-background text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    {index < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </button>
                  {index !== steps.length - 1 && (
                    <div
                      className={cn(
                        "ml-4 h-0.5 flex-1",
                        index < currentStep ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </div>
                <div className="mt-2">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      index <= currentStep
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </nav>
        <div>{children}</div>
      </div>
    </StepWizardContext.Provider>
  );
}

interface StepWizardContentProps {
  step: number;
  children: React.ReactNode;
}

export function StepWizardContent({ step, children }: StepWizardContentProps) {
  const { currentStep } = useStepWizard();

  if (step !== currentStep) {
    return null;
  }

  return <>{children}</>;
}

interface StepWizardFooterProps {
  onComplete?: () => void;
  completeLabel?: string;
  nextLabel?: string;
  prevLabel?: string;
  className?: string;
}

export function StepWizardFooter({
  onComplete,
  completeLabel = "Complete",
  nextLabel = "Next",
  prevLabel = "Previous",
  className,
}: StepWizardFooterProps) {
  const { nextStep, prevStep, isFirstStep, isLastStep } = useStepWizard();

  return (
    <div className={cn("flex justify-between", className)}>
      <Button
        type="button"
        variant="outline"
        onClick={prevStep}
        disabled={isFirstStep}
      >
        {prevLabel}
      </Button>
      {isLastStep ? (
        <Button type="button" onClick={onComplete}>
          {completeLabel}
        </Button>
      ) : (
        <Button type="button" onClick={nextStep}>
          {nextLabel}
        </Button>
      )}
    </div>
  );
}
