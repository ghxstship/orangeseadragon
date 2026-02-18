'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { documentSchema } from '@/lib/schemas/core/document';

export default function TypographyPage() {
  return <CrudList schema={documentSchema} filter={{ document_type: 'typography' }} />;
}
