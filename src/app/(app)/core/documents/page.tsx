'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { documentSchema } from '@/lib/schemas/core/document';

export default function DocumentsPage() {
  return <CrudList schema={documentSchema} />;
}
