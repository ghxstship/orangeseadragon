'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { guestListSchema } from '@/lib/schemas/production/guestList';

export default function GuestListsPage() {
  return <CrudList schema={guestListSchema} />;
}
