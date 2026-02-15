// /app/api/employee-certifications/route.ts
// Employee certifications CRUD

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
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
    console.error('[Employee Certifications] GET error:', err);
    return serverError('Failed to fetch employee certifications');
  }
}
