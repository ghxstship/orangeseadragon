'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { trainingCourseSchema } from '@/lib/schemas/trainingCourse';

export default function NewTrainingCoursePage() {
  return <CrudForm schema={trainingCourseSchema} mode="create" />;
}
