'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { badgeSchema } from '@/lib/schemas/network/gamification';

export default function BadgesPage() {
  return <CrudList schema={badgeSchema} />;
}
