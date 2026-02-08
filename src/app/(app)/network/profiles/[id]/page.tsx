'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { publicProfileSchema } from '@/lib/schemas/publicProfile';

export default function PublicProfileDetailPage({ params }: { params: { id: string } }) {
    return <CrudDetail schema={publicProfileSchema} id={params.id} />;
}
