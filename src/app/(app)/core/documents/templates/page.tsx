'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { documentTemplateSchema } from '@/lib/schemas/core/documentTemplate';

export default function DocumentTemplatesPage() {
  return <CrudList schema={documentTemplateSchema} />;
}
