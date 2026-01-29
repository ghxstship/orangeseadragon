'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { radioChannelSchema } from '@/lib/schemas/radioChannel';

export default function WeatherPage() {
  return <CrudList schema={radioChannelSchema} />;
}
