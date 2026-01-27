'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { radioChannelSchema } from '@/lib/schemas/radioChannel';

export default function RadioChannelsPage() {
  return <CrudList schema={radioChannelSchema} />;
}
