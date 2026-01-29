'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { checkInOutSchema } from '@/lib/schemas/checkInOut';

export default function AssetStatusPage() {
  return <CrudList schema={checkInOutSchema} />;
}
