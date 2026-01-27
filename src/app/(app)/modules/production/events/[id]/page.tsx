'use client';

import { eventSchema } from '@/lib/schemas/event';
import { CrudDetail } from '@/lib/crud';

export default function EventDetailPage({ params }: { params: { id: string } }) {
    return (
        <CrudDetail
            schema={eventSchema as any}
            id={params.id}
            initialTab="overview"
        />
    );
}
