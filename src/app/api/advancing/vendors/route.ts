import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const searchParams = request.nextUrl.searchParams;

  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '25');

  // Get vendors (companies with company_type = 'vendor') with performance metrics
  let query = supabase
    .from('companies')
    .select('*', { count: 'exact' })
    .eq('company_type', 'vendor');

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  query = query
    .order('name', { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data: vendors, error, count } = await query;

  if (error) {
    return supabaseError(error);
  }

  // Get performance summary for each vendor
  const vendorIds = vendors?.map(v => v.id) || [];
  
  let performanceData: Record<string, unknown>[] = [];
  if (vendorIds.length > 0) {
    const { data: performance } = await supabase
      .from('vendor_performance_summary')
      .select('*')
      .in('vendor_id', vendorIds);
    performanceData = performance || [];
  }

  // Merge performance data with vendors
  const vendorsWithPerformance = vendors?.map(vendor => {
    const perf = performanceData.find((p: Record<string, unknown>) => p.vendor_id === vendor.id);
    return {
      ...vendor,
      performance: perf || null,
    };
  });

  return apiSuccess({
    records: vendorsWithPerformance,
    total: count || 0,
    page,
    pageSize,
  });
}
