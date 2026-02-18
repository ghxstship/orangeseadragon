'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { radioChannelSchema } from '@/lib/schemas/production/radioChannel';

export default function CommsPage() {
  return <CrudList schema={radioChannelSchema} />;
}
