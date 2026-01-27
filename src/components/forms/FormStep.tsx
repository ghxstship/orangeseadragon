import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface FormStepProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  nextLabel?: string;
  previousLabel?: string;
  className?: string;
}

export function FormStep({
  title,
  description,
  children,
  onNext,
  onPrevious,
  isFirstStep = false,
  isLastStep = false,
  nextLabel = 'Next',
  previousLabel = 'Previous',
  className
}: FormStepProps) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </CardHeader>
      )}
      <CardContent className="space-y-6">
        {children}

        <div className="flex justify-between pt-4">
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {previousLabel}
            </Button>
          )}

          <div className="flex-1" />

          <Button
            type="button"
            onClick={onNext}
          >
            {isLastStep ? 'Complete' : nextLabel}
            {!isLastStep && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
