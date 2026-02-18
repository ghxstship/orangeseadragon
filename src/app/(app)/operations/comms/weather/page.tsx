'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { weatherAlertSchema } from '@/lib/schemas/production/weatherAlert';

export default function WeatherPage() {
  return <CrudList schema={weatherAlertSchema} />;
}
