'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { folderSchema } from '@/lib/schemas/folder';

export default function EditFolderPage({ params }: { params: { id: string } }) {
  return <CrudForm schema={folderSchema} mode="edit" id={params.id} />;
}
