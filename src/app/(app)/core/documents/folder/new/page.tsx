'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { folderSchema } from '@/lib/schemas/core/folder';

export default function NewFolderPage() {
  return <CrudForm schema={folderSchema} mode="create" />;
}
