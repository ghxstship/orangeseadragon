'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { emailTemplateSchema } from '@/lib/schemas/emailTemplate';

export default function TemplatesPage() {
  return <CrudList schema={emailTemplateSchema} />;
}
