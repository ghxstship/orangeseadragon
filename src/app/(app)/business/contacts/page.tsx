'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { contactSchema } from '@/lib/schemas/crm/contact';

export default function ContactsPage() {
    return <CrudList schema={contactSchema} />;
}
