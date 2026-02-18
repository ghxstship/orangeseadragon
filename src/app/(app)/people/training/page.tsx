'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { trainingCourseSchema } from '@/lib/schemas/people/trainingCourse';

export default function TrainingPage() {
  return <CrudList schema={trainingCourseSchema} />;
}
