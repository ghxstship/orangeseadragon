'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { publicProfileSchema } from '@/lib/schemas/publicProfile';

export default function PublicProfilesPage() {
    return <CrudList schema={publicProfileSchema} />;
}
