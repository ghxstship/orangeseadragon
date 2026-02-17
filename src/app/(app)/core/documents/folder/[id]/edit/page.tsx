'use client';

import { use } from 'react';
import { CrudForm } from '@/lib/crud/components/CrudForm';
import { folderSchema } from '@/lib/schemas/folder';

export default function EditFolderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <CrudForm schema={folderSchema} mode="edit" id={id} />;
}
