'use client';

import { use } from 'react';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { conversationSchema } from '@/lib/schemas/conversation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ConversationDetailPage({ params }: PageProps) {
  const { id } = use(params);
  return <CrudDetail schema={conversationSchema} id={id} />;
}
