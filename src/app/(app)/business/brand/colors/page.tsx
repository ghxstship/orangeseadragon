'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { documentSchema } from '@/lib/schemas/document';

export default function ColorsPage() {
  return <CrudList schema={documentSchema} filter={{ document_type: 'color_palette' }} />;
}
