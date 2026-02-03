'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { notificationSchema } from '@/lib/schemas/notification';

export default function NotificationsPage() {
  return <CrudList schema={notificationSchema} />;
}
