"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useLookupTables } from '@/hooks/use-configuration';

interface AccountTypeSelectorProps {
  user?: { user_metadata?: Record<string, unknown> } | null;
  onNext?: (data: { accountType: string }) => void;
}

export function AccountTypeSelector({ onNext }: AccountTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const { data: accountTypes, isLoading } = useLookupTables('account_types');

  const getTypeDescription = (metadata: unknown): string => {
    const data = metadata as { description?: string } | undefined;
    return data?.description || 'Configure your account for this role';
  };

  const handleContinue = () => {
    if (selectedType && onNext) {
      onNext({ accountType: selectedType });
    }
  };

  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/2 mx-auto"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeAccountTypes = accountTypes?.filter(type => type.is_active) || [];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Select Your Account Type</CardTitle>
        <p className="text-muted-foreground">
          Choose the account type that best describes your role and needs.
        </p>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedType} onValueChange={setSelectedType} className="space-y-4">
          {activeAccountTypes.map((type) => (
            <div key={type.key} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent">
              <RadioGroupItem value={type.key} id={type.key} />
              <Label htmlFor={type.key} className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{type.value}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getTypeDescription(type.metadata)}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {type.key}
                  </Badge>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        <Button
          onClick={handleContinue}
          disabled={!selectedType}
          className="w-full mt-6"
          size="lg"
        >
          Continue
        </Button>
      </CardContent>
    </Card>
  );
}
