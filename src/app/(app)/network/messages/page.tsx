'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { conversationSchema } from '@/lib/schemas/core/conversation';

export default function MessagesPage() {
  return <CrudList schema={conversationSchema} />;
}
