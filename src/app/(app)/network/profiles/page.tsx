'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { publicProfileSchema } from '@/lib/schemas/core/publicProfile';

export default function PublicProfilesPage() {
    return <CrudList schema={publicProfileSchema} />;
}
