'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { pipelineSchema } from '@/lib/schemas/pipeline';

export default function NewPipelinePage() {
  return <CrudForm schema={pipelineSchema} mode="create" />;
}
