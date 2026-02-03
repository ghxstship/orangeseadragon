'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { trainingCourseSchema } from '@/lib/schemas/trainingCourse';

export default function EnrollmentsPage() {
  return <CrudList schema={trainingCourseSchema} />;
}
