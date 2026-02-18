'use client';

import { use } from 'react';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { folderSchema } from '@/lib/schemas/core/folder';

export default function DocumentFolderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <CrudDetail schema={folderSchema} id={id} />;
}
