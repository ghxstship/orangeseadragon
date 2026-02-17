// /app/api/employee-certifications/route.ts
// Employee certifications CRUD

import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  const employeeId = request.nextUrl.searchParams.get('employeeId');
  const status = request.nextUrl.searchParams.get('status');

  try {
    let query = supabase
      .from('employee_certifications')
      .select('*')
      .order('expiry_date', { ascending: true })
      .limit(100);

    if (employeeId) query = query.eq('employee_id', employeeId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return supabaseError(error);

    return apiSuccess(data || []);
  } catch (err) {
    captureError(err, 'api.employee-certifications.error');
    return serverError('Failed to fetch employee certifications');
  }
}
