'use client';

import { peopleSchema } from '@/lib/schemas/people';
import { CrudDetail } from '@/lib/crud';

export default function PersonDetailPage({ params }: { params: { id: string } }) {
    return (
        <CrudDetail
            schema={peopleSchema as any}
            id={params.id}
            initialTab="overview"
        />
    );
}
