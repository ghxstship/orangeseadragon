'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { formTemplateSchema } from '@/lib/schemas/formTemplate';

export default function FormsPage() {
  return <CrudList schema={formTemplateSchema} />;
}
