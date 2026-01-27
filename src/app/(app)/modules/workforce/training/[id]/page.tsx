'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { trainingCourseSchema } from '@/lib/schemas/trainingCourse';

export default function TrainingCourseDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={trainingCourseSchema} id={params.id} />;
}
