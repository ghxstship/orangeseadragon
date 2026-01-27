'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { folderSchema } from '@/lib/schemas/folder';

export default function NewFolderPage() {
  return <CrudForm schema={folderSchema} mode="create" />;
}
