'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { folderSchema } from '@/lib/schemas/folder';

export default function DocumentFolderPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={folderSchema} id={params.id} />;
}
