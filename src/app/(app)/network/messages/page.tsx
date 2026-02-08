'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { conversationSchema } from '@/lib/schemas/conversation';

export default function MessagesPage() {
  return <CrudList schema={conversationSchema} />;
}
