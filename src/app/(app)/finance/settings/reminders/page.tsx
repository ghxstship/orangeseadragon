'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { reminderTemplateSchema } from '@/lib/schemas/reminderTemplate';

export default function ReminderTemplatesPage() {
  return <CrudList schema={reminderTemplateSchema} />;
}
