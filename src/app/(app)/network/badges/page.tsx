'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { badgeSchema } from '@/lib/schemas/gamification';

export default function BadgesPage() {
  return <CrudList schema={badgeSchema} />;
}
