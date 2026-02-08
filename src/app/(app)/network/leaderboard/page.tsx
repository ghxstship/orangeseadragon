'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { userPointsSchema } from '@/lib/schemas/gamification';

export default function LeaderboardPage() {
  return <CrudList schema={userPointsSchema} />;
}
