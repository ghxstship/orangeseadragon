import React from 'react';
import { PageLayoutRenderer } from '../ComponentRegistry';
import { useUser } from '@/hooks/auth/use-supabase';

interface FormTemplateProps {
  layoutSlug?: string;
  title?: string;
  onSubmit?: (data: Record<string, unknown>) => void;
  initialData?: Record<string, unknown>;
  className?: string;
}

export function FormTemplate({
  layoutSlug,
  title,
  onSubmit,
  initialData = {},
  className
}: FormTemplateProps) {
  const { user } = useUser();

  const contextData = {
    user,
    title: title || 'Form',
    onSubmit,
    initialData
  };

  return (
    <div className={className}>
      <PageLayoutRenderer
        layoutSlug={layoutSlug}
        layoutType="form"
        contextData={contextData}
      />
    </div>
  );
}
