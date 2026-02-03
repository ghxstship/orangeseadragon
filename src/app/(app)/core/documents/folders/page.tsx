'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { folderSchema } from '@/lib/schemas/folder';

export default function FoldersPage() {
  return <CrudList schema={folderSchema} />;
}
