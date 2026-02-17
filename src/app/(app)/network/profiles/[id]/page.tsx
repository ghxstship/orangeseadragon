'use client';

import { use } from 'react';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { publicProfileSchema } from '@/lib/schemas/publicProfile';

export default function PublicProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    return <CrudDetail schema={publicProfileSchema} id={id} />;
}
