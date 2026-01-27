'use client';

import { projectSchema } from '@/lib/schemas/project';
import { CrudDetail } from '@/lib/crud';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
    return (
        <CrudDetail
            schema={projectSchema as any}
            id={params.id}
            initialTab="overview"
        />
    );
}
