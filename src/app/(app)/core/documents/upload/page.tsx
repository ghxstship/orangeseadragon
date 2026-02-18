'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { documentSchema } from '@/lib/schemas/core/document';

export default function UploadDocumentPage() {
  return <CrudForm schema={documentSchema} mode="create" />;
}
