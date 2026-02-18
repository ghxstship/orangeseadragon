"use client";

import React, { useState } from 'react';
import { PageLayoutRenderer } from '../ComponentRegistry';
import { useUser } from '@/hooks/auth/use-supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface WizardTemplateProps {
  layoutSlug?: string;
  title?: string;
  steps?: Array<{
    title: string;
    component: string;
    data?: Record<string, unknown>;
  }>;
  onComplete?: (allData: Record<string, unknown>) => void;
  className?: string;
}

export function WizardTemplate({
  layoutSlug,
  title,
  steps: customSteps,
  onComplete,
  className
}: WizardTemplateProps) {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<Record<string, unknown>>({});

  // Use custom steps or get from layout
  const steps = customSteps || [];

  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  const handleNext = (stepData?: Record<string, unknown>) => {
    if (stepData) {
      setWizardData(prev => ({ ...prev, ...stepData }));
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete wizard
      const allData = { ...wizardData, ...(stepData || {}) };
      onComplete?.(allData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const currentStepData = steps[currentStep];

  if (!currentStepData) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No steps configured for this wizard.
          </p>
        </CardContent>
      </Card>
    );
  }

  const contextData = {
    user,
    title: title || currentStepData.title,
    wizardData,
    currentStep,
    totalSteps: steps.length,
    onNext: handleNext,
    onPrevious: handlePrevious,
    ...currentStepData.data
  };

  return (
    <div className={className}>
      {/* Progress Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{title || 'Wizard'}</span>
            <span className="text-sm font-normal">
              Step {currentStep + 1} of {steps.length}
            </span>
          </CardTitle>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
      </Card>

      {/* Current Step Content */}
      <PageLayoutRenderer
        layoutSlug={layoutSlug}
        layoutType="wizard"
        contextData={contextData}
      />

      {/* Navigation Footer */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button
              onClick={() => handleNext()}
              disabled={currentStep >= steps.length - 1 && !onComplete}
            >
              {currentStep >= steps.length - 1 ? 'Complete' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
