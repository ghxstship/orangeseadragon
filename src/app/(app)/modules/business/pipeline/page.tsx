'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { pipelineSchema } from '@/lib/schemas/pipeline';

export default function PipelinePage() {
  return <CrudList schema={pipelineSchema} />;
}
