'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { documentSchema } from '@/lib/schemas/document';

export default function UploadDocumentPage() {
  return <CrudForm schema={documentSchema} mode="create" />;
}
