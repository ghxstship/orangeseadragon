// /app/api/account/preferences/route.ts
// Get and update user preferences with cascade resolution

import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, serverError } from '@/lib/api/response';
import { PreferenceCascadeService } from '@/lib/services/preference-cascade.service';
import { captureError } from '@/lib/observability';

export async function GET() {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, user, membership } = auth;

  try {
    const service = new PreferenceCascadeService(supabase);
    const orgId = membership?.organization_id ?? null;
    const resolved = await service.resolve(user.id, orgId);
    return apiSuccess(resolved);
  } catch (err) {
    captureError(err, 'api.account.preferences.get.error');
    return serverError('Failed to fetch preferences');
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, user, membership } = auth;

  try {
    const body = await request.json();
    const { scope, preferences } = body;

    if (!preferences || typeof preferences !== 'object') {
      return badRequest('preferences object is required');
    }

    const validScopes = ['user_global', 'user_org'] as const;
    const resolvedScope = validScopes.includes(scope) ? scope : 'user_global';
    const orgId = membership?.organization_id ?? null;

    const service = new PreferenceCascadeService(supabase);
    const result = await service.save(user.id, resolvedScope, preferences, orgId);

    if (!result.success) {
      return badRequest(result.error || 'Failed to save preferences');
    }

    // Return the newly resolved preferences
    const resolved = await service.resolve(user.id, orgId);
    return apiSuccess(resolved);
  } catch (err) {
    captureError(err, 'api.account.preferences.put.error');
    return serverError('Failed to update preferences');
  }
}
