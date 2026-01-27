'use client';

import { projectSchema } from '@/lib/schemas/project';
import { CrudList } from '@/lib/crud';

export default function ProjectsPage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Project Management</h1>
                <p className="text-muted-foreground">
                    Manage and track all production projects in one place.
                </p>
            </div>

            <CrudList
                schema={projectSchema as any}
                initialSubpage="all"
            />
        </div>
    );
}
